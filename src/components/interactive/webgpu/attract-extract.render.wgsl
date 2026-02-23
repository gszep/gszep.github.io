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
@group(0) @binding(3) var mask: texture_2d<f32>;  // tree=1, sky=0

@fragment
fn frag(in: VSOut) -> @location(0) vec4f {
  let uv = vec2f(in.uv.x, 1.0 - in.uv.y);
  let c  = textureSampleBaseClampToEdge(video, samp, uv).rgb;

  // Color proximity: how close is this pixel to the target color?
  let tgt = vec3f(params.target_r, params.target_g, params.target_b);
  let dist = distance(c, tgt);
  let attract = smoothstep(params.tolerance, 0.0, dist);

  // Sky repulsion: reuse the tree/sky mask (0=sky → strong repulsion)
  let coord = vec2i(uv * params.size);
  let tree = textureLoad(mask, coord, 0).r;
  let sky = (1.0 - tree) * 2.0;  // doubled repulsion strength

  return vec4f(attract - sky, 0.0, 0.0, 1.0);
}
