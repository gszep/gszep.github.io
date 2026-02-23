// Extract tree silhouette mask from video luminance.
// Renders to an r32float texture: 1.0 = tree, 0.0 = sky.

#import fullscreen_vertex

struct Params {
  size: vec2f,
  threshold: f32,
};

@group(0) @binding(0) var video: texture_external;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var<uniform> params: Params;

@fragment
fn frag(in: VSOut) -> @location(0) vec4f {
  let uv = vec2f(in.uv.x, 1.0 - in.uv.y);
  let c  = textureSampleBaseClampToEdge(video, samp, uv).rgb;
  let l  = dot(c, vec3f(0.299, 0.587, 0.114));
  let t  = params.threshold;
  let mask = 1.0 - smoothstep(t + 0.15, t - 0.15, l);
  return vec4f(mask, 0.0, 0.0, 1.0);
}
