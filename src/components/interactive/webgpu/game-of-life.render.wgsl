#import fullscreen_vertex

struct Colors { alive: vec4f, dead: vec4f };

@group(0) @binding(0) var state: texture_2d<u32>;
@group(0) @binding(1) var<uniform> colors: Colors;

@fragment
fn frag(in: VSOut) -> @location(0) vec4f {
  let size = vec2f(textureDimensions(state));
  let cell = vec2i(
    i32(in.uv.x * size.x),
    i32((1.0 - in.uv.y) * size.y),
  );
  let c = select(colors.dead, colors.alive, textureLoad(state, cell, 0).x == 1u);
  return vec4f(c.rgb * c.a, c.a);
}
