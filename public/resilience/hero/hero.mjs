// Thin presentation adapter around the unchanged APS renderer and sim2real CAD.
import { createServoScene, preloadServoAssets } from './js/servo-scene.js';
import { fetchAsset } from './js/asset-cache.mjs?v=20261103-cache';
import { servoInstructionFrame } from './js/servo-instruction-model.mjs';
import { HERO_BUILD_MS, VARIANT_MS, heroTimeline, heroPhase, heroCamera } from './js/landing-hero.mjs';
import { componentOf } from './component-of.mjs';

const canvas = document.querySelector('#scene'), prompt = document.querySelector('#prompt');
const progress = document.querySelector('#progress'), loading = document.querySelector('#loading');
const params = new URLSearchParams(location.search);
let lang = params.get('lang') === 'ja' ? 'ja' : 'en';
let active = window.parent === window, scene, api, clock = 0, last = null, ready = false;
const parentOrigin = document.referrer ? new URL(document.referrer).origin : location.origin;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const send = data => { if (parent !== window) parent.postMessage(data, parentOrigin); };
const label = () => {
  document.documentElement.lang = lang;
  document.querySelector('#loadingText').textContent = lang === 'ja' ? 'アニメーションを読み込み中…' : 'Loading animation…';
};
label();
function report(value) {
  progress.value = value;
  send({ type: 'sesame-build-progress', value });
}
function paint() {
  if (!scene) return;
  const timeline = heroTimeline(clock, HERO_BUILD_MS + VARIANT_MS);
  // Only the assembly and two-eye design change; no guide UI or dance phase.
  const phase = heroPhase(timeline.elapsed, 0), variant = phase.variant ?? null;
  const frame = servoInstructionFrame(api, 35, 4, 2500);
  frame.hero = { assembly: true, elapsed: phase.assembly, direction: timeline.direction,
    duration: 0, variant, legs: null, style: variant?.style ?? phase.style, wide: 1 };
  frame.simulationElapsed = 0;
  scene.setState(frame);
  scene.setHeroCamera(heroCamera(variant ? variant.camera : phase.assembly,
    canvas.clientWidth / Math.max(1, canvas.clientHeight), variant?.active ? variant.widen : 0, 0, 1));
  const text = lang === 'ja' ? '目を二つにして' : 'Give it two eyes';
  prompt.hidden = !variant;
  if (variant) prompt.textContent = text.slice(0, Math.round(variant.typed * text.length));
}
function tick(now) {
  if (active && !document.hidden && ready && !reduced.matches) {
    if (last !== null) clock += Math.min(now - last, 100);
    paint();
  }
  last = now;
  requestAnimationFrame(tick);
}
addEventListener('message', event => {
  if (event.source !== parent || event.origin !== parentOrigin) return;
  if (event.data?.type === 'sesame-build-active') {
    active = Boolean(event.data.active); last = null;
    scene?.setVisible(active); if (active) paint();
  }
  if (event.data?.type === 'sesame-build-locale') { lang = event.data.lang === 'ja' ? 'ja' : 'en'; label(); paint(); }
});
addEventListener('keydown', event => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Enter', 'Backspace', 'Tab', 'l', 'L', 'f', 'F'].includes(event.key)) {
    event.preventDefault(); send({ type: 'sesame-build-key', key: event.key });
  }
});
addEventListener('resize', paint);
addEventListener('pagehide', () => scene?.destroy());

try {
  const [manifest, binary, jointApi] = await Promise.all([
    fetchAsset(new URL('./assets/assembly.json', import.meta.url)).then(r => r.json()),
    fetchAsset(new URL('./assets/assembly.bin', import.meta.url)).then(r => r.arrayBuffer()),
    fetchAsset(new URL('./assets/joint-api.json', import.meta.url)).then(r => r.json()),
    preloadServoAssets((name, done, total) => report(Math.round(done / total * 80))),
  ]);
  api = jointApi;
  const groups = new Map(manifest.parts.map(part => [part.id, componentOf(part)]));
  report(85);
  scene = await createServoScene(canvas, { assembly: { manifest, binary }, mode: 'robot',
    prefer: 'webgl', groupForPart: id => groups.get(id) || id });
  // The renderer's default is camera-only gestures; this is an audience slide.
  canvas.style.touchAction = 'auto';
  scene.setAppearance({ style: 1, accent: [.93, .36, .12], ink: [.09, .09, .1], lineSurface: [.96, .96, .95], lightTint: [1, 1, 1] });
  if (reduced.matches) clock = HERO_BUILD_MS + 7000;
  paint(); scene.setVisible(active);
  ready = true; report(100); loading.hidden = true;
  document.documentElement.dataset.ready = 'true';
  window.heroPresentation = { snapshot: () => ({ ready, active, clock, scene: scene.snapshot() }),
    seek(ms) { clock = ms; paint(); } };
  send({ type: 'sesame-build-ready' });
  requestAnimationFrame(tick);
} catch (error) {
  document.querySelector('#loadingText').textContent = lang === 'ja' ? '読み込めませんでした。再読み込みしてください。' : 'Could not load the animation. Please reload.';
  document.documentElement.dataset.error = String(error);
  send({ type: 'sesame-build-error', message: String(error) });
  console.error(error);
}
