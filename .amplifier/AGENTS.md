# Personal Portfolio Website

Astro 5 static site with MDX content, Tailwind CSS, and optional React islands.
See `CLAUDE.md` at the repo root for the full project context, workflow, and rules.

## Deployment Workflow (CRITICAL)

- **Always work on the `staging` branch**
- Commit and push to `staging` after finishing edits
- Changes deploy to staging.gszep.com automatically
- **NEVER merge `staging` to `main` without explicit user approval**
- Merging to `main` triggers production deploy to gszep.com

If you are working in this repo via Amplifier, follow the same rules as in `CLAUDE.md`.

## Quick Reference

- **Build**: `npm run build` (output to `dist/`)
- **Dev**: `npm run dev` (localhost:4321)
- **Content**: `src/content/blog/*.mdx` (unified collection)
- **Media**: `public/images/` -- use MP4 for animations, PNG/JPG for stills
- **Site data**: `src/data/site.json` and `src/data/citations.json`
- **Animated content**: `<video autoplay loop muted playsinline src="/images/file.mp4">`

## WebGPU Constraints

- **read_write storage textures**: Only `r32float`, `r32sint`, and `r32uint` formats support `read_write` access. Multi-channel formats like `rgba32float` do NOT support `read_write`.
- **Storage buffers for multi-channel state**: Use `var<storage, read_write> state: array<vec4f>` instead. No format restrictions on storage buffers.
- **Shared utils**: `src/components/interactive/webgpu/utils.ts` provides `initWebGPU`, `resizeCanvas`, `createShader`, `fullscreenPass`.
- **Shader includes**: Use `#import name` in WGSL + `processShaderIncludes()` for shared code (e.g., fullscreen vertex shader).
- **WGSL raw imports**: Import `.wgsl` files with `?raw` suffix (declared in `src/wgsl.d.ts`).
