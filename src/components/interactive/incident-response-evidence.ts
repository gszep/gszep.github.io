// Selective public coding, not an export of the research collection.
// IDs refer to the owner-reviewed records. null means not coded in those records.
export type Locale = 'en' | 'ja';
export type Job = 'scope' | 'revision' | 'help' | 'remaining';
export type LocalText = Record<Locale, string>;
export const jobs: Job[] = ['scope', 'revision', 'help', 'remaining'];
const text = (en: string, ja: string): LocalText => ({ en, ja });
export const rules: Record<Job, LocalText> = {
  scope: text('An affected or unaffected configuration, product or ownership boundary is explicitly stated.', '影響のある・ない構成、製品、または管理責任の範囲が明示されている。'),
  revision: text('An actor explicitly acknowledges a change to an earlier assessment, claim or advice. Differently scoped statements, narrower current wording, new details or a collector’s correction label alone do not qualify. This includes a discovery-assessment revision within one account, not necessarily a public false claim being corrected.', '発信者自身が、以前の判断・説明・助言を変更したと明示している。対象範囲の違う説明、現行本文の限定的な表現、追加情報、収集時の「訂正」という分類だけでは数えない。一つの報告内で発見者が判断を改めた場合も含み、公開された誤情報の訂正とは限らない。'),
  help: text('Delivered assistance, an available tool, a specific procedure or targeted notification addresses an identified obstacle to action. An ordinary patch announcement or “update now” alone does not qualify.', '実際の支援、利用できるツール、具体的な手順、対象を絞った通知が、対応を妨げる問題に対処している。通常の修正版の告知や更新の呼びかけだけでは数えない。'),
  remaining: text('The source distinguishes a provision already made from a residual task, layer or unfinished outcome. Gaps in our collection alone do not qualify.', '資料自体が、すでに提供・実施した対応と、なお残る作業・対象・未完了の結果を区別している。今回の収集で分からないことだけでは数えない。'),
};
export type Origin = 'current' | 'retrospective' | 'historic';
export const originLabels: Record<Origin, LocalText> = {
  current: text('Current retained wording; historical wording not independently preserved', '保存した現行本文。当時の文面は独立に保存されていない'),
  retrospective: text('Retrospective account, not a contemporaneous observation', '後日の報告。当時の直接観察ではない'),
  historic: text('Dated message, archived capture or versioned record; see source', '日付付きメッセージ、保存版、または版の記録。詳細は出典を参照'),
};
type Event = { url: string; origin: Origin };
const current = (url: string): Event => ({ url, origin: 'current' });
const historic = (url: string): Event => ({ url, origin: 'historic' });
const retrospective = (url: string): Event => ({ url, origin: 'retrospective' });
const shellshock = 'https://access.redhat.com/security/vulnerabilities/shellshock';
const drown = 'https://www.openssl.org/news/secadv/20160301.txt';
const openssl = 'https://www.openssl.org/news/secadv/20221101.txt';
const petya = 'https://www.microsoft.com/en-us/security/blog/2017/06/27/new-ransomware-old-techniques-petya-adds-worm-capabilities/';
const exchange = 'https://techcommunity.microsoft.com/blog/exchange/released-march-2021-exchange-server-security-updates/2175901';
const citrix = 'https://www.netscaler.com/blogs/2023-10/cve-2023-4966-critical-security-update-now-available-for-netscaler-adc-and-netscaler-gateway';
const diginotar = 'https://blog.mozilla.org/security/2011/09/02/diginotar-removal-follow-up/';
const codecov = 'https://about.codecov.io/security-update/';
const ua = 'https://github.com/faisalman/ua-parser-js/issues/536';
const cx = 'https://www.3cx.com/blog/news/desktopapp-security-alert/';
const xz = 'https://www.openwall.com/lists/oss-security/2024/03/29/4';
export const events: Record<string, Event> = {
  'disclosure-e06': current('https://ftp.gnu.org/gnu/bash/bash-4.3-patches/bash43-025'),
  'disclosure-e02': current(shellshock),
  'disclosure-e10': current(drown),
  'disclosure-e11': current('https://drownattack.com/'),
  'disclosure-e14': current('https://w1.fi/security/2017-1/wpa-packet-number-reuse-with-replayed-messages.txt'),
  'disclosure-e23': current('https://support.microsoft.com/help/4073290'),
  'disclosure-e24': current('https://support.microsoft.com/help/4073290'),
  'disclosure-e31': current('https://www.openssl.org/blog/blog/2022/11/01/email-address-overflows/'),
  'disclosure-e29': current(openssl),
  'operations-e01': historic('https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/'),
  'operations-e02': historic('https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/'),
  'operations-e04': retrospective('https://www.nao.org.uk/wp-content/uploads/2017/10/Investigation-WannaCry-cyber-attack-and-the-NHS.pdf'),
  'operations-e10': current(petya),
  'operations-e11': current(petya),
  'operations-e19': current(exchange),
  'operations-e20': current(exchange),
  'operations-e22': current('https://www.cisa.gov/news-events/cybersecurity-advisories/aa21-062a'),
  'operations-e30': current(citrix),
  'operations-e33': current(citrix),
  'operations-e34': current(citrix),
  'operations-e35': current('https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-325a'),
  'trust-e03': current(diginotar),
  'trust-e04': current('https://bugzilla.mozilla.org/show_bug.cgi?id=683449'),
  'trust-e05': current(diginotar),
  'trust-e10': current('https://www.solarwinds.com/sa-overview/securityadvisory'),
  'trust-e11': retrospective('https://about.codecov.io/apr-2021-post-mortem/'),
  'trust-e12': current(codecov),
  'trust-e13': current(codecov),
  'trust-e14': current(codecov),
  'trust-e16': current(ua),
  'trust-e17': current(ua),
  'trust-e18': current('https://github.com/advisories/GHSA-pjwm-rvh2-c87w'),
  'trust-e19': current(cx),
  'trust-e20': current(cx),
  'trust-e21': current(cx),
  'php-2026-ev-sakura-completion': retrospective('https://www.sakura.ad.jp/corporate/information/announcements/2026/10/22/1968226117/'),
  'php-2026-ev-hn-correction': current('https://news.ycombinator.com/item?id=50167754'),
  'php-2026-ev-mayfirst-patch': retrospective('https://status.mayfirst.org/2026/16/'),
  'emudhra-2026-ev-update2': current('https://emudhra.com/en/post/certificate-security-incident'),
  'emudhra-2026-ev-mozilla-blog': current('https://blog.mozilla.org/security/2026/10/20/protecting-firefox-users-following-the-compromise-of-emudhra-intermediate-certificates/'),
  'emudhra-2026-ev-apple-root': retrospective('https://support.apple.com/en-us/149555'),
  'log4shell-2021-e11': historic('https://www.openwall.com/lists/oss-security/2021/12/13/1'),
  'log4shell-2021-e05': historic('https://web.archive.org/web/20211220000136/https://logging.apache.org/log4j/2.x/security.html'),
  'log4shell-2021-e13': current('https://logging.apache.org/security.html'),
  'log4shell-2021-e03': current('https://cveawg.mitre.org/api/cve/CVE-2021-45046'),
  'xz-2024-e01': historic(xz),
  'xz-2024-e02': historic('https://www.debian.org/security/2024/dsa-5649'),
  'heartbleed-2014-e02': historic('http://www.mail-archive.com/openssl-users@openssl.org/msg73408.html'),
  'heartbleed-2014-e06': historic('http://blogs.akamai.com/2014/04/heartbleed-update-v3.html'),
  'heartbleed-2014-e07': historic('http://blogs.akamai.com/2014/04/heartbleed-update.html'),
  'heartbleed-2014-e08': retrospective('https://jhalderm.com/pub/papers/heartbleed-imc14.pdf'),
};
export type Cell = { note: LocalText; eventIds: string[] };
const cell = (en: string, ja: string, ...eventIds: string[]): Cell => ({ note: text(en, ja), eventIds });
export type Incident = { id: string; name: string; codes: Record<Job, Cell | null> };
export const incidents: Incident[] = [
  { id: 'shellshock-2014', name: 'Shellshock · 2014', codes: {
    scope: cell('The Bash 4.3 patch report identifies processing of exported function definitions as the trigger.', 'Bash 4.3の修正記録は、エクスポートした関数定義の処理を問題の経路として示す。', 'disclosure-e06'),
    revision: cell('Red Hat acknowledges that the first patch was incomplete.', 'Red Hatが最初の修正の不完全さを認める。', 'disclosure-e02'),
    help: null,
    remaining: cell('The already-issued patch is explicitly described as incomplete, leaving further repair necessary.', '公開済みの修正だけでは不十分で、追加対応が必要だと明示する。', 'disclosure-e02'),
  } },
  { id: 'drown-2016', name: 'DROWN · 2016', codes: {
    scope: cell('Disabling SSLv2 ciphers is sufficient only with the specified earlier patches installed.', 'SSLv2暗号を無効にする対策は、指定の既存修正が適用済みの場合に限り有効とする。', 'disclosure-e10'),
    revision: null,
    help: cell('OpenSSL gives a conditional cipher-disabling procedure and identifies the patch prerequisite that makes it work.', 'OpenSSLは暗号を無効にする具体策と、それを有効にする前提の修正を示す。', 'disclosure-e10'),
    remaining: cell('Researchers explain that a clean test of one server does not check reuse of its key on another server.', '研究者は、一台の検査で問題がなくても、同じ鍵を使う別のサーバーまでは確認できないと説明する。', 'disclosure-e11'),
  } },
  { id: 'krack-2017', name: 'KRACK · 2017', codes: {
    scope: cell('The advisory identifies the hostapd access-point issue with FT enabled; this is one issue, not every KRACK variant.', '勧告はhostapdのアクセスポイント側の一つの問題を、FT有効時に限定する。KRACK全体の条件ではない。', 'disclosure-e14'),
    revision: null, help: null, remaining: null,
  } },
  { id: 'meltdown-spectre-2018', name: 'Meltdown / Spectre · 2018', codes: {
    scope: cell('Microsoft narrows the update-induced boot failure to a subset of older AMD processors.', 'Microsoftは更新後の起動障害を、一部の旧型AMDプロセッサーに限定する。', 'disclosure-e23'),
    revision: null,
    help: cell('Microsoft supplies an update for the unbootable state caused by the earlier update; installation outcomes are not measured.', 'Microsoftは以前の更新による起動不能を直す更新を提供する。実機での復旧結果は測定していない。', 'disclosure-e23', 'disclosure-e24'),
    remaining: null,
  } },
  { id: 'openssl-2022', name: 'OpenSSL · November 2022', codes: {
    scope: cell('OpenSSL separates unaffected pre-3.0 releases from the affected branch.', 'OpenSSLは影響のない3.0未満の版と、影響のある系統を区別する。', 'disclosure-e31'),
    revision: cell('The project explicitly lowers the pre-announced Critical rating to High after further analysis.', 'プロジェクトは追加分析を受け、事前告知の深刻度をCriticalからHighに引き下げる。', 'disclosure-e29'),
    help: null, remaining: null,
  } },
  { id: 'wannacry-2017', name: 'WannaCry · 2017', codes: {
    scope: cell('Microsoft says Windows 10 was not targeted that day, not that every Windows 10 system was generally safe.', 'Microsoftは当日の攻撃がWindows 10を狙っていなかったと述べる。一般的な安全性の保証ではない。', 'operations-e02'),
    revision: null,
    help: cell('Microsoft widens patch availability to platforms normally limited to custom support.', 'Microsoftは通常は個別サポートに限られる旧製品にも修正を提供する。', 'operations-e01'),
    remaining: cell('The NAO distinguishes issued patch advice from the missing formal mechanism to check compliance before the outbreak.', '英国会計検査院は、更新の助言は出されていた一方、発生前に実施状況を確認する正式な仕組みがなかったと報告する。', 'operations-e04'),
  } },
  { id: 'notpetya-2017', name: 'NotPetya · 2017', codes: {
    scope: null,
    revision: cell('Microsoft describes moving from circumstantial evidence to evidence of infections starting in the MEDoc updater. This is an attributed revision within the retained body, not preserved before-and-after pages.', 'MicrosoftはMEDoc更新経由の感染について、状況証拠から具体的な証拠を得た経緯を記す。保存した本文内での説明であり、変更前後のページを比較したものではない。', 'operations-e10', 'operations-e11'),
    help: null, remaining: null,
  } },
  { id: 'exchange-proxylogon-2021', name: 'Exchange / ProxyLogon · 2021', codes: {
    scope: cell('Security fixes require particular supported Exchange builds; older installations first need the prerequisite updates.', 'セキュリティ修正は指定のサポート対象ビルドに限られ、古い環境では前提となる更新が必要とする。', 'operations-e19'),
    revision: null,
    help: cell('Microsoft provides a one-click mitigation tool for administrators unable to apply the security update immediately.', 'Microsoftはすぐに修正を適用できない管理者向けに、ワンクリックの緩和ツールを提供する。', 'operations-e20'),
    remaining: cell('CISA separates available patches from incident response for organisations with evidence of compromise.', 'CISAは、利用できる修正の適用と、侵害が見つかった組織で必要なインシデント対応を区別する。', 'operations-e22'),
  } },
  { id: 'citrixbleed-2023', name: 'Citrix Bleed · 2023', codes: {
    scope: cell('The vendor identifies NetScaler ADC and Gateway as affected products.', 'ベンダーは影響を受ける製品としてNetScaler ADCとGatewayを示す。', 'operations-e30'),
    revision: cell('The vendor contrasts no known exploitation at disclosure with subsequently received credible attack reports; the change is recorded in the current body.', 'ベンダーは、公表時には攻撃を把握していなかったが、その後信頼できる報告を得たと説明する。変更は現行本文の記述に基づく。', 'operations-e30', 'operations-e33'),
    help: cell('The vendor gives commands to terminate active and persistent sessions; the joint advisory explains the session-hijacking risk.', 'ベンダーは既存・永続セッションを終了するコマンドを示す。共同勧告はセッション乗っ取りの危険を説明する。', 'operations-e34', 'operations-e35'),
    remaining: cell('Fixed builds are available, but the vendor also calls for terminating active and persistent sessions.', '修正版の提供に加え、ベンダーは既存・永続セッションの終了も求める。', 'operations-e30', 'operations-e34'),
  } },
  { id: 'diginotar-2011', name: 'DigiNotar · 2011', codes: {
    scope: cell('Mozilla identifies two Dutch government roots and which one its exemption actually covered.', 'Mozillaはオランダ政府系の二つのルート証明書を区別し、例外措置がどちらに適用されたかを示す。', 'trust-e04'),
    revision: cell('Mozilla removes an exemption after the Dutch government rescinds its assessment.', 'オランダ政府の評価撤回を受け、Mozillaが例外措置を取り消す。', 'trust-e05'),
    help: null,
    remaining: cell('Mozilla contrasts earlier revocation of individual fraudulent certificates with an unresolved breach scope, motivating broader distrust.', 'Mozillaは個々の不正証明書の失効後も侵害範囲が未解明だったとし、より広い信頼撤回の理由に挙げる。', 'trust-e03'),
  } },
  { id: 'solarwinds-2020', name: 'SolarWinds · 2020', codes: {
    scope: cell('SolarWinds lists the affected Orion builds and distinguishes attack-chain components from new product vulnerabilities.', 'SolarWindsは影響のあるOrionのビルドを列挙し、攻撃の構成要素と製品の新たな脆弱性を区別する。', 'trust-e10'),
    revision: null, help: null, remaining: null,
  } },
  { id: 'codecov-2021', name: 'Codecov · 2021', codes: {
    scope: cell('Codecov describes the affected uploader windows and exposed environment-variable and repository information.', 'Codecovは改変されたアップローダーが配布された時間帯と、流出対象の環境変数・リポジトリ情報を示す。', 'trust-e12'),
    revision: null,
    help: cell('Codecov reports targeted email and in-app notices, then directs affected users to account-specific information about exposed variables.', 'Codecovは対象ユーザーへのメール・アプリ内通知を報告し、流出した可能性のある変数について各アカウントの情報を案内する。', 'trust-e13', 'trust-e14'),
    remaining: cell('Removing the malicious uploader change does not replace the separate customer task of invalidating exposed credentials and auditing their use.', 'アップローダーの改変を取り除くことと、利用者が漏えいし得る認証情報を無効化し利用履歴を調べることを区別する。', 'trust-e11', 'trust-e13'),
  } },
  { id: 'ua-parser-js-2021', name: 'ua-parser-js · 2021', codes: {
    scope: cell('The maintainer names three compromised package versions.', 'メンテナーが改ざんされた三つの版を特定する。', 'trust-e17'),
    revision: cell('The reporter withdraws version-range advice and instead recommends an exact version pin.', '報告者は版の範囲指定を勧めた助言を撤回し、特定の版に固定するよう訂正する。', 'trust-e16'),
    help: cell('The advisory specifies rotating secrets from a different computer, avoiding use of the potentially compromised machine.', '勧告は、侵害された可能性のある端末を使わず、別の端末から秘密情報を更新するよう具体的に指示する。', 'trust-e18'),
    remaining: cell('The advisory explicitly warns that removing the package does not guarantee removal of other malicious software.', '勧告は、パッケージを削除しても他の不正ソフトが消える保証はないと明記する。', 'trust-e18'),
  } },
  { id: '3cx-2023', name: '3CX · 2023', codes: {
    scope: cell('3CX names the affected Windows app builds.', '3CXが影響のあるWindowsアプリのビルドを示す。', 'trust-e19'),
    revision: cell('3CX records a correction to the Mac version list because a build belonged to Update 6.', '3CXは、一つのビルドがUpdate 6に属していたためMac版の一覧を訂正したと記す。', 'trust-e21'),
    help: cell('3CX offers its web-based PWA while a newly signed Windows app would be delayed.', '新しい署名付きWindowsアプリの公開に時間がかかる間、3CXはブラウザーで使えるPWAを代替として案内する。', 'trust-e20'),
    remaining: cell('An available PWA alternative is distinguished from the still-delayed new Windows app.', '利用可能な代替のPWAと、まだ公開を待つWindowsアプリを区別する。', 'trust-e20'),
  } },
  { id: 'php-2026', name: 'PHP · 2026', codes: {
    scope: cell('Sakura separates provider-managed PHP from PHP inside customer-managed VPS instances.', 'さくらは提供側が管理するPHPと、利用者のVPS内のPHPを区別する。', 'php-2026-ev-sakura-completion'),
    revision: cell('A community commenter explicitly corrects the rumoured release schedule using the PHP notice; this is evidence of that correction, not of reader uptake.', 'コミュニティの投稿者がPHPの告知を参照して流布した公開予定を訂正する。訂正の記録であり、読者が受け入れた証拠ではない。', 'php-2026-ev-hn-correction'),
    help: cell('May First links a member-facing version-switching guide alongside its reported platform patching.', 'May Firstは基盤側の修正を報告するとともに、会員向けのPHP版切り替え手順を案内する。', 'php-2026-ev-mayfirst-patch'),
    remaining: cell('May First reports patching older PHP too, while encouraging—not requiring—members to switch to 8.3 or later.', 'May Firstは旧版も修正済みと報告する一方、会員には8.3以降への切り替えを推奨する。必須とはしていない。', 'php-2026-ev-mayfirst-patch'),
  } },
  { id: 'emudhra-2026', name: 'eMudhra · 2026', codes: {
    scope: cell('eMudhra describes the affected intermediate certificates and distinguishes them from root keys and other intermediates; these are its attributed claims.', 'eMudhraは影響のある中間証明書をルート鍵や他の中間証明書と区別する。同社の説明として扱う。', 'emudhra-2026-ev-update2'),
    revision: null,
    help: cell('Mozilla offers Firefox releases for users whose custom settings may have blocked the OneCRL update.', 'Mozillaは独自設定によりOneCRL更新が届かなかった可能性のある利用者向けにFirefoxの更新版を提供する。', 'emudhra-2026-ev-mozilla-blog'),
    remaining: cell('Apple distinguishes blocking already begun from further changes planned for other certificate-checking paths on Mac.', 'Appleは開始済みのブロックと、Macの別の証明書検証経路に予定する追加対応を区別する。', 'emudhra-2026-ev-apple-root'),
  } },
  { id: 'log4shell-2021', name: 'Log4Shell · 2021', codes: {
    scope: cell('The Log4j 1.2 advisory narrows the JMSAppender issue to attacker write access to a non-default configuration.', 'Log4j 1.2の勧告は、JMSAppenderの問題を、攻撃者が非標準設定を書き換えられる場合に限定する。', 'log4shell-2021-e11'),
    revision: cell('The archived Apache history records changed mitigation and severity advice; this does not discredit removing JndiLookup.', '保存版のApacheの履歴に、緩和策と深刻度の説明変更が記録されている。JndiLookupの削除が否定されたという意味ではない。', 'log4shell-2021-e05'),
    help: cell('Apache’s current guide offers branch-specific upgrades, including the Java 6 backport, addressing runtime compatibility. This records offered guidance, not a first-availability time or installation outcome.', 'Apacheの現行ガイドはJava 6向けバックポートなど実行環境に合う系統別の更新先を案内する。案内の記録であり、最初の提供日時や導入結果は示さない。', 'log4shell-2021-e13'),
    remaining: cell('The follow-up advisory identifies a residual problem in 2.15.0 under non-default configurations.', '後続の勧告が、2.15.0でも非標準構成では問題が残ると示す。', 'log4shell-2021-e03'),
  } },
  { id: 'xz-2024', name: 'xz · 2024', codes: {
    scope: cell('Debian separates stable releases from affected testing, unstable and experimental packages.', 'Debianは安定版と、影響のあったtesting・unstable・experimentalのパッケージを区別する。', 'xz-2024-e02'),
    revision: cell('Freund recounts changing his initial Debian-package hypothesis to an upstream compromise. This is within one disclosure, not a demonstrated public rumour correction.', 'FreundはDebianパッケージへの疑いから上流側の侵害へ見方を変えた経緯を記す。一つの公表文内の説明であり、公開の噂を訂正したと実証するものではない。', 'xz-2024-e01'),
    help: cell('The disclosure includes a detection script for checking potentially affected systems; its effectiveness is not measured here.', '公表文には影響が疑われるシステムを調べる検出スクリプトが付属する。ここでは有効性を測定していない。', 'xz-2024-e01'),
    remaining: null,
  } },
  { id: 'heartbleed-2014', name: 'Heartbleed · 2014', codes: {
    scope: cell('The advisory distinguishes affected 1.0.1 and 1.0.2-beta releases from other branches.', '勧告は影響を受ける1.0.1・1.0.2ベータ系統と他の系統を区別する。', 'heartbleed-2014-e02'),
    revision: cell('Akamai explicitly retracts its earlier belief that its allocator protected customer keys.', 'Akamaiは独自のメモリ管理が顧客の鍵を守っていたという以前の説明を明示的に撤回する。', 'heartbleed-2014-e07'),
    help: cell('Researchers report sending contacts lists of still-vulnerable hosts with a recovery-guide link. No private host data is reproduced.', '研究者は未修正ホストの一覧と復旧ガイドを連絡先へ送ったと報告する。非公開のホスト情報は掲載しない。', 'heartbleed-2014-e08'),
    remaining: cell('Akamai says key rotation has begun but some certificates require extra validation and take longer.', 'Akamaiは鍵の更新を開始したが、一部の証明書には追加確認が必要で時間がかかると説明する。', 'heartbleed-2014-e06'),
  } },
];
export const counts = Object.fromEntries(jobs.map(job => [job, incidents.filter(c => c.codes[job] !== null).length])) as Record<Job, number>;

// Display ordering only: average-linkage agglomeration on four equally weighted
// binary evidence codes. Null is treated as 0 for similarity, NOT as non-action.
// Resolve equal distances by sorted IDs; orient each merge to minimize the
// boundary Hamming distance, then by IDs. No chronology or quality rank implied.
export function hammingDistance(a: typeof incidents[number], b: typeof incidents[number]): number {
  return jobs.reduce((sum, job) => sum + Number((a.codes[job] !== null) !== (b.codes[job] !== null)), 0);
}
export function clusterIncidents(input = incidents): typeof incidents {
  if (new Set(input.map(row => row.id)).size !== input.length) throw new Error('Duplicate incident ID');
  const signature = (rows: typeof incidents) => rows.map(row => row.id).join('|');
  const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
  const key = (rows: typeof incidents) => signature([...rows].sort((a, b) => compare(a.id, b.id)));
  const clusters = input.map(row => [row]).sort((a, b) => compare(key(a), key(b)));
  while (clusters.length > 1) {
    let best: { i: number; j: number; sum: number; pairs: number; key: string } | undefined;
    for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++) {
      const a = clusters[i], b = clusters[j];
      const sum = a.reduce((n, x) => n + b.reduce((m, y) => m + hammingDistance(x, y), 0), 0);
      const pairs = a.length * b.length;
      const pairKey = [key(a), key(b)].sort(compare).join('::');
      if (!best || sum * best.pairs < best.sum * pairs ||
          (sum * best.pairs === best.sum * pairs && compare(pairKey, best.key) < 0)) best = { i, j, sum, pairs, key: pairKey };
    }
    const { i, j } = best!;
    const a = clusters[i], b = clusters[j];
    const choices = [a, [...a].reverse()].flatMap(left => [b, [...b].reverse()].flatMap(right => [
      { rows: [...left, ...right], gap: hammingDistance(left.at(-1)!, right[0]) },
      { rows: [...right, ...left], gap: hammingDistance(right.at(-1)!, left[0]) },
    ]));
    choices.sort((x, y) => x.gap - y.gap || compare(signature(x.rows), signature(y.rows)));
    clusters.splice(j, 1); clusters.splice(i, 1); clusters.push(choices[0].rows);
    clusters.sort((x, y) => compare(key(x), key(y)));
  }
  return clusters[0] ?? [];
}
export const clusteredIncidents = clusterIncidents();
export const screened = 20;
export const excluded = { id: 'moveit-2023', reason: text('MOVEit: insufficient retained incident-action evidence for the collection’s inclusion rule; not a judgement about the incident’s importance.', 'MOVEit：この収集の採用条件を満たす対応記録が不足。事件の重要性についての評価ではない。') };
