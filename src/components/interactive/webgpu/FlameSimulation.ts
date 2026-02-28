/**
 * 3D Lattice Boltzmann flame simulation with volumetric ray marching.
 * D3Q19 model, single read_write buffers (race conditions accepted),
 * thermal buoyancy, and orbit camera controls.
 */

import { WebGPUSimulation } from './WebGPUSimulation';
import { createShader, fullscreenPass, isMobile } from './utils';

import d3q19Src from './d3q19.wgsl?raw';
import flameParamsSrc from './flame-params.wgsl?raw';
import trilinearSrc from './trilinear.wgsl?raw';
import fullscreenVertexSrc from './fullscreen.vertex.wgsl?raw';
import initSrc from './flame.init.wgsl?raw';
import lbmSrc from './flame.lbm.wgsl?raw';
import temperatureSrc from './flame.temperature.wgsl?raw';
import renderSrc from './flame.render.wgsl?raw';

// ── Types ──────────────────────────────────────────────────────────────

export interface SimColors {
  alive: [number, number, number, number];
  dead: [number, number, number, number];
}

/** Tunable parameters exposed to lil-gui. */
export interface FlameTuning {
  // Flow (affect turbulence)
  tau: number;          // relaxation time: viscosity = (tau - 0.5)/3
  buoyancy: number;     // thermal buoyancy strength
  // Heat source
  heatRate: number;     // fuel injection rate per step
  cooling: number;      // multiplicative temperature decay per step
  sourceRadius: number; // heat source radius (fraction of grid)
  sourceJitter: number; // source position flicker (fraction of grid)
  // Turbulence
  turbulence: number;   // noise-based velocity perturbation strength
  substeps: number;     // LBM iterations per frame (more = faster flow)
  // Rendering
  densityScale: number; // volumetric ray march opacity multiplier
}

// ── Minimal mat4 utilities (column-major Float32Array) ────────────────

function perspective(fov: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan(fov / 2);
  const ri = 1 / (near - far);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = far * ri;
  m[11] = -1;
  m[14] = near * far * ri;
  return m;
}

function lookAt(eye: number[], target: number[], up: number[]): Float32Array {
  let fx = eye[0] - target[0], fy = eye[1] - target[1], fz = eye[2] - target[2];
  let len = 1 / Math.sqrt(fx * fx + fy * fy + fz * fz);
  fx *= len; fy *= len; fz *= len;

  let rx = up[1] * fz - up[2] * fy;
  let ry = up[2] * fx - up[0] * fz;
  let rz = up[0] * fy - up[1] * fx;
  len = 1 / Math.sqrt(rx * rx + ry * ry + rz * rz);
  rx *= len; ry *= len; rz *= len;

  const ux = fy * rz - fz * ry;
  const uy = fz * rx - fx * rz;
  const uz = fx * ry - fy * rx;

  return new Float32Array([
    rx, ux, fx, 0,
    ry, uy, fy, 0,
    rz, uz, fz, 0,
    -(rx * eye[0] + ry * eye[1] + rz * eye[2]),
    -(ux * eye[0] + uy * eye[1] + uz * eye[2]),
    -(fx * eye[0] + fy * eye[1] + fz * eye[2]),
    1,
  ]);
}

function mat4Mul(a: Float32Array, b: Float32Array): Float32Array {
  const o = new Float32Array(16);
  for (let j = 0; j < 4; j++)
    for (let i = 0; i < 4; i++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + i] * b[j * 4 + k];
      o[j * 4 + i] = s;
    }
  return o;
}

function invertView(v: Float32Array): Float32Array {
  const o = new Float32Array(16);
  o[0] = v[0]; o[1] = v[4]; o[2] = v[8];
  o[4] = v[1]; o[5] = v[5]; o[6] = v[9];
  o[8] = v[2]; o[9] = v[6]; o[10] = v[10];
  o[3] = 0; o[7] = 0; o[11] = 0;
  const tx = v[12], ty = v[13], tz = v[14];
  o[12] = -(o[0] * tx + o[4] * ty + o[8] * tz);
  o[13] = -(o[1] * tx + o[5] * ty + o[9] * tz);
  o[14] = -(o[2] * tx + o[6] * ty + o[10] * tz);
  o[15] = 1;
  return o;
}

function invertPerspective(p: Float32Array): Float32Array {
  const o = new Float32Array(16);
  o[0] = 1 / p[0];
  o[5] = 1 / p[5];
  o[11] = 1 / p[14];
  o[14] = -1;
  o[15] = p[10] / p[14];
  return o;
}

// ── FlameSimulation ───────────────────────────────────────────────────

export class FlameSimulation extends WebGPUSimulation {
  private gridN: number;
  private colors: SimColors;

  // GPU resources (sim — persist across resize)
  private distBuf: GPUBuffer | null = null;
  private macroBuf: GPUBuffer | null = null;
  private tempBuf: GPUBuffer | null = null;
  private simParamsBuf: GPUBuffer | null = null;

  // GPU resources (render — recreated on resize)
  private renderParamsBuf: GPUBuffer | null = null;

  // Pipelines
  private initPL!: GPUComputePipeline;
  private lbmPL!: GPUComputePipeline;
  private tempPL!: GPUComputePipeline;

  // Bind groups
  private initBG!: GPUBindGroup;
  private lbmBG!: GPUBindGroup;
  private tempBG!: GPUBindGroup;

  // Camera (orbit)
  private theta = 0;
  private phi = 0.3;
  private radius = 2.5;
  private target = [0.5, 0.3, 0.5];

  // Pointer tracking
  private pointers = new Map<number, { x: number; y: number }>();
  private lastPinchDist = 0;

  // Simulation constants
  private simTime = 0;
  private marchSteps: number;

  /** Live-tunable parameters (bind to lil-gui). */
  tuning: FlameTuning = {
    tau: 0.54,
    buoyancy: 0.03,
    heatRate: 0.8,
    cooling: 0.995,
    sourceRadius: 0.02,
    sourceJitter: 0.005,
    turbulence: 0.03,
    substeps: 4,
    densityScale: 12.0,
  };

  constructor(config: { canvas: HTMLCanvasElement; gridSize?: number; colors: SimColors }) {
    super({
      canvas: config.canvas,
      cellSize: 1,
      updateInterval: 0,
    } as any);
    this.gridN = config.gridSize ?? (isMobile() ? 32 : 48);
    this.colors = config.colors;
    this.marchSteps = isMobile() ? 32 : 48;
  }

  // ── Pipelines (created once) ──────────────────────────────────────

  buildPipelines(): void {
    const includes = {
      d3q19: d3q19Src,
      flame_params: flameParamsSrc,
      trilinear: trilinearSrc,
      fullscreen_vertex: fullscreenVertexSrc,
    };

    const compute = (src: string) =>
      this.device.createComputePipeline({
        layout: 'auto',
        compute: { module: createShader(this.device, src, includes)! },
      });

    this.initPL = compute(initSrc);
    this.lbmPL = compute(lbmSrc);
    this.tempPL = compute(temperatureSrc);

    const renderModule = createShader(this.device, renderSrc, includes)!;
    this.renderPL = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: { module: renderModule, entryPoint: 'vert' },
      fragment: {
        module: renderModule,
        entryPoint: 'frag',
        targets: [{ format: this.format }],
      },
      primitive: { topology: 'triangle-list' },
    });
  }

  // ── Resources ─────────────────────────────────────────────────────

  buildResources(): void {
    const N = this.gridN;
    const total = N * N * N;
    const firstBuild = !this.distBuf;

    if (firstBuild) {
      this.distBuf = this.device.createBuffer({
        size: 19 * total * 4,
        usage: GPUBufferUsage.STORAGE,
      });
      this.macroBuf = this.device.createBuffer({
        size: total * 16,
        usage: GPUBufferUsage.STORAGE,
      });
      this.tempBuf = this.device.createBuffer({
        size: total * 4,
        usage: GPUBufferUsage.STORAGE,
      });
      this.simParamsBuf = this.device.createBuffer({
        size: 48,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      // Bind groups for compute pipelines (init & LBM share layout)
      const simEntries = [
        { binding: 0, resource: { buffer: this.distBuf } },
        { binding: 1, resource: { buffer: this.macroBuf } },
        { binding: 2, resource: { buffer: this.tempBuf } },
        { binding: 3, resource: { buffer: this.simParamsBuf } },
      ];
      this.initBG = this.device.createBindGroup({
        layout: this.initPL.getBindGroupLayout(0),
        entries: simEntries,
      });
      this.lbmBG = this.device.createBindGroup({
        layout: this.lbmPL.getBindGroupLayout(0),
        entries: simEntries,
      });
      this.tempBG = this.device.createBindGroup({
        layout: this.tempPL.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.tempBuf } },
          { binding: 1, resource: { buffer: this.macroBuf } },
          { binding: 2, resource: { buffer: this.simParamsBuf } },
        ],
      });

      // Initialize simulation state
      this.writeSimParams();
      const wg = Math.ceil(N / 4);
      const enc = this.device.createCommandEncoder();
      const pass = enc.beginComputePass();
      pass.setPipeline(this.initPL);
      pass.setBindGroup(0, this.initBG);
      pass.dispatchWorkgroups(wg, wg, wg);
      pass.end();
      this.device.queue.submit([enc.finish()]);
    }

    // (Re)create render uniform + bind group on every build (resolution may change)
    this.renderParamsBuf?.destroy();
    this.renderParamsBuf = this.device.createBuffer({
      size: 128,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.renderBG = this.device.createBindGroup({
      layout: (this.renderPL as GPURenderPipeline).getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.tempBuf! } },
        { binding: 1, resource: { buffer: this.renderParamsBuf } },
      ],
    });
    this.writeRenderParams();
  }

  destroyResources(): void {
    // Only destroy render buffer; sim buffers persist across resize
    this.renderParamsBuf?.destroy();
    this.renderParamsBuf = null;
  }

  // ── Frame loop ────────────────────────────────────────────────────

  frame(): void {
    const N = this.gridN;
    const wg = Math.ceil(N / 4);
    const steps = Math.max(1, Math.round(this.tuning.substeps));
    const enc = this.device.createCommandEncoder();

    // Run multiple LBM + temperature substeps per frame
    for (let s = 0; s < steps; s++) {
      this.simTime += 0.016 / steps;
      this.writeSimParams();

      // Compute pass 1: LBM collide + stream + buoyancy + turbulence
      const cp1 = enc.beginComputePass();
      cp1.setPipeline(this.lbmPL);
      cp1.setBindGroup(0, this.lbmBG);
      cp1.dispatchWorkgroups(wg, wg, wg);
      cp1.end();

      // Compute pass 2: temperature advection + cooling + injection
      const cp2 = enc.beginComputePass();
      cp2.setPipeline(this.tempPL);
      cp2.setBindGroup(0, this.tempBG);
      cp2.dispatchWorkgroups(wg, wg, wg);
      cp2.end();
    }

    this.writeRenderParams();

    // Render pass: volumetric ray march
    fullscreenPass(
      enc,
      this.ctx.getCurrentTexture().createView(),
      this.renderPL as GPURenderPipeline,
      this.renderBG!,
    );

    this.device.queue.submit([enc.finish()]);
  }

  // ── Uniform writes ────────────────────────────────────────────────

  private writeSimParams(): void {
    const buf = new ArrayBuffer(48);
    const u = new Uint32Array(buf);
    const f = new Float32Array(buf);
    const t = this.tuning;
    u[0] = this.gridN;
    f[1] = t.tau;
    f[2] = t.buoyancy;
    f[3] = t.heatRate;
    f[4] = t.cooling;
    f[5] = t.sourceRadius;
    f[6] = t.sourceJitter;
    f[7] = this.simTime;
    f[8] = t.turbulence;
    this.device.queue.writeBuffer(this.simParamsBuf!, 0, buf);
  }

  private writeRenderParams(): void {
    const { canvas, gridN, colors, marchSteps, theta, phi, radius, target } = this;
    const densityScale = this.tuning.densityScale;
    const aspect = canvas.width / canvas.height;

    // Camera position from spherical coordinates
    const eye = [
      target[0] + radius * Math.cos(phi) * Math.sin(theta),
      target[1] + radius * Math.sin(phi),
      target[2] + radius * Math.cos(phi) * Math.cos(theta),
    ];

    const view = lookAt(eye, target, [0, 1, 0]);
    const proj = perspective(Math.PI / 3, aspect, 0.01, 10);
    const invVP = mat4Mul(invertView(view), invertPerspective(proj));

    const d = new Float32Array(32);
    d.set(invVP, 0);                                         // [0-15]  inv_view_proj
    d[16] = eye[0]; d[17] = eye[1]; d[18] = eye[2];          // [16-18] camera_pos xyz
    d[19] = gridN;                                            // [19]    camera_pos.w = grid_size
    d[20] = colors.alive[0]; d[21] = colors.alive[1];        // [20-23] alive
    d[22] = colors.alive[2]; d[23] = colors.alive[3];
    d[24] = colors.dead[0]; d[25] = colors.dead[1];          // [24-27] dead
    d[26] = colors.dead[2]; d[27] = colors.dead[3];
    d[28] = canvas.width; d[29] = canvas.height;             // [28-29] resolution
    d[30] = densityScale;                                     // [30]    density_scale
    d[31] = marchSteps;                                       // [31]    march_steps

    this.device.queue.writeBuffer(this.renderParamsBuf!, 0, d);
  }

  // ── Public API ────────────────────────────────────────────────────

  updateColors(c: SimColors): void {
    this.colors = c;
  }

  // ── Pointer / orbit controls ─────────────────────────────────────

  onStart(): void {
    this.canvas.style.pointerEvents = 'auto';
    this.canvas.style.touchAction = 'none';
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointercancel', this.onPointerUp);
    this.canvas.addEventListener('pointerleave', this.onPointerUp);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: true });
  }

  onStop(): void {
    this.canvas.style.pointerEvents = '';
    this.canvas.style.touchAction = '';
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerUp);
    this.canvas.removeEventListener('pointerleave', this.onPointerUp);
    this.canvas.removeEventListener('wheel', this.onWheel);
  }

  private onPointerDown = (e: PointerEvent): void => {
    this.canvas.setPointerCapture(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 2) {
      this.lastPinchDist = this.pinchDist();
    }
  };

  private onPointerMove = (e: PointerEvent): void => {
    const prev = this.pointers.get(e.pointerId);
    if (!prev) return;

    if (this.pointers.size === 1) {
      // Rotate
      this.theta += (e.clientX - prev.x) * 0.005;
      this.phi = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, this.phi - (e.clientY - prev.y) * 0.005),
      );
    } else if (this.pointers.size >= 2) {
      // Pinch zoom
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const dist = this.pinchDist();
      if (this.lastPinchDist > 0) {
        this.radius = Math.max(1, Math.min(5, this.radius * (this.lastPinchDist / dist)));
      }
      this.lastPinchDist = dist;
      return;
    }

    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };

  private onPointerUp = (e: PointerEvent): void => {
    this.pointers.delete(e.pointerId);
    this.lastPinchDist = 0;
  };

  private onWheel = (e: WheelEvent): void => {
    this.radius = Math.max(1, Math.min(5, this.radius * (1 + e.deltaY * 0.001)));
  };

  private pinchDist(): number {
    const pts = Array.from(this.pointers.values());
    if (pts.length < 2) return 0;
    const dx = pts[1].x - pts[0].x;
    const dy = pts[1].y - pts[0].y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
