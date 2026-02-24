// Shared physarum parameter struct.
// Used by both physarum-agents.compute.wgsl and physarum-diffuse.compute.wgsl.

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
  agent_threshold: f32,
};
