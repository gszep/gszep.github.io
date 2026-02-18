// Navier-Stokes vorticity-stream function formulation.
// Workgroup cache with halo for race-free stencil operations.
// Single read_write buffer — no scratch, no ping-pong.
//
// Channels: x=error, y=unused, z=stream_function, w=vorticity
// Discretization ported from public/art/3141

struct Params {
  mouse: vec4f,   // xy=position, z=brush_size (NaN=idle), w=unused
  size: vec2f,
};

const WG: u32 = 8u;
const TILE: u32 = 2u;
const HALO: u32 = 1u;
const CACHE: u32 = TILE * WG;          // 16
const INNER: u32 = CACHE - 2u * HALO;  // 14

@group(0) @binding(0) var<storage, read_write> state: array<vec4f>;
@group(0) @binding(1) var<uniform> params: Params;

var<workgroup> tile: array<array<vec4f, CACHE>, CACHE>;

// ── Index helpers ────────────────────────────────────────

fn gidx(p: vec2i) -> u32 {
  let sz = vec2i(params.size);
  let w = ((p % sz) + sz) % sz;
  return u32(w.y * sz.x + w.x);
}

fn to_global(local: vec2u, wid: vec2u) -> vec2i {
  return vec2i(local) + vec2i(INNER * wid) - vec2i(1);
}

fn in_bounds(local: vec2u) -> bool {
  return local.x >= HALO && local.x < INNER + HALO
      && local.y >= HALO && local.y < INNER + HALO;
}

// ── Cached stencil operations ────────────────────────────

fn cval(p: vec2u) -> vec4f {
  return tile[p.x][p.y];
}

fn claplacian(p: vec2u) -> vec4f {
  return cval(p + vec2u(1, 0)) + cval(p - vec2u(1, 0))
       + cval(p + vec2u(0, 1)) + cval(p - vec2u(0, 1))
       - 4.0 * cval(p);
}

struct Curl {
  x: vec2f, y: vec2f, z: vec2f, w: vec2f,
};

fn ccurl(p: vec2u) -> Curl {
  let u = (cval(p + vec2u(0, 1)) - cval(p - vec2u(0, 1))) / 2.0;
  let v = (cval(p - vec2u(1, 0)) - cval(p + vec2u(1, 0))) / 2.0;
  var c: Curl;
  c.x = vec2f(u.x, v.x);
  c.y = vec2f(u.y, v.y);
  c.z = vec2f(u.z, v.z);
  c.w = vec2f(u.w, v.w);
  return c;
}

fn cjacobi(p: vec2u, w: f32, h: f32) -> f32 {
  return (cval(p + vec2u(1, 0)).z + cval(p - vec2u(1, 0)).z
        + cval(p + vec2u(0, 1)).z + cval(p - vec2u(0, 1)).z
        + h * w) / 4.0;
}

// ── Advection (global reads — displacement can exceed cache)

fn gvalue(x: vec2i) -> vec4f {
  return state[gidx(x)];
}

fn interpolate(pos: vec2f) -> vec4f {
  let fraction = fract(pos);
  let y = vec2i(pos + (0.5 - fraction));
  return mix(
    mix(gvalue(y), gvalue(y + vec2i(1, 0)), fraction.x),
    mix(gvalue(y + vec2i(0, 1)), gvalue(y + vec2i(1, 1)), fraction.x),
    fraction.y,
  );
}

fn advect(p: vec2u, global: vec2i, dt: f32) -> vec4f {
  let y = vec2f(global) - ccurl(p).z * dt;
  return interpolate(y);
}

// ── Main ─────────────────────────────────────────────────

@compute @workgroup_size(8, 8)
fn main(
  @builtin(local_invocation_id) lid: vec3u,
  @builtin(workgroup_id) wid: vec3u,
) {
  let sz = vec2i(params.size);

  // Load state into workgroup cache (with halo)
  for (var tx = 0u; tx < TILE; tx++) {
    for (var ty = 0u; ty < TILE; ty++) {
      let local = vec2u(tx, ty) + TILE * lid.xy;
      let global = to_global(local, wid.xy);
      tile[local.x][local.y] = state[gidx(global)];
    }
  }
  workgroupBarrier();

  let brush = params.mouse.z;

  // Process each tile cell
  for (var tx = 0u; tx < TILE; tx++) {
    for (var ty = 0u; ty < TILE; ty++) {
      let local = vec2u(tx, ty) + TILE * lid.xy;
      if !in_bounds(local) { continue; }

      let global = to_global(local, wid.xy);
      if (global.x >= sz.x || global.y >= sz.y) { continue; }

      // Idle: Jacobi relaxation
      if !(brush < 0.0 || 0.0 < brush) {
        var Fdt = cval(local);
        Fdt.z = cjacobi(local, Fdt.w, 10.0);
        Fdt.x = abs(claplacian(local).z + cval(local).w) / (1.0 + cval(local).w);
        state[gidx(global)] = Fdt;
        continue;
      }

      // Active: advect + diffuse
      var Fdt = advect(local, global, 1.0);
      Fdt.w += claplacian(local).w * 0.05;

      // Error metric
      Fdt.x = abs(claplacian(local).z + cval(local).w) / (1.0 + cval(local).w);

      // Brush interaction
      let distance = vec2f(global) - params.mouse.xy;
      let norm = dot(distance, distance);
      if (sqrt(norm) < abs(brush)) {
        Fdt.w += 0.01 * sign(brush) * exp(-norm / (brush * brush));
      }

      state[gidx(global)] = Fdt;
    }
  }
}
