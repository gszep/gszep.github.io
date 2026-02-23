/**
 * WebGPU sumi-e (ink wash painting) rendering of video input.
 *
 * Samples each video frame as a texture_external, runs Sobel edge
 * detection and multi-layer NPR compositing in a single fragment
 * shader pass. No compute pass or simulation state — the video
 * provides all input data each frame.
 */

import { createShader, fullscreenPass } from "./utils";
import { WebGPUSimulation } from "./WebGPUSimulation";
import renderSrc from "./brush-stroke.render.wgsl?raw";
import fullscreenVertex from "./fullscreen.vertex.wgsl?raw";

export interface BrushStrokeOptions {
  canvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  updateInterval?: number; // ms between frames (default 33 ≈ 30fps)
}

/** Tunable parameters exposed to lil-gui. */
export interface SumieTuning {
  branchLum: number;   // luminance threshold for branch detection
  branchEdge: number;  // contrast threshold for branch detection
  branchInk: number;   // branch stroke opacity
  skyInk: number;      // sky wash opacity
  paperTone: number;   // paper brightness
}

export class BrushStroke extends WebGPUSimulation {
  private video: HTMLVideoElement;
  private sampler!: GPUSampler;
  private paramsBuf!: GPUBuffer;
  private paramsData = new Float32Array(8);

  /** Live-tunable parameters — mutate directly, changes apply next frame. */
  readonly tuning: SumieTuning = {
    branchLum: 0.50,
    branchEdge: 0.00,
    branchInk: 1.00,
    skyInk: 0.00,
    paperTone: 1.00,
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
    const mod = createShader(this.device, renderSrc, includes);

    this.renderPL = this.device.createRenderPipeline({
      layout: "auto",
      vertex: { module: mod, entryPoint: "vert" },
      fragment: {
        module: mod,
        entryPoint: "frag",
        targets: [{ format: this.format }],
      },
      primitive: { topology: "triangle-list" },
    });

    this.sampler = this.device.createSampler({
      magFilter: "linear",
      minFilter: "linear",
    });
  }

  // ── Resources ──────────────────────────────────────────────

  protected buildResources(): void {
    this.paramsBuf = this.device.createBuffer({
      size: 32, // 8 × f32
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  protected destroyResources(): void {
    this.paramsBuf.destroy();
  }

  // ── Rendering ──────────────────────────────────────────────

  /** Render one NPR frame from the current video frame. */
  private renderNPR(): void {
    // Wait for video to have at least one decoded frame
    if (this.video.readyState < 2) return;

    let ext: GPUExternalTexture;
    try {
      ext = this.device.importExternalTexture({ source: this.video });
    } catch {
      return; // frame not available yet
    }

    // Upload uniforms (size + time + tuning knobs)
    const t = this.tuning;
    this.paramsData[0] = this.gw;
    this.paramsData[1] = this.gh;
    this.paramsData[2] = performance.now() / 1000.0;
    this.paramsData[3] = t.branchLum;
    this.paramsData[4] = t.branchEdge;
    this.paramsData[5] = t.branchInk;
    this.paramsData[6] = t.skyInk;
    this.paramsData[7] = t.paperTone;
    this.device.queue.writeBuffer(this.paramsBuf, 0, this.paramsData);

    // Bind group must be recreated each frame (external texture expires)
    const bg = this.device.createBindGroup({
      layout: this.renderPL.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: ext },
        { binding: 1, resource: this.sampler },
        { binding: 2, resource: { buffer: this.paramsBuf } },
      ],
    });

    const enc = this.device.createCommandEncoder();
    fullscreenPass(
      enc,
      this.ctx.getCurrentTexture().createView(),
      this.renderPL,
      bg,
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
