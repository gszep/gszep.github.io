import {
  createShader,
  fullscreenPass,
  MouseTracker,
} from "./utils";
import { WebGPUSimulation } from "./WebGPUSimulation";
import computeSrc from "./navier-stokes.compute.wgsl?raw";
import renderSrc from "./navier-stokes.render.wgsl?raw";
import fullscreenVertex from "./fullscreen.vertex.wgsl?raw";

export type BgColor = [number, number, number, number];

export interface NavierStokesOptions {
  canvas: HTMLCanvasElement;
  cellSize?: number;
  updateInterval?: number;
  stepsPerFrame?: number;
  brushSize?: number;
  bgColor?: BgColor;
}

const WG = 8; // must match compute shader
const TILE = 2;
const HALO = 1;
const INNER = TILE * WG - 2 * HALO;

export class NavierStokes extends WebGPUSimulation {
  private stepsPerFrame: number;
  private brushSize: number;
  private bgColor: BgColor;

  private mouse!: MouseTracker;

  private computePL!: GPUComputePipeline;
  private buf!: GPUBuffer;
  private paramsBuf!: GPUBuffer;
  private computeBG!: GPUBindGroup;
  private readbackBuf!: GPUBuffer;
  private nanCheckPending = false;

  private paramsData = new Float32Array(12);

  constructor(opts: NavierStokesOptions) {
    super({
      canvas: opts.canvas,
      cellSize: opts.cellSize ?? 4,
      updateInterval: opts.updateInterval ?? 16,
    });
    this.stepsPerFrame = opts.stepsPerFrame ?? 1;
    this.brushSize = opts.brushSize ?? 1000;
    this.bgColor = opts.bgColor ?? [1.0, 1.0, 1.0, 1.0];
  }

  updateBackground(bg: BgColor): void {
    this.bgColor = bg;
    this.paramsData[8] = bg[0];
    this.paramsData[9] = bg[1];
    this.paramsData[10] = bg[2];
    this.paramsData[11] = bg[3];
  }

  protected onStart(): void {
    this.mouse = new MouseTracker(this.canvas);
  }

  protected onStop(): void {
    this.mouse?.destroy();
  }

  protected buildPipelines(): void {
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

  protected buildResources(): void {
    const d = this.device;
    const cellCount = this.gw * this.gh;
    const bufSize = cellCount * 16; // 4 floats × 4 bytes

    this.buf = d.createBuffer({
      size: bufSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
    });

    this.resetState();

    this.paramsBuf = d.createBuffer({
      size: 48,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.paramsData.fill(0);
    this.paramsData[2] = NaN;
    this.paramsData[4] = this.gw;
    this.paramsData[5] = this.gh;
    this.paramsData[8] = this.bgColor[0];
    this.paramsData[9] = this.bgColor[1];
    this.paramsData[10] = this.bgColor[2];
    this.paramsData[11] = this.bgColor[3];
    d.queue.writeBuffer(this.paramsBuf, 0, this.paramsData);

    this.readbackBuf = d.createBuffer({
      size: 64,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });

    this.computeBG = d.createBindGroup({
      layout: this.computePL.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.buf } },
        { binding: 1, resource: { buffer: this.paramsBuf } },
      ],
    });

    this.renderBG = d.createBindGroup({
      layout: this.renderPL.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.buf } },
        { binding: 1, resource: { buffer: this.paramsBuf } },
      ],
    });
  }

  protected destroyResources(): void {
    this.buf.destroy();
    this.paramsBuf.destroy();
    this.readbackBuf.destroy();
    this.nanCheckPending = false;
  }

  private resetState(): void {
    const cellCount = this.gw * this.gh;
    const init = new Float32Array(cellCount * 4);
    const scale = Math.min(this.gw, this.gh);
    const blobs = [
      { x: 0.22, y: 0.28, a: 0.8, s: 0.05 },
      { x: 0.28, y: 0.33, a: -0.8, s: 0.05 },
      { x: 0.55, y: 0.40, a: 0.4, s: 0.10 },
      { x: 0.50, y: 0.55, a: -0.4, s: 0.10 },
      { x: 0.72, y: 0.68, a: 1.0, s: 0.03 },
      { x: 0.76, y: 0.72, a: -1.0, s: 0.03 },
      { x: 0.82, y: 0.25, a: 0.6, s: 0.07 },
      { x: 0.18, y: 0.72, a: -0.5, s: 0.04 },
      { x: 0.30, y: 0.65, a: 0.5, s: 0.04 },
    ];
    for (let iy = 0; iy < this.gh; iy++) {
      for (let ix = 0; ix < this.gw; ix++) {
        let w = 0;
        for (const b of blobs) {
          const dx = ix - b.x * this.gw;
          const dy = iy - b.y * this.gh;
          const r2 = dx * dx + dy * dy;
          const sig = b.s * scale;
          w += b.a * Math.exp(-r2 / (2 * sig * sig));
        }
        const idx = (iy * this.gw + ix) * 4;
        init[idx] = Math.abs(w) / (1 + w);
        init[idx + 3] = w;
      }
    }
    this.device.queue.writeBuffer(this.buf, 0, init);
  }

  protected frame(): void {
    const m = this.mouse.state;
    this.paramsData[0] = m.x * this.gw;
    this.paramsData[1] = m.y * this.gh;
    if (m.active) {
      const gridRadius = this.brushSize / this.cellSize;
      this.paramsData[2] = m.button === 2 ? -gridRadius : gridRadius;
    } else {
      this.paramsData[2] = NaN;
    }

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

    // Async NaN detection: read 4 corners, reset if all NaN
    if (!this.nanCheckPending) {
      this.nanCheckPending = true;
      const corners = [
        0,
        (this.gw - 1) * 16,
        (this.gh - 1) * this.gw * 16,
        ((this.gh - 1) * this.gw + this.gw - 1) * 16,
      ];
      const enc2 = this.device.createCommandEncoder();
      for (let i = 0; i < 4; i++) {
        enc2.copyBufferToBuffer(this.buf, corners[i], this.readbackBuf, i * 16, 16);
      }
      this.device.queue.submit([enc2.finish()]);
      this.readbackBuf.mapAsync(GPUMapMode.READ).then(() => {
        const data = new Float32Array(this.readbackBuf.getMappedRange());
        const allNaN =
          isNaN(data[3]) && isNaN(data[7]) && isNaN(data[11]) && isNaN(data[15]);
        this.readbackBuf.unmap();
        this.nanCheckPending = false;
        if (allNaN) {
          console.warn("[NavierStokes] NaN in all corners, resetting simulation");
          this.resetState();
        }
      }).catch(() => {
        this.nanCheckPending = false;
      });
    }
  }
}
