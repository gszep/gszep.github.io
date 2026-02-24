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

  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: "high-performance",
  });
  if (!adapter) return null;

  // Request optional features the shaders may need
  const requiredFeatures: GPUFeatureName[] = [];
  if (adapter.features.has("readonly_and_readwrite_storage_textures" as GPUFeatureName)) {
    requiredFeatures.push("readonly_and_readwrite_storage_textures" as GPUFeatureName);
  }

  const device = await adapter.requestDevice({ requiredFeatures });
  const context = canvas.getContext("webgpu");
  if (!context) return null;

  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "premultiplied" });

  return { device, context, format };
}

/** Resize canvas pixel dimensions to match its CSS display size. */
export function resizeCanvas(
  canvas: HTMLCanvasElement,
  dpr = Math.min(window.devicePixelRatio, 2),
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

// ── Pointer tracking ───────────────────────────────────────────

/** Simulation-agnostic pointer state in normalized [0,1] canvas coordinates. */
export interface MouseState {
  /** X position in [0,1] relative to canvas width. */
  x: number;
  /** Y position in [0,1] relative to canvas height. */
  y: number;
  /** Whether a pointer is currently active (mouse button or touch). */
  active: boolean;
  /** Interaction type: 0=left-click / single touch, 2=right-click / multi-touch. */
  button: number;
}

/**
 * Tracks mouse and touch input on a canvas element.
 * Returns normalized [0,1] coordinates — simulations map these
 * to their own coordinate systems (grid cells, world units, etc.).
 *
 * Touch: single finger = left-click, two+ fingers = right-click.
 */
export class MouseTracker {
  readonly state: MouseState = { x: 0, y: 0, active: false, button: 0 };
  private cleanup: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    const updatePosition = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      this.state.x = (clientX - rect.left) / rect.width;
      this.state.y = (clientY - rect.top) / rect.height;
    };

    // ── Mouse ──
    const onMouseMove = (e: MouseEvent) => updatePosition(e.clientX, e.clientY);
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      this.state.active = true;
      this.state.button = e.button;
    };
    const onMouseUp = () => { this.state.active = false; };
    const onMouseLeave = () => { this.state.active = false; };
    const onContext = (e: Event) => e.preventDefault();

    // ── Touch ──
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      this.state.active = true;
      this.state.button = e.touches.length > 1 ? 2 : 0;
      if (e.touches.length > 0) {
        updatePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        updatePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        this.state.active = false;
      } else {
        this.state.button = e.touches.length > 1 ? 2 : 0;
      }
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("contextmenu", onContext);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);

    this.cleanup = () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("contextmenu", onContext);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
    };
  }

  /** Remove all event listeners. */
  destroy(): void {
    this.cleanup?.();
    this.cleanup = null;
  }
}

// ── Theme & device detection ────────────────────────────────────────────────

/** Whether the page is in dark mode (checks `<html class="dark">`). */
export function isDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

/**
 * Observe dark/light theme changes and call `onChange` when they occur.
 * Returns the MutationObserver for cleanup if needed.
 */
export function observeTheme(
  onChange: (dark: boolean) => void,
): MutationObserver {
  const obs = new MutationObserver(() => onChange(isDark()));
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return obs;
}

/** Whether the device has a coarse pointer (touch screen). */
export function isMobile(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
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
