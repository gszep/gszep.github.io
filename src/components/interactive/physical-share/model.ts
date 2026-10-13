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

export function model(s: number, gI: number, gP: number) {
  const gE = s <= 0 ? gI : s >= 1 ? gP : Math.min(gI / (1 - s), gP / s);
  const gPhys = Math.max(GB, s * gE);
  const gRob = Math.max(GRB, s * gPhys);
  return { gE, gPhys, gRob };
}

export const sStar = (gI: number, gP: number) => gP / (gI + gP);

export function crunchYear(ratio: number, gDemand: number, gSupply: number) {
  return gDemand <= gSupply ? Infinity : START_YEAR + ratio / (gDemand - gSupply);
}

// Country strengths at s = 0, 0.5, 1 on a 0–3 scale (my judgement).
export type Country = { en: string; ja: string; why: string; whyJa: string; score: [number, number, number]; middle: boolean };
export const COUNTRIES: Country[] = [
  { en: 'US', ja: '米国', why: 'Owns most existing AI computers and the leading models', whyJa: '既存のAI計算資源と最先端モデルの大半を持つ', score: [3, 2.5, 1.5], middle: false },
  { en: 'China', ja: '中国', why: 'Refining, magnets, robots and fast power build-out; less compute', whyJa: '精錬・磁石・ロボット・電源の急速な建設。計算資源は少ない', score: [1, 2, 3], middle: false },
  { en: 'Japan', ja: '日本', why: 'Chip materials and tools; robot gears', whyJa: '半導体材料と製造装置、ロボット用の歯車', score: [1, 3, 2], middle: true },
  { en: 'Taiwan', ja: '台湾', why: 'Makes the most advanced chips', whyJa: '最先端チップの製造', score: [1, 3, 2], middle: true },
  { en: 'Korea', ja: '韓国', why: 'AI memory chips; grid equipment', whyJa: 'AI用メモリ、送電設備', score: [1, 3, 1.5], middle: true },
  { en: 'Netherlands', ja: 'オランダ', why: 'Chipmaking lithography machines', whyJa: '半導体の露光装置', score: [0.5, 3, 1.5], middle: true },
  { en: 'Germany', ja: 'ドイツ', why: 'Grid equipment, machinery, optics', whyJa: '送電設備・機械・光学', score: [0.5, 1.5, 2.5], middle: true },
  { en: 'Gulf states', ja: '湾岸諸国', why: 'Cheap power and capital; sulfur and helium; computers hosted there', whyJa: '安価な電力と資本、硫黄とヘリウム、国内に置かれた計算資源', score: [1.5, 2, 3], middle: true },
  { en: 'Australia & Canada', ja: 'オーストラリア・カナダ', why: 'Minerals, uranium, capital', whyJa: '鉱物・ウラン・資本', score: [0.5, 1.5, 3], middle: true },
  { en: 'DRC, Indonesia, Chile', ja: 'コンゴ・インドネシア・チリ', why: 'Cobalt, nickel, copper', whyJa: 'コバルト・ニッケル・銅', score: [0, 1, 2.5], middle: false },
  { en: 'EU', ja: 'EU', why: 'Market rules; chipmaking tools', whyJa: '市場のルール、半導体製造装置', score: [1, 2, 1.5], middle: true },
  { en: 'UK', ja: '英国', why: 'AI safety institute and research labs; little heavy industry', whyJa: 'AI安全研究所と研究拠点。重工業は少ない', score: [2, 1.5, 0.5], middle: true },
  { en: 'Singapore', ja: 'シンガポール', why: 'A neutral meeting place; licences for data centres', whyJa: '中立的な対話の場、データセンターの免許', score: [1.5, 1.5, 1.5], middle: true },
];

export function interp(s: number, [a, b, c]: [number, number, number]) {
  return s <= 0.5 ? a + (b - a) * (s / 0.5) : b + (c - b) * ((s - 0.5) / 0.5);
}

export function middlePowerLeverage(s: number) {
  const mids = COUNTRIES.filter((c) => c.middle);
  return mids.reduce((sum, c) => sum + interp(s, c.score), 0) / mids.length;
}

// How much each kind of material matters at a given s (0–1), used to fade the leverage map.
export function relevance(kind: 'chip' | 'build' | 'robot', s: number) {
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  if (kind === 'chip') return s <= 0.5 ? 0.35 + 0.65 * (s / 0.5) : 1 - 0.4 * ((s - 0.5) / 0.5);
  if (kind === 'build') { const t = clamp(s / 0.6); return 0.12 + 0.88 * t * t * (3 - 2 * t); }
  return 0.1 + 0.9 * clamp((s - 0.4) / 0.6);
}

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
