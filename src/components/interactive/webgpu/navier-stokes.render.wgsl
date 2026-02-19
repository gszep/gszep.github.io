#import fullscreen_vertex

struct Params {
  mouse: vec4f,
  size: vec2f,
  _pad: vec2f,
  bg: vec4f,
};

@group(0) @binding(0) var<storage, read> state: array<vec4f>;
@group(0) @binding(1) var<uniform> params: Params;

fn load_at(pos: vec2i, sz: vec2i) -> vec4f {
  let p = clamp(pos, vec2i(0), sz - 1);
  return state[u32(p.y * sz.x + p.x)];
}

@fragment
fn frag(in: VSOut) -> @location(0) vec4f {
  let size = vec2i(params.size);
  let pos = vec2i(
    i32(in.uv.x * f32(size.x)),
    i32((1.0 - in.uv.y) * f32(size.y)),
  );

  let c = load_at(pos, size);

  // Vorticity -> red/green (unchanged in both modes)
  var color = vec4f(0.0);
  color.g = 5.0 * max(0.0, c.w);    // positive vorticity -> green
  color.r = 5.0 * max(0.0, -c.w);   // negative vorticity -> red
  color.a = c.x;                     // error metric -> alpha

  // Stream function coloring (mode-dependent)
  let raw_stream = abs(c.z);
  if (params.bg.r < 0.5) {
    // Dark mode: #DCED31 accent for stream function, fading to blue
    // near vortex cores to preserve emergent magenta/cyan.
    // Reinhard compress stream to [0,1) to prevent yellow clipping to white.
    let stream = raw_stream / (1.0 + raw_stream);
    let vort = color.r + color.g;
    let t = clamp(vort, 0.0, 1.0);
    let accent = vec3f(0.863, 0.929, 0.192);
    let stream_col = mix(accent, vec3f(0.0, 0.0, 1.0), t);
    color = vec4f(color.rg + stream_col.rg * stream, stream_col.b * stream, color.a);
  } else {
    color.b = raw_stream;
  }

  // Blend over background so dark/light mode both look correct
  let a = clamp(color.a, 0.0, 1.0);
  let blended = mix(params.bg.rgb, color.rgb, a);
  return vec4f(blended, 1.0);
}
