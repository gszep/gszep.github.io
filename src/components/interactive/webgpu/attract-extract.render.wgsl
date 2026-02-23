// Extract color-based attraction field from video.
// Agents are attracted to regions whose color is close to a target color
// (e.g. dark green branches in the plum blossom footage).

#import fullscreen_vertex

struct Params {
  size: vec2f,
  threshold: f32,       // luminance darkness threshold
  tolerance: f32,       // color distance radius (smaller = stricter match)
  target_r: f32,        // target color R [0,1]
  target_g: f32,        // target color G [0,1]
  target_b: f32,        // target color B [0,1]
};

@group(0) @binding(0) var video: texture_external;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var<uniform> params: Params;

@fragment
fn frag(in: VSOut) -> @location(0) vec4f {
  let uv = vec2f(in.uv.x, 1.0 - in.uv.y);
  let c  = textureSampleBaseClampToEdge(video, samp, uv).rgb;

  // Color proximity: how close is this pixel to the target color?
  let target = vec3f(params.target_r, params.target_g, params.target_b);
  let dist = distance(c, target);
  let attract = smoothstep(params.tolerance, 0.0, dist);

  return vec4f(attract, 0.0, 0.0, 1.0);
}
