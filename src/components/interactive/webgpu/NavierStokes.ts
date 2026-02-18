/**
 * WebGPU Navier-Stokes fluid simulation.
 *
 * Vorticity-stream function formulation with a single read_write storage
 * buffer. Race-free stencil operations via workgroup cache with halo.
 * Advection reads from global memory (displacement can exceed cache).
 *
 * Discretization ported from public/art/3141.
 *
 * Channels: x=error, y=unused, z=stream_function, w=vorticity
 *
 * Idle:   Jacobi relaxation converges stream function to match vorticity.
 * Active: Semi-Lagrangian advection + vorticity diffusion + brush forcing.
 */

import {
  initWebGPU,
  resizeCanvas,
  createShader,
  fullscreenPass,
} from "./utils";
import computeSrc from "./navier-stokes.compute.wgsl?raw";
import renderSrc from "./navier-stokes.render.wgsl?raw";
import fullscreenVertex from "./fullscreen.vertex.wgsl?raw";

export interface NavierStokesOptions {
  canvas: HTMLCanvasElement;
  cellSize?: number; // px per sim cell (default 4)
  updateInterval?: number; // ms between frames (default 16)
  stepsPerFrame?: number; // compute dispatches per render (default 1)
  brushSize?: number; // radius of interaction brush (default 30)
}

const WG = 8; // workgroup size (must match compute shader)
const TILE = 2;
const HALO = 1;
const INNER = TILE * WG - 2 * HALO; // 14 — active cells per workgroup

export class NavierStokes {
  // Config
  private canvas: HTMLCanvasElement;
  private cellSize: number;
  private interval: number;
  private stepsPerFrame: number;
  private brushSize: number;

  // GPU state
  private device!: GPUDevice;
  private ctx!: GPUCanvasContext;
  private format!: GPUTextureFormat;
  private gw = 0;
  private gh = 0;
  private raf: number | null = null;
  private last = 0;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;

  // Pipelines
  private computePL!: GPUComputePipeline;
  private renderPL!: GPURenderPipeline;

  // Resources (single buffer, no ping-pong)
  private buf!: GPUBuffer;
  private paramsBuf!: GPUBuffer;
  private computeBG!: GPUBindGroup;
  private renderBG!: GPUBindGroup;

  // Params: [mouse.x, mouse.y, brush_size, unused, grid_w, grid_h, pad, pad]
  private paramsData = new Float32Array(8);

  constructor(opts: NavierStokesOptions) {
    this.canvas = opts.canvas;
    this.cellSize = opts.cellSize ?? 4;
    this.interval = opts.updateInterval ?? 16;
    this.stepsPerFrame = opts.stepsPerFrame ?? 1;
    this.brushSize = opts.brushSize ?? 30;
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

      this.gw = Math.ceil(this.canvas.width / this.cellSize);
      this.gh = Math.ceil(this.canvas.height / this.cellSize);

      this.buildPipelines();
      this.buildResources();
      this.setupMouse();

      this.renderFrame();
      this.raf = requestAnimationFrame(this.loop);
      return true;
    } catch (e) {
      console.warn("[NavierStokes] Init failed:", e);
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

  /** Handle viewport resize: rebuild grid and resources. */
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

    this.buf.destroy();
    this.paramsBuf.destroy();
    this.buildResources();
    this.renderFrame();
  }

  // ── Pipelines ──────────────────────────────────────────

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

  // ── Resources ──────────────────────────────────────────

  private buildResources(): void {
    const d = this.device;
    const cellCount = this.gw * this.gh;
    const bufSize = cellCount * 16; // 4 floats x 4 bytes per cell

    // Single state buffer (read_write in compute, read in render)
    this.buf = d.createBuffer({
      size: bufSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    // All zeros — matches original 3141 (Math.random() > 1 ? 1 : 0 ≡ 0)
    d.queue.writeBuffer(this.buf, 0, new Float32Array(cellCount * 4));

    // Params uniform buffer (32 bytes)
    this.paramsBuf = d.createBuffer({
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.paramsData.fill(0);
    this.paramsData[2] = NaN; // brush inactive
    this.paramsData[4] = this.gw;
    this.paramsData[5] = this.gh;
    d.queue.writeBuffer(this.paramsBuf, 0, this.paramsData);

    // Compute bind group
    this.computeBG = d.createBindGroup({
      layout: this.computePL.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.buf } },
        { binding: 1, resource: { buffer: this.paramsBuf } },
      ],
    });

    // Render bind group
    this.renderBG = d.createBindGroup({
      layout: this.renderPL.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.buf } },
        { binding: 1, resource: { buffer: this.paramsBuf } },
      ],
    });
  }

  // ── Mouse interaction ──────────────────────────────────

  private setupMouse(): void {
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.paramsData[0] = ((e.clientX - rect.left) / rect.width) * this.gw;
      this.paramsData[1] = ((e.clientY - rect.top) / rect.height) * this.gh;
    });

    this.canvas.addEventListener("mousedown", (e) => {
      e.preventDefault();
      // Left click: positive vorticity, right click: negative
      this.paramsData[2] = e.button === 2 ? -this.brushSize : this.brushSize;
    });

    this.canvas.addEventListener("mouseup", () => {
      this.paramsData[2] = NaN;
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.paramsData[2] = NaN;
    });

    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  // ── Frame loop ─────────────────────────────────────────

  private loop = (t: number): void => {
    this.raf = requestAnimationFrame(this.loop);
    if (t - this.last < this.interval) return;
    this.last = t;
    this.frame();
  };

  /** Run compute steps + render. */
  private frame(): void {
    // Upload params
    this.device.queue.writeBuffer(this.paramsBuf, 0, this.paramsData);

    const enc = this.device.createCommandEncoder();

    for (let i = 0; i < this.stepsPerFrame; i++) {
      const cp = enc.beginComputePass();
      cp.setPipeline(this.computePL);
      cp.setBindGroup(0, this.computeBG);
      cp.dispatchWorkgroups(
        Math.ceil(this.gw / INNER),
        Math.ceil(this.gh / INNER),
      );
      cp.end();
    }

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
