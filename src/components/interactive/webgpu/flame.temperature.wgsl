// Temperature advection (semi-Lagrangian), cooling, and heat injection.
// In-place read_write on temp buffer — races accepted.

#import trilinear
#import flame_params

@group(0) @binding(0) var<storage, read_write> temp: array<f32>;
@group(0) @binding(1) var<storage, read_write> macro_field: array<vec4f>;
@group(0) @binding(2) var<uniform> params: SimParams;

@compute @workgroup_size(4, 4, 4)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let n = params.n;
  let ny = params.ny;
  if (id.x >= n || id.y >= ny || id.z >= n) { return; }

  let idx = id.z * n * ny + id.y * n + id.x;
  let nf = f32(n);
  let nyf = f32(ny);

  // --- Semi-Lagrangian advection: backtrack through velocity field ---
  let vel = macro_field[idx].xyz;
  let back_pos = vec3f(id) - vel;

  // Trilinear sample temperature at back-traced position
  let p = clamp(back_pos, vec3f(0.0), vec3f(nf - 1.001, nyf - 1.001, nf - 1.001));
  let p0 = vec3u(floor(p));
  let fr = p - vec3f(p0);

  let c000 = temp[idx3d(p0.x,      p0.y,      p0.z,      n, ny)];
  let c100 = temp[idx3d(p0.x + 1u, p0.y,      p0.z,      n, ny)];
  let c010 = temp[idx3d(p0.x,      p0.y + 1u, p0.z,      n, ny)];
  let c110 = temp[idx3d(p0.x + 1u, p0.y + 1u, p0.z,      n, ny)];
  let c001 = temp[idx3d(p0.x,      p0.y,      p0.z + 1u, n, ny)];
  let c101 = temp[idx3d(p0.x + 1u, p0.y,      p0.z + 1u, n, ny)];
  let c011 = temp[idx3d(p0.x,      p0.y + 1u, p0.z + 1u, n, ny)];
  let c111 = temp[idx3d(p0.x + 1u, p0.y + 1u, p0.z + 1u, n, ny)];

  let c00 = mix(c000, c100, fr.x);
  let c10 = mix(c010, c110, fr.x);
  let c01 = mix(c001, c101, fr.x);
  let c11 = mix(c011, c111, fr.x);
  let c0  = mix(c00, c10, fr.y);
  let c1  = mix(c01, c11, fr.y);
  var t   = mix(c0, c1, fr.z);

  // --- Cooling: temperature decays each step ---
  t *= params.cooling;

  // --- Heat injection at base ---
  // Ring source at bottom-center (cigarette ember), jittered for flicker
  let center_xz = vec2f(nf * 0.5, nf * 0.5);
  let jx = sin(params.time * 2.7) * params.source_jitter * nf;
  let jz = cos(params.time * 3.1) * params.source_jitter * nf;
  let src_xz = center_xz + vec2f(jx, jz);

  let cell_xz = vec2f(f32(id.x), f32(id.z));
  let dist_xz = length(cell_xz - src_xz);
  let ring_r = params.source_radius * nf;
  let ring_w = ring_r * 0.3;
  let heat_xz = smoothstep(ring_w, 0.0, abs(dist_xz - ring_r));
  let heat_y  = smoothstep(ring_r * 0.5, 0.0, f32(id.y));
  t += params.heat_rate * heat_xz * heat_y;

  temp[idx] = clamp(t, 0.0, 1.0);
}
