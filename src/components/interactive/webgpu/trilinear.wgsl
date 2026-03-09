// 3D grid indexing utilities
// Trilinear interpolation is written inline in each shader because
// WGSL does not allow storage-address-space pointer parameters.

fn idx3d(x: u32, y: u32, z: u32, nx: u32, ny: u32) -> u32 {
  return z * nx * ny + y * nx + x;
}

fn idx3v(p: vec3u, nx: u32, ny: u32) -> u32 {
  return p.z * nx * ny + p.y * nx + p.x;
}
