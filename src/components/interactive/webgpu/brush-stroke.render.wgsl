// Sumi-e ink wash NPR rendering of video input.
// Samples video via texture_external, computes Sobel edges inline,
// composites: washi paper + ink wash + brush texture + contours + pooling.

#import fullscreen_vertex

struct Params {
  size: vec2f,
  time: f32,
  branch_lum: f32,     // luminance threshold for branch detection
  branch_edge: f32,    // contrast threshold for branch detection
  branch_ink: f32,     // branch stroke opacity
  sky_ink: f32,        // sky wash opacity
  paper_tone: f32,     // paper brightness
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
  let pt = params.paper_tone;
  let paper = vec3f(pt, pt - 0.01, pt - 0.03) - grain;

  // ── Segmentation ──────────────────────────────────────────
  // Branch: dark pixels with high local contrast (thin dark structures)
  let blum = params.branch_lum;
  let bedg = params.branch_edge;
  let branch = smoothstep(blum + 0.09, blum - 0.09, l0)
             * smoothstep(bedg - 0.04, bedg + 0.04, edge);

  // Sky: dark-ish pixels with low contrast (uniform dark areas)
  let sky = smoothstep(blum + 0.24, blum - 0.01, l0)
          * (1.0 - smoothstep(bedg * 0.25, bedg, edge));

  // ── Brush texture (for branch stroke variation) ───────────
  let sdir  = edge_a + 1.5708;                         // along contour
  let angle = mix(0.5, sdir, smoothstep(0.03, 0.10, edge));
  let ca = cos(angle); let sa = sin(angle);
  let rot = vec2f(ca * px.x + sa * px.y,
                  -sa * px.x + ca * px.y);

  let wob  = vnoise(px * 0.006 + t * 0.02) * 10.0;
  let b1   = sin((rot.y + wob) * 0.45) * 0.5 + 0.5;
  let b2   = sin((rot.y * 2.3 + wob * 1.4) * 0.45) * 0.5 + 0.5;
  let btex = b1 * 0.7 + b2 * 0.3;

  // ── Composite ─────────────────────────────────────────────
  // Brush texture only where edges exist (smooth ink in uniform areas like sky)
  let btex_mask = smoothstep(0.03, 0.10, edge);
  let brush_mod = mix(1.0, mix(0.85, 1.0, btex), btex_mask);
  let branch_ink = branch * params.branch_ink * brush_mod;
  let sky_ink    = sky * params.sky_ink;
  let ink_col    = vec3f(0.06, 0.05, 0.08);             // sumi blue-black
  let total_ink  = clamp(branch_ink + sky_ink, 0.0, 1.0);
  let out        = mix(paper, ink_col, total_ink);

  return vec4f(out, 1.0);
}
