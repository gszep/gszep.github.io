// Volumetric ray marching through the 3D smoke density field,
// with screen-space Game of Life overlay above transition height.

#import fullscreen_vertex

struct RenderParams {
  inv_view_proj: mat4x4f,
  camera_pos: vec4f,   // xyz = position, w = f32(grid_size)
  alive: vec4f,
  dead: vec4f,
  params: vec4f,       // xy = resolution, z = density_scale, w = f32(march_steps)
  gol_params: vec4f,   // x = f32(gol_n), y = pixel_scale_max, z = volume_h, w = f32(grid_ny)
  gol_rect: vec4f,     // x = threshold, y = theta, z = unused, w = unused
}

@group(0) @binding(0) var<storage, read> smoke: array<f32>;
@group(0) @binding(1) var<uniform> rp: RenderParams;
@group(0) @binding(2) var<storage, read> gol: array<u32>;

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

@fragment
fn frag(in: VSOut) -> @location(0) vec4f {
  let grid_n = u32(rp.camera_pos.w);
  let grid_ny = u32(rp.gol_params.w);
  let nf = f32(grid_n);
  let nyf = f32(grid_ny);
  let density_scale = rp.params.z;
  let steps = u32(rp.params.w);

  let gol_n = u32(rp.gol_params.x);
  let pixel_scale_max = rp.gol_params.y;
  let volume_h = rp.gol_params.z;  // stretched Y extent (2.0 for 1:2 ratio)

  // Reconstruct world-space ray from screen UV
  let ndc = vec2f(in.uv.x * 2.0 - 1.0, in.uv.y * 2.0 - 1.0);
  let clip = rp.inv_view_proj * vec4f(ndc, 1.0, 1.0);
  let world_pt = clip.xyz / clip.w;
  let ray_origin = rp.camera_pos.xyz;
  let ray_dir = normalize(world_pt - ray_origin);

  // Intersect ray with stretched box [0,1] x [0,volume_h] x [0,1]
  let hit = intersect_aabb(ray_origin, ray_dir, vec3f(0.0), vec3f(1.0, volume_h, 1.0));

  // March through volume, accumulating smoke density
  // GoL acts as a 3D binarization filter: quantize sample positions
  // to coarse blocks and threshold smoke to get pixelated alive/dead look
  let gol_block = nf / f32(gol_n);  // voxels per GoL cell
  let threshold = rp.gol_rect.x;     // binarization threshold

  var smoke_alpha = 0.0;
  if (hit.x < hit.y) {
    let step_size = (hit.y - hit.x) / f32(steps);
    var t = hit.x + step_size * 0.5;
    for (var i = 0u; i < steps; i++) {
      if (t >= hit.y) { break; }
      let pos = ray_origin + ray_dir * t;
      // Map world pos to grid coords: X,Z -> [0,N), Y -> [0,NY)
      let grid_pos = vec3f(pos.x * nf, pos.y / volume_h * nyf, pos.z * nf);

      var smoke_val = max(sample_smoke(grid_pos, grid_n, grid_ny), 0.0);

      // Binarize: quantize position to GoL cell, sample smoke at cell center,
      // then snap to 0 or 1 based on threshold
      if (gol_n > 0u) {
        let qpos = (floor(grid_pos / gol_block) + 0.5) * gol_block;
        let qsmoke = max(sample_smoke(qpos, grid_n, grid_ny), 0.0);
        // Look up GoL state at this quantized cell
        let gx = u32(clamp(qpos.x / nf * f32(gol_n), 0.0, f32(gol_n) - 1.0));
        let gz = u32(clamp(qpos.z / nf * f32(gol_n), 0.0, f32(gol_n) - 1.0));
        // GoL is 2D (XZ plane projected through Y), sample at (gx, gz)
        let gol_cell = f32(gol[gz * gol_n + gx]);
        // Where GoL is alive, binarize smoke; where dead, suppress
        smoke_val = smoke_val * (1.0 - gol_cell) + gol_cell * step(threshold, qsmoke);
      }

      smoke_alpha += (1.0 - smoke_alpha) * smoke_val * density_scale * step_size;
      if (smoke_alpha > 0.99) { break; }
      t += step_size;
    }
    smoke_alpha = clamp(smoke_alpha, 0.0, 1.0);
  }

  var color = mix(rp.dead.rgb, rp.alive.rgb, smoke_alpha);

  // 2D GoL overlay on top half — alive cells opaque, dead cells transparent
  // Rotate UV mapping by camera theta to align with the 3D smoke view.
  // Screen right → camera right in XZ, screen up → depth away from camera.
  if (in.uv.y > 0.5 && gol_n > 0u) {
    let gol_uv = vec2f(in.uv.x, (in.uv.y - 0.5) * 2.0);
    let theta = rp.gol_rect.y;
    let ct = cos(theta);
    let st = sin(theta);

    // Map screen-space UV to volume XZ via camera rotation
    let cx_f = gol_uv.x - 0.5;
    let cz_f = gol_uv.y - 0.5;
    let vol_x = cx_f * ct - cz_f * st + 0.5;
    let vol_z = (cx_f * st + cz_f * ct) + 0.5;

    // Skip if rotated coords fall outside the GoL grid
    if (vol_x >= 0.0 && vol_x <= 1.0 && vol_z >= 0.0 && vol_z <= 1.0) {
      let res = rp.params.xy;
      let aspect = res.x / (res.y * 0.5);
      let rows = f32(gol_n) * 0.25;
      let cols = rows * aspect;

      let cx = u32(floor(gol_uv.x * cols));
      let cz = u32(floor(gol_uv.y * rows));
      let cn_x = u32(cols);
      let cn_z = u32(rows);

      // Quantize to coarse pixels, then map to gol grid via rotated coords
      let qx_uv = floor(gol_uv.x * cols) / cols;
      let qz_uv = floor(gol_uv.y * rows) / rows;
      let qcx = qx_uv - 0.5;
      let qcz = qz_uv - 0.5;
      let qvol_x = qcx * ct - qcz * st + 0.5;
      let qvol_z = (qcx * st + qcz * ct) + 0.5;

      let gx = u32(clamp(qvol_x * f32(gol_n), 0.0, f32(gol_n) - 1.0));
      let gz = u32(clamp(qvol_z * f32(gol_n), 0.0, f32(gol_n) - 1.0));

      let on_border = cx == 0u || cx >= cn_x - 1u || cz == 0u || cz >= cn_z - 1u;

      // Only generate alive pixels where smoke has reached the bottom of the GoL region
      let smoke_sx = (f32(gx) + 0.5) / f32(gol_n) * nf;
      let smoke_sz = (f32(gz) + 0.5) / f32(gol_n) * nf;
      let smoke_sy = nyf * 0.5;
      let smoke_here = sample_smoke(vec3f(smoke_sx, smoke_sy, smoke_sz), grid_n, grid_ny);

      let cell = gol[gz * gol_n + gx];
      if (cell == 1u && smoke_here > threshold) {
        color = select(rp.alive.rgb, vec3f(0.2, 0.4, 1.0), on_border);
      } else if (on_border) {
        color = vec3f(0.2, 0.4, 1.0);
      }
    }
  }

  return vec4f(color, 1.0);
}
