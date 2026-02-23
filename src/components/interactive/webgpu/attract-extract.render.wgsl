// Extract dark green attraction field from video.
// Agents are attracted to regions with low luminance AND green-dominant hue
// (tree branches in the plum blossom footage).

#import fullscreen_vertex

struct Params {
  size: vec2f,
  threshold: f32,
  color_low: f32,     // smoothstep lower edge for green excess
  color_high: f32,    // smoothstep upper edge for green excess
};

@group(0) @binding(0) var video: texture_external;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var<uniform> params: Params;

@fragment
fn frag(in: VSOut) -> @location(0) vec4f {
  let uv = vec2f(in.uv.x, 1.0 - in.uv.y);
  let c  = textureSampleBaseClampToEdge(video, samp, uv).rgb;
  let l  = dot(c, vec3f(0.299, 0.587, 0.114));

  // Dark: below luminance threshold
  let dark = smoothstep(params.threshold + 0.15, params.threshold - 0.15, l);

  // Green dominance: green channel exceeds both red and blue
  let green_excess = c.g - max(c.r, c.b);
  let green = smoothstep(params.color_low, params.color_high, green_excess);

  return vec4f(dark * green, 0.0, 0.0, 1.0);
}
