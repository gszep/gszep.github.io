/**
 * WebGPU Conway's Game of Life simulation.
 *
 * Uses a single read_write storage texture instead of ping-pong buffers.
 * Race conditions from in-place updates create interesting visual artifacts
 * acceptable for a background effect. Designed as a reusable template for
 * more complex GPU simulations.
 */

import {
  initWebGPU,
  resizeCanvas,
  createShader,
  fullscreenPass,
} from "./utils";
import computeSrc from "./game-of-life.compute.wgsl?raw";
import renderSrc from "./game-of-life.render.wgsl?raw";
import fullscreenVertex from "./fullscreen.vertex.wgsl?raw";

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
  private raf: number | null = null;
  private last = 0;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;

  // Pipelines & resources
  private computePL!: GPUComputePipeline;
  private renderPL!: GPURenderPipeline;
  private stateTex!: GPUTexture;
  private colorBuf!: GPUBuffer;
  private computeBG!: GPUBindGroup;
  private renderBG!: GPUBindGroup;

  constructor(opts: GameOfLifeOptions) {
    this.canvas = opts.canvas;
    this.cellSize = opts.cellSize ?? 10;
    this.interval = opts.updateInterval ?? 150;
    this.density = opts.initialDensity ?? 0.25;
    this.colors = { ...opts.colors };
  }

  /** Initialise WebGPU and begin the simulation loop. Returns false if unsupported. */
  async start(): Promise<boolean> {
    try {
      resizeCanvas(this.canvas);
      const gpu = await initWebGPU(this.canvas);
      if (!gpu) return false;

      this.device = gpu.device;
      this.ctx = gpu.context;
      this.format = gpu.format;

      // Stop simulation gracefully if GPU device is lost (common on mobile)
      this.device.lost.then((info) => {
        console.warn(`[GameOfLife] Device lost (${info.reason}): ${info.message}`);
        this.stop();
      });

      this.gw = Math.ceil(this.canvas.width / this.cellSize);
      this.gh = Math.ceil(this.canvas.height / this.cellSize);

      this.buildPipelines();
      this.buildResources();

      this.renderFrame(); // show initial state immediately
      this.raf = requestAnimationFrame(this.loop);
      return true;
    } catch (e) {
      console.warn("[GameOfLife] Init failed:", e);
      return false;
    }
  }

  /** Stop the simulation loop. */
  stop(): void {
    if (this.raf !== null) cancelAnimationFrame(this.raf);
    this.raf = null;
    if (this.resizeTimer !== null) clearTimeout(this.resizeTimer);
    this.resizeTimer = null;
  }

  /** Handle viewport resize: rebuild grid and resources to maintain square cells. */
  handleResize(): void {
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

    this.stateTex.destroy();
    this.buildResources();
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

  private buildPipelines(): void {
    const includes = { fullscreen_vertex: fullscreenVertex };

    this.computePL = this.device.createComputePipeline({
      layout: "auto",
      compute: {
        module: createShader(this.device, computeSrc),
        entryPoint: "main",
      },
    });

    const renderMod = createShader(this.device, renderSrc, includes);
    this.renderPL = this.device.createRenderPipeline({
      layout: "auto",
      vertex: { module: renderMod, entryPoint: "vert" },
      fragment: {
        module: renderMod,
        entryPoint: "frag",
        targets: [{ format: this.format }],
      },
      primitive: { topology: "triangle-list" },
    });
  }

  // ── Resources ─────────────────────────────────────────────

  private buildResources(): void {
    const d = this.device;

    // State texture (single read_write — no ping-pong needed)
    this.stateTex = d.createTexture({
      size: [this.gw, this.gh],
      format: "r32uint",
      usage:
        GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST,
    });

    // Upload random initial state
    const data = new Uint32Array(this.gw * this.gh);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() < this.density ? 1 : 0;
    }
    d.queue.writeTexture(
      { texture: this.stateTex },
      data,
      { bytesPerRow: this.gw * 4 },
      [this.gw, this.gh],
    );

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

    // Compute bind group: state texture as storage
    this.computeBG = d.createBindGroup({
      layout: this.computePL.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.stateTex.createView() },
      ],
    });

    // Render bind group: state as sampled texture + colours
    this.renderBG = d.createBindGroup({
      layout: this.renderPL.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.stateTex.createView() },
        { binding: 1, resource: { buffer: this.colorBuf } },
      ],
    });
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
    cp.setBindGroup(0, this.computeBG);
    cp.dispatchWorkgroups(
      Math.ceil(this.gw / WG),
      Math.ceil(this.gh / WG),
    );
    cp.end();

    // Render pass — draw to canvas
    fullscreenPass(
      enc,
      this.ctx.getCurrentTexture().createView(),
      this.renderPL,
      this.renderBG,
    );

    this.device.queue.submit([enc.finish()]);
  }

  /** Render current state without advancing simulation. */
  private renderFrame(): void {
    const enc = this.device.createCommandEncoder();
    fullscreenPass(
      enc,
      this.ctx.getCurrentTexture().createView(),
      this.renderPL,
      this.renderBG,
    );
    this.device.queue.submit([enc.finish()]);
  }
}
