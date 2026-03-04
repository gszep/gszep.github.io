// Volumetric ray marching through the 3D temperature field.
// Renders flame as alive color over dead color background.

#import fullscreen_vertex

struct RenderParams {
  inv_view_proj: mat4x4f,
  camera_pos: vec4f,   // xyz = position, w = f32(grid_size)
  alive: vec4f,
  dead: vec4f,
  params: vec4f,       // xy = resolution, z = density_scale, w = f32(march_steps)
}

@group(0) @binding(0) var<storage, read> temp: array<f32>;
@group(0) @binding(1) var<uniform> rp: RenderParams;

fn idx3(x: u32, y: u32, z: u32, n: u32) -> u32 {
  return z * n * n + y * n + x;
}

fn sample_temp(pos: vec3f, n: u32) -> f32 {
  let nf = f32(n);
  let p = clamp(pos, vec3f(0.0), vec3f(nf - 1.001));
  let p0 = vec3u(floor(p));
  let fr = p - vec3f(p0);

  let c000 = temp[idx3(p0.x,      p0.y,      p0.z,      n)];
  let c100 = temp[idx3(p0.x + 1u, p0.y,      p0.z,      n)];
  let c010 = temp[idx3(p0.x,      p0.y + 1u, p0.z,      n)];
  let c110 = temp[idx3(p0.x + 1u, p0.y + 1u, p0.z,      n)];
  let c001 = temp[idx3(p0.x,      p0.y,      p0.z + 1u, n)];
  let c101 = temp[idx3(p0.x + 1u, p0.y,      p0.z + 1u, n)];
  let c011 = temp[idx3(p0.x,      p0.y + 1u, p0.z + 1u, n)];
  let c111 = temp[idx3(p0.x + 1u, p0.y + 1u, p0.z + 1u, n)];

  let c00 = mix(c000, c100, fr.x);
  let c10 = mix(c010, c110, fr.x);
  let c01 = mix(c001, c101, fr.x);
  let c11 = mix(c011, c111, fr.x);
  let c0  = mix(c00, c10, fr.y);
  let c1  = mix(c01, c11, fr.y);
  return mix(c0, c1, fr.z);
}

fn intersect_aabb(origin: vec3f, dir: vec3f, bmin: vec3f, bmax: vec3f) -> vec2f {
  let inv_dir = 1.0 / dir;
  let t1 = (bmin - origin) * inv_dir;
  let t2 = (bmax - origin) * inv_dir;
  let tmin = max(max(min(t1.x, t2.x), min(t1.y, t2.y)), min(t1.z, t2.z));
  let tmax = min(min(max(t1.x, t2.x), max(t1.y, t2.y)), max(t1.z, t2.z));
  return vec2f(max(tmin, 0.0), tmax);
}

@fragment
fn frag(in: VSOut) -> @location(0) vec4f {
  let grid_n = u32(rp.camera_pos.w);
  let nf = f32(grid_n);
  let density_scale = rp.params.z;
  let steps = u32(rp.params.w);

  // Reconstruct world-space ray from screen UV
  let ndc = vec2f(in.uv.x * 2.0 - 1.0, (1.0 - in.uv.y) * 2.0 - 1.0);
  let clip = rp.inv_view_proj * vec4f(ndc, 1.0, 1.0);
  let world_pt = clip.xyz / clip.w;
  let ray_origin = rp.camera_pos.xyz;
  let ray_dir = normalize(world_pt - ray_origin);

  // Intersect ray with unit cube [0, 1]^3
  let hit = intersect_aabb(ray_origin, ray_dir, vec3f(0.0), vec3f(1.0));
  if (hit.x >= hit.y) {
    return vec4f(rp.dead.rgb, 1.0);
  }

  // March through volume, accumulating density
  let step_size = (hit.y - hit.x) / f32(steps);
  var alpha = 0.0;
  var t = hit.x + step_size * 0.5;

  for (var i = 0u; i < steps; i++) {
    if (t >= hit.y) { break; }
    let pos = ray_origin + ray_dir * t;
    let grid_pos = pos * nf;
    let temp_val = max(sample_temp(grid_pos, grid_n), 0.0);

    alpha += (1.0 - alpha) * temp_val * density_scale * step_size;
    if (alpha > 0.99) { break; }
    t += step_size;
  }

  alpha = clamp(alpha, 0.0, 1.0);
  let color = mix(rp.dead.rgb, rp.alive.rgb, alpha);
  return vec4f(color, 1.0);
}
