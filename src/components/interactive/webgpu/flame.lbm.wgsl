// Fused pull-based streaming + BGK collision + buoyancy forcing
// Single read_write buffer — race conditions at workgroup boundaries
// are accepted for visual turbulence.

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
  let ni = i32(n);

  // --- PULL: gather distributions from upstream neighbors ---
  // For direction q, the distribution arriving here was at (x - e_q)
  // before streaming. Toroidal wrapping on all boundaries.
  var f: array<f32, 19>;
  for (var q = 0u; q < 19u; q++) {
    let src = (vec3i(id) - E[q] + vec3i(ni)) % vec3i(ni);
    let src_idx = u32(src.z) * n * n + u32(src.y) * n + u32(src.x);
    f[q] = dist[q * N + src_idx];
  }

  // --- Macroscopic quantities ---
  var rho: f32 = 0.0;
  var vel = vec3f(0.0);
  for (var q = 0u; q < 19u; q++) {
    rho += f[q];
    vel += f[q] * vec3f(E[q]);
  }
  vel /= max(rho, 0.001);  // guard against division by zero

  // --- Buoyancy: hot fluid rises ---
  let t = temp[idx];
  vel.y += params.buoyancy * t;

  // --- Velocity clamp: ensure LBM stability (Mach < 0.15) ---
  let speed = length(vel);
  if (speed > 0.15) {
    vel = vel * (0.15 / speed);
  }

  // --- BGK collision: relax toward equilibrium ---
  for (var q = 0u; q < 19u; q++) {
    let feq = equilibrium(q, rho, vel);
    dist[q * N + idx] = f[q] + (feq - f[q]) / params.tau;
  }

  // --- Export for rendering and temperature advection ---
  macro_field[idx] = vec4f(vel, rho);
}
