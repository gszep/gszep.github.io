// Shared simulation parameters for all flame compute shaders

struct SimParams {
  n: u32,              // grid cells per dimension
  tau: f32,            // BGK relaxation time (viscosity = (tau - 0.5) / 3)
  buoyancy: f32,       // thermal buoyancy strength
  heat_rate: f32,      // heat injection rate at source
  cooling: f32,        // per-step temperature decay (e.g. 0.995)
  source_radius: f32,  // heat source radius (fraction of N)
  source_jitter: f32,  // injection center noise amplitude (fraction of N)
  time: f32,           // accumulated time for injection noise
}
