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
  createShader,
  fullscreenPass,
  MouseTracker,
} from "./utils";
import { WebGPUSimulation } from "./WebGPUSimulation";
import computeSrc from "./navier-stokes.compute.wgsl?raw";
import renderSrc from "./navier-stokes.render.wgsl?raw";
import fullscreenVertex from "./fullscreen.vertex.wgsl?raw";

export interface NavierStokesOptions {
  canvas: HTMLCanvasElement;
  cellSize?: number; // px per sim cell (default 4)
  updateInterval?: number; // ms between frames (default 16)
  stepsPerFrame?: number; // compute dispatches per render (default 1)
  brushSize?: number; // radius of interaction brush in px (default 1000)
}

const WG = 8; // workgroup size (must match compute shader)
const TILE = 2;
const HALO = 1;
const INNER = TILE * WG - 2 * HALO; // 14 — active cells per workgroup

export class NavierStokes extends WebGPUSimulation {
  private stepsPerFrame: number;
  private brushSize: number;

  // Input
  private mouse!: MouseTracker;

  // Pipelines & resources
  private computePL!: GPUComputePipeline;
  private buf!: GPUBuffer;
  private paramsBuf!: GPUBuffer;
  private computeBG!: GPUBindGroup;
  private readbackBuf!: GPUBuffer;
  private nanCheckPending = false;

  // Params: [mouse.x, mouse.y, brush_size, unused, grid_w, grid_h, pad, pad]
  private paramsData = new Float32Array(8);

  constructor(opts: NavierStokesOptions) {
    super({
      canvas: opts.canvas,
      cellSize: opts.cellSize ?? 4,
      updateInterval: opts.updateInterval ?? 16,
    });
    this.stepsPerFrame = opts.stepsPerFrame ?? 1;
    this.brushSize = opts.brushSize ?? 1000;
  }

  protected onStart(): void {
    this.mouse = new MouseTracker(this.canvas);
  }

  protected onStop(): void {
    this.mouse?.destroy();
  }

  // ── Pipelines ──────────────────────────────────────────

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

  // ── Resources ──────────────────────────────────────────

  protected buildResources(): void {
    const d = this.device;
    const cellCount = this.gw * this.gh;
    const bufSize = cellCount * 16; // 4 floats × 4 bytes per cell

    // Single state buffer (read_write in compute, read in render)
    this.buf = d.createBuffer({
      size: bufSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
    });

    this.resetState();

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

    // Readback buffer for NaN corner detection (4 corners × 16 bytes)
    this.readbackBuf = d.createBuffer({
      size: 64,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });

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

  protected destroyResources(): void {
    this.buf.destroy();
    this.paramsBuf.destroy();
    this.readbackBuf.destroy();
    this.nanCheckPending = false;
  }

  /** Write initial vortex dipole state to the simulation buffer. */
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

  // ── Frame ─────────────────────────────────────────────

  protected frame(): void {
    // Map mouse state to params (convert px brush radius to grid coords)
    const m = this.mouse.state;
    this.paramsData[0] = m.x * this.gw;
    this.paramsData[1] = m.y * this.gh;
    if (m.active) {
      const gridRadius = this.brushSize / this.cellSize;
      this.paramsData[2] = m.button === 2 ? -gridRadius : gridRadius;
    } else {
      this.paramsData[2] = NaN;
    }

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
