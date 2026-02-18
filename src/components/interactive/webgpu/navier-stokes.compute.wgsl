// Navier-Stokes vorticity-stream function formulation.
// Single read_write buffer — race conditions between workgroups
// produce the characteristic numerical errors that make this art.
// Channels: x=error, y=unused, z=stream_function, w=vorticity
//
// Discretization ported from public/art/3141

struct Params {
  mouse: vec4f,   // xy=position, z=brush_size (NaN=idle), w=unused
  size: vec2f,
};

@group(0) @binding(0) var<storage, read_write> state: array<vec4f>;
@group(0) @binding(1) var<uniform> params: Params;

fn idx(p: vec2i, sz: vec2i) -> u32 {
  let w = (p % sz + sz) % sz;
  return u32(w.y * sz.x + w.x);
}

// ── field helpers ─────────────────────────────────────────

fn value(x: vec2i) -> vec4f {
  let sz = vec2i(params.size);
  return state[idx(x, sz)];
}

fn laplacian(x: vec2i) -> vec4f {
  return value(x + vec2i(1, 0)) + value(x - vec2i(1, 0))
       + value(x + vec2i(0, 1)) + value(x - vec2i(0, 1))
       - 4.0 * value(x);
}

struct Curl {
  x: vec2f, y: vec2f, z: vec2f, w: vec2f,
};

fn curl(x: vec2i) -> Curl {
  let u = (value(x + vec2i(0, 1)) - value(x - vec2i(0, 1))) / 2.0;
  let v = (value(x - vec2i(1, 0)) - value(x + vec2i(1, 0))) / 2.0;
  var c: Curl;
  c.x = vec2f(u.x, v.x);
  c.y = vec2f(u.y, v.y);
  c.z = vec2f(u.z, v.z);
  c.w = vec2f(u.w, v.w);
  return c;
}

fn interpolate_value(pos: vec2f) -> vec4f {
  let fraction = fract(pos);
  let y = vec2i(pos + (0.5 - fraction));
  return mix(
    mix(value(y), value(y + vec2i(1, 0)), fraction.x),
    mix(value(y + vec2i(0, 1)), value(y + vec2i(1, 1)), fraction.x),
    fraction.y,
  );
}

fn advected_value(x: vec2i, dt: f32) -> vec4f {
  let y = vec2f(x) - curl(x).z * dt;
  return interpolate_value(y);
}

fn jacobi_iteration(w: f32, x: vec2i, h: f32) -> f32 {
  return (value(x + vec2i(1, 0)).z + value(x - vec2i(1, 0)).z
        + value(x + vec2i(0, 1)).z + value(x - vec2i(0, 1)).z
        + h * w) / 4.0;
}

// ── main ──────────────────────────────────────────────────

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let size = vec2i(params.size);
  let x = vec2i(id.xy);
  if (x.x >= size.x || x.y >= size.y) { return; }

  let brush = params.mouse.z;

  // Idle: relax stream function via Jacobi iteration
  if !(brush < 0.0 || 0.0 < brush) {
    var Fdt = value(x);
    Fdt.z = jacobi_iteration(Fdt.w, x, 10.0);
    Fdt.x = abs(laplacian(x).z + value(x).w) / (1.0 + value(x).w);
    state[idx(x, size)] = Fdt;
    return;
  }

  // Active: advect vorticity + diffuse
  var Fdt = advected_value(x, 1.0);
  Fdt.w += laplacian(x).w * 0.05;

  // Error metric (Poisson residual)
  Fdt.x = abs(laplacian(x).z + value(x).w) / (1.0 + value(x).w);

  // Brush: Gaussian vorticity injection
  let distance = vec2f(x) - params.mouse.xy;
  let norm = dot(distance, distance);
  if (sqrt(norm) < abs(brush)) {
    Fdt.w += 0.01 * sign(brush) * exp(-norm / abs(brush));
  }

  state[idx(x, size)] = Fdt;
}
