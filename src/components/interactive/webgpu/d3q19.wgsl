// D3Q19 lattice constants for 3D Lattice Boltzmann Method

const CS2: f32 = 1.0 / 3.0;  // speed of sound squared
const INV_CS2: f32 = 3.0;
const INV_2CS4: f32 = 4.5;
const INV_2CS2: f32 = 1.5;

// 19 lattice velocity vectors (rest + 6 face + 12 edge)
const E = array<vec3i, 19>(
  vec3i( 0,  0,  0),  //  0: rest
  vec3i( 1,  0,  0),  //  1: +x
  vec3i(-1,  0,  0),  //  2: -x
  vec3i( 0,  1,  0),  //  3: +y
  vec3i( 0, -1,  0),  //  4: -y
  vec3i( 0,  0,  1),  //  5: +z
  vec3i( 0,  0, -1),  //  6: -z
  vec3i( 1,  1,  0),  //  7: +x+y
  vec3i(-1,  1,  0),  //  8: -x+y
  vec3i( 1, -1,  0),  //  9: +x-y
  vec3i(-1, -1,  0),  // 10: -x-y
  vec3i( 1,  0,  1),  // 11: +x+z
  vec3i(-1,  0,  1),  // 12: -x+z
  vec3i( 1,  0, -1),  // 13: +x-z
  vec3i(-1,  0, -1),  // 14: -x-z
  vec3i( 0,  1,  1),  // 15: +y+z
  vec3i( 0, -1,  1),  // 16: -y+z
  vec3i( 0,  1, -1),  // 17: +y-z
  vec3i( 0, -1, -1),  // 18: -y-z
);

// Lattice weights
const W = array<f32, 19>(
  1.0 / 3.0,   // rest
  1.0 / 18.0, 1.0 / 18.0, 1.0 / 18.0,  // face +x -x +y
  1.0 / 18.0, 1.0 / 18.0, 1.0 / 18.0,  // face -y +z -z
  1.0 / 36.0, 1.0 / 36.0, 1.0 / 36.0, 1.0 / 36.0,  // edge xy
  1.0 / 36.0, 1.0 / 36.0, 1.0 / 36.0, 1.0 / 36.0,  // edge xz
  1.0 / 36.0, 1.0 / 36.0, 1.0 / 36.0, 1.0 / 36.0,  // edge yz
);

// Opposite direction index for each q (used in pull-based streaming)
const OPP = array<u32, 19>(
  0u,   // rest -> rest
  2u,   // +x -> -x
  1u,   // -x -> +x
  4u,   // +y -> -y
  3u,   // -y -> +y
  6u,   // +z -> -z
  5u,   // -z -> +z
  10u,  // +x+y -> -x-y
  9u,   // -x+y -> +x-y
  8u,   // +x-y -> -x+y
  7u,   // -x-y -> +x+y
  14u,  // +x+z -> -x-z
  13u,  // -x+z -> +x-z
  12u,  // +x-z -> -x+z
  11u,  // -x-z -> +x+z
  18u,  // +y+z -> -y-z
  17u,  // -y+z -> +y-z
  16u,  // +y-z -> -y+z
  15u,  // -y-z -> +y+z
);

// Compute equilibrium distribution for direction q
fn equilibrium(q: u32, rho: f32, u: vec3f) -> f32 {
  let ei = vec3f(E[q]);
  let eu = dot(ei, u);
  let uu = dot(u, u);
  return rho * W[q] * (1.0 + INV_CS2 * eu + INV_2CS4 * eu * eu - INV_2CS2 * uu);
}
