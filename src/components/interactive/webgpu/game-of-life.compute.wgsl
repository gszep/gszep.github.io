requires readonly_and_readwrite_storage_textures;

@group(0) @binding(0) var state: texture_storage_2d<r32uint, read_write>;

fn alive(pos: vec2i, size: vec2i) -> u32 {
  return textureLoad(state, (pos % size + size) % size).x;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let size = vec2i(textureDimensions(state));
  let pos = vec2i(id.xy);
  if (pos.x >= size.x || pos.y >= size.y) { return; }

  let n = alive(pos + vec2i(-1,-1), size) + alive(pos + vec2i(0,-1), size) + alive(pos + vec2i(1,-1), size)
        + alive(pos + vec2i(-1, 0), size)                                  + alive(pos + vec2i(1, 0), size)
        + alive(pos + vec2i(-1, 1), size) + alive(pos + vec2i(0, 1), size) + alive(pos + vec2i(1, 1), size);

  let cur = textureLoad(state, pos).x;
  textureStore(state, pos, vec4u(select(0u, 1u, n == 3u || (cur == 1u && n == 2u)), 0u, 0u, 0u));
}
