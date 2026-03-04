import { createShader, fullscreenPass } from "./utils";
import { WebGPUSimulation } from "./WebGPUSimulation";
import renderSrc from "./brush-stroke.render.wgsl?raw";
import extractSrc from "./erosion-extract.render.wgsl?raw";
import blurSrc from "./erosion-blur.compute.wgsl?raw";
import attractSrc from "./attract-extract.render.wgsl?raw";
import agentsSrc from "./physarum-agents.compute.wgsl?raw";
import diffuseSrc from "./physarum-diffuse.compute.wgsl?raw";
import fullscreenVertex from "./fullscreen.vertex.wgsl?raw";
import hashSrc from "./hash.wgsl?raw";
import physarumParamsSrc from "./physarum-params.wgsl?raw";
import downsampleSrc from "./downsample.compute.wgsl?raw";
import upsampleSrc from "./upsample.compute.wgsl?raw";

export interface BrushStrokeOptions {
  canvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  updateInterval?: number;
}

export interface SumieTuning {
  branchInk: number;
  skyInk: number;
  paperTone: number;
  maskThreshold: number;
  erosionSteps: number;
  blossomInk: number;
  attractColor: string;
  colorTolerance: number;
  sensorDist: number;
  sensorAngle: number;
  turnSpeed: number;
  deposit: number;
  trailSpeed: number;
  maskWeight: number;
  trailDecay: number;
  diffuseWeight: number;
  physarumSteps: number;
  agentThreshold: number;
}

const BLUR_INNER = 12;
const DIFFUSE_INNER = 14;
const AGENT_WG = 256;
const DOWNSAMPLE = 2;
const DS_WG = 8;

export class BrushStroke extends WebGPUSimulation {
  private video: HTMLVideoElement;
  private sampler!: GPUSampler;
  private paramsBuf!: GPUBuffer;
  private paramsData = new Float32Array(8);

  private extractPL!: GPURenderPipeline;
  private blurPL!: GPUComputePipeline;
  private maskOrigTex!: GPUTexture;
  private maskOrigView!: GPUTextureView;
  private maskBlurTex!: GPUTexture;
  private maskBlurView!: GPUTextureView;
  private extractParamsBuf!: GPUBuffer;
  private extractParamsData = new Float32Array(8);
  private blurBG!: GPUBindGroup;

  private downsamplePL!: GPUComputePipeline;
  private upsamplePL!: GPUComputePipeline;
  private maskSmallTex!: GPUTexture;
  private maskSmallView!: GPUTextureView;
  private downsampleBG!: GPUBindGroup;
  private upsampleBG!: GPUBindGroup;
  private smallW = 0;
  private smallH = 0;

  private attractPL!: GPURenderPipeline;
  private attractTex!: GPUTexture;
  private attractView!: GPUTextureView;

  private agentsPL!: GPUComputePipeline;
  private diffusePL!: GPUComputePipeline;
  private agentsBuf!: GPUBuffer;
  private trailTex!: GPUTexture;
  private trailView!: GPUTextureView;
  private physarumParamsBuf!: GPUBuffer;
  private physarumParamsData = new Float32Array(16);
  private agentsBG!: GPUBindGroup;
  private diffuseBG!: GPUBindGroup;
  private numAgents = 0;

  readonly tuning: SumieTuning = {
    branchInk: 1.00,
    skyInk: 0.30,
    paperTone: 1.00,
    maskThreshold: 0.52,
    erosionSteps: 70,
    blossomInk: 1.00,
    attractColor: "#6c896f",
    colorTolerance: 0.32,
    sensorDist: 9.5,
    sensorAngle: 0.9,
    turnSpeed: 0.44,
    deposit: 1.78,
    trailSpeed: 1.5,
    maskWeight: 10.0,
    trailDecay: 0.986,
    diffuseWeight: 0,
    physarumSteps: 16,
    agentThreshold: 0,
  };

  constructor(opts: BrushStrokeOptions) {
    super({
      canvas: opts.canvas,
      cellSize: 1,
      updateInterval: opts.updateInterval ?? 33,
    });
    this.video = opts.video;
  }

  protected override sizeCanvas(): void {
    if (this.video.videoWidth > 0) {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
    } else {
      super.sizeCanvas();
    }
  }

  protected buildPipelines(): void {
    const vertexIncludes = { fullscreen_vertex: fullscreenVertex };
    const hashIncludes = { hash21: hashSrc };
    const physarumIncludes = { physarum_params: physarumParamsSrc, hash21: hashSrc };

    const renderMod = createShader(this.device, renderSrc, { ...vertexIncludes, ...hashIncludes });
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

    const extractMod = createShader(this.device, extractSrc, vertexIncludes);
    this.extractPL = this.device.createRenderPipeline({
      layout: "auto",
      vertex: { module: extractMod, entryPoint: "vert" },
      fragment: {
        module: extractMod,
        entryPoint: "frag",
        targets: [{ format: "r32float" }],
      },
      primitive: { topology: "triangle-list" },
    });

    const blurMod = createShader(this.device, blurSrc);
    this.blurPL = this.device.createComputePipeline({
      layout: "auto",
      compute: { module: blurMod, entryPoint: "blur" },
    });

    const downsampleMod = createShader(this.device, downsampleSrc);
    this.downsamplePL = this.device.createComputePipeline({
      layout: "auto",
      compute: { module: downsampleMod, entryPoint: "downsample" },
    });

    const upsampleMod = createShader(this.device, upsampleSrc);
    this.upsamplePL = this.device.createComputePipeline({
      layout: "auto",
      compute: { module: upsampleMod, entryPoint: "upsample" },
    });

    const attractMod = createShader(this.device, attractSrc, vertexIncludes);
    this.attractPL = this.device.createRenderPipeline({
      layout: "auto",
      vertex: { module: attractMod, entryPoint: "vert" },
      fragment: {
        module: attractMod,
        entryPoint: "frag",
        targets: [{ format: "r32float" }],
      },
      primitive: { topology: "triangle-list" },
    });

    const agentsMod = createShader(this.device, agentsSrc, physarumIncludes);
    this.agentsPL = this.device.createComputePipeline({
      layout: "auto",
      compute: { module: agentsMod, entryPoint: "agents_step" },
    });

    const diffuseMod = createShader(this.device, diffuseSrc, { physarum_params: physarumParamsSrc });
    this.diffusePL = this.device.createComputePipeline({
      layout: "auto",
      compute: { module: diffuseMod, entryPoint: "diffuse" },
    });

    this.sampler = this.device.createSampler({
      magFilter: "linear",
      minFilter: "linear",
    });
  }

  protected buildResources(): void {
    const d = this.device;

    this.paramsBuf = d.createBuffer({
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.extractParamsBuf = d.createBuffer({
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.maskOrigTex = d.createTexture({
      size: [this.gw, this.gh],
      format: "r32float",
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT |
        GPUTextureUsage.TEXTURE_BINDING,
    });
    this.maskOrigView = this.maskOrigTex.createView();

    this.smallW = Math.max(1, Math.ceil(this.gw / DOWNSAMPLE));
    this.smallH = Math.max(1, Math.ceil(this.gh / DOWNSAMPLE));
    this.maskSmallTex = d.createTexture({
      size: [this.smallW, this.smallH],
      format: "r32float",
      usage:
        GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.TEXTURE_BINDING,
    });
    this.maskSmallView = this.maskSmallTex.createView();

    this.maskBlurTex = d.createTexture({
      size: [this.gw, this.gh],
      format: "r32float",
      usage:
        GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.TEXTURE_BINDING,
    });
    this.maskBlurView = this.maskBlurTex.createView();

    this.blurBG = d.createBindGroup({
      layout: this.blurPL.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: this.maskSmallView }],
    });

    this.downsampleBG = d.createBindGroup({
      layout: this.downsamplePL.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.maskOrigView },
        { binding: 1, resource: this.maskSmallView },
      ],
    });

    this.upsampleBG = d.createBindGroup({
      layout: this.upsamplePL.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.maskSmallView },
        { binding: 1, resource: this.maskBlurView },
      ],
    });

    this.attractTex = d.createTexture({
      size: [this.gw, this.gh],
      format: "r32float",
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT |
        GPUTextureUsage.TEXTURE_BINDING,
    });
    this.attractView = this.attractTex.createView();

    this.numAgents = Math.min(
      Math.floor((this.gw * this.gh) / 8),
      500_000,
    );

    this.agentsBuf = d.createBuffer({
      size: this.numAgents * 16,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    const agents = new Float32Array(this.numAgents * 4);
    for (let i = 0; i < this.numAgents; i++) {
      const idx = i * 4;
      agents[idx + 0] = Math.random() * this.gw;
      agents[idx + 1] = Math.random() * this.gh * 0.5 + this.gh * 0.5;
      agents[idx + 2] = Math.random() * Math.PI * 2;
      agents[idx + 3] = 0;
    }
    d.queue.writeBuffer(this.agentsBuf, 0, agents);

    this.trailTex = d.createTexture({
      size: [this.gw, this.gh],
      format: "r32float",
      usage:
        GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.TEXTURE_BINDING,
    });
    this.trailView = this.trailTex.createView();

    this.physarumParamsBuf = d.createBuffer({
      size: 64,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.agentsBG = d.createBindGroup({
      layout: this.agentsPL.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.agentsBuf } },
        { binding: 1, resource: this.trailView },
        { binding: 2, resource: this.attractView },
        { binding: 3, resource: { buffer: this.physarumParamsBuf } },
        { binding: 4, resource: this.maskOrigView },
      ],
    });

    this.diffuseBG = d.createBindGroup({
      layout: this.diffusePL.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.trailView },
        { binding: 1, resource: { buffer: this.physarumParamsBuf } },
        { binding: 2, resource: this.maskOrigView },
      ],
    });

    this.renderBG = d.createBindGroup({
      layout: this.renderPL.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.paramsBuf } },
        { binding: 1, resource: this.maskBlurView },
        { binding: 2, resource: this.maskOrigView },
        { binding: 3, resource: this.trailView },
      ],
    });
  }

  protected destroyResources(): void {
    this.paramsBuf.destroy();
    this.extractParamsBuf.destroy();
    this.maskOrigTex.destroy();
    this.maskSmallTex.destroy();
    this.maskBlurTex.destroy();
    this.attractTex.destroy();
    this.agentsBuf.destroy();
    this.trailTex.destroy();
    this.physarumParamsBuf.destroy();
  }

  private renderNPR(): void {
    if (this.video.readyState < 2) return;

    let ext: GPUExternalTexture;
    try {
      ext = this.device.importExternalTexture({ source: this.video });
    } catch {
      return;
    }

    const t = this.tuning;

    this.extractParamsData[0] = this.gw;
    this.extractParamsData[1] = this.gh;
    this.extractParamsData[2] = t.maskThreshold;
    const hex = t.attractColor;
    this.extractParamsData[3] = t.colorTolerance;
    this.extractParamsData[4] = parseInt(hex.slice(1, 3), 16) / 255;
    this.extractParamsData[5] = parseInt(hex.slice(3, 5), 16) / 255;
    this.extractParamsData[6] = parseInt(hex.slice(5, 7), 16) / 255;
    this.device.queue.writeBuffer(
      this.extractParamsBuf, 0, this.extractParamsData,
    );

    this.paramsData[0] = this.gw;
    this.paramsData[1] = this.gh;
    this.paramsData[2] = t.branchInk;
    this.paramsData[3] = t.skyInk;
    this.paramsData[4] = t.paperTone;
    this.paramsData[5] = t.blossomInk;
    this.device.queue.writeBuffer(this.paramsBuf, 0, this.paramsData);

    this.physarumParamsData[0] = this.gw;
    this.physarumParamsData[1] = this.gh;
    this.physarumParamsData[2] = this.numAgents;
    this.physarumParamsData[3] = performance.now() / 1000.0;
    this.physarumParamsData[4] = t.sensorDist;
    this.physarumParamsData[5] = t.sensorAngle;
    this.physarumParamsData[6] = t.turnSpeed;
    this.physarumParamsData[7] = t.deposit;
    this.physarumParamsData[8] = t.trailSpeed;
    this.physarumParamsData[9] = t.maskWeight;
    this.physarumParamsData[10] = t.trailDecay;
    this.physarumParamsData[11] = t.diffuseWeight;
    this.physarumParamsData[12] = t.agentThreshold;
    this.device.queue.writeBuffer(
      this.physarumParamsBuf, 0, this.physarumParamsData,
    );

    const extractBG = this.device.createBindGroup({
      layout: this.extractPL.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: ext },
        { binding: 1, resource: this.sampler },
        { binding: 2, resource: { buffer: this.extractParamsBuf } },
      ],
    });

    const attractBG = this.device.createBindGroup({
      layout: this.attractPL.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: ext },
        { binding: 1, resource: this.sampler },
        { binding: 2, resource: { buffer: this.extractParamsBuf } },
        { binding: 3, resource: this.maskOrigView },
      ],
    });

    const enc = this.device.createCommandEncoder();

    fullscreenPass(enc, this.maskOrigView, this.extractPL, extractBG);
    fullscreenPass(enc, this.attractView, this.attractPL, attractBG);

    {
      const cp = enc.beginComputePass();
      cp.setPipeline(this.downsamplePL);
      cp.setBindGroup(0, this.downsampleBG);
      cp.dispatchWorkgroups(
        Math.ceil(this.smallW / DS_WG),
        Math.ceil(this.smallH / DS_WG),
      );
      cp.end();
    }

    const erosionSteps = Math.max(0, Math.round(t.erosionSteps / DOWNSAMPLE));
    for (let i = 0; i < erosionSteps; i++) {
      const cp = enc.beginComputePass();
      cp.setPipeline(this.blurPL);
      cp.setBindGroup(0, this.blurBG);
      cp.dispatchWorkgroups(
        Math.ceil(this.smallW / BLUR_INNER),
        Math.ceil(this.smallH / BLUR_INNER),
      );
      cp.end();
    }

    {
      const cp = enc.beginComputePass();
      cp.setPipeline(this.upsamplePL);
      cp.setBindGroup(0, this.upsampleBG);
      cp.dispatchWorkgroups(
        Math.ceil(this.gw / DS_WG),
        Math.ceil(this.gh / DS_WG),
      );
      cp.end();
    }

    const pSteps = Math.max(1, Math.round(t.physarumSteps));
    for (let i = 0; i < pSteps; i++) {
      const cp1 = enc.beginComputePass();
      cp1.setPipeline(this.agentsPL);
      cp1.setBindGroup(0, this.agentsBG);
      cp1.dispatchWorkgroups(Math.ceil(this.numAgents / AGENT_WG));
      cp1.end();

      const cp2 = enc.beginComputePass();
      cp2.setPipeline(this.diffusePL);
      cp2.setBindGroup(0, this.diffuseBG);
      cp2.dispatchWorkgroups(
        Math.ceil(this.gw / DIFFUSE_INNER),
        Math.ceil(this.gh / DIFFUSE_INNER),
      );
      cp2.end();
    }

    fullscreenPass(
      enc,
      this.ctx.getCurrentTexture().createView(),
      this.renderPL,
      this.renderBG,
    );

    this.device.queue.submit([enc.finish()]);
  }

  protected renderFrame(): void {
    this.renderNPR();
  }

  protected frame(): void {
    this.renderNPR();
  }
}
