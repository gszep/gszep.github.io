# Sesame two-eye presentation hero

Standalone presentation adapter for the assembly and “Give it two eyes”
sequence. No course navigation or build-guide UI is included.

`js/` and `vendor/` contain unchanged APS renderer dependencies. CAD STLs are
copied from the local sim2real checkout and checked against the hashes and
revision recorded in the APS exports. `sources.json`, `asset-versions.json`,
and `assets/*frame.json` / `assets/variant-*.json` record provenance. Licenses
are retained under `assets/licenses/` and `vendor/`.

Refresh the copied dependencies from the website repository:

```sh
python3 scripts/bundle-resilience-hero.py --aps ../aps --sim2real ../sim2real
```

`hero.mjs` selects only the assembly and two-eye stages through the existing
renderer API. The model and renderer initialize on page load. Playback waits
for the parent slide's active message; leaving slide 7 pauses it. Locale and
presentation key messages are restricted to the embedding parent origin.

Validation: headless WebGL2 initialized with 983 visible parts at the two-eye
checkpoint; EN/JA prompts, preload-before-slide-7, pause/resume and navigation
passed. No screenshots were taken.
