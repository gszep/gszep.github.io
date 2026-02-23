/**
 * WebGPU sumi-e (ink wash painting) rendering of video input.
 *
 * Samples each video frame as a texture_external, runs Sobel edge
 * detection and multi-layer NPR compositing in a fragment shader.
 * Includes an erosion pipeline for morphological separation of
 * branches (thin structures) from blossoms (round structures).
 */

import { createShader, fullscreenPass } from "./utils";
import { WebGPUSimulation } from "./WebGPUSimulation";
import renderSrc from "./brush-stroke.render.wgsl?raw";
import extractSrc from "./erosion-extract.render.wgsl?raw";
import blurSrc from "./erosion-blur.compute.wgsl?raw";
import fullscreenVertex from "./fullscreen.vertex.wgsl?raw";

export interface BrushStrokeOptions {
  canvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  updateInterval?: number; // ms between frames (default 33 ≈ 30fps)
}

/** Tunable parameters exposed to lil-gui. */
export interface SumieTuning {
  branchLum: number;      // luminance threshold for branch detection
  branchEdge: number;     // contrast threshold for branch detection
  branchInk: number;      // branch stroke opacity
  skyInk: number;         // sky wash opacity
  paperTone: number;      // paper brightness
  maskThreshold: number;  // luminance cutoff for tree mask extraction
  erosionSteps: number;   // blur iterations (more = stronger erosion)
  blossomInk: number;     // pink blossom overlay strength
}

/** Blur dispatch uses INNER = CACHE - 2*HALO = 16 - 4 = 12. */
const BLUR_INNER = 12;

export class BrushStroke extends WebGPUSimulation {
  private video: HTMLVideoElement;
  private sampler!: GPUSampler;
  private paramsBuf!: GPUBuffer;
  private paramsData = new Float32Array(12); // 9 used + 3 padding

  // Erosion pipeline resources
  private extractPL!: GPURenderPipeline;
  private blurPL!: GPUComputePipeline;
  private maskTex!: GPUTexture;
  private maskView!: GPUTextureView;
  private extractParamsBuf!: GPUBuffer;
  private extractParamsData = new Float32Array(4); // size(2) + threshold + pad
  private blurBG!: GPUBindGroup;

  /** Live-tunable parameters — mutate directly, changes apply next frame. */
  readonly tuning: SumieTuning = {
    branchLum: 0.20,
    branchEdge: 0.30,
    branchInk: 1.00,
    skyInk: 0.25,
    paperTone: 1.00,
    maskThreshold: 0.35,
    erosionSteps: 15,
    blossomInk: 0.60,
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

    // Blur compute pipeline
    const blurMod = createShader(this.device, blurSrc);
    this.blurPL = this.device.createComputePipeline({
      layout: "auto",
      compute: { module: blurMod, entryPoint: "blur" },
    });

    this.sampler = this.device.createSampler({
      magFilter: "linear",
      minFilter: "linear",
    });
  }

  // ── Resources ──────────────────────────────────────────────

  protected buildResources(): void {
    // Render params: 12 x f32 = 48 bytes
    this.paramsBuf = this.device.createBuffer({
      size: 48,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Extract params: 4 x f32 = 16 bytes
    this.extractParamsBuf = this.device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Mask texture: render target + storage (blur) + sampled (final render)
    this.maskTex = this.device.createTexture({
      size: [this.gw, this.gh],
      format: "r32float",
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT |
        GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.TEXTURE_BINDING,
    });
    this.maskView = this.maskTex.createView();

    // Blur bind group is stable (no external texture)
    this.blurBG = this.device.createBindGroup({
      layout: this.blurPL.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: this.maskView }],
    });
  }

  protected destroyResources(): void {
    this.paramsBuf.destroy();
    this.extractParamsBuf.destroy();
    this.maskTex.destroy();
  }

  // ── Rendering ──────────────────────────────────────────────

  /** Render one NPR frame: extract mask → blur → composite. */
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
    this.extractParamsData[3] = 0;
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

    // Create bind groups (both reference ext, which expires after microtask)
    const extractBG = this.device.createBindGroup({
      layout: this.extractPL.getBindGroupLayout(0),
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
        { binding: 3, resource: this.maskView },
      ],
    });

    const enc = this.device.createCommandEncoder();

    // Pass 1: Extract tree mask from video → r32float texture
    fullscreenPass(enc, this.maskView, this.extractPL, extractBG);

    // Pass 2: Iterative blur (erodes thin structures, preserves fat ones)
    const steps = Math.max(0, Math.round(t.erosionSteps));
    for (let i = 0; i < steps; i++) {
      const cp = enc.beginComputePass();
      cp.setPipeline(this.blurPL);
      cp.setBindGroup(0, this.blurBG);
      cp.dispatchWorkgroups(
        Math.ceil(this.gw / BLUR_INNER),
        Math.ceil(this.gh / BLUR_INNER),
      );
      cp.end();
    }

    // Pass 3: Final NPR composite with pink blossom overlay
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
