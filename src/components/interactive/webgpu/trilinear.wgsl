// 3D grid indexing utilities
// Trilinear interpolation is written inline in each shader because
// WGSL does not allow storage-address-space pointer parameters.

fn idx3d(x: u32, y: u32, z: u32, n: u32) -> u32 {
  return z * n * n + y * n + x;
}

fn idx3v(p: vec3u, n: u32) -> u32 {
  return p.z * n * n + p.y * n + p.x;
}
