/**
 * WebGPU Conway's Game of Life simulation.
 *
 * Reusable class: create an instance, call start(), and the simulation
 * runs autonomously on a <canvas>. Call stop() to halt. Designed to be
 * embedded in any page via an Astro wrapper component.
 */

import { initWebGPU, resizeCanvas } from "./utils";
import computeSrc from "./game-of-life.compute.wgsl?raw";
import renderSrc from "./game-of-life.render.wgsl?raw";

export interface SimColors {
  alive: [number, number, number, number]; // RGBA 0-1
  dead: [number, number, number, number];
}

export interface GameOfLifeOptions {
  canvas: HTMLCanvasElement;
  cellSize?: number; // px per cell (default 10)
  updateInterval?: number; // ms between generations (default 150)
  initialDensity?: number; // 0-1 fraction alive (default 0.25)
  colors: SimColors;
}

const WG = 8; // workgroup size (must match compute shader)

export class GameOfLife {
  // Config
  private canvas: HTMLCanvasElement;
  private cellSize: number;
  private interval: number;
  private density: number;
  private colors: SimColors;

  // GPU state
  private device!: GPUDevice;
  private ctx!: GPUCanvasContext;
  private format!: GPUTextureFormat;
  private gw = 0;
  private gh = 0;
  private step = 0;
  private raf: number | null = null;
  private last = 0;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;

  // Pipelines & resources
  private computePL!: GPUComputePipeline;
  private renderPL!: GPURenderPipeline;
  private gridBuf!: GPUBuffer;
  private colorBuf!: GPUBuffer;
  private cellBufs!: [GPUBuffer, GPUBuffer];
  private computeBGs!: [GPUBindGroup, GPUBindGroup];
  private renderBGs!: [GPUBindGroup, GPUBindGroup];

  constructor(opts: GameOfLifeOptions) {
    this.canvas = opts.canvas;
    this.cellSize = opts.cellSize ?? 10;
    this.interval = opts.updateInterval ?? 150;
    this.density = opts.initialDensity ?? 0.25;
    this.colors = { ...opts.colors };
  }

  /** Initialise WebGPU and begin the simulation loop. Returns false if unsupported. */
  async start(): Promise<boolean> {
    resizeCanvas(this.canvas);
    const gpu = await initWebGPU(this.canvas);
    if (!gpu) return false;

    this.device = gpu.device;
    this.ctx = gpu.context;
    this.format = gpu.format;

    this.gw = Math.ceil(this.canvas.width / this.cellSize);
    this.gh = Math.ceil(this.canvas.height / this.cellSize);

    this.buildPipelines(this.format);
    this.buildBuffers();
    this.buildBindGroups();

    this.renderFrame(); // show initial state immediately
    this.raf = requestAnimationFrame(this.loop);
    return true;
  }

  /** Stop the simulation loop. */
  stop(): void {
    if (this.raf !== null) cancelAnimationFrame(this.raf);
    this.raf = null;
    if (this.resizeTimer !== null) clearTimeout(this.resizeTimer);
    this.resizeTimer = null;
  }

  /** Handle viewport resize: rebuild grid and buffers to maintain square cells. */
  handleResize(): void {
    // Debounce — avoid rebuilding every frame during drag-resize
    if (this.resizeTimer !== null) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => this.rebuild(), 150);
  }

  private rebuild(): void {
    resizeCanvas(this.canvas);
    this.ctx.configure({
      device: this.device,
      format: this.format,
      alphaMode: "premultiplied",
    });

    this.gw = Math.ceil(this.canvas.width / this.cellSize);
    this.gh = Math.ceil(this.canvas.height / this.cellSize);
    this.step = 0;

    this.buildBuffers();
    this.buildBindGroups();
    this.renderFrame();
  }

  /** Live-update colours (e.g. on theme toggle). */
  updateColors(c: SimColors): void {
    this.colors = { ...c };
    if (this.colorBuf) {
      this.device.queue.writeBuffer(
        this.colorBuf,
        0,
        new Float32Array([...c.alive, ...c.dead]),
      );
    }
  }

  // ── Pipelines ──────────────────────────────────────────────

  private buildPipelines(format: GPUTextureFormat): void {
    const d = this.device;

    this.computePL = d.createComputePipeline({
      layout: "auto",
      compute: {
        module: d.createShaderModule({ code: computeSrc }),
        entryPoint: "main",
      },
    });

    const renderMod = d.createShaderModule({ code: renderSrc });
    this.renderPL = d.createRenderPipeline({
      layout: "auto",
      vertex: { module: renderMod, entryPoint: "vert" },
      fragment: {
        module: renderMod,
        entryPoint: "frag",
        targets: [{ format }],
      },
      primitive: { topology: "triangle-list" },
    });
  }

  // ── Buffers ────────────────────────────────────────────────

  private buildBuffers(): void {
    const d = this.device;
    const n = this.gw * this.gh;

    // Grid dimensions (vec2u = 8 bytes)
    this.gridBuf = d.createBuffer({
      size: 8,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    d.queue.writeBuffer(this.gridBuf, 0, new Uint32Array([this.gw, this.gh]));

    // Alive / dead colours (2 × vec4f = 32 bytes)
    this.colorBuf = d.createBuffer({
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    d.queue.writeBuffer(
      this.colorBuf,
      0,
      new Float32Array([...this.colors.alive, ...this.colors.dead]),
    );

    // Cell state double-buffer (ping-pong)
    const init = new Uint32Array(n);
    for (let i = 0; i < n; i++) {
      init[i] = Math.random() < this.density ? 1 : 0;
    }

    this.cellBufs = [0, 1].map(() => {
      const b = d.createBuffer({
        size: n * 4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      d.queue.writeBuffer(b, 0, init);
      return b;
    }) as [GPUBuffer, GPUBuffer];
  }

  // ── Bind groups ────────────────────────────────────────────

  private buildBindGroups(): void {
    const d = this.device;

    // Compute: read from [i], write to [1-i]
    this.computeBGs = [0, 1].map((i) =>
      d.createBindGroup({
        layout: this.computePL.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.gridBuf } },
          { binding: 1, resource: { buffer: this.cellBufs[i] } },
          { binding: 2, resource: { buffer: this.cellBufs[1 - i] } },
        ],
      }),
    ) as [GPUBindGroup, GPUBindGroup];

    // Render: read from [i]
    this.renderBGs = [0, 1].map((i) =>
      d.createBindGroup({
        layout: this.renderPL.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.gridBuf } },
          { binding: 1, resource: { buffer: this.cellBufs[i] } },
          { binding: 2, resource: { buffer: this.colorBuf } },
        ],
      }),
    ) as [GPUBindGroup, GPUBindGroup];
  }

  // ── Frame loop ─────────────────────────────────────────────

  private loop = (t: number): void => {
    this.raf = requestAnimationFrame(this.loop);
    if (t - this.last < this.interval) return;
    this.last = t;
    this.frame();
  };

  /** Run one compute step + render in a single command buffer. */
  private frame(): void {
    const enc = this.device.createCommandEncoder();

    // Compute pass — advance simulation
    const cp = enc.beginComputePass();
    cp.setPipeline(this.computePL);
    cp.setBindGroup(0, this.computeBGs[this.step % 2]);
    cp.dispatchWorkgroups(
      Math.ceil(this.gw / WG),
      Math.ceil(this.gh / WG),
    );
    cp.end();
    this.step++;

    // Render pass — draw to canvas
    const rp = enc.beginRenderPass({
      colorAttachments: [
        {
          view: this.ctx.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    rp.setPipeline(this.renderPL);
    rp.setBindGroup(0, this.renderBGs[this.step % 2]);
    rp.draw(3);
    rp.end();

    this.device.queue.submit([enc.finish()]);
  }

  /** Render current state without advancing simulation. */
  private renderFrame(): void {
    const enc = this.device.createCommandEncoder();
    const rp = enc.beginRenderPass({
      colorAttachments: [
        {
          view: this.ctx.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    rp.setPipeline(this.renderPL);
    rp.setBindGroup(0, this.renderBGs[0]);
    rp.draw(3);
    rp.end();
    this.device.queue.submit([enc.finish()]);
  }
}
