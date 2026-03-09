// Shared simulation parameters for all flame compute shaders

struct SimParams {
  n: u32,              // grid cells per X/Z dimension
  ny: u32,             // grid cells Y dimension (height = n * 2)
  tau: f32,            // BGK relaxation time (viscosity = (tau - 0.5) / 3)
  buoyancy: f32,       // thermal buoyancy strength
  heat_rate: f32,      // heat injection rate at source
  cooling: f32,        // per-step temperature decay (e.g. 0.995)
  source_radius: f32,  // heat source radius (fraction of N)
  source_jitter: f32,  // injection center noise amplitude (fraction of N)
  time: f32,           // accumulated time for injection noise
  num_swirls: u32,     // active swirl vortex count
  gol_n: u32,          // Game of Life grid size
  gol_threshold: f32,  // smoke density threshold for GoL cell birth
  gol_transition: f32, // height fraction where smoke→GoL transition begins
  gol_threshold_2d: f32, // smoke threshold for 2D overlay GoL seeding
  gol2d_n: u32,        // 2D overlay GoL grid rows (height)
  gol2d_cols: u32,     // 2D overlay GoL grid columns (width)
}
