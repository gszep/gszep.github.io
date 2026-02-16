@group(0) @binding(0) var<uniform> grid: vec2u;
@group(0) @binding(1) var<storage, read> stateIn: array<u32>;
@group(0) @binding(2) var<storage, read_write> stateOut: array<u32>;

fn idx(x: u32, y: u32) -> u32 {
  return (y % grid.y) * grid.x + (x % grid.x);
}

fn alive(x: u32, y: u32) -> u32 {
  return stateIn[idx(x, y)];
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  if (id.x >= grid.x || id.y >= grid.y) { return; }

  let n = alive(id.x - 1u, id.y - 1u) + alive(id.x, id.y - 1u) + alive(id.x + 1u, id.y - 1u)
        + alive(id.x - 1u, id.y)                                   + alive(id.x + 1u, id.y)
        + alive(id.x - 1u, id.y + 1u) + alive(id.x, id.y + 1u) + alive(id.x + 1u, id.y + 1u);

  let i = idx(id.x, id.y);
  // B3/S23: born at 3 neighbours, survive at 2 or 3
  stateOut[i] = select(0u, 1u, n == 3u || (stateIn[i] == 1u && n == 2u));
}
