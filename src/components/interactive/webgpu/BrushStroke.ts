/**
 * WebGPU sumi-e (ink wash painting) rendering of video input
 * with physarum-inspired calligraphy brush strokes.
 *
 * Pipeline per frame:
 *   1. Extract tree mask from video → maskOrigTex
 *   2. Copy → maskBlurTex, iterative blur (erosion separates branches/blossoms)
 *   3. Physarum agent step × N (agents sense trail + branch mask, move, deposit)
 *   4. Trail diffusion + decay × N (3×3 blur with workgroup cache)
 *   5. Composite: washi paper + physarum trail ink + sky wash + blossom overlay
 *
 * Agents self-organize into filamentary structures along tree branches,
 * creating emergent calligraphic brush strokes attracted to the artwork.
 */

import { createShader, fullscreenPass } from "./utils";
import { WebGPUSimulation } from "./WebGPUSimulation";
import renderSrc from "./brush-stroke.render.wgsl?raw";
import extractSrc from "./erosion-extract.render.wgsl?raw";
import blurSrc from "./erosion-blur.compute.wgsl?raw";
import attractSrc from "./attract-extract.render.wgsl?raw";
import agentsSrc from "./physarum-agents.compute.wgsl?raw";
import diffuseSrc from "./physarum-diffuse.compute.wgsl?raw";
import fullscreenVertex from "./fullscreen.vertex.wgsl?raw";

export interface BrushStrokeOptions {
  canvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  updateInterval?: number; // ms between frames (default 33 ≈ 30fps)
}

/** Tunable parameters exposed to lil-gui. */
export interface SumieTuning {
  // NPR segmentation
  branchLum: number;      // luminance threshold for branch detection
  branchEdge: number;     // contrast threshold for branch detection
  branchInk: number;      // branch stroke opacity
  skyInk: number;         // sky wash opacity
  paperTone: number;      // paper brightness
  // Erosion pipeline
  maskThreshold: number;  // luminance cutoff for tree mask extraction
  erosionSteps: number;   // blur iterations (more = stronger erosion)
  blossomInk: number;     // pink blossom overlay strength
  // Color attraction
  attractColor: string;   // hex color that agents are attracted to
  colorTolerance: number; // color distance radius (smaller = stricter match)
  // Physarum
  sensorDist: number;     // agent sensor distance in pixels
  sensorAngle: number;    // sensor spread angle in radians
  turnSpeed: number;      // heading change per step in radians
  deposit: number;        // trail deposit amount per agent per step
  trailSpeed: number;     // agent movement speed in pixels per step
  maskWeight: number;     // attraction strength to branch mask vs trail
  trailDecay: number;     // multiplicative decay per diffusion step
  diffuseWeight: number;  // blend factor: 0=no blur, 1=full blur
  physarumSteps: number;  // agent+diffuse iterations per frame
}

/** Blur dispatch uses INNER = CACHE - 2*HALO = 16 - 4 = 12. */
const BLUR_INNER = 12;
/** Physarum diffuse dispatch uses INNER = 16 - 2*1 = 14. */
const DIFFUSE_INNER = 14;
/** Workgroup size for 1D agent dispatch. */
const AGENT_WG = 256;

export class BrushStroke extends WebGPUSimulation {
  private video: HTMLVideoElement;
  private sampler!: GPUSampler;
  private paramsBuf!: GPUBuffer;
  private paramsData = new Float32Array(12); // 9 used + 3 padding

  // Erosion pipeline resources
  private extractPL!: GPURenderPipeline;
  private blurPL!: GPUComputePipeline;
  private maskOrigTex!: GPUTexture;   // sharp original mask
  private maskOrigView!: GPUTextureView;
  private maskBlurTex!: GPUTexture;   // blurred copy for classification
  private maskBlurView!: GPUTextureView;
  private extractParamsBuf!: GPUBuffer;
  private extractParamsData = new Float32Array(8); // size(2) + threshold + pad + colorLow + colorHigh + pad
  private blurBG!: GPUBindGroup;

  // Attraction field (dark green detection from video)
  private attractPL!: GPURenderPipeline;
  private attractTex!: GPUTexture;
  private attractView!: GPUTextureView;

  // Physarum resources
  private agentsPL!: GPUComputePipeline;
  private diffusePL!: GPUComputePipeline;
  private agentsBuf!: GPUBuffer;
  private trailTex!: GPUTexture;
  private trailView!: GPUTextureView;
  private physarumParamsBuf!: GPUBuffer;
  private physarumParamsData = new Float32Array(12);
  private agentsBG!: GPUBindGroup;
  private diffuseBG!: GPUBindGroup;
  private numAgents = 0;

  /** Live-tunable parameters — mutate directly, changes apply next frame. */
  readonly tuning: SumieTuning = {
    branchLum: 0.20,
    branchEdge: 0.30,
    branchInk: 1.00,
    skyInk: 0.25,
    paperTone: 1.00,
    maskThreshold: 0.34,
    erosionSteps: 100,
    blossomInk: 0.60,
    attractColor: "#2d3a1a",
    colorTolerance: 0.3,
    sensorDist: 2,
    sensorAngle: 0.43,
    turnSpeed: 0.54,
    deposit: 0.19,
    trailSpeed: 1.0,
    maskWeight: 10.0,
    trailDecay: 0.9,
    diffuseWeight: 0,
    physarumSteps: 16,
  };

  constructor(opts: BrushStrokeOptions) {
    super({
      canvas: opts.canvas,
      cellSize: 1, // full resolution
      updateInterval: opts.updateInterval ?? 33,
    });
    this.video = opts.video;
  }

  // ── Pipelines ──────────────────────────────────────────────

  protected buildPipelines(): void {
    const includes = { fullscreen_vertex: fullscreenVertex };

    // Main render pipeline (canvas output)
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

    // Mask extraction render pipeline (r32float output)
    const extractMod = createShader(this.device, extractSrc, includes);
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

    // Erosion blur compute pipeline
    const blurMod = createShader(this.device, blurSrc);
    this.blurPL = this.device.createComputePipeline({
      layout: "auto",
      compute: { module: blurMod, entryPoint: "blur" },
    });

    // Attraction field extraction (dark green from video → r32float)
    const attractMod = createShader(this.device, attractSrc, includes);
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

    // Physarum agent step compute pipeline
    const agentsMod = createShader(this.device, agentsSrc);
    this.agentsPL = this.device.createComputePipeline({
      layout: "auto",
      compute: { module: agentsMod, entryPoint: "agents_step" },
    });

    // Physarum trail diffusion compute pipeline
    const diffuseMod = createShader(this.device, diffuseSrc);
    this.diffusePL = this.device.createComputePipeline({
      layout: "auto",
      compute: { module: diffuseMod, entryPoint: "diffuse" },
    });

    this.sampler = this.device.createSampler({
      magFilter: "linear",
      minFilter: "linear",
    });
  }

  // ── Resources ──────────────────────────────────────────────

  protected buildResources(): void {
    const d = this.device;

    // Render params: 12 x f32 = 48 bytes
    this.paramsBuf = d.createBuffer({
      size: 48,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Extract params: 8 x f32 = 32 bytes (shared by erosion + attract shaders)
    this.extractParamsBuf = d.createBuffer({
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Original mask: sharp detail (render target, copy source, sampled)
    this.maskOrigTex = d.createTexture({
      size: [this.gw, this.gh],
      format: "r32float",
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT |
        GPUTextureUsage.COPY_SRC |
        GPUTextureUsage.TEXTURE_BINDING,
    });
    this.maskOrigView = this.maskOrigTex.createView();

    // Blur mask: copy of original that gets blurred in-place
    this.maskBlurTex = d.createTexture({
      size: [this.gw, this.gh],
      format: "r32float",
      usage:
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.TEXTURE_BINDING,
    });
    this.maskBlurView = this.maskBlurTex.createView();

    // Blur bind group (stable, no external texture)
    this.blurBG = d.createBindGroup({
      layout: this.blurPL.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: this.maskBlurView }],
    });

    // Attraction field: dark green detection (render target, sampled by agents)
    this.attractTex = d.createTexture({
      size: [this.gw, this.gh],
      format: "r32float",
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT |
        GPUTextureUsage.TEXTURE_BINDING,
    });
    this.attractView = this.attractTex.createView();

    // ── Physarum resources ──

    // Agent count: ~1 agent per 8 pixels, capped at 500k
    this.numAgents = Math.min(
      Math.floor((this.gw * this.gh) / 8),
      500_000,
    );

    // Agent buffer: vec4f per agent (x, y, heading, unused)
    this.agentsBuf = d.createBuffer({
      size: this.numAgents * 16,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    // Initialize agents with random positions and headings
    const agents = new Float32Array(this.numAgents * 4);
    for (let i = 0; i < this.numAgents; i++) {
      const idx = i * 4;
      agents[idx + 0] = Math.random() * this.gw;
      agents[idx + 1] = Math.random() * this.gh;
      agents[idx + 2] = Math.random() * Math.PI * 2;
      agents[idx + 3] = 0;
    }
    d.queue.writeBuffer(this.agentsBuf, 0, agents);

    // Trail texture (read_write storage + sampled in render)
    this.trailTex = d.createTexture({
      size: [this.gw, this.gh],
      format: "r32float",
      usage:
        GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.TEXTURE_BINDING,
    });
    this.trailView = this.trailTex.createView();

    // Physarum params: 12 x f32 = 48 bytes
    this.physarumParamsBuf = d.createBuffer({
      size: 48,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Agent step bind group
    this.agentsBG = d.createBindGroup({
      layout: this.agentsPL.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.agentsBuf } },
        { binding: 1, resource: this.trailView },
        { binding: 2, resource: this.attractView },
        { binding: 3, resource: { buffer: this.physarumParamsBuf } },
      ],
    });

    // Trail diffusion bind group
    this.diffuseBG = d.createBindGroup({
      layout: this.diffusePL.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.trailView },
        { binding: 1, resource: { buffer: this.physarumParamsBuf } },
      ],
    });
  }

  protected destroyResources(): void {
    this.paramsBuf.destroy();
    this.extractParamsBuf.destroy();
    this.maskOrigTex.destroy();
    this.maskBlurTex.destroy();
    this.attractTex.destroy();
    this.agentsBuf.destroy();
    this.trailTex.destroy();
    this.physarumParamsBuf.destroy();
  }

  // ── Rendering ──────────────────────────────────────────────

  /**
   * Render one frame:
   *   extract mask → copy → erosion blur → physarum (agents + diffuse) → composite
   */
  private renderNPR(): void {
    if (this.video.readyState < 2) return;

    let ext: GPUExternalTexture;
    try {
      ext = this.device.importExternalTexture({ source: this.video });
    } catch {
      return;
    }

    const t = this.tuning;

    // Upload extract params
    this.extractParamsData[0] = this.gw;
    this.extractParamsData[1] = this.gh;
    this.extractParamsData[2] = t.maskThreshold;
    // Parse hex color to RGB floats for attraction shader
    const hex = t.attractColor;
    this.extractParamsData[3] = t.colorTolerance;
    this.extractParamsData[4] = parseInt(hex.slice(1, 3), 16) / 255;
    this.extractParamsData[5] = parseInt(hex.slice(3, 5), 16) / 255;
    this.extractParamsData[6] = parseInt(hex.slice(5, 7), 16) / 255;
    this.device.queue.writeBuffer(
      this.extractParamsBuf, 0, this.extractParamsData,
    );

    // Upload render params
    this.paramsData[0] = this.gw;
    this.paramsData[1] = this.gh;
    this.paramsData[2] = performance.now() / 1000.0;
    this.paramsData[3] = t.branchLum;
    this.paramsData[4] = t.branchEdge;
    this.paramsData[5] = t.branchInk;
    this.paramsData[6] = t.skyInk;
    this.paramsData[7] = t.paperTone;
    this.paramsData[8] = t.blossomInk;
    this.device.queue.writeBuffer(this.paramsBuf, 0, this.paramsData);

    // Upload physarum params
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
    this.device.queue.writeBuffer(
      this.physarumParamsBuf, 0, this.physarumParamsData,
    );

    // Create bind groups that reference external texture (expires after microtask)
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
      ],
    });

    const renderBG = this.device.createBindGroup({
      layout: this.renderPL.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: ext },
        { binding: 1, resource: this.sampler },
        { binding: 2, resource: { buffer: this.paramsBuf } },
        { binding: 3, resource: this.maskBlurView },   // eroded classification
        { binding: 4, resource: this.maskOrigView },    // sharp original
        { binding: 5, resource: this.trailView },       // physarum trail
      ],
    });

    const enc = this.device.createCommandEncoder();

    // Pass 1a: Extract tree mask from video → sharp original texture
    fullscreenPass(enc, this.maskOrigView, this.extractPL, extractBG);

    // Pass 1b: Extract dark green attraction field from video
    fullscreenPass(enc, this.attractView, this.attractPL, attractBG);

    // Copy original → blur texture (preserves original for sharp detail)
    enc.copyTextureToTexture(
      { texture: this.maskOrigTex },
      { texture: this.maskBlurTex },
      [this.gw, this.gh],
    );

    // Pass 2: Iterative blur on the COPY (erodes thin structures)
    const erosionSteps = Math.max(0, Math.round(t.erosionSteps));
    for (let i = 0; i < erosionSteps; i++) {
      const cp = enc.beginComputePass();
      cp.setPipeline(this.blurPL);
      cp.setBindGroup(0, this.blurBG);
      cp.dispatchWorkgroups(
        Math.ceil(this.gw / BLUR_INNER),
        Math.ceil(this.gh / BLUR_INNER),
      );
      cp.end();
    }

    // Pass 3: Physarum — interleaved agent step + trail diffusion
    const pSteps = Math.max(1, Math.round(t.physarumSteps));
    for (let i = 0; i < pSteps; i++) {
      // Agent step: sense → turn → move → deposit
      const cp1 = enc.beginComputePass();
      cp1.setPipeline(this.agentsPL);
      cp1.setBindGroup(0, this.agentsBG);
      cp1.dispatchWorkgroups(Math.ceil(this.numAgents / AGENT_WG));
      cp1.end();

      // Trail diffusion + decay
      const cp2 = enc.beginComputePass();
      cp2.setPipeline(this.diffusePL);
      cp2.setBindGroup(0, this.diffuseBG);
      cp2.dispatchWorkgroups(
        Math.ceil(this.gw / DIFFUSE_INNER),
        Math.ceil(this.gh / DIFFUSE_INNER),
      );
      cp2.end();
    }

    // Pass 4: Final composite (reads trail + masks)
    fullscreenPass(
      enc,
      this.ctx.getCurrentTexture().createView(),
      this.renderPL,
      renderBG,
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
