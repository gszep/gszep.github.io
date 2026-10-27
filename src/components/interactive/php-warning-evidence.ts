// Public records only. Header seconds do not imply second-accurate service telemetry.
export type Localized = { en: string; ja: string };
export const warning = {
  kind: 'public-maintainer-advance-warning', at: '2026-10-20T19:33:47Z',
  source: 'https://news-web.php.net/php.announce/509',
  scheduledRelease: '2026-10-21T14:00:00Z', actualRelease: null,
} as const;
export const offsetSeconds = (at: string) => (Date.parse(at) - Date.parse(warning.at)) / 1000;
export const minutesBetween = (start: string, end: string) => (Date.parse(end) - Date.parse(start)) / 60000;
type Notice = { kind: 'date-only'; start: string; endExclusive: string } | { kind: 'page-timestamp'; at: string };
type Base = {
  id: string; locale: 'JP' | 'KR' | 'MULTIREGION'; label: Localized;
  scope: Localized; uncertainty: Localized; zone: 'JST' | 'KST' | 'UTC'; zoneExplicit: boolean;
  source: string; incident: string; notice?: Notice;
};
type Restriction = Base & { kind: 'reported-restriction'; start: string; end: string; approximate: boolean };
type Checkpoints = Base & {
  kind: 'reporting-checkpoints'; start: null; end: null; durationMinutes: null;
  events: { at: string; label: Localized }[];
};
export const responses: (Restriction | Checkpoints)[] = [
  {
    id: 'pixiv', locale: 'JP', label: { en: 'pixiv · service family', ja: 'pixiv・サービス群' },
    scope: { en: 'pixiv, Encyclopedia, FANBOX and some functions using pixiv accounts.', ja: 'pixiv・百科事典・FANBOX、およびpixivアカウントを使う他サービスの一部機能。' },
    uncertainty: { en: 'Patching and checks are not timed separately. The completion notice gives a date, not a publication time.', ja: '修正と確認の所要時間は分けられていません。完了通知は日付のみで、公表時刻は不明です。' },
    zone: 'JST', zoneExplicit: true, incident: 'php-october-2026', kind: 'reported-restriction', approximate: false,
    start: '2026-10-21T19:00:00+09:00', end: '2026-10-21T23:30:00+09:00',
    notice: { kind: 'date-only', start: '2026-10-22T00:00:00+09:00', endExclusive: '2026-10-23T00:00:00+09:00' },
    source: 'https://www.pixiv.net/info.php?id=14290',
  },
  {
    id: 'asken', locale: 'JP', label: { en: 'Asken · apps / web', ja: 'あすけん・アプリ／Web' },
    scope: { en: 'Named apps, website and corporate services.', ja: '通知に挙げられたアプリ・Web・法人向けサービス。' },
    uncertainty: { en: 'Approximate onset; JST assumed. Generic PHP attribution, no exact CVEs. Publication time unknown.', ja: '開始は概時刻、JSTは仮定です。PHPとの関連は記載されていますが個別のCVEは未記載。公表時刻は不明です。' },
    zone: 'JST', zoneExplicit: false, incident: 'php-october-2026', kind: 'reported-restriction', approximate: true,
    start: '2026-10-21T22:50:00+09:00', end: '2026-10-22T09:25:00+09:00',
    notice: { kind: 'date-only', start: '2026-10-22T00:00:00+09:00', endExclusive: '2026-10-23T00:00:00+09:00' },
    source: 'https://www.asken.inc/news/20261022-2',
  },
  {
    id: 'bamboohr', locale: 'MULTIREGION', label: { en: 'BambooHR · access reports', ja: 'BambooHR・利用再開の報告' },
    scope: { en: 'US, Canada and Ireland application components and public website.', ja: '米国・カナダ・アイルランドのアプリ構成要素と公開Webサイト。' },
    uncertainty: { en: 'Actual onset and endpoint unknown. The 10:46 entry contains an undated shutdown edit. PHP2SHELL is named, not exact CVEs. Reopened access can still have errors.', ja: '実際の停止開始・終了時刻は不明です。10:46の項目には時刻不明の停止追記があります。PHP2SHELLとの記載はありますが個別のCVEは未記載で、再開後もエラーの可能性が残ります。' },
    zone: 'UTC', zoneExplicit: true, incident: 'php-october-2026', kind: 'reporting-checkpoints', start: null, end: null, durationMinutes: null,
    events: [
      { at: '2026-10-21T11:51:00Z', label: { en: 'Precautionary unavailability reported', ja: '予防的な停止を報告' } },
      { at: '2026-10-21T15:03:00Z', label: { en: 'Fix applied; testing', ja: '修正適用済み、試験中' } },
      { at: '2026-10-21T16:01:00Z', label: { en: 'Initial tests passed; feature validation', ja: '初期試験を通過、機能を確認中' } },
      { at: '2026-10-21T17:31:00Z', label: { en: 'Validation continuing', ja: '機能の確認を継続' } },
      { at: '2026-10-21T18:01:00Z', label: { en: 'Access restored; residual errors possible', ja: '利用再開、エラーが残る可能性あり' } },
    ],
    source: 'https://status.bamboohr.com/pages/incident/54f0de009d6f51e7140002b7/6ad897f670d2d304e082ebdb',
  },
  {
    id: 'ffxiv-login', locale: 'KR', label: { en: 'FFXIV · new logins', ja: 'FFXIV・新規ログイン' },
    scope: { en: 'Korean FFXIV service: new logins, not all gameplay or the NAVER portal.', ja: '韓国版FFXIVの新規ログイン。ゲーム全体やNAVERポータルの停止ではありません。' },
    uncertainty: { en: 'KST assumed; generic PHP attribution, no exact CVEs. Existing-session availability unknown. Same incident as the backup row.', ja: 'KSTは仮定。PHPとの関連は記載されていますが個別のCVEは未記載です。接続済みの利用者がプレイを続けられたかは不明。バックアップ行と同じ対応事例です。' },
    zone: 'KST', zoneExplicit: false, incident: 'ffxiv-php-response', kind: 'reported-restriction', approximate: false,
    start: '2026-10-22T01:25:00+09:00', end: '2026-10-23T02:50:00+09:00',
    source: 'https://ff14.game.naver.com/news/notice/view/3152?page=1',
  },
  {
    id: 'ffxiv-backup', locale: 'KR', label: { en: 'FFXIV · settings backup', ja: 'FFXIV・設定バックアップ' },
    scope: { en: 'Korean FFXIV service: client and character settings backup.', ja: '韓国版FFXIVのクライアント・キャラクター設定のバックアップ。' },
    uncertainty: { en: 'KST assumed; generic PHP attribution. Same incident as login, not another outage. The conditional damaged-data warning does not establish data loss.', ja: 'KSTは仮定。PHPとの関連を記載。ログイン行と同じ対応事例で、別の障害ではありません。データが破損した場合の注意書きは、データ損失の確認ではありません。' },
    zone: 'KST', zoneExplicit: false, incident: 'ffxiv-php-response', kind: 'reported-restriction', approximate: false,
    start: '2026-10-22T01:25:00+09:00', end: '2026-10-26T18:08:00+09:00',
    notice: { kind: 'page-timestamp', at: '2026-10-26T18:08:00+09:00' },
    source: 'https://ff14.game.naver.com/news/notice/view/3154?page=1',
  },
];
// Latest selected event, never retrieval time or initial login recovery.
export const latestEvent = '2026-10-26T09:08:00Z';
export const axisEndSeconds = offsetSeconds(latestEvent);
export const maintenance = [
  { id: 'ffxiv-20260917', start: '2026-09-17T15:00:00+09:00', plannedEnd: '2026-09-17T19:00:00+09:00', reportedEnd: '2026-09-17T18:25:00+09:00', pageCreated: '2026-09-17T18:10:00+09:00',
    plan: 'https://ff14.game.naver.com/news/notice/view/2956?page=3', completion: 'https://ff14.game.naver.com/news/notice/view/2961?page=2' },
  { id: 'ffxiv-20261013', start: '2026-10-13T14:00:00+09:00', plannedEnd: '2026-10-13T19:00:00+09:00', reportedEnd: '2026-10-13T18:25:00+09:00', pageCreated: '2026-10-13T18:11:00+09:00',
    plan: 'https://ff14.game.naver.com/news/notice/view/2966?page=2', completion: 'https://ff14.game.naver.com/news/notice/view/2970?page=1' },
].map(row => ({ ...row, kind: 'reported-completed-maintenance', function: 'game-and-launcher', zone: 'KST', zoneExplicit: false, matchedBaseline: false, completionWordingPublishedAt: null }));
export function durationLabel(minutes: number, lang: string): string {
  const days = Math.floor(minutes / 1440), hours = Math.floor(minutes % 1440 / 60), mins = minutes % 60;
  return lang === 'ja' ? `${days ? `${days}日` : ''}${hours}時間${mins ? `${mins}分` : ''}` : `${days ? `${days}d ` : ''}${hours}h${mins ? ` ${mins}m` : ''}`;
}
