// 4x downsample with box-filter average.
// Each output pixel averages a 4x4 block from the source texture.

const SCALE: u32 = 4u;
const WG: u32 = 8u;

@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var dst: texture_storage_2d<r32float, write>;

@compute @workgroup_size(WG, WG)
fn downsample(@builtin(global_invocation_id) gid: vec3u) {
  let dst_dims = textureDimensions(dst);
  if (gid.x >= dst_dims.x || gid.y >= dst_dims.y) { return; }

  let base = vec2i(gid.xy) * i32(SCALE);
  let src_max = vec2i(textureDimensions(src)) - 1;

  var sum = 0.0;
  for (var dy = 0i; dy < i32(SCALE); dy++) {
    for (var dx = 0i; dx < i32(SCALE); dx++) {
      let c = clamp(base + vec2i(dx, dy), vec2i(0), src_max);
      sum += textureLoad(src, c, 0).r;
    }
  }

  textureStore(dst, vec2i(gid.xy), vec4f(sum / f32(SCALE * SCALE), 0.0, 0.0, 0.0));
}
