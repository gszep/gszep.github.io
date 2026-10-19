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
};
export const STAGES: Stage[] = [
  { k: 'mine', en: 'Mineral refining', ja: '鉱物の精錬', w: [0.05, 0.5, 1], share: { CN: 70, PROD: 10, JP: 3, AUCA: 2, US: 2, OTH: 13 }, used: ['CN', 'PROD'],
    note: 'My rough average of where minerals are refined (tungsten: mined), 2025, over magnet rare earths, copper, gallium, tungsten, cobalt and nickel. China refines about 90% of magnet rare earths, 47% of copper, 76% of cobalt and makes 99% of gallium; Indonesia refines 45% of nickel, much of it in Chinese-owned plants.',
    noteJa: '2025年の精錬の所在地（タングステンは採掘地）を、磁石用レアアース・銅・ガリウム・タングステン・コバルト・ニッケルについて私が大まかに平均したものです。中国は磁石用レアアースの約90%、銅の47%、コバルトの76%を精錬し、ガリウムの99%を生産しています。ニッケルの45%はインドネシアで精錬され、その多くは中国企業の工場です。' },
  { k: 'magnet', en: 'Magnets & robot parts', ja: '磁石・ロボット部品', w: [0, 0.2, 1], share: { CN: 50, JP: 40, DE: 5, KR: 1, US: 1, OTH: 3 }, used: ['CN'],
    note: 'My rough average of strong magnets (94% made in China), precision robot gears (mostly Japanese firms) and industrial robots (by maker nationality).',
    noteJa: '強力な磁石（94%が中国製）、ロボット用の精密歯車（大半が日本企業）、産業用ロボット（メーカーの国籍）を私が大まかに平均したものです。' },
  { k: 'power', en: 'Power & data-centre hosting', ja: '電力・データセンター', w: [0.1, 0.8, 1], share: { US: 45, CN: 25, JP: 5, DE: 3, UK: 2, NL: 1, KR: 2, GULF: 1, AUCA: 2, OTH: 14 },
    note: 'Where data centres use electricity, 2024. Newly built AI capacity leans further towards the US.',
    noteJa: 'データセンターが電力を使う場所、2024年。新しく建つAI向けの施設は、さらに米国に偏っています。' },
  { k: 'grid', en: 'Grid equipment', ja: '送電網の設備', w: [0.05, 0.6, 0.9], share: { CN: 40, US: 15, JP: 10, DE: 10, KR: 5, OTH: 20 },
    note: 'My rough blend of transformers (where made; China about 60% by one industry estimate) and gas turbines (maker nationality). The least certain row.',
    noteJa: '変圧器（製造地。ある業界推定では中国が約60%）とガスタービン（メーカーの国籍）を私が大まかに組み合わせたものです。最も不確かな行です。' },
  { k: 'mat', en: 'Chip materials', ja: 'チップの素材', w: [0.15, 0.9, 0.4], share: { JP: 60, US: 15, CN: 5, TW: 5, KR: 5, DE: 5, OTH: 5 }, used: ['JP'],
    note: 'My rough average of silicon wafers (Japanese firms 44%), light-sensitive chemicals (about 60–75%), glass cloth (about 85–90%) and insulating film (over 95%) in chip packages, and high-purity quartz (mostly mined in North Carolina).',
    noteJa: 'シリコンウェハー（日本企業44%）、感光性の化学品（約60〜75%）、チップパッケージ用のガラスクロス（約85〜90%）と絶縁フィルム（95%超）、高純度石英（大半が米ノースカロライナ州産）を私が大まかに平均したものです。' },
  { k: 'tools', en: 'Lithography & chipmaking tools', ja: '露光装置・製造装置', w: [0.1, 1, 0.4], share: { US: 40, NL: 25, JP: 20, CN: 5, DE: 3, KR: 2, OTH: 5 }, used: ['US', 'NL', 'JP'],
    note: 'Chipmaking equipment sales by maker nationality, 2025, my estimate from analyst rankings. One Dutch company makes every machine for the finest printing step (EUV).',
    noteJa: '2025年の半導体製造装置の売上（メーカーの国籍）で、アナリストのランキングからの私の推定です。最も微細な露光（EUV）の装置は、オランダの1社がすべて作っています。' },
  { k: 'fab', en: 'Leading-edge chips & packaging', ja: '先端チップ製造・パッケージ', w: [0.15, 1, 0.5], share: { TW: 80, KR: 10, US: 5, CN: 3, JP: 1, OTH: 1 },
    note: 'Where the most advanced chips are made and packaged, late 2025; my estimate from company capacity shares. Most is in Taiwan.',
    noteJa: '最先端のチップが製造・パッケージされる場所、2025年末。各社の生産能力のシェアからの私の推定です。大半は台湾です。' },
  { k: 'hbm', en: 'AI memory (HBM)', ja: 'AI用メモリ（HBM）', w: [0.15, 1, 0.4], share: { KR: 80, US: 20 }, used: ['US'],
    note: 'Revenue by maker nationality, Q2 2026: two Korean firms and one American. US rules have limited sales to China since December 2024.',
    noteJa: '2026年第2四半期の売上（メーカーの国籍）。韓国の2社と米国の1社です。米国の規則で2024年12月から中国向けの販売が制限されています。' },
  { k: 'design', en: 'AI chip design', ja: 'AIチップ設計', w: [0.3, 0.8, 0.3], share: { US: 95, CN: 4, OTH: 1 }, used: ['US'],
    note: 'Share of AI computing power shipped, by designer nationality, late 2025.',
    noteJa: '2025年末に出荷されたAI計算能力の、設計企業の国籍別シェアです。' },
  { k: 'compute', en: 'Installed AI computing power', ja: '設置済みのAI計算能力', w: [1, 0.6, 0.2], share: { US: 75, CN: 15, GULF: 2, UK: 1, JP: 1, KR: 1, DE: 1, OTH: 4 },
    note: 'Where AI supercomputers are, in a large sample from early 2025. Five US companies own over 70% of the world\'s AI computing power.',
    noteJa: 'AIスーパーコンピューターの所在地（2025年初めの大規模なサンプル）。世界のAI計算能力の70%超を米国の5社が所有しています。' },
  { k: 'model', en: 'Notable AI models', ja: '主なAIモデル', w: [1, 0.5, 0.1], share: { US: 55, CN: 35, KR: 5, UK: 1, AUCA: 1, OTH: 3 },
    note: 'Notable AI models released in 2025, by developer nationality. In one ranking from March 2026, the top four developers were all American.',
    noteJa: '2025年に公開された主なAIモデルの、開発者の国籍別シェアです。2026年3月のあるランキングでは、上位4社がすべて米国の開発者でした。' },
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
