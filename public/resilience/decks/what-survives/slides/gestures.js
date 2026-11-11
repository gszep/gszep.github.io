/* Native browser pinch zoom and pan, without treating a pinch as a slide swipe. */
(() => {
  if (parent === window) return;
  const viewer = parent, stage = viewer.document.querySelector('#stage');
  if (!stage) return;
  stage.style.touchAction = 'auto';
  const viewport = viewer.document.querySelector('meta[name="viewport"]');
  if (viewport) viewport.content = 'width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=yes';
  const prepared = new WeakSet();
  function prepare(win) {
    let doc;
    try { doc = win.document; } catch { return; }
    if (!doc || prepared.has(doc)) return;
    prepared.add(doc);
    doc.documentElement.style.touchAction = 'auto';
    if (doc.body) doc.body.style.touchAction = 'auto';
    let pinching = false;
    const guard = event => {
      if (event.touches.length > 1) pinching = true;
      // Let the browser zoom/pan normally. Only suppress the viewer's swipe JS.
      if (pinching || (viewer.visualViewport?.scale || 1) > 1.01) event.stopImmediatePropagation();
      if (event.type === 'touchcancel' || (event.type === 'touchend' && !event.touches.length)) pinching = false;
    };
    for (const type of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) doc.addEventListener(type, guard, { capture: true, passive: true });
    const attach = frame => {
      frame.style.touchAction = 'auto';
      frame.addEventListener('load', () => prepare(frame.contentWindow));
      prepare(frame.contentWindow);
    };
    for (const frame of doc.querySelectorAll('iframe')) attach(frame);
    new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.tagName === 'IFRAME') attach(node);
        for (const frame of node.querySelectorAll('iframe')) attach(frame);
      }
    }).observe(doc.documentElement, { childList: true, subtree: true });
  }
  prepare(viewer);
})();
