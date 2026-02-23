// Physarum agent step: sense trail + branch mask → turn → move → deposit.
// Agents self-organize into filamentary structures along tree branches,
// creating emergent calligraphic brush strokes.

requires readonly_and_readwrite_storage_textures;

struct Params {
  size: vec2f,
  num_agents: f32,
  time: f32,
  sensor_dist: f32,
  sensor_angle: f32,
  turn_speed: f32,
  deposit: f32,
  speed: f32,
  mask_weight: f32,
  decay: f32,
  diffuse_weight: f32,
};

@group(0) @binding(0) var<storage, read_write> agents: array<vec4f>;
@group(0) @binding(1) var trail: texture_storage_2d<r32float, read_write>;
@group(0) @binding(2) var mask_orig: texture_2d<f32>;
@group(0) @binding(3) var mask_blur: texture_2d<f32>;
@group(0) @binding(4) var<uniform> params: Params;

fn hash(p: vec2f) -> f32 {
  var p3 = fract(p.xyx * vec3f(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

fn sense(pos: vec2f, angle: f32) -> f32 {
  let dir = vec2f(cos(angle), sin(angle));
  let sp = pos + dir * params.sensor_dist;
  let sz = vec2i(params.size);
  let coord = clamp(vec2i(sp), vec2i(0), sz - 1);

  let trail_val = textureLoad(trail, coord).r;
  let orig = textureLoad(mask_orig, coord, 0).r;
  let eroded = textureLoad(mask_blur, coord, 0).r;

  // Attract to branches: high original mask AND low erosion (not blossom)
  let branch = orig * (1.0 - step(0.5, eroded));
  return trail_val + params.mask_weight * branch;
}

@compute @workgroup_size(256)
fn agents_step(@builtin(global_invocation_id) id: vec3u) {
  let idx = id.x;
  if (idx >= u32(params.num_agents)) { return; }

  var agent = agents[idx];
  let pos = agent.xy;
  let heading = agent.z;
  let sz = params.size;

  // Sense at three positions
  let left   = sense(pos, heading - params.sensor_angle);
  let center = sense(pos, heading);
  let right  = sense(pos, heading + params.sensor_angle);

  // Stochastic element
  let rng = hash(pos * 0.1 + vec2f(params.time * 13.7, f32(idx) * 0.01));

  // Turn decision
  var h = heading;
  if (center > left && center > right) {
    // Continue straight with tiny noise
    h += (rng - 0.5) * 0.1;
  } else if (center < left && center < right) {
    // Both sides better → random turn
    h += (rng - 0.5) * 2.0 * params.turn_speed;
  } else if (left > right) {
    h -= params.turn_speed;
  } else {
    h += params.turn_speed;
  }

  // Move
  var np = pos + vec2f(cos(h), sin(h)) * params.speed;

  // Wrap boundaries
  np = fract(np / sz) * sz;

  // Update agent
  agents[idx] = vec4f(np, h, 0.0);

  // Deposit trail at new position
  let dc = clamp(vec2i(np), vec2i(0), vec2i(sz) - 1);
  let cur = textureLoad(trail, dc).r;
  textureStore(trail, dc, vec4f(min(cur + params.deposit, 5.0), 0.0, 0.0, 0.0));
}
