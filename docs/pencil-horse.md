# Honse — 3 November 2026

## Outcome

`/honse/` is a standalone, touch/keyboard-friendly spring-powered sketch based
on the user's supplied block-horse drawing. The original image is not uploaded.
Body, neck, muzzle, ears, articulated rectangular legs, hooves and tail are built
from small boxes. One invisible spring supports the main body; the legs are
decorative. Movement modes: Legs flailing, Naruto running and Paddle steamer.
The horse runs in place over scrolling pencil ground marks.

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
  Following the updated art direction, chose a much smaller original toy
  solver: one vertical mass and an invisible attached spring/damper. Gravity
  and the spring are its only continuous forces; Hop supplies an explicit impulse.
  The spring rest length pulses with tempo to sustain the bounce. The attached
  spring pushes and pulls, avoiding the excessive low-gravity launch heights seen
  in an initial compression-only prototype. Semi-implicit integration uses a fixed 1/120 s step;
  rendering is capped at 24 Hz, with bounded catch-up and no hidden-tab work.
- The previous hoof contacts, pitch dynamics and foot-driven body corrections
  are removed. Limb angles, body lean and head/tail poses are presentation only.
  Mode switches do not reset or affect the spring trajectory. Flail uses loose
  bent-leg swings; Naruto sweeps the forelegs back and cycles the hindlegs;
  Paddle rotates extended legs through full circles with wider paddle hooves.
  None is motion capture, biomechanics or a full articulated rigid-body solver.
- The existing drawing study's graphite ribbon/filament brush is extracted into
  `pencil-brush.ts` and reused by both drawings. Face-contained planar marks use
  the existing `pencil-facades.ts`. Painter-sorted box faces use paper-colour
  occlusion masks. This lightweight approach can have ordering artifacts where
  boxes intersect; no new graphics/physics dependencies or large meshes.
- Animation pauses offscreen and when hidden. Reduced-motion users get a still
  drawing until they press Go or Hop. Sliders, mode buttons, drag, arrow keys and Space
  cover pointer, touch and keyboard access. A generated still covers no-JS or
  unavailable-canvas cases.

## Validation

`npm run test:horse` independently checks the gravity contribution, spring/damper
force, exact trajectory equality across all modes (including mid-bounce switches),
control-extreme stability, distinct mode poses, swept-back forelegs, full paddle
rotations, bounded hop impulses and deterministic reset.

`npm run test:pencil` protects the shared face-containment code. Browser checks
cover actual animation and controls, mobile framing, pause/reduced motion,
offscreen suspension, and the existing cube after the shared-brush extraction.

Initial version validated on 3 November: all four original horse and four face-containment tests passed;
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

The 4 November move-mode revision passes six model tests, strict TypeScript and the build.
Browser checks confirm that all three modes produce distinct poses and moving
canvas pixels, mode switching/reset works, reduced motion and pause hold still,
hop/sliders/orbit work, the 390 px layout fits, offscreen animation stops, and
resize callbacks leave paper pixels rather than cleared black frames. Mode
independence is verified by exact state equality over 2,400 fixed steps while
switching between all three modes. No shared-brush or cube-renderer changes were
needed for this revision.
