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

  protected device!: GPUDevice;
  protected ctx!: GPUCanvasContext;
  protected format!: GPUTextureFormat;
  protected gw = 0;
  protected gh = 0;

  protected renderPL!: GPURenderPipeline;
  protected renderBG!: GPUBindGroup;

  private raf: number | null = null;
  private last = 0;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(opts: SimulationOptions) {
    this.canvas = opts.canvas;
    this.cellSize = opts.cellSize;
    this.interval = opts.updateInterval;
  }

  protected sizeCanvas(): void {
    resizeCanvas(this.canvas);
  }

  async start(): Promise<boolean> {
    try {
      this.sizeCanvas();
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

  stop(): void {
    if (this.raf !== null) cancelAnimationFrame(this.raf);
    this.raf = null;
    if (this.resizeTimer !== null) clearTimeout(this.resizeTimer);
    this.resizeTimer = null;
    this.onStop();
  }

  handleResize(): void {
    if (this.resizeTimer !== null) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => this.rebuild(), 150);
  }

  private rebuild(): void {
    this.sizeCanvas();
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

  protected abstract buildPipelines(): void;
  protected abstract buildResources(): void;
  protected abstract destroyResources(): void;
  protected abstract frame(): void;
  protected onStart(): void {}
  protected onStop(): void {}
}
