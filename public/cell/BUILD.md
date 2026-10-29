# Cell demo publication

Source: `alife-institute/webgpu_collab_stringed_entities`, commit
`2edec68` (microscope-inspired transmitted light, persistent polarity, actin
renewal and bounded contact recovery).

The JavaScript bundles and worker are immutable copies of the tested source
build. The HTML adds only a no-query default selecting the gentler polarized
renewal preset in transmitted light, paused initially. Explicit query parameters retain their
original behavior. No Tailscale connection or server-side simulation is needed.

View → Filament diagnostics restores the schematic rendering. Green granulation
is an illustrative density texture, not simulated organelles; focus is a visual
blur/halo control, not depth-resolved light-field refocusing. Source validation
and screenshots are in `docs/MICROSCOPE-VIEW.md` and `evidence/microscope/`.

To update: build the source repository, copy its index/runtime/current worker
bundles and index.html into this directory, and retain the public preset
bootstrap. Do not edit generated simulation code in this repository.
