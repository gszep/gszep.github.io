# Cell demo publication

Source: `alife-institute/webgpu_collab_stringed_entities`, commit
`d8b43c6` (persistent polarity, actin renewal and bounded contact recovery).

The JavaScript bundles and worker are immutable copies of the tested source
build. The HTML adds only a no-query default selecting the gentler polarized
renewal preset, paused initially. Explicit query parameters retain their
original behavior. No Tailscale connection or server-side simulation is needed.

To update: build the source repository, copy its index/runtime/current worker
bundles and index.html into this directory, and retain the public preset
bootstrap. Do not edit generated simulation code in this repository.
