// Hand-curated public evidence. These are selected functions, not an incident cohort.
export type Localized = { en: string; ja: string };
export type OutcomeState = 'observed-unavailable' | 'reported-operating' | 'reported-restored' | 'not-established';
export type EvidenceClass = 'endpoint-observation' | 'operator-report' | 'operator-initial-account';
export type RecoveryOutcome = {
  id: string; provider: string; function: Localized; state: OutcomeState;
  evidence: EvidenceClass; date: string; dated: Localized;
  action: Localized; access: Localized; unresolved: Localized; detail: Localized;
  sources: { url: string; label: Localized }[];
};
const l = (en: string, ja: string): Localized => ({ en, ja });
const source = (url: string, en: string, ja: string) => ({ url, label: l(en, ja) });
export const states: Record<OutcomeState, Localized> = {
  'observed-unavailable': l('Observed unavailable', '利用不可を観測'),
  'reported-operating': l('Reported operating', '営業継続との発表'),
  'reported-restored': l('Reported restored', '再開・復旧との発表'),
  'not-established': l('Not established', '確認できず'),
};
export const evidenceLabels: Record<EvidenceClass, Localized> = {
  'endpoint-observation': l('Endpoint observation', '公開ページへのアクセス結果'),
  'operator-report': l('Operator report', '運営者の発表'),
  'operator-initial-account': l('Initial operator account', '運営者による初期報告'),
};
export const copy = {
  title: l('Different functions, different recovery states', '機能ごとに異なる、利用再開の状況'),
  subtitle: l('8 selected functions · October–November 2026 records, not live status', '選んだ8つの機能の記録 · 2026年10〜11月時点。現在の稼働状況ではありません'),
  service: l('Service / function', 'サービス・機能'),
  action: l('Disruption / action', '支障・対応'),
  access: l('User access at stated date', '記載日時の利用状況'),
  unresolved: l('Still not established', 'まだ確認できないこと'),
  sourceLabel: l('Source', '出典'),
  sourcesTitle: l('Function records: sources and scope', '各機能の記録：出典と対象範囲'),
};
export const outcomes: RecoveryOutcome[] = [
  {
    id: 'fabcafe-homepage', provider: 'FabCafe', function: l('Homepage', 'ホームページ'),
    state: 'observed-unavailable', evidence: 'endpoint-observation', date: '2026-11-04',
    dated: l('4 Nov · 11:29 JST', '11月4日 11:29 JST'),
    action: l('Precautionary PHP website pause', 'PHPの脆弱性への予防的なサイト停止'),
    access: l('HTTP 503 at the check', '確認時はHTTP 503'),
    unresolved: l('Onset and reopening', '停止開始・再開の日時'),
    detail: l('One homepage request on 4 November 2026 returned HTTP 503. Its notice attributed the precautionary pause to a PHP vulnerability. This does not establish continuous downtime or the state of other pages. The operator’s statement that it found no related breach is not an independent security finding.', '2026年11月4日、ホームページへの1回のアクセスでHTTP 503を確認しました。掲載された告知は、PHPの脆弱性を理由に予防的に停止したと説明しています。継続的な停止期間や他のページの状態は不明です。関連する不正アクセス等は見つかっていないとの説明も、運営者の発表であり独立した安全性の確認ではありません。'),
    sources: [source('https://fabcafe.com/', 'Homepage notice (observed 4 November)', 'ホームページの告知（11月4日確認）')],
  },
  {
    id: 'fabcafe-venues', provider: 'FabCafe', function: l('Physical venues / events', '店舗・イベント'),
    state: 'reported-operating', evidence: 'operator-report', date: '2026-11-04',
    dated: l('Page observed 4 Nov', '11月4日に確認した告知'),
    action: l('Website paused; venues separate', 'サイト停止と店舗営業は別'),
    access: l('Open; events as scheduled', '店舗は営業、イベントは予定どおり'),
    unresolved: l('Independent venue checks', '現地での独立した確認'),
    detail: l('The notice on the homepage observed on 4 November 2026 said physical locations remained open and scheduled events would continue. These are operator statements, not visits or attendance checks. This is a second function of FabCafe, not a second incident.', '2026年11月4日に確認したホームページの告知は、実店舗の営業と予定されたイベントの実施を継続すると説明しています。現地訪問や開催実績の確認ではなく、運営者の発表です。サイトとは別の機能を示す行で、別の障害として数えていません。'),
    sources: [source('https://fabcafe.com/', 'Venue and event notice', '店舗・イベントについての告知')],
  },
  {
    id: 'ffxiv-login', provider: 'FFXIV', function: l('New logins · Korean service', '韓国版の新規ログイン'),
    state: 'reported-restored', evidence: 'operator-report', date: '2026-10-23',
    dated: l('23 Oct · 02:50 (KST assumed)', '10月23日 02:50（KSTと仮定）'),
    action: l('New logins restricted', '新規ログインを制限'),
    access: l('Returned after 25h 25m', '25時間25分後に再開'),
    unresolved: l('Existing-session availability', '接続済みの利用者への影響'),
    detail: l('The retained operator clocks run from 22 October 2026 at 01:25 to 23 October at 02:50, with KST assumed: 25 hours 25 minutes. This concerns new logins, not all gameplay or the NAVER portal. Settings backup below belongs to the same response, with a later endpoint.', '保存された運営者の時刻は、2026年10月22日01:25から23日02:50までで、差は25時間25分です。時刻帯はKSTと仮定しています。対象は新規ログインで、ゲーム全体やNAVERポータルではありません。次の設定バックアップも同じ対応事例ですが、再開時刻が異なります。'),
    sources: [source('https://ff14.game.naver.com/news/notice/view/3152?page=1', 'New-login restoration notice', '新規ログイン再開の告知')],
  },
  {
    id: 'ffxiv-backup', provider: 'FFXIV', function: l('Settings backup · Korean service', '韓国版の設定バックアップ'),
    state: 'reported-restored', evidence: 'operator-report', date: '2026-10-26',
    dated: l('26 Oct · 18:08 (KST assumed)', '10月26日 18:08（KSTと仮定）'),
    action: l('Backup stayed restricted', 'バックアップの制限は継続'),
    access: l('3d 15h 18m after login', 'ログイン再開の3日15時間18分後'),
    unresolved: l('Whether any data was lost', '実際にデータが失われたか'),
    detail: l('The operator reported client and character settings backup restored on 26 October 2026 at 18:08 (KST assumed). The extra 3 days 15 hours 18 minutes runs from login restoration, not the start of the backup restriction. A conditional damaged-data warning does not establish data loss.', '運営者はクライアント・キャラクター設定のバックアップを2026年10月26日18:08に再開したと発表しています（KSTと仮定）。3日15時間18分はログイン再開からの追加の制限時間であり、バックアップの全停止期間ではありません。データが破損した場合の注意書きは、実際の損失を確認したものではありません。'),
    sources: [source('https://ff14.game.naver.com/news/notice/view/3154?page=1', 'Settings-backup restoration notice', '設定バックアップ再開の告知')],
  },
  {
    id: 'nicos-statements', provider: 'MUFG NICOS', function: l('Corporate purchasing-card statements', '法人パーチェシングカードの利用明細'),
    state: 'not-established', evidence: 'operator-report', date: '2026-10-26',
    dated: l('26 Oct notice', '10月26日の告知'),
    action: l('Some WEB functions resumed', 'WEBサービスの一部を再開'),
    access: l('Statements not named', '明細の閲覧は個別に記載なし'),
    unresolved: l('Statement access / interruption', '明細の利用可否・停止の有無'),
    detail: l('The 26 October 2026 notice reports normal login-page presentation and resumption of some WEB functions after changes from the night of 21 October. Corporate purchasing-card statement retrieval is not individually named. Neither its interruption nor its restoration is established; this is not a payment-outage finding. PHP is not named.', '2026年10月26日の告知は、21日夜から変更していたログイン画面を通常の表示に戻し、一部のWEBサービスを再開したと説明しています。法人パーチェシングカードの明細閲覧は個別に挙げられていません。この機能の停止も再開も確認できず、決済障害を示すものでもありません。PHPへの言及はありません。'),
    sources: [source('https://info.cr.mufg.jp/info/down2.php?attach_id=1091&seq=11195&category=2&page=2', 'WEB service resumption notice', 'WEBサービス再開の告知')],
  },
  {
    id: 'kansai-web-information', provider: 'Kansai T&D', function: l('Website / outage information', '関西電力送配電のサイト・停電情報'),
    state: 'reported-restored', evidence: 'operator-report', date: '2026-10-22',
    dated: l('22 Oct · end hour unstated', '10月22日（復旧時刻は未記載）'),
    action: l('Web functions paused; app offered', 'サイトの機能停止、アプリを案内'),
    access: l('Same-day website restoration', '同日中にサイト機能を復旧と発表'),
    unresolved: l('Exact interval; not power supply', '正確な停止時間。電力供給とは別'),
    detail: l('Website functions, including part of outage information, were sequentially suspended from 22 October 2026 at 00:00. A same-date notice reported restoration without an end hour. An app was offered as a workaround. The notices concern a generic software vulnerability, not explicitly PHP; they do not report electricity-supply interruption or restoration.', '2026年10月22日00:00から、停電情報の一部を含むサイト機能を順次停止しました。同日付の告知で復旧を発表していますが、終了時刻はありません。代替としてアプリを案内しています。原因の説明はソフトウェアの脆弱性で、PHPとは明記されていません。電力供給の停止や復旧を示す告知ではありません。'),
    sources: [source('https://www.kansai-td.co.jp/corporate/information/2026/pdf/20261022_1_01.pdf', 'Website suspension notice', 'サイト機能停止の告知'), source('https://www.kansai-td.co.jp/corporate/information/2026/pdf/20261022_3_01.pdf', 'Website restoration notice', 'サイト機能復旧の告知')],
  },
  {
    id: 'docomo-voice', provider: 'NTT DOCOMO', function: l('Mobile voice · some users', '一部利用者の携帯電話の音声通話'),
    state: 'reported-restored', evidence: 'operator-report', date: '2026-10-28',
    dated: l('28 Oct · around 17:29 JST', '10月28日 17:29頃 JST'),
    action: l('Voice disruption from ~16:30', '16:30頃から音声通話に支障'),
    access: l('Restored in the stated areas', '告知の対象地域で復旧と発表'),
    unresolved: l('Cause; SMS not established', '原因。SMSについては確認できず'),
    detail: l('The 28 October 2026 report gives an approximate 16:30–17:29 JST interval for some users in parts of Hokkaido, Tohoku, Kanto, Hokuriku and Tokai, including emergency-call effects. This is an operator report, not an independently measured 59 minutes or a nationwide all-user outage. Cause was under confirmation; no PHP connection is established. Other DOCOMO episodes are not combined here.', '2026年10月28日の発表は、北海道・東北・関東・北陸・東海の一部地域の一部利用者について、16:30頃から17:29頃まで音声通話に支障があり、緊急通報にも影響したとしています。独立に測定した59分間ではなく、全国の全利用者の障害でもありません。原因は確認中とされ、PHPとの関連は確認できません。他の日の障害とは合算していません。'),
    sources: [source('https://www.docomo.ne.jp/info/network/kanto/pages/261028_01_m.html', '28 October voice restoration report', '10月28日の音声通話復旧報告')],
  },
  {
    id: 'binance-withdrawals', provider: 'Binance', function: l('Customer withdrawals', '顧客の出金'),
    state: 'not-established', evidence: 'operator-initial-account', date: '2026-11-03',
    dated: l('29 Oct event · 3 Nov account', '10月29日の事象・11月3日の報告'),
    action: l('Withdrawals suspended', '出金を停止'),
    access: l('Return to normal not timed', '通常の出金再開時刻は不明'),
    unresolved: l('Access ≠ security containment', '利用再開と不正な権限の無効化は別'),
    detail: l('In its initial account published on 3 November 2026 about 29 October, Binance says suspending withdrawals and shutting hot-wallet services did not invalidate permissions already on-chain; it reports a separate revocation procedure. That account does not establish when normal customer withdrawals resumed. It is not independent forensics, proof of security, or evidence of a PHP connection.', '2026年10月29日の事象について、Binanceは11月3日の初期報告で、出金やホットウォレットのサービスを止めても、ブロックチェーン上に残る権限は無効にならず、別途取り消す処理が必要だったと説明しています。この報告では通常の顧客出金がいつ再開したかは確認できません。独立した調査の結論や安全性の証明ではなく、PHPとの関連を示すものでもありません。'),
    sources: [source('https://www.binance.com/en/blog/community/3229153443759566763', 'Initial findings and response update (3 November)', '初期調査・対応報告（11月3日）')],
  },
];
