# Cell demo publication

Source: `alife-institute/webgpu_collab_stringed_entities`, commit `913e5c8`.

`/cell/` publishes the source build's `colony.html`: ten interacting cells on a
shared GPU, with 61,440 actin equivalents split into separate per-cell pools.
It starts automatically with the Explore panel closed. A tap leaves a persistent
orange goal; each cell's prescribed polarity is re-aimed at it, so the cohort turns
and converges there (an imposed cue, not sensing).
`single.html` retains the higher-detail single-cell demo and its diagnostics.

The cohort adds coarse three-strand protrusion bundles with growth/retraction,
temporary substrate attachment and membrane coupling. These are approximate
filopodial mechanisms, not molecularly calibrated filopodia. The microscope image
is computed at display resolution; its green stain follows simulated network
density and the fine grain is illustrative.

Source checks and evidence: `docs/COLONY.md`, `evidence/colony-release-local/`,
`evidence/colony-release-nvidia/` and `evidence/colony-touch-local/`. The tested ten-cell live rate was about
29 fps on NVIDIA Lovelace and 12 fps locally; performance varies by device.
The point/bond recovery fixes remain included, with no quota on successful
recoveries. No Tailscale connection or server-side simulation is required.

To update, build the source repository and copy **all** `dist/*.bundle.js`
files (including worker dependencies), `colony.html` as `index.html`, and
`single.html` unchanged. Delete hashed bundles that the new build no longer
emits. Keep the linked `migration/` reference page. The public
defaults live in source; no publication-only bootstrap is needed. Do not edit
generated simulation code in this repository.
