// Shared model for the "physical share" slider used by several figures.
// s = share of AI's capability growth that needs new physical things (0 = software only, 1 = fully physical).

export const DEFAULTS = { s: 0.4, giOom: 1, tp: 1.5 };

// Baselines when growth does not need new things (my assumptions).
const GB = Math.log(1.05); // data-centre build-out, 5%/yr
const GRB = Math.log(2) / 3; // robot production doubles every 3 years

// Copper and magnet inputs match the MaterialRace defaults.
export const COPPER = { ratio: Math.log((0.1 * 28000) / (18 * 60)), g: Math.log(1.02) };
export const MAGNETS = { ratio: Math.log((0.3 * 226) / ((100e3 * 2.5) / 1e6)), g: Math.log(1.08) };
export const START_YEAR = 2026;

export function rates(giOom: number, tp: number) {
  return { gI: giOom * Math.LN10, gP: Math.LN2 / tp };
}

// Smooth minimum of the two ingredient limits (k = 3); k → ∞ gives the strict min().
export const SMOOTH_K = 3;
export function model(s: number, gI: number, gP: number) {
  const gE = s <= 0 ? gI : s >= 1 ? gP : Math.pow(Math.pow(gI / (1 - s), -SMOOTH_K) + Math.pow(gP / s, -SMOOTH_K), -1 / SMOOTH_K);
  const gPhys = Math.max(GB, s * gE);
  const gRob = Math.max(GRB, s * gPhys);
  return { gE, gPhys, gRob };
}

export const sStar = (gI: number, gP: number) => gP / (gI + gP);

export function crunchYear(ratio: number, gDemand: number, gSupply: number) {
  return gDemand <= gSupply ? Infinity : START_YEAR + ratio / (gDemand - gSupply);
}

// The lead a one-year leader keeps after rivals copy a share cI of the gain from ideas
// and cP of the gain from building (log scale; my assumptions).
export const CATCH_UP = { cI: 0.7, cP: 0.1 };
export function keptLead(s: number, gI: number, gP: number, cI = CATCH_UP.cI, cP = CATCH_UP.cP) {
  return model(s, gI, gP).gE * ((1 - s) * (1 - cI) + s * (1 - cP));
}

export function interp(s: number, [a, b, c]: [number, number, number]) {
  return s <= 0.5 ? a + (b - a) * (s / 0.5) : b + (c - b) * ((s - 0.5) / 0.5);
}

// Countries (columns of the leverage map). `middle` marks the middle powers summed in the stakes chart.
export type CountryKey = 'US' | 'CN' | 'JP' | 'TW' | 'KR' | 'NL' | 'DE' | 'UK' | 'GULF' | 'AUCA' | 'PROD' | 'OTH';
export const COUNTRIES: { k: CountryKey; en: string; ja: string; middle: boolean }[] = [
  { k: 'US', en: 'US', ja: '米国', middle: false },
  { k: 'CN', en: 'China', ja: '中国', middle: false },
  { k: 'JP', en: 'Japan', ja: '日本', middle: true },
  { k: 'TW', en: 'Taiwan', ja: '台湾', middle: true },
  { k: 'KR', en: 'Korea', ja: '韓国', middle: true },
  { k: 'NL', en: 'Netherlands', ja: 'オランダ', middle: true },
  { k: 'DE', en: 'Germany', ja: 'ドイツ', middle: true },
  { k: 'UK', en: 'UK', ja: '英国', middle: true },
  { k: 'GULF', en: 'Gulf states', ja: '湾岸諸国', middle: true },
  { k: 'AUCA', en: 'Australia & Canada', ja: '豪州・カナダ', middle: true },
  { k: 'PROD', en: 'DRC, Indonesia, Chile, Peru', ja: 'コンゴ・インドネシア・チリ・ペルー', middle: false },
  { k: 'OTH', en: 'Others', ja: 'その他', middle: false },
];

// Stages of the AI supply chain (rows). `w` = weight at s = 0, 0.5, 1 (my judgement);
// `share` = rough % of world supply (sources in the post); `note` explains the measure.
export type Stage = {
  k: string; en: string; ja: string; w: [number, number, number];
  share: Partial<Record<CountryKey, number>>; used?: CountryKey[]; note: string; noteJa: string;
  // `basis` = what is measured and when, shown under the row name.
  basis: string; basisJa: string;
};
export const STAGES: Stage[] = [
  { k: 'ore', en: 'Mining', ja: '採掘', w: [0.05, 0.4, 0.8], share: { PROD: 41, CN: 32, AUCA: 4, US: 4, OTH: 19 }, used: ['PROD'],
    basis: 'my average, location, 2025', basisJa: '私の平均、所在地、2025年',
    note: 'My average of where ore was mined in 2025 (USGS), over rare earths, copper, cobalt, nickel and tungsten, each counted equally; gallium is not mined on its own. The Congo mines 74% of cobalt and Indonesia 67% of nickel; Chile, the Congo, Peru and Indonesia together mine 52% of copper; China mines about 69% of rare earths and 79% of tungsten. Chinese firms own many of the mines in the Congo and Indonesia. The ● marks Indonesia\'s nickel-ore export ban (2020) and the Congo\'s cobalt export ban and quotas (2025).',
    noteJa: '2025年に鉱石が採掘された場所（USGS）を、レアアース・銅・コバルト・ニッケル・タングステンについて同じ重みで私が平均したものです。ガリウムは単独では採掘されません。コバルトの74%はコンゴ、ニッケルの67%はインドネシアで採掘され、銅の52%はチリ・コンゴ・ペルー・インドネシアの合計です。レアアースの約69%とタングステンの79%は中国で採掘されています。コンゴとインドネシアの鉱山の多くは中国企業が所有しています。●は、インドネシアのニッケル鉱石の輸出禁止（2020年）と、コンゴのコバルトの輸出停止と割当（2025年）です。' },
  { k: 'mine', en: 'Mineral refining', ja: '鉱物の精錬', w: [0.05, 0.5, 1], share: { CN: 69, PROD: 13, JP: 2, AUCA: 2, US: 1, OTH: 13 }, used: ['CN'],
    basis: 'my average, location, 2024–25', basisJa: '私の平均、所在地、2024〜25年',
    note: 'My rough average of where five minerals are refined, each counted equally: magnet rare earths (China 91%, 2024), copper (China 48%, the Congo and Chile 16%, 2025), gallium (China 99%), cobalt (China over 75%) and nickel (Indonesia 45%, China 31%, much of Indonesia\'s in Chinese-owned plants). Tungsten is left out because no reliable refining figures are published. The ● marks China\'s licence requirements on gallium (2023), tungsten (February 2025) and rare earths (April 2025).',
    noteJa: '5つの鉱物が精錬される場所を、同じ重みで私が大まかに平均したものです。磁石用レアアース（中国91%、2024年）、銅（中国48%、コンゴとチリで16%、2025年）、ガリウム（中国99%）、コバルト（中国75%超）、ニッケル（インドネシア45%、中国31%。インドネシアの多くは中国企業の工場）。タングステンは、信頼できる精錬の数字が公表されていないため除いています。●は、ガリウム（2023年）、タングステン（2025年2月）、レアアース（2025年4月）に対する中国の輸出許可制です。' },
  { k: 'magnet', en: 'Magnets & robot parts', ja: '磁石・ロボット部品', w: [0, 0.2, 1], share: { CN: 50, JP: 38, DE: 3, KR: 1, US: 1, OTH: 7 }, used: ['CN'],
    basis: 'my average, mixed measures', basisJa: '私の平均、測り方は混在',
    note: 'My rough average of three parts. Strong magnets: 94% made in China (2024). Precision gears: one Japanese firm is reported to hold about 80% of the world market for strain-wave gears used in robot joints. Industrial robots: Chinese makers sold 195,000 of the more than 600,000 robots installed worldwide in 2025 (about a third), and Japan made 38% of the world\'s robots in 2023. The ● is China\'s April 2025 licence requirement on some rare-earth magnets; no restriction on robot parts was found.',
    noteJa: '3つの部品を私が大まかに平均したものです。強力な磁石は94%が中国製です（2024年）。精密歯車では、ロボットの関節に使う波動歯車の世界市場の約80%を日本の1社が握っているとされます。産業用ロボットでは、2025年に世界で設置された60万台超のうち19万5000台（約3分の1）を中国メーカーが販売し、2023年には世界のロボットの38%が日本で作られました。●は、一部のレアアース磁石に対する中国の2025年4月の許可制です。ロボット部品への制限は見つかりませんでした。' },
  { k: 'power', en: 'Power & data-centre hosting', ja: '電力・データセンター', w: [0.1, 0.8, 1], share: { US: 45, CN: 25, JP: 4, DE: 3, UK: 2, NL: 1, KR: 2, GULF: 1, AUCA: 2, OTH: 15 },
    basis: 'location, 2024', basisJa: '所在地、2024年',
    note: 'Where data centres use electricity, 2024 (IEA): US 45%, China 25%, Europe 15%, Japan under 20 of 415 TWh. The split of Europe and the smaller countries is my estimate. The IEA expects the US to make more than half of data-centre investment over the next five years.',
    noteJa: 'データセンターが電力を使う場所、2024年（IEA）。米国45%、中国25%、欧州15%、日本は415 TWhのうち20 TWh未満です。欧州の内訳と小さな国の値は私の推定です。IEAは、今後5年間のデータセンター投資の半分以上を米国が占めると見ています。' },
  { k: 'grid', en: 'Grid equipment', ja: '送電網の設備', w: [0.05, 0.6, 0.9], share: { CN: 40, US: 15, JP: 10, DE: 10, KR: 5, OTH: 20 },
    basis: 'my estimate, mixed measures', basisJa: '私の推定、測り方は混在',
    note: 'My rough blend of transformers (where made: a China Electricity Council official says China makes about 60% of the world\'s transformers; Korea is the third-largest exporter of large ones) and gas turbines (maker nationality: GE Vernova of the US supplied about 31% of turbines in gas plants under construction in 2024, and GE, Siemens Energy and Mitsubishi together two thirds). The least certain row.',
    noteJa: '変圧器（製造地。中国電力企業連合会の幹部によると世界の変圧器の約60%は中国製で、大型変圧器の輸出では韓国が3位です）とガスタービン（メーカーの国籍。2024年に建設中のガス火力発電所のタービンの約31%を米GEベルノバが、GE・シーメンス・エナジー・三菱の3社で3分の2を供給）を私が大まかに組み合わせたものです。最も不確かな行です。' },
  { k: 'mat', en: 'Chip materials', ja: 'チップの素材', w: [0.15, 0.9, 0.4], share: { JP: 54, US: 18, TW: 11, CN: 4, KR: 3, DE: 2, OTH: 8 }, used: ['JP'],
    basis: 'my average, mostly company nationality', basisJa: '私の平均、主に企業の国籍',
    note: 'My rough average of five materials, each counted equally: silicon wafers (Japanese firms about 44%, with Taiwanese, Korean, German and Chinese firms making most of the rest), light-sensitive chemicals for printing chips (Japanese firms about 75%, 2021), low-expansion glass cloth for chip packages (Nittobo of Japan over half, Taiwan Glass most of the rest), insulating film for packages (Ajinomoto of Japan over 95%), and high-purity quartz (mostly mined in North Carolina; counted by location). The ● marks Japan\'s 2019 licence requirement on exports of photoresist, hydrogen fluoride and polyimide to Korea.',
    noteJa: '5つの素材を同じ重みで私が大まかに平均したものです。シリコンウェハー（日本企業約44%、残りの大半は台湾・韓国・ドイツ・中国の企業）、チップの回路を焼き付ける感光性の化学品（日本企業約75%、2021年）、チップパッケージ用の低膨張ガラスクロス（日東紡が半分超、残りの大半は台湾ガラス）、パッケージ用の絶縁フィルム（味の素が95%超）、高純度石英（大半が米ノースカロライナ州産。所在地で数えています）。●は、2019年に日本が韓国向けのレジスト・フッ化水素・ポリイミドの輸出を個別許可制にしたことです。' },
  { k: 'tools', en: 'Lithography & chipmaking tools', ja: '露光装置・製造装置', w: [0.1, 1, 0.4], share: { US: 48, NL: 30, JP: 19, CN: 3 }, used: ['US', 'NL', 'JP'],
    basis: 'company nationality, 2025', basisJa: '企業の国籍、2025年',
    note: 'Sales of the ten largest chipmaking-equipment makers in 2025 (TechInsights), grouped by headquarters: US (Applied Materials, Lam, KLA, Teradyne) 48%, Netherlands (ASML, ASM) 30%, Japan (Tokyo Electron, Advantest, Screen) 19%, China (Naura) 3%. Smaller makers, such as Korea\'s Semes and China\'s AMEC, are left out. One Dutch company makes every machine for the finest printing step (EUV), with German optics. The ● marks US, Dutch and Japanese export controls since 2022–23.',
    noteJa: '2025年の半導体製造装置メーカー上位10社の売上（TechInsights）を本社の国別にまとめたものです。米国（アプライド マテリアルズ、ラム、KLA、テラダイン）48%、オランダ（ASML、ASM）30%、日本（東京エレクトロン、アドバンテスト、SCREEN）19%、中国（北方華創）3%。韓国のSEMESや中国のAMECなど、それより小さなメーカーは含みません。最も微細な露光（EUV）の装置は、ドイツ製の光学系を使ってオランダの1社がすべて作っています。●は、2022〜23年以降の米国・オランダ・日本の輸出規制です。' },
  { k: 'fab', en: 'Leading-edge chips & packaging', ja: '先端チップ製造・パッケージ', w: [0.15, 1, 0.5], share: { TW: 79, KR: 12, US: 6, CN: 2, OTH: 1 }, used: ['TW'],
    basis: 'my estimate, location, 2025', basisJa: '私の推定、所在地、2025年',
    note: 'My estimate of where the most advanced chips are made and packaged, from company capacity shares (ITRI, 2025: at 3 nm TSMC 69%, Samsung 23%, Intel 8%; at 4–6 nm TSMC 85%, Samsung 12%, SMIC 3%), placed where each company\'s factories are (TSMC\'s Arizona plant makes 4 nm chips), with packaging counted at one third and mostly in Taiwan. The ● marks Taiwan\'s June 2025 export-approval requirement for Huawei and SMIC.',
    noteJa: '最先端のチップが製造・パッケージされる場所の私の推定です。各社の生産能力のシェア（ITRI、2025年。3 nmではTSMC 69%、サムスン23%、インテル8%、4〜6 nmではTSMC 85%、サムスン12%、SMIC 3%）を各社の工場の所在地に割り振り（TSMCのアリゾナ工場は4 nmを製造）、パッケージを3分の1の重みで加えました。パッケージの大半は台湾です。●は、ファーウェイとSMICへの輸出に許可を求める台湾の2025年6月の措置です。' },
  { k: 'hbm', en: 'AI memory (HBM)', ja: 'AI用メモリ（HBM）', w: [0.15, 1, 0.4], share: { KR: 82, US: 18 }, used: ['US'],
    basis: 'company nationality, Q2 2026', basisJa: '企業の国籍、2026年第2四半期',
    note: 'Revenue by maker, Q2 2026 (Counterpoint): SK hynix 50%, Samsung 33%, Micron 18%. US rules have limited sales to China since December 2024.',
    noteJa: '2026年第2四半期のメーカー別売上（Counterpoint）。SK hynix 50%、Samsung 33%、Micron 18%。米国の規則で2024年12月から中国向けの販売が制限されています。' },
  { k: 'design', en: 'AI chip design', ja: 'AIチップ設計', w: [0.3, 0.8, 0.3], share: { US: 97, CN: 3 }, used: ['US'],
    basis: 'company nationality, Q2 2026', basisJa: '企業の国籍、2026年第2四半期',
    note: 'Share of AI computing power shipped in Q2 2026, by designer (Epoch AI): Nvidia 63%, Google 25%, Amazon 5%, AMD 4%, Huawei 3%, Cambricon under 1%. Smaller designers are not tracked.',
    noteJa: '2026年第2四半期に出荷されたAI計算能力の設計企業別シェア（Epoch AI）。Nvidia 63%、Google 25%、Amazon 5%、AMD 4%、Huawei 3%、Cambricon 1%未満。小さな設計企業は集計に入っていません。' },
  { k: 'compute', en: 'Installed AI computing power', ja: '設置済みのAI計算能力', w: [1, 0.6, 0.2], share: { US: 75, CN: 10, GULF: 1, UK: 1, JP: 1, KR: 1, DE: 2, OTH: 9 },
    basis: 'location and owner, 2025', basisJa: '所在地と所有者、2025年',
    note: 'About 75% US in every count. China is 9–15% of the AI supercomputers Epoch AI tracks by location (early 2025, a minority of all chips), and Chinese companies owned about 5% of the world\'s AI computing power at the end of 2025 (about 9% with an estimate of smuggled chips); I use 10%. Five US companies own over 70%. Smaller cells are rough.',
    noteJa: 'どの数え方でも米国が約75%です。中国は、Epoch AIが所在地を把握するAIスーパーコンピューター（2025年初め、全チップの一部）の9〜15%で、2025年末に中国企業が所有していた世界のAI計算能力は約5%（密輸チップの推定を含めると約9%）です。ここでは10%としています。米国の5社が70%超を所有しています。小さなセルは大まかな値です。' },
  { k: 'model', en: 'Notable AI models', ja: '主なAIモデル', w: [1, 0.5, 0.1], share: { US: 55, CN: 34, KR: 7, UK: 1, AUCA: 1, OTH: 2 },
    basis: 'developer country, 2025', basisJa: '開発者の国、2025年',
    note: 'Notable AI models released in 2025, by the country of their developers (Stanford AI Index): US 59, China 35, Korea 8, and one each for the UK, Canada, France, Singapore and Hong Kong (counted with China). A model with authors in two countries counts for both. A count of releases is not a measure of how capable the models are.',
    noteJa: '2025年に公開された主なAIモデルの、開発者の国別の数（スタンフォードAI Index）。米国59、中国35、韓国8、英国・カナダ・フランス・シンガポール・香港（中国に含めています）が各1です。2つの国の著者がいるモデルは両方に数えます。公開数はモデルの性能の高さを示すものではありません。' },
];

export const stageWeight = (st: Stage, s: number) => interp(s, st.w);

// Weighted share (0–1) of the supply chain held by a set of countries at mix s.
export function leverage(s: number, keys: CountryKey[]) {
  let num = 0, den = 0;
  for (const st of STAGES) {
    const w = stageWeight(st, s);
    den += w;
    num += w * keys.reduce((a, k) => a + (st.share[k] ?? 0), 0) / 100;
  }
  return den ? num / den : 0;
}
export const MIDDLE: CountryKey[] = COUNTRIES.filter((c) => c.middle).map((c) => c.k);
export const middlePowerLeverage = (s: number) => leverage(s, MIDDLE);

// One shared slider value across all figures on the page.
const EVT = 'physical-share-change';
export function getShared(): number {
  const w = window as unknown as { __physicalShare?: number };
  return typeof w.__physicalShare === 'number' ? w.__physicalShare : DEFAULTS.s;
}
export function setShared(s: number, source: string) {
  (window as unknown as { __physicalShare?: number }).__physicalShare = s;
  window.dispatchEvent(new CustomEvent(EVT, { detail: { s, source } }));
}
export function onShared(source: string, fn: (s: number) => void) {
  window.addEventListener(EVT, (e) => {
    const d = (e as CustomEvent).detail as { s: number; source: string };
    if (d.source !== source) fn(d.s);
  });
}
