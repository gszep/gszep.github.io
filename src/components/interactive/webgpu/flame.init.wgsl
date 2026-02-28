// Initialize all LBM distributions to equilibrium (resting fluid)

#import d3q19
#import flame_params

@group(0) @binding(0) var<storage, read_write> dist: array<f32>;
@group(0) @binding(1) var<storage, read_write> macro_field: array<vec4f>;
@group(0) @binding(2) var<storage, read_write> temp: array<f32>;
@group(0) @binding(3) var<uniform> params: SimParams;

@compute @workgroup_size(4, 4, 4)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let n = params.n;
  if (id.x >= n || id.y >= n || id.z >= n) { return; }

  let idx = id.z * n * n + id.y * n + id.x;
  let N = n * n * n;

  // Equilibrium at rest: rho = 1, u = (0, 0, 0)
  for (var q = 0u; q < 19u; q++) {
    dist[q * N + idx] = equilibrium(q, 1.0, vec3f(0.0));
  }

  macro_field[idx] = vec4f(0.0, 0.0, 0.0, 1.0);
  temp[idx] = 0.0;
}
