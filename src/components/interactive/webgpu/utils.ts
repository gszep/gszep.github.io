/**
 * Shared WebGPU utilities for all simulations.
 * Provides device initialization, canvas setup, shader preprocessing,
 * and common render pass helpers.
 */

export interface WebGPUContext {
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
}

/** Initialize WebGPU on a canvas. Returns null if unsupported. */
export async function initWebGPU(
  canvas: HTMLCanvasElement,
): Promise<WebGPUContext | null> {
  if (!navigator.gpu) return null;

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) return null;

  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu");
  if (!context) return null;

  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "premultiplied" });

  return { device, context, format };
}

/** Resize canvas pixel dimensions to match its CSS display size. */
export function resizeCanvas(
  canvas: HTMLCanvasElement,
  dpr = window.devicePixelRatio,
): void {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
}

// ── Shader preprocessing ────────────────────────────────────────

/** Process #import directives: replaces `#import name` with corresponding include string. */
export function processShaderIncludes(
  code: string,
  includes: Record<string, string>,
): string {
  return code.replace(/^#import\s+(\w+)/gm, (_, name: string) => {
    if (name in includes) return includes[name];
    console.warn(`[WGSL] Unresolved #import: ${name}`);
    return `/* unresolved #import ${name} */`;
  });
}

/** Create shader module with optional #import preprocessing and error logging. */
export function createShader(
  device: GPUDevice,
  code: string,
  includes?: Record<string, string>,
): GPUShaderModule {
  const processed = includes ? processShaderIncludes(code, includes) : code;
  const module = device.createShaderModule({ code: processed });

  module.getCompilationInfo().then((info) => {
    for (const msg of info.messages) {
      const level = msg.type === "error" ? "error" : "warn";
      console[level](`[WGSL ${msg.type}] ${msg.message}`);
    }
  });

  return module;
}

// ── Render helpers ──────────────────────────────────────────────

/** Execute a fullscreen render pass (3-vertex triangle, no vertex buffer). */
export function fullscreenPass(
  encoder: GPUCommandEncoder,
  view: GPUTextureView,
  pipeline: GPURenderPipeline,
  bindGroup: GPUBindGroup,
): void {
  const rp = encoder.beginRenderPass({
    colorAttachments: [
      {
        view,
        clearValue: { r: 0, g: 0, b: 0, a: 0 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  });
  rp.setPipeline(pipeline);
  rp.setBindGroup(0, bindGroup);
  rp.draw(3);
  rp.end();
}
