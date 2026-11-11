// Revalidate the small index; reuse unchanged, content-versioned model bytes.
const root = new URL('../', import.meta.url);
let versions;
let storage;

export async function fetchAsset(input) {
  const url = new URL(input, globalThis.location?.href || root);
  versions ??= fetch(new URL('asset-versions.json', root), { cache: 'no-cache' })
    .then(response => {
      if (!response.ok) throw new Error(`Asset index ${response.status}`);
      return response.json();
    })
    .catch(error => {
      console.warn('Asset index unavailable; revalidating assets directly.', error);
      return {};
    });
  const index = await versions;
  const path = url.href.startsWith(root.href) ? url.pathname.slice(root.pathname.length) : '';
  const version = index[path];
  if (!/^[a-f0-9]{64}$/.test(version || '')) return fetch(url, { cache: 'no-cache' });
  url.searchParams.set('v', version);
  // Cache Storage also retains large binary models that the HTTP cache may omit.
  storage ??= globalThis.caches?.open('sesame-build-assets-v1').catch(() => null) || Promise.resolve(null);
  const cache = await storage;
  const hit = await cache?.match(url).catch(() => null);
  if (hit) return hit;
  const integrity = 'sha256-' + btoa(String.fromCharCode(...version.match(/../g).map(byte => parseInt(byte, 16))));
  const response = await fetch(url, { cache: 'force-cache', integrity });
  const directives = response.headers.get('cache-control') || '';
  if (cache && response.status === 200 && !/\b(no-store|private)\b/i.test(directives)) {
    try {
      await cache.put(url, response.clone());
      // Keep the current content version without accumulating old large models.
      for (const key of await cache.keys()) {
        const old = new URL(key.url);
        const path = old.href.startsWith(root.href) ? old.pathname.slice(root.pathname.length) : null;
        if (path !== null && (!index[path] || (old.pathname === url.pathname && old.href !== url.href))) await cache.delete(key);
      }
    } catch {
      // Private browsing or storage quotas must not prevent the guide loading.
    }
  }
  return response;
}
