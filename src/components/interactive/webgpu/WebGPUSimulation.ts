/**
 * Abstract base class for WebGPU simulations.
 *
 * Handles the common lifecycle: device init, resize, animation loop,
 * and fullscreen rendering. Subclasses implement GPU pipeline setup,
 * resource allocation, and per-frame compute logic.
 */

import { initWebGPU, resizeCanvas, fullscreenPass } from "./utils";

export interface SimulationOptions {
  canvas: HTMLCanvasElement;
  cellSize: number;
  updateInterval: number;
}

export abstract class WebGPUSimulation {
  protected canvas: HTMLCanvasElement;
  protected cellSize: number;
  protected interval: number;

  // GPU state
  protected device!: GPUDevice;
  protected ctx!: GPUCanvasContext;
  protected format!: GPUTextureFormat;
  protected gw = 0;
  protected gh = 0;

  // Rendering (subclass must set in buildPipelines/buildResources)
  protected renderPL!: GPURenderPipeline;
  protected renderBG!: GPUBindGroup;

  // Animation
  private raf: number | null = null;
  private last = 0;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(opts: SimulationOptions) {
    this.canvas = opts.canvas;
    this.cellSize = opts.cellSize;
    this.interval = opts.updateInterval;
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

      this.device.lost.then((info) => {
        console.warn(
          `[${this.constructor.name}] Device lost (${info.reason}): ${info.message}`,
        );
        this.stop();
      });

      this.gw = Math.ceil(this.canvas.width / this.cellSize);
      this.gh = Math.ceil(this.canvas.height / this.cellSize);

      this.buildPipelines();
      this.buildResources();
      this.onStart();

      this.renderFrame();
      this.raf = requestAnimationFrame(this.loop);
      return true;
    } catch (e) {
      console.warn(`[${this.constructor.name}] Init failed:`, e);
      return false;
    }
  }

  /** Stop the simulation loop. */
  stop(): void {
    if (this.raf !== null) cancelAnimationFrame(this.raf);
    this.raf = null;
    if (this.resizeTimer !== null) clearTimeout(this.resizeTimer);
    this.resizeTimer = null;
    this.onStop();
  }

  /** Handle viewport resize: rebuild grid and resources after debounce. */
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

    this.destroyResources();
    this.buildResources();
    this.renderFrame();
  }

  /** Render current state without advancing simulation. */
  protected renderFrame(): void {
    const enc = this.device.createCommandEncoder();
    fullscreenPass(
      enc,
      this.ctx.getCurrentTexture().createView(),
      this.renderPL,
      this.renderBG,
    );
    this.device.queue.submit([enc.finish()]);
  }

  private loop = (t: number): void => {
    this.raf = requestAnimationFrame(this.loop);
    if (t - this.last < this.interval) return;
    this.last = t;
    this.frame();
  };

  // ── Subclass hooks ────────────────────────────────────────

  /** Create compute and render pipelines. Called once during start(). */
  protected abstract buildPipelines(): void;

  /** Allocate GPU resources (buffers, textures, bind groups). Called on start and resize. */
  protected abstract buildResources(): void;

  /** Release GPU resources before rebuild. Called on resize before buildResources(). */
  protected abstract destroyResources(): void;

  /** Run one simulation step + render. Called each frame at the configured interval. */
  protected abstract frame(): void;

  /** Optional hook called after buildResources during start(). */
  protected onStart(): void {}

  /** Optional hook called during stop() for cleanup. */
  protected onStop(): void {}
}
