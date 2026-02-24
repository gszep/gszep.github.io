// Shared hash function for pseudo-random number generation.
// Used by physarum agents (stochastic turns) and brush-stroke render (paper noise).

fn hash21(p: vec2f) -> f32 {
  var p3 = fract(p.xyx * vec3f(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
