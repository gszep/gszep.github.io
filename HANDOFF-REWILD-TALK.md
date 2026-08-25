# Handoff: publish the final interactive Rewild talk

## Goal

Publish a **static, non-editable, interactive** snapshot of the Rewild deck at:

```text
https://gszep.com/talks/rewild
```

`decks.gszep.com` is the private authoring system and must remain entirely behind
Google/IAP login. Do not iframe, redirect to, fetch from, or otherwise depend on
`decks.gszep.com` from the public talk.

Work on this repository's `staging` branch, deploy to `staging.gszep.com` for
review, and do not merge to `main` without explicit user approval (see
`CLAUDE.md`).

## Canonical source

The source deck is in the sibling repository:

```text
/Users/gszep/Documents/repos/decks/decks/rewild-open-projector/deck.json
/Users/gszep/Documents/repos/decks/decks/rewild-open-projector/slides/**
/Users/gszep/Documents/repos/decks/themes/chibatech/**
/Users/gszep/Documents/repos/decks/engine/i18n.js
```

Use deck commit `f27f4b9` or a later commit containing it. That commit reconciles
hosted editor changes and repairs the desktop/mobile technology treemap. Do not
use anything from `decks/rewild-open-projector/dist/`; those are generated PDF
and QA artifacts. The HTML, catalog, JavaScript, CSS, theme files, and assets are
the source of truth.

The manifest contains 14 slides in their final order and one locale (`en`).
Copy a pinned snapshot into this repository so the public talk has no runtime
or authentication dependency on the authoring service. Record the source deck
commit in a comment or import script so future refreshes are reproducible.

## Recommended implementation

1. Add an Astro page for the exact route `/talks/rewild/` (for example,
   `src/pages/talks/rewild.astro`). It should be a full-viewport presentation,
   not a normal article page.
2. Vendor only the required static source under a clearly owned public asset
   path. Either:
   - preserve `/decks/rewild-open-projector/slides/`, `/themes/chibatech/`, and
     `/engine/i18n.js` so existing relative URLs work unchanged; or
   - scope everything below `/talks/rewild/` and rewrite all affected paths in
     a deterministic import script.
3. Adapt the presentation shell from `presentationHtml()` in the sibling
   repository's `engine/edit.mjs`. Keep its 1280×720 fitting, keyboard,
   touch/swipe, slide query parameter, and fullscreen behavior.
4. Remove all authoring affordances and server assumptions:
   - no edit button;
   - no `/presentation/d/...` links;
   - no WebSocket, MCP, ACL, login, or mutation endpoints;
   - because this deck is English-only, the locale button may be omitted.
5. Keep slide interactivity intact. In particular verify:
   - the slide 02 technology treemap renders on desktop and mobile;
   - tapping/clicking a technology increases its weight and visibly relayouts
     the treemap;
   - canvas interactions and toggle buttons still work;
   - embedded live slides load `https://gszep.com/secret-tunnel/` and
     `https://gszep.com/mosaic/`;
   - the Instagram embed on the Jam slide degrades acceptably if blocked by
     browser privacy settings.
6. Add suitable title/canonical/Open Graph metadata for the public talk. Ensure
   `/talks/rewild` resolves or redirects cleanly to `/talks/rewild/`.

A small import script is preferable to an undocumented manual copy. It should
copy an explicit allowlist (deck slides/assets, all Chiba Tech theme files, and
`engine/i18n.js`) and must not copy `.history`, editor code, access metadata,
PDFs, or QA renders.

## Verification

Run at minimum:

```bash
npm run build
npm run preview
```

Then test the final built route, not only the dev server:

- desktop viewport (for example 1440×900);
- mobile portrait and landscape;
- previous/next controls, arrows, Space, swipe, direct `?slide=2`, and
  fullscreen;
- all 14 slides;
- slide 02 treemap before and after a vote;
- browser network panel: no request to `decks.gszep.com` and no missing local
  assets;
- direct anonymous/incognito access to the staging route.

Do not hand-edit `dist/`; Astro generates it.

## Hosting state already cleaned up

The temporary public Cloud Run service, `rewild.gszep.com` Cloud Run domain
mapping, and its DNS CNAME were removed. The Decks deployment was reverted to a
single IAP-protected service. The public artifact now belongs only in this
GitHub Pages repository.
