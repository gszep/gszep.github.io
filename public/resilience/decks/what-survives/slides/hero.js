/* Eagerly prepare the standalone two-eye animation; play only on this slide. */
(() => {
  const boot = () => {
    const slide = document.querySelector('.hero-slide');
    const source = location.pathname.startsWith('/resilience/')
      ? new URL('../../../hero/', location.href)
      : new URL('https://gszep.com/resilience/hero/');
    const origin = source.origin;
    const language = () => document.documentElement.lang === 'ja' ? 'ja' : 'en';
    if (location.protocol === 'file:') return;
    const frame = document.createElement('iframe');
    frame.title = slide.getAttribute('aria-label') || 'Sesame';
    source.searchParams.set('lang', language());
    frame.src = source.href;
    frame.loading = 'eager';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allow = 'fullscreen';
    let ready = false, lastActive;
    const send = (message) => frame.contentWindow?.postMessage(message, origin);
    const syncActivity = () => {
      const host = window.frameElement;
      const active = !document.hidden && (!host ||
        (getComputedStyle(host).visibility !== 'hidden' && getComputedStyle(host).display !== 'none'));
      if (ready && active !== lastActive) { send({ type: 'sesame-build-active', active }); lastActive = active; }
    };
    addEventListener('message', (event) => {
      if (event.origin !== origin || event.source !== frame.contentWindow) return;
      if (event.data?.type === 'sesame-build-ready') {
        ready = true; lastActive = undefined;
        document.documentElement.dataset.heroReady = 'true';
        send({ type: 'sesame-build-locale', lang: language() });
        syncActivity();
        frame.classList.add('ready');
      } else if (event.data?.type === 'sesame-build-progress') {
        document.documentElement.dataset.heroProgress = String(event.data.value);
      } else if (event.data?.type === 'sesame-build-error') {
        document.documentElement.dataset.heroError = event.data.message;
      } else if (event.data?.type === 'sesame-build-key' &&
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Enter', 'Backspace', 'Tab', 'l', 'L', 'f', 'F'].includes(event.data.key)) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: event.data.key, bubbles: true, cancelable: true }));
      }
    });
    if (window.frameElement) new MutationObserver(syncActivity).observe(window.frameElement,
      { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
    document.addEventListener('visibilitychange', syncActivity);
    new MutationObserver(() => { if (ready) send({ type: 'sesame-build-locale', lang: language() }); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    slide.append(frame);
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
