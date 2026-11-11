/* Prepare every slide plus both languages, video bytes and the resident hero.
 * This runs in the title slide so the existing viewer/editor engine is unmodified. */
(() => {
  if (location.protocol === 'file:' || parent === window) return;
  const stage = parent.document.querySelector('#stage');
  if (!stage) return; // The design editor is not the presentation viewer.
  const template = document.querySelector('.startup-loading');
  const host = parent.document.createElement('div');
  host.id = 'resilience-loading';
  host.style.cssText = 'position:fixed;inset:0;z-index:100;';
  const tokens = getComputedStyle(document.documentElement);
  for (const name of ['--ct-black', '--ct-white', '--ct-blue-light', '--ct-font-sans']) host.style.setProperty(name, tokens.getPropertyValue(name));
  const shadow = host.attachShadow({ mode: 'open' });
  const style = parent.document.createElement('style');
  style.textContent = `*{box-sizing:border-box}.startup-loading{height:100%;display:grid;place-items:center;background:var(--ct-black);color:var(--ct-white);font-family:var(--ct-font-sans)}.startup-card{width:min(360px,calc(100vw - 40px));padding:24px;border:3px solid var(--ct-white)}b{font-size:22px}p{font-size:16px;line-height:1.5;margin:14px 0}progress{width:100%;height:14px;accent-color:var(--ct-blue-light)}.startup-count{display:block;margin-top:8px}button{padding:12px;margin:8px 8px 0 0;background:var(--ct-white);color:var(--ct-black);border:0;font:inherit;cursor:pointer}[hidden]{display:none!important}`;
  const overlay = template.cloneNode(true);
  shadow.append(style, overlay); parent.document.body.append(host);
  const copyLabels = () => {
    for (const element of overlay.querySelectorAll('[data-i18n]')) element.textContent = template.querySelector(`[data-i18n="${element.dataset.i18n}"]`).textContent;
  };
  const labelsObserver = new MutationObserver(copyLabels);
  labelsObserver.observe(template, { subtree: true, childList: true, characterData: true }); copyLabels();
  const close = () => { labelsObserver.disconnect(); host.remove(); };
  const bar = overlay.querySelector('progress'), count = overlay.querySelector('.startup-count');
  const frames = [...stage.querySelectorAll(':scope > iframe')];
  let completed = 0, total = frames.length + 4;
  const update = () => {
    const value = Math.min(99, Math.round(completed / total * 100));
    bar.value = value; count.textContent = `${value}%`;
  };
  const done = () => { completed++; update(); };
  const fetched = async url => {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`Asset HTTP ${response.status}`);
    await response.arrayBuffer();
  };
  const loaded = frame => new Promise(resolve => {
    if (frame.contentDocument?.readyState === 'complete' && frame.contentDocument.URL !== 'about:blank') resolve();
    else frame.addEventListener('load', resolve, { once: true });
  });
  const imagesReady = doc => Promise.all([...doc.images].map(image => {
    if (image.complete) return image.naturalWidth ? Promise.resolve() : Promise.reject(new Error('Image failed'));
    return new Promise((resolve, reject) => { image.addEventListener('load', resolve, { once: true }); image.addEventListener('error', reject, { once: true }); });
  }));
  const heroReady = async () => {
    const frame = frames.find(frame => new URL(frame.src).pathname.endsWith('/hero.html'));
    if (!frame) return;
    await loaded(frame);
    const root = frame.contentDocument.documentElement;
    await new Promise((resolve, reject) => {
      const observer = new MutationObserver(check);
      function check() {
        if (root.dataset.heroReady === 'true') { observer.disconnect(); resolve(); }
        else if (root.dataset.heroError) { observer.disconnect(); reject(new Error(root.dataset.heroError)); }
        else {
          const fraction = Number(root.dataset.heroProgress || 0) / 100;
          bar.value = Math.min(99, Math.round((completed + fraction) / total * 100));
          count.textContent = `${bar.value}%`;
        }
      }
      observer.observe(root, { attributes: true }); check();
    });
  };
  overlay.hidden = false;
  overlay.querySelector('.startup-retry').onclick = () => parent.location.reload();
  overlay.querySelector('.startup-continue').onclick = close;
  const asset = name => new URL(name, location.href).href;
  const work = [
    ...frames.map(frame => loaded(frame).then(() => imagesReady(frame.contentDocument)).then(done)),
    fetched(asset('i18n/en.js')).then(done),
    fetched(asset('i18n/ja.js')).then(done),
    fetched(asset('assets/moving-talent.mp4')).then(done),
    heroReady().then(done),
  ];
  let timeout;
  Promise.race([Promise.all(work), new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Load timed out')), 120000); })])
    .then(() => { close(); document.documentElement.dataset.presentationReady = 'true'; })
    .catch(error => { overlay.querySelector('.startup-error').hidden = false; console.error('Presentation preload:', error); })
    .finally(() => clearTimeout(timeout));
})();
