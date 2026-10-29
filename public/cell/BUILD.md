# Cell demo publication

Source: `alife-institute/webgpu_collab_stringed_entities`, commit
`0645608` (cell-first presentation, responsive stage fitting, microscope-inspired
transmitted light, persistent polarity, actin renewal and bounded contact recovery).

The HTML, JavaScript bundles and worker are copies of the tested source build.
Opening `/cell/` with no query selects the gentler polarized-renewal preset and
starts automatically. Settings and diagnostics are hidden behind Settings;
the cell is fitted to the screen. `?demo=1` selects the same curated preset;
explicit assay parameters and `?paused=1` remain supported.
No Tailscale connection or server-side simulation is needed.

View → Filament diagnostics restores the schematic rendering. Green granulation
is an illustrative density texture, not simulated organelles; focus is a visual
blur/halo control, not depth-resolved light-field refocusing. Source validation
and screenshots are in `docs/MICROSCOPE-VIEW.md` and `evidence/microscope/`.

To update: build the source repository, copy its index/runtime/current worker
bundles and index.html into this directory. The public defaults now live in the
source; no publication-only bootstrap is needed. Do not edit generated simulation
code in this repository.
