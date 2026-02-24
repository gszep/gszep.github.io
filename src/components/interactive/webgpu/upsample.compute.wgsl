// Bilinear upsample from a small texture to a larger output.
// Each output pixel interpolates between the 4 nearest source texels.

const WG: u32 = 8u;

@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var dst: texture_storage_2d<r32float, write>;

@compute @workgroup_size(WG, WG)
fn upsample(@builtin(global_invocation_id) gid: vec3u) {
  let dst_dims = textureDimensions(dst);
  if (gid.x >= dst_dims.x || gid.y >= dst_dims.y) { return; }

  let src_dims = vec2f(textureDimensions(src));
  let dst_dimsf = vec2f(dst_dims);

  // Map output pixel center to source coordinate
  let uv = (vec2f(gid.xy) + 0.5) / dst_dimsf;
  let sc = uv * src_dims - 0.5;

  let base = vec2i(floor(sc));
  let f    = fract(sc);
  let smax = vec2i(src_dims) - 1;

  let c00 = textureLoad(src, clamp(base,              vec2i(0), smax), 0).r;
  let c10 = textureLoad(src, clamp(base + vec2i(1,0), vec2i(0), smax), 0).r;
  let c01 = textureLoad(src, clamp(base + vec2i(0,1), vec2i(0), smax), 0).r;
  let c11 = textureLoad(src, clamp(base + vec2i(1,1), vec2i(0), smax), 0).r;

  let result = mix(mix(c00, c10, f.x), mix(c01, c11, f.x), f.y);
  textureStore(dst, vec2i(gid.xy), vec4f(result, 0.0, 0.0, 0.0));
}
