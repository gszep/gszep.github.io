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
import smokeSrc from './flame.smoke.wgsl?raw';
import golSrc from './flame.gol.wgsl?raw';

export interface SimColors {
  alive: [number, number, number, number];
  dead: [number, number, number, number];
}

export interface FlameTuning {
  detail: number;
  buoyancy: number;
  heatRate: number;
  sourceRadius: number;
  turbulence: number;
  densityScale: number;
  golThreshold: number;
  golTransition: number;
  golTickRate: number;
  golPixelScaleMax: number;
}

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

export class FlameSimulation extends WebGPUSimulation {
  private gridN: number;
  private colors: SimColors;

  private distBuf: GPUBuffer | null = null;
  private macroBuf: GPUBuffer | null = null;
  private tempBuf: GPUBuffer | null = null;
  private smokeBuf: GPUBuffer | null = null;
  private simParamsBuf: GPUBuffer | null = null;
  private renderParamsBuf: GPUBuffer | null = null;
  private swirlBuf: GPUBuffer | null = null;
  private golBuf: GPUBuffer | null = null;

  private initPL!: GPUComputePipeline;
  private lbmPL!: GPUComputePipeline;
  private tempPL!: GPUComputePipeline;
  private smokePL!: GPUComputePipeline;
  private golPL!: GPUComputePipeline;

  private initBG!: GPUBindGroup;
  private lbmBG!: GPUBindGroup;
  private tempBG!: GPUBindGroup;
  private smokeBG!: GPUBindGroup;
  private golBG!: GPUBindGroup;

  theta = 0;
  private phi = 0.3;
  private radius = 2.5;

  private simTime = 0;
  private marchSteps: number;

  private swirlCount = 0;
  private swirlCPU = new Float32Array(64 * 8);

  private golN = 256;
  private golTickAccum = 0;

  tuning: FlameTuning = {
    detail: 72,
    buoyancy: 0.105,
    heatRate: 2.1,
    sourceRadius: 0.02,
    turbulence: 0,
    densityScale: 10,
    golThreshold: 0.05,
    golTransition: 0,
    golTickRate: 0.1,
    golPixelScaleMax: 1,
  };

  constructor(config: { canvas: HTMLCanvasElement; gridSize?: number; colors: SimColors }) {
    super({
      canvas: config.canvas,
      cellSize: 1,
      updateInterval: 0,
    } as any);
    if (config.gridSize) this.tuning.detail = config.gridSize;
    if (isMobile()) {
      this.tuning.detail = Math.min(this.tuning.detail, 48);
      this.golN = 128;
    }
    this.gridN = this.tuning.detail;
    this.colors = config.colors;
    this.marchSteps = this.gridN;
  }

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
    this.smokePL = compute(smokeSrc);
    this.golPL = compute(golSrc);

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

  buildResources(): void {
    const N = this.gridN;
    const NY = N * 2;
    const total = N * NY * N;
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
      this.smokeBuf = this.device.createBuffer({
        size: total * 4,
        usage: GPUBufferUsage.STORAGE,
      });
      this.simParamsBuf = this.device.createBuffer({
        size: 64,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      this.swirlBuf = this.device.createBuffer({
        size: 64 * 32,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      this.golBuf = this.device.createBuffer({
        size: this.golN * this.golN * 4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });

      // Seed GoL with random alive cells near the flame source (center)
      const golData = new Uint32Array(this.golN * this.golN);
      const cx = this.golN / 2;
      const seedR = this.golN * 0.15;
      for (let z = 0; z < this.golN; z++) {
        for (let x = 0; x < this.golN; x++) {
          const dx = x - cx, dz = z - cx;
          if (dx * dx + dz * dz < seedR * seedR && Math.random() < 0.07) {
            golData[z * this.golN + x] = 1;
          }
        }
      }
      this.device.queue.writeBuffer(this.golBuf, 0, golData);

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
        entries: [
          ...simEntries,
          { binding: 4, resource: { buffer: this.swirlBuf! } },
        ],
      });
      this.tempBG = this.device.createBindGroup({
        layout: this.tempPL.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.tempBuf } },
          { binding: 1, resource: { buffer: this.macroBuf } },
          { binding: 2, resource: { buffer: this.simParamsBuf } },
        ],
      });
      this.smokeBG = this.device.createBindGroup({
        layout: this.smokePL.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.smokeBuf } },
          { binding: 1, resource: { buffer: this.macroBuf } },
          { binding: 2, resource: { buffer: this.simParamsBuf } },
        ],
      });
      this.golBG = this.device.createBindGroup({
        layout: this.golPL.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.golBuf! } },
          { binding: 1, resource: { buffer: this.smokeBuf } },
          { binding: 2, resource: { buffer: this.simParamsBuf } },
        ],
      });

      this.writeSimParams();
      const wg = Math.ceil(N / 4);
      const wgY = Math.ceil(NY / 4);
      const enc = this.device.createCommandEncoder();
      const pass = enc.beginComputePass();
      pass.setPipeline(this.initPL);
      pass.setBindGroup(0, this.initBG);
      pass.dispatchWorkgroups(wg, wgY, wg);
      pass.end();
      this.device.queue.submit([enc.finish()]);
    }

    this.renderParamsBuf?.destroy();
    this.renderParamsBuf = this.device.createBuffer({
      size: 160,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.renderBG = this.device.createBindGroup({
      layout: (this.renderPL as GPURenderPipeline).getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.smokeBuf! } },
        { binding: 1, resource: { buffer: this.renderParamsBuf } },
        { binding: 2, resource: { buffer: this.golBuf! } },
      ],
    });
    this.writeRenderParams();
  }

  destroyResources(): void {
    this.renderParamsBuf?.destroy();
    this.renderParamsBuf = null;
  }

  frame(): void {
    const targetN = Math.round(this.tuning.detail);
    if (targetN !== this.gridN) {
      this.gridN = targetN;
      this.marchSteps = targetN;
      this.destroySimBuffers();
      this.buildResources();
    }

    this.updateSwirls(0.016);
    if (this.swirlCount > 0) {
      this.device.queue.writeBuffer(this.swirlBuf!, 0, this.swirlCPU, 0, this.swirlCount * 8);
    }

    const N = this.gridN;
    const NY = N * 2;
    const wg = Math.ceil(N / 4);
    const wgY = Math.ceil(NY / 4);
    const steps = 4;
    const enc = this.device.createCommandEncoder();

    for (let s = 0; s < steps; s++) {
      this.simTime += 0.016 / steps;
      this.writeSimParams();

      const cp1 = enc.beginComputePass();
      cp1.setPipeline(this.lbmPL);
      cp1.setBindGroup(0, this.lbmBG);
      cp1.dispatchWorkgroups(wg, wgY, wg);
      cp1.end();

      const cp2 = enc.beginComputePass();
      cp2.setPipeline(this.tempPL);
      cp2.setBindGroup(0, this.tempBG);
      cp2.dispatchWorkgroups(wg, wgY, wg);
      cp2.end();

      const cp3 = enc.beginComputePass();
      cp3.setPipeline(this.smokePL);
      cp3.setBindGroup(0, this.smokeBG);
      cp3.dispatchWorkgroups(wg, wgY, wg);
      cp3.end();
    }

    this.golTickAccum += this.tuning.golTickRate;
    while (this.golTickAccum >= 1.0) {
      this.golTickAccum -= 1.0;
      const golWg = Math.ceil(this.golN / 8);
      const golPass = enc.beginComputePass();
      golPass.setPipeline(this.golPL);
      golPass.setBindGroup(0, this.golBG);
      golPass.dispatchWorkgroups(golWg, golWg);
      golPass.end();
    }

    this.writeRenderParams();

    fullscreenPass(
      enc,
      this.ctx.getCurrentTexture().createView(),
      this.renderPL as GPURenderPipeline,
      this.renderBG!,
    );

    this.device.queue.submit([enc.finish()]);
  }

  private writeSimParams(): void {
    const buf = new ArrayBuffer(64);
    const u = new Uint32Array(buf);
    const f = new Float32Array(buf);
    u[0] = this.gridN;
    u[1] = this.gridN * 2;             // ny (height = 2x width)
    f[2] = 0.51;                       // tau (BGK relaxation)
    f[3] = this.tuning.buoyancy;
    f[4] = this.tuning.heatRate;
    f[5] = 0.95;                       // cooling
    f[6] = this.tuning.sourceRadius;
    f[7] = 0.095;                      // source jitter
    f[8] = this.simTime;
    u[9] = this.swirlCount;
    u[10] = this.golN;
    f[11] = this.tuning.golThreshold;
    f[12] = this.tuning.golTransition;
    this.device.queue.writeBuffer(this.simParamsBuf!, 0, buf);
  }

  private writeRenderParams(): void {
    const { canvas, gridN, colors, marchSteps, theta, phi, radius } = this;
    const densityScale = this.tuning.densityScale;
    const aspect = canvas.width / canvas.height;
    // Volume is 1:2 ratio (N wide, 2N tall)
    const volumeH = 2.0;
    const NY = gridN * 2;
    const target = [0.5, volumeH * 0.5, 0.5];

    const eye = [
      target[0] + radius * Math.cos(phi) * Math.sin(theta),
      target[1] + radius * Math.sin(phi),
      target[2] + radius * Math.cos(phi) * Math.cos(theta),
    ];

    const view = lookAt(eye, target, [0, 1, 0]);
    const proj = perspective(Math.PI / 3, aspect, 0.01, 10);
    const invVP = mat4Mul(invertView(view), invertPerspective(proj));

    const d = new Float32Array(40);
    d.set(invVP, 0);
    d[16] = eye[0]; d[17] = eye[1]; d[18] = eye[2];
    d[19] = gridN;
    d[20] = colors.alive[0]; d[21] = colors.alive[1];
    d[22] = colors.alive[2]; d[23] = colors.alive[3];
    d[24] = colors.dead[0]; d[25] = colors.dead[1];
    d[26] = colors.dead[2]; d[27] = colors.dead[3];
    d[28] = canvas.width; d[29] = canvas.height;
    d[30] = densityScale;
    d[31] = marchSteps;
    d[32] = this.golN;
    d[33] = this.tuning.golPixelScaleMax;
    d[34] = volumeH;
    d[35] = NY;
    d[36] = this.tuning.golThreshold;  // threshold for binarization
    d[37] = theta;
    d[38] = 0;
    d[39] = 0;

    this.device.queue.writeBuffer(this.renderParamsBuf!, 0, d);
  }

  private updateSwirls(dt: number): void {
    const N = this.gridN;
    const t = this.tuning;

    // Age, advect, and compact surviving swirls
    let alive = 0;
    for (let i = 0; i < this.swirlCount; i++) {
      const b = i * 8;
      this.swirlCPU[b + 5] -= dt;
      if (this.swirlCPU[b + 5] > 0) {
        // Drift upward with buoyancy + lateral wander
        this.swirlCPU[b + 1] += t.buoyancy * N * 0.3 * dt;
        this.swirlCPU[b + 0] += (Math.random() - 0.5) * 0.2;
        this.swirlCPU[b + 2] += (Math.random() - 0.5) * 0.2;
        if (alive !== i) {
          for (let j = 0; j < 8; j++) {
            this.swirlCPU[alive * 8 + j] = this.swirlCPU[i * 8 + j];
          }
        }
        alive++;
      }
    }
    this.swirlCount = alive;

    // Spawn new swirls on the ring source
    const rate = t.turbulence * 10;
    const omega = t.turbulence * 0.04;
    let toSpawn = Math.floor(rate) + (Math.random() < rate % 1 ? 1 : 0);
    for (let k = 0; k < toSpawn && this.swirlCount < 64; k++) {
      const angle = Math.random() * 2 * Math.PI;
      const ringR = t.sourceRadius * N;
      const b = this.swirlCount * 8;
      this.swirlCPU[b + 0] = N * 0.5 + Math.cos(angle) * ringR;
      this.swirlCPU[b + 1] = 1.0;
      this.swirlCPU[b + 2] = N * 0.5 + Math.sin(angle) * ringR;
      this.swirlCPU[b + 3] = (Math.random() < 0.5 ? -1 : 1) * omega;
      this.swirlCPU[b + 4] = N * 0.12;
      this.swirlCPU[b + 5] = 0.8 + Math.random() * 0.4;
      this.swirlCPU[b + 6] = 0;
      this.swirlCPU[b + 7] = 0;
      this.swirlCount++;
    }
  }

  private destroySimBuffers(): void {
    this.distBuf?.destroy(); this.distBuf = null;
    this.macroBuf?.destroy(); this.macroBuf = null;
    this.tempBuf?.destroy(); this.tempBuf = null;
    this.smokeBuf?.destroy(); this.smokeBuf = null;
    this.simParamsBuf?.destroy(); this.simParamsBuf = null;
    this.swirlBuf?.destroy(); this.swirlBuf = null;
    this.golBuf?.destroy(); this.golBuf = null;
    this.swirlCount = 0;
    this.simTime = 0;
  }

  updateColors(c: SimColors): void {
    this.colors = c;
  }

  onStart(): void {}
  onStop(): void {}

}
