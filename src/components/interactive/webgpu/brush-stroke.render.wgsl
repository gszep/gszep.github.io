// Sumi-e ink wash NPR rendering with physarum-generated brush strokes.
// Composites: washi paper + physarum trail ink + sky wash + blossom pink.
// Sky detection reuses the tree mask from erosion-extract (no video sampling needed).

#import fullscreen_vertex

struct Params {
  size: vec2f,
  branch_ink: f32,     // branch stroke opacity
  sky_ink: f32,        // sky wash opacity
  paper_tone: f32,     // paper brightness
  blossom_ink: f32,    // pink blossom overlay strength
};

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var eroded: texture_2d<f32>;    // blurred classification
@group(0) @binding(2) var original: texture_2d<f32>;   // sharp original mask
@group(0) @binding(3) var trail_tex: texture_2d<f32>;  // physarum trail

// ── Noise primitives ──────────────────────────────────────

fn hash21(p: vec2f) -> f32 {
  var p3 = fract(p.xyx * vec3f(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

fn vnoise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2f(1.0, 0.0)), u.x),
    mix(hash21(i + vec2f(0.0, 1.0)), hash21(i + vec2f(1.0, 1.0)), u.x),
    u.y
  );
}

fn fbm(p: vec2f) -> f32 {
  var v = 0.0;
  var a = 0.5;
  var q = p;
  for (var i = 0u; i < 3u; i++) {
    v += a * vnoise(q);
    q *= 2.01;
    a *= 0.5;
  }
  return v;
}

// ── Main ──────────────────────────────────────────────────

@fragment
fn frag(in: VSOut) -> @location(0) vec4f {
  let px = in.uv * params.size;
  let uv = vec2f(in.uv.x, 1.0 - in.uv.y);

  // ── Paper ─────────────────────────────────────────────
  let grain = fbm(px * 0.35) * 0.03 + fbm(px * 0.08) * 0.015;
  let pt = params.paper_tone;
  let paper = vec3f(pt, pt - 0.01, pt - 0.03) - grain;

  // ── Texture coordinate for mask/trail lookups ─────────
  let sz = vec2i(params.size);
  let mask_coord = clamp(vec2i(uv * params.size), vec2i(0), sz - 1);

  // ── Sky from tree mask (sky = where trees aren't) ─────
  let sky = 1.0 - textureLoad(original, mask_coord, 0).r;

  // ── Physarum trail → branch ink ───────────────────────
  let trail_val = textureLoad(trail_tex, mask_coord, 0).r;
  let trail_ink = smoothstep(0.0, 1.5, trail_val) * params.branch_ink;

  // ── Composite ─────────────────────────────────────────
  let sky_ink    = sky * params.sky_ink;
  let ink_col    = vec3f(0.06, 0.05, 0.08);
  let total_ink  = clamp(trail_ink + sky_ink, 0.0, 1.0);
  let base       = mix(paper, ink_col, total_ink);

  // ── Blossom overlay from eroded mask ──────────────────
  let classify = step(0.5, textureLoad(eroded, mask_coord, 0).r);
  let sharp    = textureLoad(original, mask_coord, 0).r;
  let blossom  = sharp * classify;
  let pink     = vec3f(0.85, 0.50, 0.55);
  let out      = mix(base, pink, blossom * params.blossom_ink);

  return vec4f(out, 1.0);
}
