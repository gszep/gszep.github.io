// Author reconstruction from operator notices, checked 26 October 2026.
// Minutes since 21 October 18:00 on the displayed JST-aligned clock.
// Only pixiv states JST explicitly. Asken/Sakura alignment assumes their
// domestic notice clocks are JST; retain that assumption in every rendering.
export const japanReleaseReference = {
  minute: 300,
  type: 'scheduled-not-observed',
  url: 'https://www.php.net/archive/2026.php',
};
export const japanResponses = [
  { id: 'pixiv', name: 'pixiv', start: 60, end: 330, approximate: false, zoneExplicit: true, reference: 2,
    source: 'https://www.pixiv.net/info.php?id=14290' },
  { id: 'asken', name: 'Asken', start: 290, end: 925, approximate: true, zoneExplicit: false, reference: 3,
    source: 'https://www.asken.inc/news/20261022-2' },
  { id: 'sakura', name: 'Sakura', start: 270, end: null, approximate: false, zoneExplicit: false, reference: 4,
    source: 'https://www.sakura.ad.jp/corporate/information/announcements/2026/10/22/1968226117/' },
] as const;
