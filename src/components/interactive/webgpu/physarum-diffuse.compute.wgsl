// Trail diffusion + decay. 3×3 mean blur with configurable mix and decay.
// Uses tiled workgroup cache with halo for race-free stencil operations.
// Dispatch: ceil(width / INNER) × ceil(height / INNER) workgroups.

requires readonly_and_readwrite_storage_textures;

#import physarum_params

const WG: u32 = 8u;
const TILE: u32 = 2u;
const HALO: u32 = 1u;
const CACHE: u32 = TILE * WG;           // 16
const INNER: u32 = CACHE - 2u * HALO;   // 14

var<workgroup> tile: array<array<f32, CACHE>, CACHE>;

@group(0) @binding(0) var trail: texture_storage_2d<r32float, read_write>;
@group(0) @binding(1) var<uniform> params: Params;
@group(0) @binding(2) var mask: texture_2d<f32>;  // tree=1, sky=0

@compute @workgroup_size(WG, WG)
fn diffuse(@builtin(local_invocation_id) lid: vec3u,
           @builtin(workgroup_id) wid: vec3u) {
  let dims = textureDimensions(trail);
  let origin = vec2i(wid.xy) * i32(INNER) - i32(HALO);

  // Load TILE × TILE cells per thread into shared memory
  for (var ty = 0u; ty < TILE; ty++) {
    for (var tx = 0u; tx < TILE; tx++) {
      let li = vec2u(lid.x * TILE + tx, lid.y * TILE + ty);
      let gi = clamp(origin + vec2i(li), vec2i(0), vec2i(dims) - 1);
      tile[li.y][li.x] = textureLoad(trail, gi).r;
    }
  }

  workgroupBarrier();

  // Write inner cells: 3×3 blur mixed with center, then decay
  for (var ty = 0u; ty < TILE; ty++) {
    for (var tx = 0u; tx < TILE; tx++) {
      let li = vec2u(lid.x * TILE + tx, lid.y * TILE + ty);
      if (li.x < HALO || li.x >= CACHE - HALO ||
          li.y < HALO || li.y >= CACHE - HALO) { continue; }

      let gi = origin + vec2i(li);
      if (gi.x < 0 || gi.y < 0 || u32(gi.x) >= dims.x || u32(gi.y) >= dims.y) { continue; }

      var sum = 0.0;
      for (var dy = -1i; dy <= 1i; dy++) {
        for (var dx = -1i; dx <= 1i; dx++) {
          sum += tile[u32(i32(li.y) + dy)][u32(i32(li.x) + dx)];
        }
      }

      let blurred = sum / 9.0;
      let center = tile[li.y][li.x];
      let diffused = mix(center, blurred, params.diffuse_weight);

      // Faster decay outside tree mask (trails fade quickly in sky)
      let raw_mask = textureLoad(mask, gi, 0).r;
      let tree = smoothstep(params.agent_threshold - 0.15, params.agent_threshold + 0.15, raw_mask);
      let decay = mix(params.decay * 0.5, params.decay, tree);
      textureStore(trail, gi, vec4f(diffused * decay, 0.0, 0.0, 0.0));
    }
  }
}
