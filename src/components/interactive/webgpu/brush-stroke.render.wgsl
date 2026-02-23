// Sumi-e ink wash NPR rendering with physarum-generated brush strokes.
// Agents deposit trail that forms the branch ink; blossom overlay from erosion.
// Composites: washi paper + physarum trail ink + sky wash + blossom pink.

#import fullscreen_vertex

struct Params {
  size: vec2f,
  time: f32,
  branch_lum: f32,     // luminance threshold for branch detection
  branch_edge: f32,    // contrast threshold for branch detection
  branch_ink: f32,     // branch stroke opacity
  sky_ink: f32,        // sky wash opacity
  paper_tone: f32,     // paper brightness
  blossom_ink: f32,    // pink blossom overlay strength
};

@group(0) @binding(0) var video: texture_external;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var<uniform> params: Params;
@group(0) @binding(3) var eroded: texture_2d<f32>;    // blurred classification
@group(0) @binding(4) var original: texture_2d<f32>;   // sharp original mask
@group(0) @binding(5) var trail_tex: texture_2d<f32>;  // physarum trail

// ── Noise primitives ──────────────────────────────────────────

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

fn lum(c: vec3f) -> f32 {
  return dot(c, vec3f(0.299, 0.587, 0.114));
}

// ── Main ──────────────────────────────────────────────────────

@fragment
fn frag(in: VSOut) -> @location(0) vec4f {
  let px   = in.uv * params.size;               // pixel coords
  let txl  = 1.0 / params.size;                 // one texel in UV
  let uv   = vec2f(in.uv.x, 1.0 - in.uv.y);    // flip Y for video
  let t    = params.time;

  // ── Sample 3×3 neighbourhood ──────────────────────────────
  let c  = textureSampleBaseClampToEdge(video, samp, uv).rgb;
  let tl = textureSampleBaseClampToEdge(video, samp, uv + vec2f(-txl.x, -txl.y)).rgb;
  let tc = textureSampleBaseClampToEdge(video, samp, uv + vec2f(   0.0, -txl.y)).rgb;
  let tr = textureSampleBaseClampToEdge(video, samp, uv + vec2f( txl.x, -txl.y)).rgb;
  let ml = textureSampleBaseClampToEdge(video, samp, uv + vec2f(-txl.x,    0.0)).rgb;
  let mr = textureSampleBaseClampToEdge(video, samp, uv + vec2f( txl.x,    0.0)).rgb;
  let bl = textureSampleBaseClampToEdge(video, samp, uv + vec2f(-txl.x,  txl.y)).rgb;
  let bc = textureSampleBaseClampToEdge(video, samp, uv + vec2f(   0.0,  txl.y)).rgb;
  let br = textureSampleBaseClampToEdge(video, samp, uv + vec2f( txl.x,  txl.y)).rgb;

  let l0 = lum(c);

  // ── Sobel ─────────────────────────────────────────────────
  let l_tl = lum(tl); let l_tc = lum(tc); let l_tr = lum(tr);
  let l_ml = lum(ml);                      let l_mr = lum(mr);
  let l_bl = lum(bl); let l_bc = lum(bc); let l_br = lum(br);

  let gx = (l_tr + 2.0 * l_mr + l_br) - (l_tl + 2.0 * l_ml + l_bl);
  let gy = (l_bl + 2.0 * l_bc + l_br) - (l_tl + 2.0 * l_tc + l_tr);
  let edge = sqrt(gx * gx + gy * gy);

  // ── Paper ─────────────────────────────────────────────────
  let grain = fbm(px * 0.35) * 0.03 + fbm(px * 0.08) * 0.015;
  let pt = params.paper_tone;
  let paper = vec3f(pt, pt - 0.01, pt - 0.03) - grain;

  // ── Sky detection (uniform dark areas with low contrast) ──
  let blum = params.branch_lum;
  let bedg = params.branch_edge;
  let sky = smoothstep(blum + 0.24, blum - 0.01, l0)
          * (1.0 - smoothstep(bedg * 0.25, bedg, edge));

  // ── Texture coordinate for mask/trail lookups ─────────────
  let sz = vec2i(params.size);
  let mask_coord = clamp(
    vec2i(vec2f(in.uv.x, 1.0 - in.uv.y) * params.size),
    vec2i(0), sz - 1
  );

  // ── Physarum trail → branch ink (masked to tree regions only) ──
  let trail_val = textureLoad(trail_tex, mask_coord, 0).r;
  let orig_mask = textureLoad(original, mask_coord, 0).r;
  let trail_ink = smoothstep(0.0, 1.5, trail_val) * params.branch_ink * orig_mask;

  // ── Composite ─────────────────────────────────────────────
  let sky_ink    = sky * params.sky_ink;
  let ink_col    = vec3f(0.06, 0.05, 0.08);             // sumi blue-black
  let total_ink  = clamp(trail_ink + sky_ink, 0.0, 1.0);
  let base       = mix(paper, ink_col, total_ink);

  // ── Blossom overlay from eroded mask ──────────────────────
  let classify = step(0.5, textureLoad(eroded, mask_coord, 0).r);
  let sharp    = textureLoad(original, mask_coord, 0).r;
  let blossom  = sharp * classify;  // sharp detail, only in blossom regions
  let pink     = vec3f(0.85, 0.50, 0.55);
  let out      = mix(base, pink, blossom * params.blossom_ink);

  return vec4f(out, 1.0);
}
