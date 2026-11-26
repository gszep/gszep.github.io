# Cell demo publication

Source: `alife-institute/webgpu_collab_stringed_entities`, branch
`feat/phagocytosis`, commit `15849a1` (staging only; production still serves
`89c1fa0`).

`/cell/` publishes the source build's `colony.html`. It now opens on predation:
six large cells, each with a nucleus, catch, wrap and digest small cells built
from the same model. A touch releases another prey and the nearest free
predator turns to it. `Whole dish` and `Follow` switch the view.
`/cell/?prey=0` is the earlier page: ten cells that follow a touch.
`single.html` retains the higher-detail single-cell demo and its diagnostics.

Simulated for every cell: membrane, actin network and the forces between them.
Imposed and labelled on the page and in the source: who chases whom, extra
membrane for a cell that holds a prey, the joining of the two lips of a cup,
the breakdown that follows, the rigid nucleus, and the correction that stops
membranes of two cells from staying crossed. The reaching protrusion tethers a
prey at its tip and does not pull it in. Everything is 2D mechanics with
uncalibrated time, not microscopy.

Source notes, checks and evidence: `docs/PHAGOCYTOSIS.md`,
`docs/PHAGOCYTOSIS-SOURCES.md`, `docs/COLONY.md` and
`evidence/adhesion-sweep/419051a/`. Checked on this build: default page 3000
steps in two seeds (eight prey engulfed, no runtime errors or faults), the
ten-cell page for 600 steps, the single-cell page, and a live phone-sized run.
The live rate was about 12 steps per second on an Intel UHD 630; performance
varies by device. No Tailscale connection or server-side simulation is required.

To update, build the source repository and copy **all** `dist/*.bundle.js`
files (including worker dependencies), `colony.html` as `index.html`, and
`single.html` unchanged. Delete hashed bundles that the new build no longer
emits. Keep the linked `migration/` reference page. The public
defaults live in source; no publication-only bootstrap is needed. Do not edit
generated simulation code in this repository.
