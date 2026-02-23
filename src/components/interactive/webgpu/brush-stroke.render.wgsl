// Sumi-e ink wash NPR rendering of video input.
// Samples video via texture_external, computes Sobel edges inline,
// composites: washi paper + ink wash + brush texture + contours + pooling.

#import fullscreen_vertex

struct Params {
  size: vec2f,
  time: f32,
  _pad: f32,
};

@group(0) @binding(0) var video: texture_external;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var<uniform> params: Params;

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
  let edge_a = atan2(gy, gx);

  // ── Paper ─────────────────────────────────────────────────
  let grain = fbm(px * 0.35) * 0.03 + fbm(px * 0.08) * 0.015;
  let paper = vec3f(0.96, 0.95, 0.93) - grain;

  // ── Ink wash ──────────────────────────────────────────────
  let raw  = 1.0 - l0;                                // bright → no ink
  let wash = smoothstep(0.10, 0.80, raw);              // soft tonal map
  let wvar = fbm(px * 0.012 + t * 0.008);              // absorption noise
  let wink = wash * mix(0.80, 1.0, wvar) * 0.12;  // light wash only

  // ── Brush texture ─────────────────────────────────────────
  let sdir  = edge_a + 1.5708;                         // along contour
  let angle = mix(0.5, sdir, smoothstep(0.03, 0.10, edge));
  let ca = cos(angle); let sa = sin(angle);
  let rot = vec2f(ca * px.x + sa * px.y,
                  -sa * px.x + ca * px.y);

  let wob  = vnoise(px * 0.006 + t * 0.02) * 10.0;
  let b1   = sin((rot.y + wob) * 0.45) * 0.5 + 0.5;
  let b2   = sin((rot.y * 2.3 + wob * 1.4) * 0.45) * 0.5 + 0.5;
  let btex = b1 * 0.7 + b2 * 0.3;

  let dry  = smoothstep(0.15, 0.55, 1.0 - wink);
  let bmod = mix(1.0, btex, dry * 0.6);

  // ── Contour strokes ───────────────────────────────────────
  let wnz   = vnoise(px * 0.015 + t * 0.01);
  let cthrs = mix(0.10, 0.22, wnz);
  let cont  = smoothstep(cthrs * 0.4, cthrs, edge);

  // ── Wash pooling ──────────────────────────────────────────
  let avg  = (l_tl + l_tc + l_tr + l_ml + l_mr + l_bl + l_bc + l_br) / 8.0;
  let pool = smoothstep(0.012, 0.05, abs(l0 - avg)) * 0.10;

  // ── Composite ─────────────────────────────────────────────
  let ink_total = clamp(wink * bmod + cont * 0.90 + pool, 0.0, 1.0);
  let ink_col   = vec3f(0.06, 0.05, 0.08);             // sumi blue-black
  let out       = mix(paper, ink_col, ink_total);

  return vec4f(out, 1.0);
}
