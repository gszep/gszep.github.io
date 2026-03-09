// 2D Game of Life for screen-space overlay.
// Seeded from the same quantized ray march used by the low-res overlay.

#import flame_params

struct RenderParams {
  inv_view_proj: mat4x4f,
  camera_pos: vec4f,
  alive: vec4f,
  dead: vec4f,
  params: vec4f,
  gol_params: vec4f,
  gol_rect: vec4f,
}

@group(0) @binding(0) var<storage, read_write> gol2d: array<u32>;
@group(0) @binding(1) var<storage, read> smoke: array<f32>;
@group(0) @binding(2) var<uniform> sp: SimParams;
@group(0) @binding(3) var<uniform> rp: RenderParams;
@group(0) @binding(4) var<storage, read> gol: array<u32>;

fn idx3(x: u32, y: u32, z: u32, nx: u32, ny: u32) -> u32 {
  return z * nx * ny + y * nx + x;
}

fn sample_smoke(pos: vec3f, nx: u32, ny: u32) -> f32 {
  let nxf = f32(nx);
  let nyf = f32(ny);
  let p = clamp(pos, vec3f(0.0), vec3f(nxf - 1.001, nyf - 1.001, nxf - 1.001));
  let p0 = vec3u(floor(p));
  let fr = p - vec3f(p0);

  let c000 = smoke[idx3(p0.x,      p0.y,      p0.z,      nx, ny)];
  let c100 = smoke[idx3(p0.x + 1u, p0.y,      p0.z,      nx, ny)];
  let c010 = smoke[idx3(p0.x,      p0.y + 1u, p0.z,      nx, ny)];
  let c110 = smoke[idx3(p0.x + 1u, p0.y + 1u, p0.z,      nx, ny)];
  let c001 = smoke[idx3(p0.x,      p0.y,      p0.z + 1u, nx, ny)];
  let c101 = smoke[idx3(p0.x + 1u, p0.y,      p0.z + 1u, nx, ny)];
  let c011 = smoke[idx3(p0.x,      p0.y + 1u, p0.z + 1u, nx, ny)];
  let c111 = smoke[idx3(p0.x + 1u, p0.y + 1u, p0.z + 1u, nx, ny)];

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

fn march(uv: vec2f) -> f32 {
  let grid_n = u32(rp.camera_pos.w);
  let grid_ny = u32(rp.gol_params.w);
  let density_scale = rp.params.z;
  let steps = u32(rp.params.w);
  let gol_n = u32(rp.gol_params.x);
  let volume_h = rp.gol_params.z;
  let threshold = rp.gol_rect.x;
  let nf = f32(grid_n);
  let gol_block = nf / f32(gol_n);

  let ndc = vec2f(uv.x * 2.0 - 1.0, uv.y * 2.0 - 1.0);
  let clip = rp.inv_view_proj * vec4f(ndc, 1.0, 1.0);
  let world_pt = clip.xyz / clip.w;
  let ray_origin = rp.camera_pos.xyz;
  let ray_dir = normalize(world_pt - ray_origin);

  let hit = intersect_aabb(ray_origin, ray_dir, vec3f(0.0), vec3f(1.0, volume_h, 1.0));

  var smoke_alpha = 0.0;
  if (hit.x < hit.y) {
    let step_size = (hit.y - hit.x) / f32(steps);
    var t = hit.x + step_size * 0.5;
    for (var i = 0u; i < steps; i++) {
      if (t >= hit.y) { break; }
      let pos = ray_origin + ray_dir * t;
      let grid_pos = vec3f(pos.x * nf, pos.y / volume_h * f32(grid_ny), pos.z * nf);

      var smoke_val = max(sample_smoke(grid_pos, grid_n, grid_ny), 0.0);

      if (gol_n > 0u) {
        let qpos = (floor(grid_pos / gol_block) + 0.5) * gol_block;
        let qsmoke = max(sample_smoke(qpos, grid_n, grid_ny), 0.0);
        let gx = u32(clamp(qpos.x / nf * f32(gol_n), 0.0, f32(gol_n) - 1.0));
        let gz = u32(clamp(qpos.z / nf * f32(gol_n), 0.0, f32(gol_n) - 1.0));
        let gol_cell = f32(gol[gz * gol_n + gx]);
        smoke_val = smoke_val * (1.0 - gol_cell) + gol_cell * step(threshold, qsmoke);
      }

      smoke_alpha += (1.0 - smoke_alpha) * smoke_val * density_scale * step_size;
      if (smoke_alpha > 0.99) { break; }
      t += step_size;
    }
  }
  return clamp(smoke_alpha, 0.0, 1.0);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let id = gid.xy;
  let cols = sp.gol2d_cols;
  let rows = sp.gol2d_n;
  if (id.x >= cols || id.y >= rows) { return; }

  let ri = i32(rows);
  let ci = i32(cols);

  // Advect: read from 1 cell below to push pattern upward (no Y wrap)
  let src_y = i32(id.y) - 1;
  var state = 0u;
  if (src_y >= 0) {
    state = gol2d[u32(src_y) * cols + id.x];
  }

  // Count neighbors around source position (Y clamped at top, X wraps)
  var neighbors = 0u;
  for (var dy = -1; dy <= 1; dy++) {
    for (var dx = -1; dx <= 1; dx++) {
      if (dx == 0 && dy == 0) { continue; }
      let ny_idx = src_y + dy;
      if (ny_idx < 0 || ny_idx >= ri) { continue; }
      let nx_idx = (i32(id.x) + dx + ci) % ci;
      neighbors += gol2d[u32(ny_idx) * cols + u32(nx_idx)];
    }
  }

  // B3/S23 rules — top row absorbs (no wrapping)
  var alive = (state == 1u && (neighbors == 2u || neighbors == 3u))
           || (state == 0u && neighbors == 3u);
  if (id.y == rows - 1u) { alive = false; }

  // Seed from screen-space quantized march
  let res = rp.params.xy;
  let block_px = res.y / f32(rows);
  let block_uv = vec2f(block_px / res.x, block_px / res.y);
  let uv = (vec2f(f32(id.x), f32(id.y)) + 0.5) * block_uv;

  let alpha = march(uv);
  if (alpha > sp.gol_threshold_2d) {
    alive = true;
  }

  gol2d[id.y * cols + id.x] = select(0u, 1u, alive);
}
