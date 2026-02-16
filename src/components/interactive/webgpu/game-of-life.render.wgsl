// ---------- vertex ----------

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
};

@vertex
fn vert(@builtin(vertex_index) i: u32) -> VSOut {
  // Fullscreen triangle — 3 vertices, no buffer needed
  let p = array(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
  var o: VSOut;
  o.pos = vec4f(p[i], 0, 1);
  o.uv = p[i] * 0.5 + 0.5;
  return o;
}

// ---------- fragment ----------

struct Colors {
  alive: vec4f,
  dead:  vec4f,
};

@group(0) @binding(0) var<uniform> grid: vec2u;
@group(0) @binding(1) var<storage, read> state: array<u32>;
@group(0) @binding(2) var<uniform> colors: Colors;

@fragment
fn frag(in: VSOut) -> @location(0) vec4f {
  let cell = vec2u(
    u32(in.uv.x * f32(grid.x)),
    u32((1.0 - in.uv.y) * f32(grid.y)),
  );
  let c = select(colors.dead, colors.alive, state[cell.y * grid.x + cell.x] == 1u);
  // Premultiply alpha for canvas compositing
  return vec4f(c.rgb * c.a, c.a);
}
