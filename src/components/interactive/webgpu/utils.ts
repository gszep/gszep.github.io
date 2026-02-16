/**
 * Shared WebGPU utilities for all simulations.
 * Provides device initialization and canvas setup.
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
