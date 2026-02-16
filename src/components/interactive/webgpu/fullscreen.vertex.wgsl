struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
};

@vertex
fn vert(@builtin(vertex_index) i: u32) -> VSOut {
  let p = array(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
  var o: VSOut;
  o.pos = vec4f(p[i], 0, 1);
  o.uv = p[i] * 0.5 + 0.5;
  return o;
}
