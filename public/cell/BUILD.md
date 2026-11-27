# Cell demo publication

Source: `alife-institute/webgpu_collab_stringed_entities`, branch `feat/chase`,
commit `732969c` (staging only; production still serves `89c1fa0`).

`/cell/` publishes the source build's `colony.html`. It now opens on a chase by
smell. One large cell (the hunter) finds one small cell (the prey) by its scent
among nine resting cells. The prey rests until the hunter's scent is strong,
then runs between the resting cells; the hunter follows, wraps it and digests
it, and another prey enters. A touch releases another prey. `Whole dish` and
`Follow` switch the view; on a phone the page opens on `Follow`.

Two earlier pages remain. `/cell/?layout=pairs&prey=8&predators=6` is the page
with six cups at once. `/cell/?prey=0` is the page with ten cells that follow a
touch. `single.html` retains the higher-detail single-cell demo and its
diagnostics.

Simulated for every cell: membrane, actin network and the forces between them.
In the chase also the two scents, which are released at membranes, spread
around the cells and fade, and what each cell reads of them around its own
membrane. Nobody is told where anybody is.

Imposed, and labelled on the page and in the source: how a cell turns its front
once it has read a side; the prey's two gaits and its stop once a third of it
is wrapped; that a running prey turns along what it leans on; resting cells
without a network that keep round and give way when pushed; the rigid nucleus;
extra membrane for a cell that holds a prey; the joining of the two lips of a
cup; the breakdown that follows, with the remains kept a round droplet inside
their phagosome; a wall that stops the hunter later than the other cells, so
that a cup can close on a prey at the wall; and the correction that stops
membranes of two cells from staying crossed. Everything is 2D mechanics with
uncalibrated time, not microscopy.

Source notes, checks and evidence: `docs/PHAGOCYTOSIS.md`,
`docs/PHAGOCYTOSIS-SOURCES.md`, `docs/COLONY.md` and `evidence/chase/3080f3e/`
in the source repository (the script files here are the same bytes as at
`3080f3e`; later commits changed page text, notes and evidence). Checked on
that build: the page as it opens for 4000 steps in three seeds and for 20,000
steps in one (no runtime errors or faults, no membrane of one cell inside
another at any sampled step), the six-cup page for 3000 steps, the ten-cell
page for 600 steps, the single-cell page, and a live phone-sized run. The live
rate at phone size was about 24 steps per second on an Intel UHD 630, and the
first capture takes 1800 to 2700 steps; performance varies by device. No Tailscale connection or server-side simulation
is required.

To update, build the source repository and copy **all** `dist/*.bundle.js`
files (including worker dependencies), `colony.html` as `index.html`, and
`single.html` unchanged. Delete hashed bundles that the new build no longer
emits. Keep the linked `migration/` reference page. The public
defaults live in source; no publication-only bootstrap is needed. Do not edit
generated simulation code in this repository.
