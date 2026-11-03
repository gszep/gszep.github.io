# Honse — 3 November 2026

## Outcome

`/honse/` is a standalone, touch/keyboard-friendly galloping sketch based
on the user's supplied block-horse drawing. The original image is not uploaded.
Body, neck, muzzle, ears, articulated rectangular legs, hooves and tail are built
from small boxes. The horse runs in place over scrolling pencil ground marks.

## Evidence and choices

- Inspected APS `origin/main` at `f0241d2`: `servo-scene.js`, `gpu-rigid.mjs`,
  `gpu-rigid-shader.mjs`, `showcase-physics.mjs` and the GPU/CPU physics reports.
  Corrected an initial misreading of the older CPU report: APS's Sesame
  simulation uses a custom WebGPU rigid-body solver where available, and falls
  back to MuJoCo (WebAssembly) in a Web Worker; MuJoCo is also the reference it
  is tested against. The selection is `renderer.gpuPhysics ?? createShowcasePhysics`.
  Its useful separation is motor targets → fixed-step integration → rendered geometry.
  Source: https://github.com/henkaku-center/aps
- APS's recent report cites the primary MuJoCo simulation and XML references:
  https://mujoco.readthedocs.io/en/stable/programming/simulation.html and
  https://mujoco.readthedocs.io/en/stable/XMLreference.html . Reused that recent
  evidence rather than adding a different engine for this small toy.
- Considered both APS's nine-body-specific GPU solver and its MuJoCo worker.
  Chose a much smaller original toy
  solver: a vertical mass, pitch inertia, four compliant hoof contacts and a
  balance controller. Semi-implicit integration uses a fixed 1/120 s step;
  rendering is capped at 24 Hz, with bounded catch-up and no hidden-tab work.
- A four-beat, hind-pair/front-pair motor cycle and two-link IK drive the legs.
  This is a stylized gait, not motion capture, biomechanics, a full articulated
  rigid-body solver, or a claim of a physically trained gallop. Foot-velocity
  feedthrough is softened; position correction bounds contact penetration.
- The existing drawing study's graphite ribbon/filament brush is extracted into
  `pencil-brush.ts` and reused by both drawings. Face-contained planar marks use
  the existing `pencil-facades.ts`. Painter-sorted box faces use paper-colour
  occlusion masks. This lightweight approach can have ordering artifacts where
  boxes intersect; no new graphics/physics dependencies or large meshes.
- Animation pauses offscreen and when hidden. Reduced-motion users get a still
  drawing until they press Gallop or Hop. Sliders, drag, arrow keys and Space
  cover pointer, touch and keyboard access. A generated still covers no-JS or
  unavailable-canvas cases.

## Validation

`npm run test:horse` checks analytic free fall independently of rendering,
support/flight phases, motion in all four legs, control-extreme stability,
bounded hoof penetration, hop impulses and deterministic reset.

`npm run test:pencil` protects the shared face-containment code. Browser checks
cover actual animation and controls, mobile framing, pause/reduced motion,
offscreen suspension, and the existing cube after the shared-brush extraction.

Validated on 3 November: all four horse and four face-containment tests passed;
strict TypeScript checks and the production build passed. Desktop Chrome and a
390 px mobile viewport showed distinct galloping frames, a stable paused image,
working hop/reset/sliders/shading and keyboard/touch orbit, and no page errors.
Rendering stopped offscreen. The existing cube's loose-mode canvas was compared
pixel-for-pixel with the live pre-change site and was unchanged. These are browser
viewport checks, not a physical-phone performance benchmark.

The first production full-page capture exposed an opaque black frame during a
layout resize. Direct canvas readbacks during playback showed healthy paper/ink
pixels and no context loss. The resize callback had cleared the backing canvas
and deferred repaint until the next animation tick. It now changes dimensions
only when necessary and redraws the current pose synchronously after resizing.
