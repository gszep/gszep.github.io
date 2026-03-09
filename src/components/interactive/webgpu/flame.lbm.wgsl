// Fused pull-based streaming + BGK collision + buoyancy forcing
// Single read_write buffer — race conditions at workgroup boundaries
// are accepted for visual turbulence.

#import d3q19
#import flame_params

@group(0) @binding(0) var<storage, read_write> dist: array<f32>;
@group(0) @binding(1) var<storage, read_write> macro_field: array<vec4f>;
@group(0) @binding(2) var<storage, read_write> temp: array<f32>;
@group(0) @binding(3) var<uniform> params: SimParams;
@group(0) @binding(4) var<storage, read> swirls: array<vec4f>;

@compute @workgroup_size(4, 4, 4)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let n = params.n;
  let ny = params.ny;
  if (id.x >= n || id.y >= ny || id.z >= n) { return; }

  let idx = id.z * n * ny + id.y * n + id.x;
  let N = n * ny * n;
  let ni = i32(n);
  let niy = i32(ny);

  // --- PULL: gather distributions from upstream neighbors ---
  // For direction q, the distribution arriving here was at (x - e_q)
  // before streaming. Toroidal wrapping on all boundaries.
  var f: array<f32, 19>;
  for (var q = 0u; q < 19u; q++) {
    let src = (vec3i(id) - E[q] + vec3i(ni, niy, ni)) % vec3i(ni, niy, ni);
    let src_idx = u32(src.z) * n * ny + u32(src.y) * n + u32(src.x);
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

  // --- Swirl vortices: coherent rotational disturbances ---
  // Discrete vortex particles spawned at the heat source and advected
  // by buoyancy. Each imposes solid-body rotation on nearby cells.
  let pos = vec3f(f32(id.x), f32(id.y), f32(id.z));
  for (var s = 0u; s < params.num_swirls; s++) {
    let sp = swirls[s * 2u];       // xyz = position, w = omega
    let sr = swirls[s * 2u + 1u];  // x = radius

    let dx = pos.x - sp.x;
    let dz = pos.z - sp.z;
    let r_xz = sqrt(dx * dx + dz * dz);
    let dy = abs(pos.y - sp.y);

    let radial = smoothstep(sr.x, 0.0, r_xz);
    let vertical = smoothstep(sr.x, 0.0, dy);
    let strength = sp.w * radial * vertical;

    // Solid-body rotation: v_tangential = omega * r
    vel.x += -dz * strength;
    vel.z += dx * strength;
  }

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
