# Cell demo publication

Source: `alife-institute/webgpu_collab_stringed_entities`, commit `c343d57`.

`/cell/` publishes the source build's `colony.html`: ten interacting cells on a
shared GPU, with 61,440 actin equivalents split into separate per-cell pools.
It starts automatically and keeps Settings closed. Drag to guide the group.
`single.html` retains the higher-detail single-cell demo and its diagnostics.

The cohort adds coarse three-strand protrusion bundles with growth/retraction,
temporary substrate attachment and membrane coupling. These are approximate
filopodial mechanisms, not molecularly calibrated filopodia. Green granulation
is an illustrative rendering of network density.

Source checks and evidence: `docs/COLONY.md`, `evidence/colony-release-local/`
and `evidence/colony-release-nvidia/`. The tested ten-cell live rate was about
29 fps on NVIDIA Lovelace and 12 fps locally; performance varies by device.
The point/bond recovery fixes remain included, with no quota on successful
recoveries. No Tailscale connection or server-side simulation is required.

To update, build the source repository and copy **all** `dist/*.bundle.js`
files (including worker dependencies), `colony.html` as `index.html`, and
`single.html` unchanged. Keep the linked `migration/` reference page. The public
defaults live in source; no publication-only bootstrap is needed. Do not edit
generated simulation code in this repository.
