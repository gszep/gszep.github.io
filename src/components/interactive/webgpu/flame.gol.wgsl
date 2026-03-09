// Game of Life on XZ plane, seeded from smoke density.
// Single read_write buffer — race conditions at workgroup boundaries accepted.

#import flame_params

@group(0) @binding(0) var<storage, read_write> gol: array<u32>;
@group(0) @binding(1) var<storage, read> smoke: array<f32>;
@group(0) @binding(2) var<uniform> params: SimParams;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let id = gid.xy;  // x = X axis, y = Z axis in smoke volume
  let n = params.gol_n;
  if (id.x >= n || id.y >= n) { return; }

  let ni = i32(n);

  // Read current state: gol[z * n + x]
  let state = gol[id.y * n + id.x];

  // Count neighbors (wrap both axes)
  var neighbors = 0u;
  for (var dz = -1; dz <= 1; dz++) {
    for (var dx = -1; dx <= 1; dx++) {
      if (dx == 0 && dz == 0) { continue; }
      let nz = (i32(id.y) + dz + ni) % ni;
      let nx = (i32(id.x) + dx + ni) % ni;
      neighbors += gol[u32(nz) * n + u32(nx)];
    }
  }

  // B3/S23 rules
  var alive = (state == 1u && (neighbors == 2u || neighbors == 3u))
           || (state == 0u && neighbors == 3u);

  // Seed from smoke density (sample 3D smoke at mapped XZ position, mid Y)
  let smoke_n = params.n;
  let smoke_ny = params.ny;
  let fx = f32(id.x) / f32(n) * f32(smoke_n);
  let fz = f32(id.y) / f32(n) * f32(smoke_n);
  let fy = f32(smoke_ny) * 0.5;  // sample at vertical midpoint

  let sx = u32(clamp(fx, 0.0, f32(smoke_n - 1u)));
  let sy = u32(clamp(fy, 0.0, f32(smoke_ny - 1u)));
  let sz = u32(clamp(fz, 0.0, f32(smoke_n - 1u)));

  let smoke_idx = sz * smoke_n * smoke_ny + sy * smoke_n + sx;
  let density = smoke[smoke_idx];

  if (density > params.gol_threshold) {
    alive = true;
  }

  gol[id.y * n + id.x] = select(0u, 1u, alive);
}
