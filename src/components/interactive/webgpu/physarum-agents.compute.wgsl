// Physarum agent step: sense trail + attraction field → turn → move → deposit.
// Agents self-organize into filamentary structures along regions of high
// attraction (dark green branches in the plum blossom video).

requires readonly_and_readwrite_storage_textures;

#import physarum_params
#import hash21

@group(0) @binding(0) var<storage, read_write> agents: array<vec4f>;
@group(0) @binding(1) var trail: texture_storage_2d<r32float, read_write>;
@group(0) @binding(2) var attract: texture_2d<f32>;   // dark green attraction field
@group(0) @binding(3) var<uniform> params: Params;
@group(0) @binding(4) var mask: texture_2d<f32>;       // tree=1, sky=0

fn sense(pos: vec2f, angle: f32) -> f32 {
  let dir = vec2f(cos(angle), sin(angle));
  let sp = pos + dir * params.sensor_dist;
  let sz = vec2i(params.size);
  let coord = clamp(vec2i(sp), vec2i(0), sz - 1);

  let trail_val = textureLoad(trail, coord).r;
  let attract_val = textureLoad(attract, coord, 0).r;

  return trail_val + params.mask_weight * attract_val;
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
  let rng = hash21(pos * 0.1 + vec2f(params.time * 13.7, f32(idx) * 0.01));

  // Boost turn speed outside tree mask (agents return to branches faster)
  let mc = clamp(vec2i(pos), vec2i(0), vec2i(params.size) - 1);
  let raw_mask = textureLoad(mask, mc, 0).r;
  let tree = smoothstep(params.agent_threshold - 0.15, params.agent_threshold + 0.15, raw_mask);
  let ts = params.turn_speed * mix(4.0, 1.0, tree);  // 4x turn speed in sky

  // Turn decision
  var h = heading;
  if (center > left && center > right) {
    // Continue straight with tiny noise
    h += (rng - 0.5) * 0.1;
  } else if (center < left && center < right) {
    // Both sides better → random turn
    h += (rng - 0.5) * 2.0 * ts;
  } else if (left > right) {
    h -= ts;
  } else {
    h += ts;
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
