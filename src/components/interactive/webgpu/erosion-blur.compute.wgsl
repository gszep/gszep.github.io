// In-place 5x5 box blur with workgroup cache.
// Dispatch repeatedly for morphological erosion effect:
// thin structures (branches) erode away, fat structures (blossoms) survive.

requires readonly_and_readwrite_storage_textures;

const WG: u32 = 8u;
const TILE: u32 = 2u;
const HALO: u32 = 2u;                   // 5x5 kernel radius
const CACHE: u32 = TILE * WG;           // 16
const INNER: u32 = CACHE - 2u * HALO;   // 12

var<workgroup> tile: array<array<f32, CACHE>, CACHE>;

@group(0) @binding(0) var mask: texture_storage_2d<r32float, read_write>;

@compute @workgroup_size(WG, WG)
fn blur(@builtin(local_invocation_id) lid: vec3u,
        @builtin(workgroup_id) wid: vec3u) {
  let dims = textureDimensions(mask);
  let origin = vec2i(wid.xy) * i32(INNER) - i32(HALO);

  // Load TILE x TILE cells per thread into shared memory
  for (var ty = 0u; ty < TILE; ty++) {
    for (var tx = 0u; tx < TILE; tx++) {
      let li = vec2u(lid.x * TILE + tx, lid.y * TILE + ty);
      let gi = clamp(origin + vec2i(li), vec2i(0), vec2i(dims) - 1);
      tile[li.y][li.x] = textureLoad(mask, gi).r;
    }
  }

  workgroupBarrier();

  // Write inner cells with 5x5 box average
  for (var ty = 0u; ty < TILE; ty++) {
    for (var tx = 0u; tx < TILE; tx++) {
      let li = vec2u(lid.x * TILE + tx, lid.y * TILE + ty);
      if (li.x < HALO || li.x >= CACHE - HALO ||
          li.y < HALO || li.y >= CACHE - HALO) { continue; }

      let gi = origin + vec2i(li);
      if (gi.x < 0 || gi.y < 0 || u32(gi.x) >= dims.x || u32(gi.y) >= dims.y) { continue; }

      var sum = 0.0;
      for (var dy = -2i; dy <= 2i; dy++) {
        for (var dx = -2i; dx <= 2i; dx++) {
          sum += tile[u32(i32(li.y) + dy)][u32(i32(li.x) + dx)];
        }
      }

      textureStore(mask, gi, vec4f(sum / 25.0, 0.0, 0.0, 0.0));
    }
  }
}
