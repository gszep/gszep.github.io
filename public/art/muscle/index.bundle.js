"use strict";
(self["webpackChunkwebgpu_collab_stringed_entities"] = self["webpackChunkwebgpu_collab_stringed_entities"] || []).push([["index"],{

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");
/* harmony import */ var _shaders_render_wgsl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shaders/render.wgsl */ "./src/shaders/render.wgsl");
/* harmony import */ var _shaders_simulate_wgsl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shaders/simulate.wgsl */ "./src/shaders/simulate.wgsl");
/* harmony import */ var _shaders_includes_bindings_wgsl__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./shaders/includes/bindings.wgsl */ "./src/shaders/includes/bindings.wgsl");
/* harmony import */ var _shaders_includes_textures_wgsl__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./shaders/includes/textures.wgsl */ "./src/shaders/includes/textures.wgsl");
/* harmony import */ var _shaders_includes_buffers_wgsl__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./shaders/includes/buffers.wgsl */ "./src/shaders/includes/buffers.wgsl");
/* harmony import */ var _shaders_includes_random_wgsl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./shaders/includes/random.wgsl */ "./src/shaders/includes/random.wgsl");







const shaderIncludes = {
    bindings: _shaders_includes_bindings_wgsl__WEBPACK_IMPORTED_MODULE_3__,
    textures: _shaders_includes_textures_wgsl__WEBPACK_IMPORTED_MODULE_4__,
    buffers: _shaders_includes_buffers_wgsl__WEBPACK_IMPORTED_MODULE_5__,
    random: _shaders_includes_random_wgsl__WEBPACK_IMPORTED_MODULE_6__,
};
const size32 = 4;
const uniforms = {
    computeStepsPerFrame: 1,
    targetFPS: 120,
    segmentCount: 100000,
    stiffness: 0.12,
    stericSamplingRange: 16,
    equilibriumLineDistance: 1.0,
};
async function index() {
    const device = await (0,_utils__WEBPACK_IMPORTED_MODULE_0__.requestDevice)();
    const canvas = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.configureCanvas)(device);
    const GROUP_INDEX = 0;
    const BINDINGS_BUFFER = { CANVAS: 0, CONTROLS: 1, INTERACTIONS: 2 };
    const BINDINGS_TEXTURE = {
        INDEX: 3,
        STERIC_POTENTIAL: 4,
        PARAMETER_FIELDS: 5,
    };
    const BINDINGS_SEGMENTS = {
        RANDOM: 6,
        SEGMENTS: 7,
    };
    const textures = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.setupTextures)(device, Object.values(BINDINGS_TEXTURE), {}, {
        depthOrArrayLayers: {
            [BINDINGS_TEXTURE.STERIC_POTENTIAL]: 3,
            [BINDINGS_TEXTURE.PARAMETER_FIELDS]: 4,
            [BINDINGS_TEXTURE.INDEX]: 3,
        },
        width: canvas.size.width,
        height: canvas.size.height,
    }, {
        [BINDINGS_TEXTURE.STERIC_POTENTIAL]: "r32float",
        [BINDINGS_TEXTURE.PARAMETER_FIELDS]: "r32float",
        [BINDINGS_TEXTURE.INDEX]: "r32uint",
    });
    const WORKGROUP_SIZE = 256;
    const TEXTURE_WORKGROUP_COUNT = [
        Math.ceil(textures.size.width / Math.sqrt(WORKGROUP_SIZE)),
        Math.ceil(textures.size.height / Math.sqrt(WORKGROUP_SIZE)),
    ];
    const BUFFER_WORKGROUP_COUNT = {
        SEGMENTS: Math.ceil(uniforms.segmentCount / WORKGROUP_SIZE),
    };
    const MAX_BUFFER_WORKGROUP_COUNT = Math.max(...Object.values(BUFFER_WORKGROUP_COUNT));
    const interactions = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.setupInteractions)(device, canvas.context.canvas, textures.size);
    const canvas_buffers = {
        [BINDINGS_BUFFER.CANVAS]: textures.canvas.buffer,
        [BINDINGS_BUFFER.CONTROLS]: interactions.controls.buffer,
        [BINDINGS_BUFFER.INTERACTIONS]: interactions.interactions.buffer,
    };
    const controlsDataView = new DataView(interactions.controls.data);
    const canvasView = new DataView(textures.canvas.data.buffer);
    const writeUniforms = () => {
        canvasView.setInt32(0, textures.size.width, true);
        canvasView.setInt32(4, textures.size.height, true);
        canvasView.setUint32(12, crypto.getRandomValues(new Uint32Array(1))[0], true);
        canvasView.setUint32(16, crypto.getRandomValues(new Uint32Array(1))[0], true);
        controlsDataView.setFloat32(0, uniforms.stiffness, true);
        controlsDataView.setUint32(4, uniforms.stericSamplingRange, true);
        controlsDataView.setFloat32(8, uniforms.equilibriumLineDistance, true);
        device.queue.writeBuffer(interactions.controls.buffer, 0, interactions.controls.data);
        device.queue.writeBuffer(textures.canvas.buffer, 0, textures.canvas.data);
    };
    writeUniforms();
    const randomBufferSize = Math.max(textures.size.width * textures.size.height, uniforms.segmentCount);
    // initialize random buffer
    const randomData = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getRandomValues)(randomBufferSize);
    const agent_buffers = {
        [BINDINGS_SEGMENTS.RANDOM]: device.createBuffer({
            label: "Random Buffer",
            size: randomData.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        }),
        [BINDINGS_SEGMENTS.SEGMENTS]: device.createBuffer({
            size: size32 * 10 * uniforms.segmentCount,
            usage: GPUBufferUsage.STORAGE,
        }),
    };
    device.queue.writeBuffer(agent_buffers[BINDINGS_SEGMENTS.RANDOM], /*offset=*/ 0, /*data=*/ randomData);
    const visibility = GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT;
    const bindGroupLayout = device.createBindGroupLayout({
        label: "bindGroupLayout",
        entries: [
            ...Object.values(BINDINGS_TEXTURE).map((binding) => ({
                binding: binding,
                visibility: visibility,
                storageTexture: textures.bindingLayout[binding],
            })),
            ...Object.values(BINDINGS_BUFFER).map((binding) => ({
                binding: binding,
                visibility: visibility,
                buffer: { type: "uniform" },
            })),
            ...Object.values(BINDINGS_SEGMENTS).map((binding) => ({
                binding: binding,
                visibility: visibility,
                buffer: { type: "storage" },
            })),
        ],
    });
    const bindGroup = device.createBindGroup({
        label: `Bind Group`,
        layout: bindGroupLayout,
        entries: [
            ...Object.values(BINDINGS_TEXTURE).map((binding) => ({
                binding: binding,
                resource: textures.textures[binding].createView(),
            })),
            ...Object.values(BINDINGS_BUFFER).map((binding) => ({
                binding: binding,
                resource: {
                    buffer: canvas_buffers[binding],
                },
            })),
            ...Object.values(BINDINGS_SEGMENTS).map((binding) => ({
                binding: binding,
                resource: {
                    buffer: agent_buffers[binding],
                },
            })),
        ],
    });
    const pipelineLayout = device.createPipelineLayout({
        label: "pipelineLayout",
        bindGroupLayouts: [bindGroupLayout],
    });
    function submitComputePass(device, pipeline, workgroupCount, passIds = [0]) {
        passIds.forEach((passId, index) => {
            const encoder = device.createCommandEncoder();
            const pass = encoder.beginComputePass();
            pass.setBindGroup(GROUP_INDEX, bindGroup);
            pass.setPipeline(pipeline);
            device.queue.writeBuffer(textures.canvas.buffer, 2 * size32, new Uint32Array([passId]));
            pass.dispatchWorkgroups(workgroupCount);
            pass.end();
            device.queue.submit([encoder.finish()]);
        });
    }
    /////////////////////////
    // Set up code instructions
    const module = await (0,_utils__WEBPACK_IMPORTED_MODULE_0__.createShader)(device, _shaders_simulate_wgsl__WEBPACK_IMPORTED_MODULE_2__, shaderIncludes);
    const resetSegmentsPipeline = device.createComputePipeline({
        layout: pipelineLayout,
        compute: { module, entryPoint: "reset_segments" },
    });
    const texturesPipeline = device.createComputePipeline({
        layout: pipelineLayout,
        compute: { module, entryPoint: "texture_updates" },
    });
    const stericForcesPipeline = device.createComputePipeline({
        layout: pipelineLayout,
        compute: { module, entryPoint: "force_updates" },
    });
    const lineConstraintPipeline = device.createComputePipeline({
        layout: pipelineLayout,
        compute: { module, entryPoint: "line_constraint_updates" },
    });
    // Traditional render pipeline of vert -> frag
    const renderModule = await (0,_utils__WEBPACK_IMPORTED_MODULE_0__.createShader)(device, _shaders_render_wgsl__WEBPACK_IMPORTED_MODULE_1__, shaderIncludes);
    const renderPipeline = device.createRenderPipeline({
        label: "Render Pipeline",
        layout: pipelineLayout,
        vertex: {
            module: renderModule,
            entryPoint: "vert",
        },
        fragment: {
            module: renderModule,
            entryPoint: "frag",
            targets: [{ format: canvas.format }], // Stage 1 renders to intermediate texture
        },
        primitive: {
            topology: "triangle-list",
        },
    });
    /////////////////////////
    // RUN the reset shader function
    const reset = () => {
        // Uniforms are potentially changed by GUI before reset, so write them.
        writeUniforms();
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginComputePass();
        pass.setBindGroup(GROUP_INDEX, bindGroup);
        pass.setPipeline(resetSegmentsPipeline);
        pass.dispatchWorkgroups(BUFFER_WORKGROUP_COUNT.SEGMENTS);
        pass.end();
        device.queue.submit([encoder.finish()]);
    };
    reset();
    // RUN the sim compute function and render pixels
    function timestep() {
        device.queue.writeBuffer(interactions.interactions.buffer, 0, interactions.interactions.data);
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginComputePass({});
        for (let i = 0; i < 10; i++) {
            pass.setBindGroup(GROUP_INDEX, bindGroup);
            pass.setPipeline(texturesPipeline);
            pass.dispatchWorkgroups(...TEXTURE_WORKGROUP_COUNT);
            pass.setPipeline(stericForcesPipeline);
            pass.dispatchWorkgroups(MAX_BUFFER_WORKGROUP_COUNT);
            for (let i = 0; i < 10; i++) {
                submitComputePass(device, lineConstraintPipeline, MAX_BUFFER_WORKGROUP_COUNT, [0, 1]);
            }
        }
        pass.end();
        const renderPass = encoder.beginRenderPass({
            colorAttachments: [
                {
                    view: canvas.context.getCurrentTexture().createView(),
                    loadOp: "load",
                    storeOp: "store",
                },
            ],
        });
        renderPass.setPipeline(renderPipeline);
        renderPass.setBindGroup(GROUP_INDEX, bindGroup);
        renderPass.draw(6, 1, 0, 0);
        renderPass.end();
        device.queue.submit([encoder.finish()]);
    }
    let lastFrameTime = 0;
    const getFrameInterval = () => 1000 / uniforms.targetFPS; // Convert FPS to milliseconds
    function frame(currentTime) {
        // Check if enough time has passed based on target FPS
        if (currentTime - lastFrameTime >= getFrameInterval()) {
            timestep();
            lastFrameTime = currentTime;
        }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return;
}
index();


/***/ }),

/***/ "./src/shaders/includes/bindings.wgsl":
/*!********************************************!*\
  !*** ./src/shaders/includes/bindings.wgsl ***!
  \********************************************/
/***/ ((module) => {

module.exports = "const GROUP_INDEX = 0;\n\nconst CANVAS = 0;\nconst CONTROLS = 1;\nconst INTERACTIONS = 2;\n\nconst INDEX = 3;\n  const SEGMENT_INDEX = 0;\n\nconst STERIC_POTENTIAL = 4;\nconst STERIC_POTENTIAL_DIM = 3;\nconst STERIC_SEGMENTS = 0;\n\nconst PARAMETER_FIELDS = 5;\nconst DEBUG = 0;\nconst TOUCH = 1;\n\nconst RANDOM = 6;\nconst SEGMENTS = 7;\n\nstruct Controls {    \n    stiffness: f32, \n    steric_sampling_range: i32,\n    equilibrium_line_distance: f32,\n}";

/***/ }),

/***/ "./src/shaders/includes/buffers.wgsl":
/*!*******************************************!*\
  !*** ./src/shaders/includes/buffers.wgsl ***!
  \*******************************************/
/***/ ((module) => {

module.exports = "struct Segment {\n  id: u32,\n  subtype: u32,\n  pass_id: u32,\n  position: vec2f,\n  orientation: vec2f,\n  tail: u32,\n  head: u32,\n}\n\nfn is_disconnected(segment: Segment) -> bool {\n  return segment.tail == segment.id && segment.head == segment.id;\n}\n\nfn is_head(segment: Segment) -> bool {\n  return segment.tail != segment.id && segment.head == segment.id;\n}\n\nfn is_tail(segment: Segment) -> bool {\n  return segment.tail == segment.id && segment.head != segment.id;\n}\n\nfn has_connection(segment: Segment) -> bool {\n  return segment.tail != segment.id || segment.head != segment.id;\n}\n\nfn has_both_connections(segment: Segment) -> bool {\n  return segment.tail != segment.id && segment.head != segment.id;\n}\n\nfn disconnect_from_head(idx: u32, segments: ptr<storage, array<Segment>, read_write>) {\n  let segment = segments[idx];\n\n  segments[segment.head].tail = segments[segment.head].id;\n  segments[idx].head = segment.id;\n}\n\nfn disconnect_from_tail(idx: u32, segments: ptr<storage, array<Segment>, read_write>) {\n  let segment = segments[idx];\n\n  segments[segment.tail].head = segments[segment.tail].id;\n  segments[idx].tail = segment.id;\n}\n\n";

/***/ }),

/***/ "./src/shaders/includes/random.wgsl":
/*!******************************************!*\
  !*** ./src/shaders/includes/random.wgsl ***!
  \******************************************/
/***/ ((module) => {

module.exports = "@group(GROUP_INDEX) @binding(RANDOM)  \n  var<storage, read_write> randomBuffer : array<vec4<u32>>;\n\nfn threefry_2x32(idx: u32) -> vec4<u32> {\n\n    let R: array<u32, 8> = array<u32, 8>(13, 15, 26, 6, 17, 29, 16, 24);\n    let C: u32 = 0x1BD11BDAu;\n\n    var state = randomBuffer[idx];\n  \n    state.x += canvas.key.x;\n    state.y += canvas.key.y;\n    state.z += canvas.key.x ^ C;\n    state.w += canvas.key.y ^ C;\n\n    for (var i = 0u; i < 8u; i++) {\n        state.x += state.z;\n        state.y += state.w;\n        state.z ^= state.x;\n        state.w ^= state.y;\n        state.z = (state.zw.x >> R[i]) | (state.zw.x << (32u - R[i]));\n        state.w = (state.zw.y >> R[i]) | (state.zw.y << (32u - R[i]));\n\n        if (i % 4u == 3u) {\n            state = vec4<u32>(state.z, state.w, state.x, state.y);\n        }\n    }\n    randomBuffer[idx] = state;\n    return state;\n}\n\nfn random_uniform(thread_id: u32) -> f32 {\n    return random_uniform_buffer(thread_id).x;\n}\n\nconst UINT32_MAX: f32 = 4294967296.0;\nfn random_uniform_buffer(thread_id: u32) -> vec4<f32> {\n\n    let random_values = threefry_2x32(thread_id);\n    return vec4<f32>(random_values) / UINT32_MAX;\n}\n\nfn random_uniform_texture(thread_id: vec2<u32>) -> vec4<f32> {\n\n    let random_values = threefry_2x32(thread_id.x + thread_id.y * u32(canvas.size.x));\n    return vec4<f32>(random_values) / UINT32_MAX;\n}";

/***/ }),

/***/ "./src/shaders/includes/textures.wgsl":
/*!********************************************!*\
  !*** ./src/shaders/includes/textures.wgsl ***!
  \********************************************/
/***/ ((module) => {

module.exports = "// Textures\n@group(GROUP_INDEX) @binding(INDEX)\n  var index_texture: texture_storage_2d_array<r32uint, read_write>;\n\n@group(GROUP_INDEX) @binding(STERIC_POTENTIAL)  \n  var steric_potential: texture_storage_2d_array<r32float, read_write>;\n\n@group(GROUP_INDEX) @binding(PARAMETER_FIELDS)  \n  var parameter_fields: texture_storage_2d_array<r32float, read_write>;\n\nconst DX = vec2i(1, 0);\nconst DY = vec2i(0, 1);\n\nconst EPS = 1e-37;\n\nfn as_r32float(r: f32) -> vec4<f32> {\n    return vec4<f32>(f32(r), 0.0, 0.0, 1.0);\n}\n\nfn as_r32uint(r: u32) -> vec4<u32> {\n    return vec4<u32>(u32(r), 0, 0, 1);\n}\n\nfn normalize_safely(x: vec2<f32>) -> vec2<f32> {\n  return x / max(length(x), EPS);\n}\n\nfn load_texture(texture: texture_storage_2d_array<r32float, read_write>, F: i32, p: vec2<i32>) -> f32 {\n  let q = p + canvas.size;\n  return textureLoad(texture, q  % canvas.size, F).r;\n}\n\nfn store_texture(texture: texture_storage_2d_array<r32float, read_write>, F: i32, p: vec2<i32>, value: f32) {\n  let q = p + canvas.size;\n  textureStore(texture, q  % canvas.size, F, as_r32float(value));\n}\n\nfn load_texture_index(F: i32, p: vec2<i32>) -> u32 {\n  let q = p + canvas.size;\n  return textureLoad(index_texture, q  % canvas.size, F).r;\n}\n\nfn store_texture_index(F: i32, p: vec2<i32>, value: u32) {\n  let q = p + canvas.size;\n  textureStore(index_texture, q  % canvas.size, F, as_r32uint(value));\n}\n\nfn as_vec2i(p: vec2<f32>) -> vec2<i32> {\n  return vec2<i32>(p + (0.5 - fract(p)));\n}\n\nfn load_steric_potential(p: vec2<i32>) -> array<f32, STERIC_POTENTIAL_DIM> {\n  var U: array<f32, STERIC_POTENTIAL_DIM>;\n  for (var i = 0; i < STERIC_POTENTIAL_DIM; i++) {\n    U[i] = load_texture(steric_potential, i, p);\n  }\n  return U;\n}\n\nfn steric_force(x: vec2<f32>, dx: vec2<f32>, coefficients: array<f32, STERIC_POTENTIAL_DIM>) -> f32 {\n  var force: f32 = 0.0;\n  for (var i = 0; i < STERIC_POTENTIAL_DIM; i++) {\n    force += coefficients[i] * (load_texture(steric_potential, i, as_vec2i(x + dx)) - load_texture(steric_potential, i, as_vec2i(x - dx))) / length(2*dx);\n  }\n  return force;\n}\n\nfn store_steric_potential(p: vec2<i32>, U: array<f32, STERIC_POTENTIAL_DIM>) {\n  for (var i = 0; i < STERIC_POTENTIAL_DIM; i++) {\n    store_texture(steric_potential, i, p, U[i]);\n  }\n}\n\nfn gaussian_blur(texture: texture_storage_2d_array<r32float, read_write>, p: vec2<i32>, F: i32, spreadAmt: f32) -> f32 {\n  return ( \n    2.0 * (  // adjacents\n      load_texture(texture, F, p + DX) + load_texture(texture, F, p - DX) + load_texture(texture, F, p + DY) + load_texture(texture, F, p - DY)\n    ) + (  // diagonals\n      load_texture(texture, F, p + DX + DY) + load_texture(texture, F, p + DX - DY) + load_texture(texture, F, p - DX + DY) + load_texture(texture, F, p - DX - DY)\n    ) + 8.0 *(  // center\n      load_texture(texture, F, p)\n    )\n  ) / (20.0 - spreadAmt);\n}\n";

/***/ }),

/***/ "./src/shaders/render.wgsl":
/*!*********************************!*\
  !*** ./src/shaders/render.wgsl ***!
  \*********************************/
/***/ ((module) => {

module.exports = "#import includes::bindings\n#import includes::textures\n#import includes::random\n\nstruct VertexOutput {\n    @builtin(position) Position : vec4f,\n    @location(0) fragUV : vec2f,\n}\n\n@group(GROUP_INDEX) @binding(CONTROLS)\n  var<uniform> controls: Controls;\n\n@vertex\nfn vert(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {\n    const pos = array(\n        vec2( 1.0,  1.0),\n        vec2( 1.0, -1.0),\n        vec2(-1.0, -1.0),\n        vec2( 1.0,  1.0),\n        vec2(-1.0, -1.0),\n        vec2(-1.0,  1.0),\n    );\n\n    const uv = array(\n        vec2(1.0, 0.0),\n        vec2(1.0, 1.0),\n        vec2(0.0, 1.0),\n        vec2(1.0, 0.0),\n        vec2(0.0, 1.0),\n        vec2(0.0, 0.0),\n    );\n\n    var output : VertexOutput;\n    output.Position = vec4(pos[VertexIndex], 0.0, 1.0);\n    output.fragUV = uv[VertexIndex];\n    return output;\n}\n\nstruct Canvas {\n    size: vec2<i32>,\n    pass_id: u32,\n    key: vec2<u32>,\n}\n\nstruct Interactions {\n    position: vec2<f32>,\n    size: f32,\n};\n\n// Uniforms\n@group(GROUP_INDEX) @binding(CANVAS) \n  var<uniform> canvas: Canvas;\n\n@group(GROUP_INDEX) @binding(INTERACTIONS)\n  var<uniform> interactions: Interactions; // for user interactions, like mouse position or touch input\n\n\n// #e40026ff\nconst red = vec4(0.894, 0.0, 0.149, 1.0);\n\n// #064164ff\nconst blue = vec4(0.024, 0.255, 0.396, 1.0);\n\n@fragment\nfn frag(@location(0) uv : vec2f) -> @location(0) vec4f {\n    let x = vec2<i32>(uv * vec2<f32>(canvas.size));\n    var color = blue / 4;\n\n    let potential = load_steric_potential(x);\n    var max_potential = 0.0;\n\n    for (var i = 0; i < STERIC_POTENTIAL_DIM; i++) {\n      max_potential = max(max_potential, potential[i]);\n    }\n    color += red * max_potential;\n\n    let idx = load_texture_index(SEGMENT_INDEX, x);\n    if (idx > 0){\n        color += vec4(1.0, 1.0, 1.0, 1.0);\n    }\n\n    return color;\n}";

/***/ }),

/***/ "./src/shaders/simulate.wgsl":
/*!***********************************!*\
  !*** ./src/shaders/simulate.wgsl ***!
  \***********************************/
/***/ ((module) => {

module.exports = "#import includes::bindings\n#import includes::textures\n#import includes::random\n#import includes::buffers\n\nstruct Canvas {\n  size: vec2<i32>,\n  pass_id: u32,\n  key: vec2<u32>,\n}\n\nstruct Interactions {\n    position: vec2<f32>,\n    size: f32,\n};\n\n// Uniforms\n@group(GROUP_INDEX) @binding(CANVAS) \n  var<uniform> canvas: Canvas;\n\n@group(GROUP_INDEX) @binding(CONTROLS)\n  var<uniform> controls: Controls;\n\n@group(GROUP_INDEX) @binding(INTERACTIONS)\n  var<uniform> interactions: Interactions; // for user interactions, like mouse position or touch input\n\nconst MEMBRANE_INDEX = 1;\n@group(GROUP_INDEX) @binding(SEGMENTS)  \n  var<storage, read_write> segments : array<Segment>;\n\nconst PI = 3.14159265358979323846;\n\n\nfn line_constraint_update(idx: u32, segments: ptr<storage, array<Segment>, read_write>) {\n  let segment = segments[idx];\n  \n  if (segment.pass_id != canvas.pass_id || is_disconnected(segment) || idx >= arrayLength(segments)) {\n    return;\n  }\n\n  let tail = segments[segment.tail];\n  let head = segments[segment.head];\n\n  let x = tail.position - segment.position;\n  let y = head.position - segment.position;\n\n  let line_distance = 2*max(0.05, 1.0 - load_texture(parameter_fields, TOUCH, as_vec2i(segment.position)));\n\n  segments[idx].position += 0.5 * ( (length(x) - line_distance) * normalize_safely(x)\n                                  + (length(y) - line_distance) * normalize_safely(y));\n}\n\nfn steric_force_update(idx: u32, segments: ptr<storage, array<Segment>, read_write>, coefficients: array<f32, STERIC_POTENTIAL_DIM>) {\n\n  if (idx >= arrayLength(segments)) {\n    return;\n  }\n  \n  var segment = segments[idx];\n  let tail = segments[segment.tail];\n  let head = segments[segment.head];\n  \n  let theta = random_uniform(idx) * 2.0 * PI;\n  let dx = (1 + f32(controls.steric_sampling_range) * random_uniform(idx)) * vec2<f32>(cos(theta), sin(theta));\n  let normal = normalize_safely(head.position - 2*segment.position + tail.position);\n\n  segments[idx].orientation = normalize_safely(tail.position - head.position);\n  segments[idx].position += -normal * dot(normalize_safely(dx), normal) * steric_force(segment.position, dx, coefficients);\n}\n\nfn biharmonic_operator(idx: u32, segments: ptr<storage, array<Segment>, read_write>) -> vec2<f32> {\n  \n  var segment = segments[idx];\n  let tail = segments[segment.tail];\n  let head = segments[segment.head];\n\n  return segments[tail.tail].position - 4*tail.position + 6*segments[idx].position - 4*head.position + segments[head.head].position;\n}\n\nfn bending_force_update(idx: u32, segments: ptr<storage, array<Segment>, read_write>, stiffness: f32) {\n  if (idx >= arrayLength(segments)) {\n    return;\n  }\n\n  segments[idx].position += -stiffness * biharmonic_operator(idx, segments);\n}\n\n@compute @workgroup_size(256)\nfn line_constraint_updates(@builtin(global_invocation_id) id : vec3u) {\n  line_constraint_update(id.x, &segments);\n}\n\n@compute @workgroup_size(256)\nfn force_updates(@builtin(global_invocation_id) id : vec3u) {\n\n  steric_force_update(id.x, &segments, array<f32, STERIC_POTENTIAL_DIM>(10.0, 10.0, 10.0));\n  bending_force_update(id.x, &segments, controls.stiffness);\n\n  segments_to_textures(id.x, &segments);\n}\n\nfn segments_to_textures(idx: u32, segments: ptr<storage, array<Segment>, read_write>) {\n  if (idx >= arrayLength(segments)) {\n    return;\n  }\n  \n  var segment = segments[idx];\n  let p = segment.position;\n\n  let line_distance = 2*max(0.05,1.0 - load_texture(parameter_fields, TOUCH, as_vec2i(segment.position)));\n\n  if line_distance >= 1.0 {\n    let draw_direction = segment.orientation;\n\n    for (var t = -line_distance/2; t <= line_distance/2; t += 1.0) {\n      let q = p + t * draw_direction;\n      store_texture(steric_potential, STERIC_SEGMENTS, as_vec2i(q), 1.0);\n      store_texture_index(SEGMENT_INDEX, as_vec2i(q), idx + 1);\n    }\n  } else {\n    let draw_direction = vec2<f32>(-segment.orientation.y, segment.orientation.x);\n    for (var t = -1/(2*line_distance); t <= 1/(2*line_distance); t += 1.0) {\n      let q = p + t * draw_direction;\n      store_texture(steric_potential, STERIC_SEGMENTS, as_vec2i(q), 1.0);\n      store_texture_index(SEGMENT_INDEX, as_vec2i(q), idx + 1);\n    }\n  }\n}\n\n@compute @workgroup_size(16, 16)\nfn texture_updates(@builtin(global_invocation_id) id : vec3u) {\n  let p = vec2i(id.xy);\n\n  store_texture(steric_potential, STERIC_SEGMENTS, p, gaussian_blur(steric_potential, p, STERIC_SEGMENTS, 0.0));\n  store_texture(parameter_fields, TOUCH, p, gaussian_blur(parameter_fields, p, TOUCH, 0.0));\n\n  let x = vec2<f32>(p) + vec2<f32>(0.5, 0.5); // center of pixel\n  let y = interactions.position;\n\n  let dims = vec2<f32>(canvas.size);\n  let distance = length((x - y) - dims * floor((x - y) / dims + 0.5));\n\n  if distance < abs(interactions.size) {\n      store_texture(parameter_fields, TOUCH, as_vec2i(x), 1.0);\n  }\n\n  let foodClick = load_texture(parameter_fields, TOUCH, p);\n  store_texture(parameter_fields, TOUCH, p, select(foodClick, foodClick - 0.0001, foodClick > 0.0));\n  store_texture(steric_potential, STERIC_SEGMENTS, p, 0.95*load_texture(steric_potential, STERIC_SEGMENTS, p));\n  store_texture(parameter_fields, TOUCH, p, 0.997*load_texture(parameter_fields, TOUCH, p));\n  store_texture_index(SEGMENT_INDEX, p, 0);\n}\n\n@compute @workgroup_size(256)\nfn reset_segments(@builtin(global_invocation_id) id : vec3u) {\n\n  let count = arrayLength(&segments);\n  let idx = id.x;\n  \n  if (idx >= count) {\n    return;\n  }\n  \n  let center = vec2<f32>(canvas.size) * 0.5;\n  let radius = min(center.x, center.y) * 0.3;\n  let angle =  2 * PI * f32(idx) / f32(count);\n\n  segments[idx].id = idx;\n  segments[idx].subtype = SEGMENTS;\n  segments[idx].pass_id = (idx + 2) % 2;\n\n  segments[idx].position.x = center.x + radius * cos(angle);\n  segments[idx].position.y = center.y + radius * sin(angle);\n\n  segments[idx].orientation.x = -sin(angle);\n  segments[idx].orientation.y = cos(angle);\n\n  segments[idx].tail = (idx + count + 1) % count;\n  segments[idx].head = (idx + count - 1) % count;\n}\n";

/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   configureCanvas: () => (/* binding */ configureCanvas),
/* harmony export */   createShader: () => (/* binding */ createShader),
/* harmony export */   getRandomValues: () => (/* binding */ getRandomValues),
/* harmony export */   requestDevice: () => (/* binding */ requestDevice),
/* harmony export */   setupInteractions: () => (/* binding */ setupInteractions),
/* harmony export */   setupTextures: () => (/* binding */ setupTextures)
/* harmony export */ });
function throwDetectionError(error) {
    document.querySelector(".webgpu-not-supported").style.visibility = "visible";
    throw new Error("Could not initialize WebGPU: " + error);
}
async function requestDevice(options = {
    powerPreference: "high-performance",
}, requiredFeatures = [], requiredLimits = {
    maxStorageTexturesPerShaderStage: 8,
}) {
    if (!navigator.gpu)
        throwDetectionError("WebGPU NOT Supported");
    const adapter = await navigator.gpu.requestAdapter(options);
    if (!adapter)
        throwDetectionError("No GPU adapter found");
    const canTimestamp = adapter.features.has("timestamp-query");
    const features = [...requiredFeatures];
    if (canTimestamp) {
        features.push("timestamp-query");
    }
    return adapter.requestDevice({
        requiredFeatures: features,
        requiredLimits: requiredLimits,
        ...(canTimestamp ? ["timestamp-query"] : []),
    });
}
function configureCanvas(device, size = { width: window.innerWidth, height: window.innerHeight }) {
    const canvas = Object.assign(document.createElement("canvas"), size);
    document.body.appendChild(canvas);
    const context = document.querySelector("canvas").getContext("webgpu");
    if (!context)
        throwDetectionError("Canvas does not support WebGPU");
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device: device,
        format: format,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
        alphaMode: "premultiplied",
    });
    return { canvas: canvas, context: context, format: format, size: size };
}
async function createShader(device, code, includes) {
    // Process the code with imports
    const processedCode = prependIncludes(code, includes);
    const module = device.createShaderModule({ code: processedCode });
    const info = await module.getCompilationInfo();
    if (info.messages.length > 0) {
        for (let message of info.messages) {
            console.warn(`${message.message} 
  at line ${message.lineNum}`);
        }
        throw new Error(`Could not compile shader`);
    }
    return module;
}
/**
 * Process import statements in shader code to include the content of referenced modules
 * @param code - The shader code containing import statements
 * @param includes - Optional mapping of module names to their content
 * @returns The processed shader code with imports resolved
 */
function prependIncludes(code, includes) {
    // Extract import statements
    const importRegex = /^#import\s+([a-zA-Z0-9_]+)::([a-zA-Z0-9_]+)/gm;
    const imports = [...code.matchAll(importRegex)];
    // Build a map of imports to their content
    const includesToAdd = {};
    // Process each import
    for (const [fullMatch, namespace, moduleName] of imports) {
        if (namespace === "includes" && includes && moduleName in includes) {
            includesToAdd[fullMatch] = includes[moduleName];
        }
        else {
            console.warn(`Could not resolve import: ${fullMatch}`);
        }
    }
    // Replace import statements with their content
    let processedCode = code;
    for (const [importStatement, content] of Object.entries(includesToAdd)) {
        // Replace the import statement with the content
        processedCode = processedCode.replace(importStatement, content);
    }
    return processedCode;
}
function setupInteractions(device, canvas, texture, size = 10) {
    let uniformBufferData = new Float32Array(4);
    let controlsBufferData = new ArrayBuffer(64);
    var sign = 1;
    let position = { x: 0, y: 0 };
    let velocity = { x: 0, y: 0 };
    uniformBufferData.set([position.x, position.y]);
    if (canvas instanceof HTMLCanvasElement) {
        // disable context menu
        canvas.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });
        // move events
        ["mousemove", "touchmove"].forEach((type) => {
            canvas.addEventListener(type, (event) => {
                const rect = canvas.getBoundingClientRect();
                let clientX = 0;
                let clientY = 0;
                if (event instanceof MouseEvent) {
                    clientX = event.clientX;
                    clientY = event.clientY;
                }
                else if (event instanceof TouchEvent) {
                    if (event.touches.length === 0)
                        return;
                    clientX = event.touches[0].clientX;
                    clientY = event.touches[0].clientY;
                }
                position.x = clientX - rect.left;
                position.y = clientY - rect.top;
                // Scale from CSS pixels to texture coordinates
                const x = Math.floor((position.x / rect.width) * texture.width);
                const y = Math.floor((position.y / rect.height) * texture.height);
                uniformBufferData.set([x, y]);
            }, { passive: true });
        });
        // zoom events TODO(@gszep) add pinch and scroll for touch devices
        ["wheel"].forEach((type) => {
            canvas.addEventListener(type, (event) => {
                switch (true) {
                    case event instanceof WheelEvent:
                        velocity.x = event.deltaY;
                        velocity.y = event.deltaY;
                        break;
                }
                size += velocity.y;
                uniformBufferData.set([size], 2);
            }, { passive: true });
        });
        // click events TODO(@gszep) implement right click equivalent for touch devices
        ["mousedown", "touchstart"].forEach((type) => {
            canvas.addEventListener(type, (event) => {
                switch (true) {
                    case event instanceof MouseEvent:
                        sign = 1 - event.button;
                        break;
                    case event instanceof TouchEvent:
                        sign = event.touches.length > 1 ? -1 : 1;
                }
                uniformBufferData.set([sign * size], 2);
            }, { passive: true });
        });
        ["mouseup", "touchend"].forEach((type) => {
            canvas.addEventListener(type, (event) => {
                uniformBufferData.set([NaN], 2);
            }, { passive: true });
        });
    }
    const uniformBuffer = device.createBuffer({
        label: "Interaction Buffer",
        size: uniformBufferData.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const controlsBuffer = device.createBuffer({
        label: "Controls Buffer",
        size: controlsBufferData.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    return {
        interactions: { data: uniformBufferData, buffer: uniformBuffer },
        controls: { data: controlsBufferData, buffer: controlsBuffer },
        type: "uniform",
    };
}
function setupTextures(device, bindings, data, size, format) {
    const textures = {};
    const bindingLayout = {};
    const depthOrArrayLayers = size.depthOrArrayLayers || {};
    const DEFAULT_FORMAT = "r32float";
    bindings.forEach((key) => {
        textures[key] = device.createTexture({
            usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_DST,
            format: format && key in format ? format[key] : DEFAULT_FORMAT,
            size: {
                width: size.width,
                height: size.height,
                depthOrArrayLayers: key in depthOrArrayLayers ? depthOrArrayLayers[key] : 1,
            },
        });
    });
    Object.keys(textures).forEach((key) => {
        const layers = key in depthOrArrayLayers ? depthOrArrayLayers[key] : 1;
        bindingLayout[key] = {
            format: format && key in format ? format[key] : DEFAULT_FORMAT,
            access: "read-write",
            viewDimension: layers > 1 ? "2d-array" : "2d",
        };
        const array = key in data ? new Float32Array(flatten(data[key])) : new Float32Array(flatten(zeros(size.height, size.width, layers)));
        const channels = channelCount(bindingLayout[key].format);
        device.queue.writeTexture({ texture: textures[key] }, 
        /*data=*/ array, 
        /*dataLayout=*/ {
            offset: 0,
            bytesPerRow: size.width * array.BYTES_PER_ELEMENT * channels,
            rowsPerImage: size.height,
        }, 
        /*size=*/ {
            width: size.width,
            height: size.height,
            depthOrArrayLayers: layers,
        });
    });
    let canvasData = new Uint32Array([size.width, size.height, 0, 0, 0, 0]);
    const canvasBuffer = device.createBuffer({
        label: "Canvas Buffer",
        size: canvasData.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(canvasBuffer, /*offset=*/ 0, /*data=*/ canvasData);
    return {
        canvas: {
            buffer: canvasBuffer,
            data: canvasData,
            type: "uniform",
        },
        textures: textures,
        bindingLayout: bindingLayout,
        size: size,
    };
}
function channelCount(format) {
    if (format.includes("rgba")) {
        return 4;
    }
    else if (format.includes("rgb")) {
        return 3;
    }
    else if (format.includes("rg")) {
        return 2;
    }
    else if (format.includes("r")) {
        return 1;
    }
    else {
        throw new Error("Invalid format: " + format);
    }
}
function flatten(nestedArray) {
    const flattened = [];
    for (let k = 0; k < nestedArray[0][0].length; k++) {
        for (let i = 0; i < nestedArray.length; i++) {
            for (let j = 0; j < nestedArray[0].length; j++) {
                flattened.push(nestedArray[i][j][k]);
            }
        }
    }
    return flattened;
}
function zeros(height, width, layers = 1) {
    const zeroArray = [];
    for (let i = 0; i < height; i++) {
        const row = [];
        for (let j = 0; j < width; j++) {
            const layer = [];
            for (let k = 0; k < layers; k++) {
                layer.push(0);
            }
            row.push(layer);
        }
        zeroArray.push(row);
    }
    return zeroArray;
}
function getRandomValues(length) {
    // fast cpu-side random number generation
    const maxChunkLength = 65536 / 4;
    const result = new Uint32Array(4 * length);
    for (let i = 0; i < 4 * length; i += maxChunkLength) {
        const chunkLength = Math.min(maxChunkLength, 4 * length - i);
        crypto.getRandomValues(result.subarray(i, i + chunkLength));
    }
    return result;
}


/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("./src/index.ts"));
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQy9CLE1BQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQztZQUMzQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ2hDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsQ0FBQztZQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEIsQ0FBQztRQUNELFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFFTSxTQUFTLGVBQWUsQ0FBQyxNQUFjO0lBQzVDLHlDQUF5QztJQUV6QyxNQUFNLGNBQWMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ2pDLE1BQU0sTUFBTSxHQUFHLElBQUksV0FBVyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztJQUMzQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLElBQUksY0FBYyxFQUFFLENBQUM7UUFDcEQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM3RCxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3V0aWxzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJlcXVlc3REZXZpY2UsIGNvbmZpZ3VyZUNhbnZhcywgY3JlYXRlU2hhZGVyLCBzZXR1cEludGVyYWN0aW9ucywgc2V0dXBUZXh0dXJlcywgZ2V0UmFuZG9tVmFsdWVzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCByZW5kZXJDb2RlIGZyb20gXCIuL3NoYWRlcnMvcmVuZGVyLndnc2xcIjtcbmltcG9ydCBzaW11bGF0ZUNvZGUgZnJvbSBcIi4vc2hhZGVycy9zaW11bGF0ZS53Z3NsXCI7XG5cbmltcG9ydCBiaW5kaW5nc0NvZGUgZnJvbSBcIi4vc2hhZGVycy9pbmNsdWRlcy9iaW5kaW5ncy53Z3NsXCI7XG5pbXBvcnQgdGV4dHVyZXNDb2RlIGZyb20gXCIuL3NoYWRlcnMvaW5jbHVkZXMvdGV4dHVyZXMud2dzbFwiO1xuaW1wb3J0IGJ1ZmZlcnNDb2RlIGZyb20gXCIuL3NoYWRlcnMvaW5jbHVkZXMvYnVmZmVycy53Z3NsXCI7XG5pbXBvcnQgcmFuZG9tQ29kZSBmcm9tIFwiLi9zaGFkZXJzL2luY2x1ZGVzL3JhbmRvbS53Z3NsXCI7XG5cbmNvbnN0IHNoYWRlckluY2x1ZGVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICBiaW5kaW5nczogYmluZGluZ3NDb2RlLFxuICB0ZXh0dXJlczogdGV4dHVyZXNDb2RlLFxuICBidWZmZXJzOiBidWZmZXJzQ29kZSxcbiAgcmFuZG9tOiByYW5kb21Db2RlLFxufTtcblxuY29uc3Qgc2l6ZTMyID0gNDtcblxuY29uc3QgdW5pZm9ybXMgPSB7XG4gIGNvbXB1dGVTdGVwc1BlckZyYW1lOiAxLFxuICB0YXJnZXRGUFM6IDEyMCxcbiAgc2VnbWVudENvdW50OiAxMDAwMDAsXG4gIHN0aWZmbmVzczogMC4xMixcbiAgc3RlcmljU2FtcGxpbmdSYW5nZTogMTYsXG4gIGVxdWlsaWJyaXVtTGluZURpc3RhbmNlOiAxLjAsXG59O1xuXG5hc3luYyBmdW5jdGlvbiBpbmRleCgpIHtcbiAgY29uc3QgZGV2aWNlID0gYXdhaXQgcmVxdWVzdERldmljZSgpO1xuICBjb25zdCBjYW52YXMgPSBjb25maWd1cmVDYW52YXMoZGV2aWNlKTtcblxuICBjb25zdCBHUk9VUF9JTkRFWCA9IDA7XG4gIGNvbnN0IEJJTkRJTkdTX0JVRkZFUiA9IHsgQ0FOVkFTOiAwLCBDT05UUk9MUzogMSwgSU5URVJBQ1RJT05TOiAyIH07XG4gIGNvbnN0IEJJTkRJTkdTX1RFWFRVUkUgPSB7XG4gICAgSU5ERVg6IDMsXG4gICAgU1RFUklDX1BPVEVOVElBTDogNCxcbiAgICBQQVJBTUVURVJfRklFTERTOiA1LFxuICB9O1xuXG4gIGNvbnN0IEJJTkRJTkdTX1NFR01FTlRTID0ge1xuICAgIFJBTkRPTTogNixcbiAgICBTRUdNRU5UUzogNyxcbiAgfTtcblxuICBjb25zdCB0ZXh0dXJlcyA9IHNldHVwVGV4dHVyZXMoXG4gICAgZGV2aWNlLFxuICAgIE9iamVjdC52YWx1ZXMoQklORElOR1NfVEVYVFVSRSksXG4gICAge30sXG4gICAge1xuICAgICAgZGVwdGhPckFycmF5TGF5ZXJzOiB7XG4gICAgICAgIFtCSU5ESU5HU19URVhUVVJFLlNURVJJQ19QT1RFTlRJQUxdOiAzLFxuICAgICAgICBbQklORElOR1NfVEVYVFVSRS5QQVJBTUVURVJfRklFTERTXTogNCxcbiAgICAgICAgW0JJTkRJTkdTX1RFWFRVUkUuSU5ERVhdOiAzLFxuICAgICAgfSxcbiAgICAgIHdpZHRoOiBjYW52YXMuc2l6ZS53aWR0aCxcbiAgICAgIGhlaWdodDogY2FudmFzLnNpemUuaGVpZ2h0LFxuICAgIH0sXG4gICAge1xuICAgICAgW0JJTkRJTkdTX1RFWFRVUkUuU1RFUklDX1BPVEVOVElBTF06IFwicjMyZmxvYXRcIixcbiAgICAgIFtCSU5ESU5HU19URVhUVVJFLlBBUkFNRVRFUl9GSUVMRFNdOiBcInIzMmZsb2F0XCIsXG4gICAgICBbQklORElOR1NfVEVYVFVSRS5JTkRFWF06IFwicjMydWludFwiLFxuICAgIH1cbiAgKTtcblxuICBjb25zdCBXT1JLR1JPVVBfU0laRSA9IDI1NjtcbiAgY29uc3QgVEVYVFVSRV9XT1JLR1JPVVBfQ09VTlQ6IFtudW1iZXIsIG51bWJlcl0gPSBbXG4gICAgTWF0aC5jZWlsKHRleHR1cmVzLnNpemUud2lkdGggLyBNYXRoLnNxcnQoV09SS0dST1VQX1NJWkUpKSxcbiAgICBNYXRoLmNlaWwodGV4dHVyZXMuc2l6ZS5oZWlnaHQgLyBNYXRoLnNxcnQoV09SS0dST1VQX1NJWkUpKSxcbiAgXTtcblxuICBjb25zdCBCVUZGRVJfV09SS0dST1VQX0NPVU5UID0ge1xuICAgIFNFR01FTlRTOiBNYXRoLmNlaWwodW5pZm9ybXMuc2VnbWVudENvdW50IC8gV09SS0dST1VQX1NJWkUpLFxuICB9O1xuICBjb25zdCBNQVhfQlVGRkVSX1dPUktHUk9VUF9DT1VOVCA9IE1hdGgubWF4KC4uLk9iamVjdC52YWx1ZXMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVCkpO1xuXG4gIGNvbnN0IGludGVyYWN0aW9ucyA9IHNldHVwSW50ZXJhY3Rpb25zKGRldmljZSwgY2FudmFzLmNvbnRleHQuY2FudmFzLCB0ZXh0dXJlcy5zaXplKTtcbiAgY29uc3QgY2FudmFzX2J1ZmZlcnMgPSB7XG4gICAgW0JJTkRJTkdTX0JVRkZFUi5DQU5WQVNdOiB0ZXh0dXJlcy5jYW52YXMuYnVmZmVyLFxuICAgIFtCSU5ESU5HU19CVUZGRVIuQ09OVFJPTFNdOiBpbnRlcmFjdGlvbnMuY29udHJvbHMuYnVmZmVyLFxuICAgIFtCSU5ESU5HU19CVUZGRVIuSU5URVJBQ1RJT05TXTogaW50ZXJhY3Rpb25zLmludGVyYWN0aW9ucy5idWZmZXIsXG4gIH07XG5cbiAgY29uc3QgY29udHJvbHNEYXRhVmlldyA9IG5ldyBEYXRhVmlldyhpbnRlcmFjdGlvbnMuY29udHJvbHMuZGF0YSk7XG4gIGNvbnN0IGNhbnZhc1ZpZXcgPSBuZXcgRGF0YVZpZXcodGV4dHVyZXMuY2FudmFzLmRhdGEuYnVmZmVyKTtcblxuICBjb25zdCB3cml0ZVVuaWZvcm1zID0gKCkgPT4ge1xuICAgIGNhbnZhc1ZpZXcuc2V0SW50MzIoMCwgdGV4dHVyZXMuc2l6ZS53aWR0aCwgdHJ1ZSk7XG4gICAgY2FudmFzVmlldy5zZXRJbnQzMig0LCB0ZXh0dXJlcy5zaXplLmhlaWdodCwgdHJ1ZSk7XG5cbiAgICBjYW52YXNWaWV3LnNldFVpbnQzMigxMiwgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDMyQXJyYXkoMSkpWzBdLCB0cnVlKTtcbiAgICBjYW52YXNWaWV3LnNldFVpbnQzMigxNiwgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDMyQXJyYXkoMSkpWzBdLCB0cnVlKTtcblxuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigwLCB1bmlmb3Jtcy5zdGlmZm5lc3MsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDQsIHVuaWZvcm1zLnN0ZXJpY1NhbXBsaW5nUmFuZ2UsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMig4LCB1bmlmb3Jtcy5lcXVpbGlicml1bUxpbmVEaXN0YW5jZSwgdHJ1ZSk7XG5cbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoaW50ZXJhY3Rpb25zLmNvbnRyb2xzLmJ1ZmZlciwgMCwgaW50ZXJhY3Rpb25zLmNvbnRyb2xzLmRhdGEpO1xuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcih0ZXh0dXJlcy5jYW52YXMuYnVmZmVyLCAwLCB0ZXh0dXJlcy5jYW52YXMuZGF0YSk7XG4gIH07XG5cbiAgd3JpdGVVbmlmb3JtcygpO1xuICBjb25zdCByYW5kb21CdWZmZXJTaXplID0gTWF0aC5tYXgodGV4dHVyZXMuc2l6ZS53aWR0aCAqIHRleHR1cmVzLnNpemUuaGVpZ2h0LCB1bmlmb3Jtcy5zZWdtZW50Q291bnQpO1xuXG4gIC8vIGluaXRpYWxpemUgcmFuZG9tIGJ1ZmZlclxuICBjb25zdCByYW5kb21EYXRhID0gZ2V0UmFuZG9tVmFsdWVzKHJhbmRvbUJ1ZmZlclNpemUpO1xuXG4gIGNvbnN0IGFnZW50X2J1ZmZlcnMgPSB7XG4gICAgW0JJTkRJTkdTX1NFR01FTlRTLlJBTkRPTV06IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgbGFiZWw6IFwiUmFuZG9tIEJ1ZmZlclwiLFxuICAgICAgc2l6ZTogcmFuZG9tRGF0YS5ieXRlTGVuZ3RoLFxuICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgICB9KSxcbiAgICBbQklORElOR1NfU0VHTUVOVFMuU0VHTUVOVFNdOiBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgIHNpemU6IHNpemUzMiAqIDEwICogdW5pZm9ybXMuc2VnbWVudENvdW50LFxuICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UsXG4gICAgfSksXG4gIH07XG5cbiAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGFnZW50X2J1ZmZlcnNbQklORElOR1NfU0VHTUVOVFMuUkFORE9NXSwgLypvZmZzZXQ9Ki8gMCwgLypkYXRhPSovIHJhbmRvbURhdGEpO1xuXG4gIGNvbnN0IHZpc2liaWxpdHkgPSBHUFVTaGFkZXJTdGFnZS5DT01QVVRFIHwgR1BVU2hhZGVyU3RhZ2UuRlJBR01FTlQ7XG4gIGNvbnN0IGJpbmRHcm91cExheW91dCA9IGRldmljZS5jcmVhdGVCaW5kR3JvdXBMYXlvdXQoe1xuICAgIGxhYmVsOiBcImJpbmRHcm91cExheW91dFwiLFxuICAgIGVudHJpZXM6IFtcbiAgICAgIC4uLk9iamVjdC52YWx1ZXMoQklORElOR1NfVEVYVFVSRSkubWFwKChiaW5kaW5nKSA9PiAoe1xuICAgICAgICBiaW5kaW5nOiBiaW5kaW5nLFxuICAgICAgICB2aXNpYmlsaXR5OiB2aXNpYmlsaXR5LFxuICAgICAgICBzdG9yYWdlVGV4dHVyZTogdGV4dHVyZXMuYmluZGluZ0xheW91dFtiaW5kaW5nXSxcbiAgICAgIH0pKSxcbiAgICAgIC4uLk9iamVjdC52YWx1ZXMoQklORElOR1NfQlVGRkVSKS5tYXAoKGJpbmRpbmcpID0+ICh7XG4gICAgICAgIGJpbmRpbmc6IGJpbmRpbmcsXG4gICAgICAgIHZpc2liaWxpdHk6IHZpc2liaWxpdHksXG4gICAgICAgIGJ1ZmZlcjogeyB0eXBlOiBcInVuaWZvcm1cIiBhcyBHUFVCdWZmZXJCaW5kaW5nVHlwZSB9LFxuICAgICAgfSkpLFxuICAgICAgLi4uT2JqZWN0LnZhbHVlcyhCSU5ESU5HU19TRUdNRU5UUykubWFwKChiaW5kaW5nKSA9PiAoe1xuICAgICAgICBiaW5kaW5nOiBiaW5kaW5nLFxuICAgICAgICB2aXNpYmlsaXR5OiB2aXNpYmlsaXR5LFxuICAgICAgICBidWZmZXI6IHsgdHlwZTogXCJzdG9yYWdlXCIgYXMgR1BVQnVmZmVyQmluZGluZ1R5cGUgfSxcbiAgICAgIH0pKSxcbiAgICBdLFxuICB9KTtcblxuICBjb25zdCBiaW5kR3JvdXAgPSBkZXZpY2UuY3JlYXRlQmluZEdyb3VwKHtcbiAgICBsYWJlbDogYEJpbmQgR3JvdXBgLFxuICAgIGxheW91dDogYmluZEdyb3VwTGF5b3V0LFxuICAgIGVudHJpZXM6IFtcbiAgICAgIC4uLk9iamVjdC52YWx1ZXMoQklORElOR1NfVEVYVFVSRSkubWFwKChiaW5kaW5nKSA9PiAoe1xuICAgICAgICBiaW5kaW5nOiBiaW5kaW5nLFxuICAgICAgICByZXNvdXJjZTogdGV4dHVyZXMudGV4dHVyZXNbYmluZGluZ10uY3JlYXRlVmlldygpLFxuICAgICAgfSkpLFxuICAgICAgLi4uT2JqZWN0LnZhbHVlcyhCSU5ESU5HU19CVUZGRVIpLm1hcCgoYmluZGluZykgPT4gKHtcbiAgICAgICAgYmluZGluZzogYmluZGluZyxcbiAgICAgICAgcmVzb3VyY2U6IHtcbiAgICAgICAgICBidWZmZXI6IGNhbnZhc19idWZmZXJzW2JpbmRpbmddLFxuICAgICAgICB9LFxuICAgICAgfSkpLFxuICAgICAgLi4uT2JqZWN0LnZhbHVlcyhCSU5ESU5HU19TRUdNRU5UUykubWFwKChiaW5kaW5nKSA9PiAoe1xuICAgICAgICBiaW5kaW5nOiBiaW5kaW5nLFxuICAgICAgICByZXNvdXJjZToge1xuICAgICAgICAgIGJ1ZmZlcjogYWdlbnRfYnVmZmVyc1tiaW5kaW5nXSxcbiAgICAgICAgfSxcbiAgICAgIH0pKSxcbiAgICBdLFxuICB9KTtcblxuICBjb25zdCBwaXBlbGluZUxheW91dCA9IGRldmljZS5jcmVhdGVQaXBlbGluZUxheW91dCh7XG4gICAgbGFiZWw6IFwicGlwZWxpbmVMYXlvdXRcIixcbiAgICBiaW5kR3JvdXBMYXlvdXRzOiBbYmluZEdyb3VwTGF5b3V0XSxcbiAgfSk7XG5cbiAgZnVuY3Rpb24gc3VibWl0Q29tcHV0ZVBhc3MoZGV2aWNlOiBHUFVEZXZpY2UsIHBpcGVsaW5lOiBHUFVDb21wdXRlUGlwZWxpbmUsIHdvcmtncm91cENvdW50OiBudW1iZXIsIHBhc3NJZHM6IG51bWJlcltdID0gWzBdKSB7XG4gICAgcGFzc0lkcy5mb3JFYWNoKChwYXNzSWQsIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgICBjb25zdCBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG5cbiAgICAgIHBhc3Muc2V0QmluZEdyb3VwKEdST1VQX0lOREVYLCBiaW5kR3JvdXApO1xuICAgICAgcGFzcy5zZXRQaXBlbGluZShwaXBlbGluZSk7XG5cbiAgICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcih0ZXh0dXJlcy5jYW52YXMuYnVmZmVyLCAyICogc2l6ZTMyLCBuZXcgVWludDMyQXJyYXkoW3Bhc3NJZF0pKTtcbiAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKHdvcmtncm91cENvdW50KTtcblxuICAgICAgcGFzcy5lbmQoKTtcbiAgICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gU2V0IHVwIGNvZGUgaW5zdHJ1Y3Rpb25zXG4gIGNvbnN0IG1vZHVsZSA9IGF3YWl0IGNyZWF0ZVNoYWRlcihkZXZpY2UsIHNpbXVsYXRlQ29kZSwgc2hhZGVySW5jbHVkZXMpO1xuXG4gIGNvbnN0IHJlc2V0U2VnbWVudHNQaXBlbGluZSA9IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoe1xuICAgIGxheW91dDogcGlwZWxpbmVMYXlvdXQsXG4gICAgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwicmVzZXRfc2VnbWVudHNcIiB9LFxuICB9KTtcblxuICBjb25zdCB0ZXh0dXJlc1BpcGVsaW5lID0gZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7XG4gICAgbGF5b3V0OiBwaXBlbGluZUxheW91dCxcbiAgICBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJ0ZXh0dXJlX3VwZGF0ZXNcIiB9LFxuICB9KTtcblxuICBjb25zdCBzdGVyaWNGb3JjZXNQaXBlbGluZSA9IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoe1xuICAgIGxheW91dDogcGlwZWxpbmVMYXlvdXQsXG4gICAgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiZm9yY2VfdXBkYXRlc1wiIH0sXG4gIH0pO1xuXG4gIGNvbnN0IGxpbmVDb25zdHJhaW50UGlwZWxpbmUgPSBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHtcbiAgICBsYXlvdXQ6IHBpcGVsaW5lTGF5b3V0LFxuICAgIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImxpbmVfY29uc3RyYWludF91cGRhdGVzXCIgfSxcbiAgfSk7XG5cbiAgLy8gVHJhZGl0aW9uYWwgcmVuZGVyIHBpcGVsaW5lIG9mIHZlcnQgLT4gZnJhZ1xuICBjb25zdCByZW5kZXJNb2R1bGUgPSBhd2FpdCBjcmVhdGVTaGFkZXIoZGV2aWNlLCByZW5kZXJDb2RlLCBzaGFkZXJJbmNsdWRlcyk7XG5cbiAgY29uc3QgcmVuZGVyUGlwZWxpbmUgPSBkZXZpY2UuY3JlYXRlUmVuZGVyUGlwZWxpbmUoe1xuICAgIGxhYmVsOiBcIlJlbmRlciBQaXBlbGluZVwiLFxuICAgIGxheW91dDogcGlwZWxpbmVMYXlvdXQsXG4gICAgdmVydGV4OiB7XG4gICAgICBtb2R1bGU6IHJlbmRlck1vZHVsZSxcbiAgICAgIGVudHJ5UG9pbnQ6IFwidmVydFwiLFxuICAgIH0sXG4gICAgZnJhZ21lbnQ6IHtcbiAgICAgIG1vZHVsZTogcmVuZGVyTW9kdWxlLFxuICAgICAgZW50cnlQb2ludDogXCJmcmFnXCIsXG4gICAgICB0YXJnZXRzOiBbeyBmb3JtYXQ6IGNhbnZhcy5mb3JtYXQgfV0sIC8vIFN0YWdlIDEgcmVuZGVycyB0byBpbnRlcm1lZGlhdGUgdGV4dHVyZVxuICAgIH0sXG4gICAgcHJpbWl0aXZlOiB7XG4gICAgICB0b3BvbG9neTogXCJ0cmlhbmdsZS1saXN0XCIsXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBSVU4gdGhlIHJlc2V0IHNoYWRlciBmdW5jdGlvblxuICBjb25zdCByZXNldCA9ICgpID0+IHtcbiAgICAvLyBVbmlmb3JtcyBhcmUgcG90ZW50aWFsbHkgY2hhbmdlZCBieSBHVUkgYmVmb3JlIHJlc2V0LCBzbyB3cml0ZSB0aGVtLlxuICAgIHdyaXRlVW5pZm9ybXMoKTtcblxuICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICBjb25zdCBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG5cbiAgICBwYXNzLnNldEJpbmRHcm91cChHUk9VUF9JTkRFWCwgYmluZEdyb3VwKTtcblxuICAgIHBhc3Muc2V0UGlwZWxpbmUocmVzZXRTZWdtZW50c1BpcGVsaW5lKTtcbiAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULlNFR01FTlRTKTtcblxuICAgIHBhc3MuZW5kKCk7XG4gICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICB9O1xuICByZXNldCgpO1xuXG4gIC8vIFJVTiB0aGUgc2ltIGNvbXB1dGUgZnVuY3Rpb24gYW5kIHJlbmRlciBwaXhlbHNcbiAgZnVuY3Rpb24gdGltZXN0ZXAoKSB7XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGludGVyYWN0aW9ucy5pbnRlcmFjdGlvbnMuYnVmZmVyLCAwLCBpbnRlcmFjdGlvbnMuaW50ZXJhY3Rpb25zLmRhdGEpO1xuXG4gICAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgIGNvbnN0IHBhc3MgPSBlbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3Moe30pO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICBwYXNzLnNldEJpbmRHcm91cChHUk9VUF9JTkRFWCwgYmluZEdyb3VwKTtcblxuICAgICAgcGFzcy5zZXRQaXBlbGluZSh0ZXh0dXJlc1BpcGVsaW5lKTtcbiAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKC4uLlRFWFRVUkVfV09SS0dST1VQX0NPVU5UKTtcblxuICAgICAgcGFzcy5zZXRQaXBlbGluZShzdGVyaWNGb3JjZXNQaXBlbGluZSk7XG4gICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhNQVhfQlVGRkVSX1dPUktHUk9VUF9DT1VOVCk7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgICBzdWJtaXRDb21wdXRlUGFzcyhkZXZpY2UsIGxpbmVDb25zdHJhaW50UGlwZWxpbmUsIE1BWF9CVUZGRVJfV09SS0dST1VQX0NPVU5ULCBbMCwgMV0pO1xuICAgICAgfVxuICAgIH1cbiAgICBwYXNzLmVuZCgpO1xuXG4gICAgY29uc3QgcmVuZGVyUGFzcyA9IGVuY29kZXIuYmVnaW5SZW5kZXJQYXNzKHtcbiAgICAgIGNvbG9yQXR0YWNobWVudHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHZpZXc6IGNhbnZhcy5jb250ZXh0LmdldEN1cnJlbnRUZXh0dXJlKCkuY3JlYXRlVmlldygpLFxuICAgICAgICAgIGxvYWRPcDogXCJsb2FkXCIsXG4gICAgICAgICAgc3RvcmVPcDogXCJzdG9yZVwiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcbiAgICByZW5kZXJQYXNzLnNldFBpcGVsaW5lKHJlbmRlclBpcGVsaW5lKTtcbiAgICByZW5kZXJQYXNzLnNldEJpbmRHcm91cChHUk9VUF9JTkRFWCwgYmluZEdyb3VwKTtcblxuICAgIHJlbmRlclBhc3MuZHJhdyg2LCAxLCAwLCAwKTtcbiAgICByZW5kZXJQYXNzLmVuZCgpO1xuICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgfVxuXG4gIGxldCBsYXN0RnJhbWVUaW1lID0gMDtcbiAgY29uc3QgZ2V0RnJhbWVJbnRlcnZhbCA9ICgpID0+IDEwMDAgLyB1bmlmb3Jtcy50YXJnZXRGUFM7IC8vIENvbnZlcnQgRlBTIHRvIG1pbGxpc2Vjb25kc1xuXG4gIGZ1bmN0aW9uIGZyYW1lKGN1cnJlbnRUaW1lOiBudW1iZXIpIHtcbiAgICAvLyBDaGVjayBpZiBlbm91Z2ggdGltZSBoYXMgcGFzc2VkIGJhc2VkIG9uIHRhcmdldCBGUFNcbiAgICBpZiAoY3VycmVudFRpbWUgLSBsYXN0RnJhbWVUaW1lID49IGdldEZyYW1lSW50ZXJ2YWwoKSkge1xuICAgICAgdGltZXN0ZXAoKTtcbiAgICAgIGxhc3RGcmFtZVRpbWUgPSBjdXJyZW50VGltZTtcbiAgICB9XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcbiAgfVxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xuICByZXR1cm47XG59XG5cbmluZGV4KCk7XG4iLCJmdW5jdGlvbiB0aHJvd0RldGVjdGlvbkVycm9yKGVycm9yOiBzdHJpbmcpOiBuZXZlciB7XG4gIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLndlYmdwdS1ub3Qtc3VwcG9ydGVkXCIpIGFzIEhUTUxFbGVtZW50KS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBpbml0aWFsaXplIFdlYkdQVTogXCIgKyBlcnJvcik7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXF1ZXN0RGV2aWNlKFxuICBvcHRpb25zOiBHUFVSZXF1ZXN0QWRhcHRlck9wdGlvbnMgPSB7XG4gICAgcG93ZXJQcmVmZXJlbmNlOiBcImhpZ2gtcGVyZm9ybWFuY2VcIixcbiAgfSxcbiAgcmVxdWlyZWRGZWF0dXJlczogR1BVRmVhdHVyZU5hbWVbXSA9IFtdLFxuICByZXF1aXJlZExpbWl0czogUmVjb3JkPHN0cmluZywgdW5kZWZpbmVkIHwgbnVtYmVyPiA9IHtcbiAgICBtYXhTdG9yYWdlVGV4dHVyZXNQZXJTaGFkZXJTdGFnZTogOCxcbiAgfVxuKTogUHJvbWlzZTxHUFVEZXZpY2U+IHtcbiAgaWYgKCFuYXZpZ2F0b3IuZ3B1KSB0aHJvd0RldGVjdGlvbkVycm9yKFwiV2ViR1BVIE5PVCBTdXBwb3J0ZWRcIik7XG5cbiAgY29uc3QgYWRhcHRlciA9IGF3YWl0IG5hdmlnYXRvci5ncHUucmVxdWVzdEFkYXB0ZXIob3B0aW9ucyk7XG4gIGlmICghYWRhcHRlcikgdGhyb3dEZXRlY3Rpb25FcnJvcihcIk5vIEdQVSBhZGFwdGVyIGZvdW5kXCIpO1xuXG4gIGNvbnN0IGNhblRpbWVzdGFtcCA9IGFkYXB0ZXIuZmVhdHVyZXMuaGFzKFwidGltZXN0YW1wLXF1ZXJ5XCIpO1xuICBjb25zdCBmZWF0dXJlcyA9IFsuLi5yZXF1aXJlZEZlYXR1cmVzXTtcblxuICBpZiAoY2FuVGltZXN0YW1wKSB7XG4gICAgZmVhdHVyZXMucHVzaChcInRpbWVzdGFtcC1xdWVyeVwiKTtcbiAgfVxuXG4gIHJldHVybiBhZGFwdGVyLnJlcXVlc3REZXZpY2Uoe1xuICAgIHJlcXVpcmVkRmVhdHVyZXM6IGZlYXR1cmVzLFxuICAgIHJlcXVpcmVkTGltaXRzOiByZXF1aXJlZExpbWl0cyxcbiAgICAuLi4oY2FuVGltZXN0YW1wID8gW1widGltZXN0YW1wLXF1ZXJ5XCJdIDogW10pLFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZUNhbnZhcyhcbiAgZGV2aWNlOiBHUFVEZXZpY2UsXG4gIHNpemUgPSB7IHdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCwgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfVxuKToge1xuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuICBjb250ZXh0OiBHUFVDYW52YXNDb250ZXh0O1xuICBmb3JtYXQ6IEdQVVRleHR1cmVGb3JtYXQ7XG4gIHNpemU6IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfTtcbn0ge1xuICBjb25zdCBjYW52YXMgPSBPYmplY3QuYXNzaWduKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiksIHNpemUpO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XG5cbiAgY29uc3QgY29udGV4dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJjYW52YXNcIikhLmdldENvbnRleHQoXCJ3ZWJncHVcIik7XG4gIGlmICghY29udGV4dCkgdGhyb3dEZXRlY3Rpb25FcnJvcihcIkNhbnZhcyBkb2VzIG5vdCBzdXBwb3J0IFdlYkdQVVwiKTtcblxuICBjb25zdCBmb3JtYXQgPSBuYXZpZ2F0b3IuZ3B1LmdldFByZWZlcnJlZENhbnZhc0Zvcm1hdCgpO1xuICBjb250ZXh0LmNvbmZpZ3VyZSh7XG4gICAgZGV2aWNlOiBkZXZpY2UsXG4gICAgZm9ybWF0OiBmb3JtYXQsXG4gICAgdXNhZ2U6IEdQVVRleHR1cmVVc2FnZS5SRU5ERVJfQVRUQUNITUVOVCxcbiAgICBhbHBoYU1vZGU6IFwicHJlbXVsdGlwbGllZFwiLFxuICB9KTtcblxuICByZXR1cm4geyBjYW52YXM6IGNhbnZhcywgY29udGV4dDogY29udGV4dCwgZm9ybWF0OiBmb3JtYXQsIHNpemU6IHNpemUgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVNoYWRlcihkZXZpY2U6IEdQVURldmljZSwgY29kZTogc3RyaW5nLCBpbmNsdWRlcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBQcm9taXNlPEdQVVNoYWRlck1vZHVsZT4ge1xuICAvLyBQcm9jZXNzIHRoZSBjb2RlIHdpdGggaW1wb3J0c1xuICBjb25zdCBwcm9jZXNzZWRDb2RlID0gcHJlcGVuZEluY2x1ZGVzKGNvZGUsIGluY2x1ZGVzKTtcblxuICBjb25zdCBtb2R1bGUgPSBkZXZpY2UuY3JlYXRlU2hhZGVyTW9kdWxlKHsgY29kZTogcHJvY2Vzc2VkQ29kZSB9KTtcbiAgY29uc3QgaW5mbyA9IGF3YWl0IG1vZHVsZS5nZXRDb21waWxhdGlvbkluZm8oKTtcbiAgaWYgKGluZm8ubWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgIGZvciAobGV0IG1lc3NhZ2Ugb2YgaW5mby5tZXNzYWdlcykge1xuICAgICAgY29uc29sZS53YXJuKGAke21lc3NhZ2UubWVzc2FnZX0gXG4gIGF0IGxpbmUgJHttZXNzYWdlLmxpbmVOdW19YCk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGNvbXBpbGUgc2hhZGVyYCk7XG4gIH1cbiAgcmV0dXJuIG1vZHVsZTtcbn1cblxuLyoqXG4gKiBQcm9jZXNzIGltcG9ydCBzdGF0ZW1lbnRzIGluIHNoYWRlciBjb2RlIHRvIGluY2x1ZGUgdGhlIGNvbnRlbnQgb2YgcmVmZXJlbmNlZCBtb2R1bGVzXG4gKiBAcGFyYW0gY29kZSAtIFRoZSBzaGFkZXIgY29kZSBjb250YWluaW5nIGltcG9ydCBzdGF0ZW1lbnRzXG4gKiBAcGFyYW0gaW5jbHVkZXMgLSBPcHRpb25hbCBtYXBwaW5nIG9mIG1vZHVsZSBuYW1lcyB0byB0aGVpciBjb250ZW50XG4gKiBAcmV0dXJucyBUaGUgcHJvY2Vzc2VkIHNoYWRlciBjb2RlIHdpdGggaW1wb3J0cyByZXNvbHZlZFxuICovXG5mdW5jdGlvbiBwcmVwZW5kSW5jbHVkZXMoY29kZTogc3RyaW5nLCBpbmNsdWRlcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBzdHJpbmcge1xuICAvLyBFeHRyYWN0IGltcG9ydCBzdGF0ZW1lbnRzXG4gIGNvbnN0IGltcG9ydFJlZ2V4ID0gL14jaW1wb3J0XFxzKyhbYS16QS1aMC05X10rKTo6KFthLXpBLVowLTlfXSspL2dtO1xuICBjb25zdCBpbXBvcnRzID0gWy4uLmNvZGUubWF0Y2hBbGwoaW1wb3J0UmVnZXgpXTtcblxuICAvLyBCdWlsZCBhIG1hcCBvZiBpbXBvcnRzIHRvIHRoZWlyIGNvbnRlbnRcbiAgY29uc3QgaW5jbHVkZXNUb0FkZDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuXG4gIC8vIFByb2Nlc3MgZWFjaCBpbXBvcnRcbiAgZm9yIChjb25zdCBbZnVsbE1hdGNoLCBuYW1lc3BhY2UsIG1vZHVsZU5hbWVdIG9mIGltcG9ydHMpIHtcbiAgICBpZiAobmFtZXNwYWNlID09PSBcImluY2x1ZGVzXCIgJiYgaW5jbHVkZXMgJiYgbW9kdWxlTmFtZSBpbiBpbmNsdWRlcykge1xuICAgICAgaW5jbHVkZXNUb0FkZFtmdWxsTWF0Y2hdID0gaW5jbHVkZXNbbW9kdWxlTmFtZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihgQ291bGQgbm90IHJlc29sdmUgaW1wb3J0OiAke2Z1bGxNYXRjaH1gKTtcbiAgICB9XG4gIH1cblxuICAvLyBSZXBsYWNlIGltcG9ydCBzdGF0ZW1lbnRzIHdpdGggdGhlaXIgY29udGVudFxuICBsZXQgcHJvY2Vzc2VkQ29kZSA9IGNvZGU7XG4gIGZvciAoY29uc3QgW2ltcG9ydFN0YXRlbWVudCwgY29udGVudF0gb2YgT2JqZWN0LmVudHJpZXMoaW5jbHVkZXNUb0FkZCkpIHtcbiAgICAvLyBSZXBsYWNlIHRoZSBpbXBvcnQgc3RhdGVtZW50IHdpdGggdGhlIGNvbnRlbnRcbiAgICBwcm9jZXNzZWRDb2RlID0gcHJvY2Vzc2VkQ29kZS5yZXBsYWNlKGltcG9ydFN0YXRlbWVudCwgY29udGVudCk7XG4gIH1cblxuICByZXR1cm4gcHJvY2Vzc2VkQ29kZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwSW50ZXJhY3Rpb25zKFxuICBkZXZpY2U6IEdQVURldmljZSxcbiAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCB8IE9mZnNjcmVlbkNhbnZhcyxcbiAgdGV4dHVyZTogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9LFxuICBzaXplOiBudW1iZXIgPSAxMFxuKToge1xuICBpbnRlcmFjdGlvbnM6IHtcbiAgICBkYXRhOiBGbG9hdDMyQXJyYXk7XG4gICAgYnVmZmVyOiBHUFVCdWZmZXI7XG4gIH07XG4gIGNvbnRyb2xzOiB7XG4gICAgZGF0YTogQXJyYXlCdWZmZXI7XG4gICAgYnVmZmVyOiBHUFVCdWZmZXI7XG4gIH07XG4gIHR5cGU6IEdQVUJ1ZmZlckJpbmRpbmdUeXBlO1xufSB7XG4gIGxldCB1bmlmb3JtQnVmZmVyRGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoNCk7XG4gIGxldCBjb250cm9sc0J1ZmZlckRhdGEgPSBuZXcgQXJyYXlCdWZmZXIoNjQpO1xuXG4gIHZhciBzaWduID0gMTtcblxuICBsZXQgcG9zaXRpb24gPSB7IHg6IDAsIHk6IDAgfTtcbiAgbGV0IHZlbG9jaXR5ID0geyB4OiAwLCB5OiAwIH07XG5cbiAgdW5pZm9ybUJ1ZmZlckRhdGEuc2V0KFtwb3NpdGlvbi54LCBwb3NpdGlvbi55XSk7XG4gIGlmIChjYW52YXMgaW5zdGFuY2VvZiBIVE1MQ2FudmFzRWxlbWVudCkge1xuICAgIC8vIGRpc2FibGUgY29udGV4dCBtZW51XG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICAvLyBtb3ZlIGV2ZW50c1xuICAgIFtcIm1vdXNlbW92ZVwiLCBcInRvdWNobW92ZVwiXS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdHlwZSxcbiAgICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICBsZXQgY2xpZW50WCA9IDA7XG4gICAgICAgICAgbGV0IGNsaWVudFkgPSAwO1xuXG4gICAgICAgICAgaWYgKGV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudCkge1xuICAgICAgICAgICAgY2xpZW50WCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgICAgICBjbGllbnRZID0gZXZlbnQuY2xpZW50WTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50IGluc3RhbmNlb2YgVG91Y2hFdmVudCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAgICAgICBjbGllbnRYID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgICAgICAgY2xpZW50WSA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwb3NpdGlvbi54ID0gY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgICBwb3NpdGlvbi55ID0gY2xpZW50WSAtIHJlY3QudG9wO1xuXG4gICAgICAgICAgLy8gU2NhbGUgZnJvbSBDU1MgcGl4ZWxzIHRvIHRleHR1cmUgY29vcmRpbmF0ZXNcbiAgICAgICAgICBjb25zdCB4ID0gTWF0aC5mbG9vcigocG9zaXRpb24ueCAvIHJlY3Qud2lkdGgpICogdGV4dHVyZS53aWR0aCk7XG4gICAgICAgICAgY29uc3QgeSA9IE1hdGguZmxvb3IoKHBvc2l0aW9uLnkgLyByZWN0LmhlaWdodCkgKiB0ZXh0dXJlLmhlaWdodCk7XG5cbiAgICAgICAgICB1bmlmb3JtQnVmZmVyRGF0YS5zZXQoW3gsIHldKTtcbiAgICAgICAgfSxcbiAgICAgICAgeyBwYXNzaXZlOiB0cnVlIH1cbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICAvLyB6b29tIGV2ZW50cyBUT0RPKEBnc3plcCkgYWRkIHBpbmNoIGFuZCBzY3JvbGwgZm9yIHRvdWNoIGRldmljZXNcbiAgICBbXCJ3aGVlbFwiXS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdHlwZSxcbiAgICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgc3dpdGNoICh0cnVlKSB7XG4gICAgICAgICAgICBjYXNlIGV2ZW50IGluc3RhbmNlb2YgV2hlZWxFdmVudDpcbiAgICAgICAgICAgICAgdmVsb2NpdHkueCA9IGV2ZW50LmRlbHRhWTtcbiAgICAgICAgICAgICAgdmVsb2NpdHkueSA9IGV2ZW50LmRlbHRhWTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2l6ZSArPSB2ZWxvY2l0eS55O1xuICAgICAgICAgIHVuaWZvcm1CdWZmZXJEYXRhLnNldChbc2l6ZV0sIDIpO1xuICAgICAgICB9LFxuICAgICAgICB7IHBhc3NpdmU6IHRydWUgfVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIC8vIGNsaWNrIGV2ZW50cyBUT0RPKEBnc3plcCkgaW1wbGVtZW50IHJpZ2h0IGNsaWNrIGVxdWl2YWxlbnQgZm9yIHRvdWNoIGRldmljZXNcbiAgICBbXCJtb3VzZWRvd25cIiwgXCJ0b3VjaHN0YXJ0XCJdLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICB0eXBlLFxuICAgICAgICAoZXZlbnQpID0+IHtcbiAgICAgICAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgICAgICAgIGNhc2UgZXZlbnQgaW5zdGFuY2VvZiBNb3VzZUV2ZW50OlxuICAgICAgICAgICAgICBzaWduID0gMSAtIGV2ZW50LmJ1dHRvbjtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgZXZlbnQgaW5zdGFuY2VvZiBUb3VjaEV2ZW50OlxuICAgICAgICAgICAgICBzaWduID0gZXZlbnQudG91Y2hlcy5sZW5ndGggPiAxID8gLTEgOiAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICB1bmlmb3JtQnVmZmVyRGF0YS5zZXQoW3NpZ24gKiBzaXplXSwgMik7XG4gICAgICAgIH0sXG4gICAgICAgIHsgcGFzc2l2ZTogdHJ1ZSB9XG4gICAgICApO1xuICAgIH0pO1xuICAgIFtcIm1vdXNldXBcIiwgXCJ0b3VjaGVuZFwiXS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdHlwZSxcbiAgICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgdW5pZm9ybUJ1ZmZlckRhdGEuc2V0KFtOYU5dLCAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgeyBwYXNzaXZlOiB0cnVlIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cbiAgY29uc3QgdW5pZm9ybUJ1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgIGxhYmVsOiBcIkludGVyYWN0aW9uIEJ1ZmZlclwiLFxuICAgIHNpemU6IHVuaWZvcm1CdWZmZXJEYXRhLmJ5dGVMZW5ndGgsXG4gICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlVOSUZPUk0gfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgfSk7XG5cbiAgY29uc3QgY29udHJvbHNCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICBsYWJlbDogXCJDb250cm9scyBCdWZmZXJcIixcbiAgICBzaXplOiBjb250cm9sc0J1ZmZlckRhdGEuYnl0ZUxlbmd0aCxcbiAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuVU5JRk9STSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGludGVyYWN0aW9uczogeyBkYXRhOiB1bmlmb3JtQnVmZmVyRGF0YSwgYnVmZmVyOiB1bmlmb3JtQnVmZmVyIH0sXG4gICAgY29udHJvbHM6IHsgZGF0YTogY29udHJvbHNCdWZmZXJEYXRhLCBidWZmZXI6IGNvbnRyb2xzQnVmZmVyIH0sXG4gICAgdHlwZTogXCJ1bmlmb3JtXCIsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cFRleHR1cmVzKFxuICBkZXZpY2U6IEdQVURldmljZSxcbiAgYmluZGluZ3M6IG51bWJlcltdLFxuICBkYXRhOiB7IFtrZXk6IG51bWJlcl06IG51bWJlcltdW11bXSB9LFxuICBzaXplOiB7XG4gICAgZGVwdGhPckFycmF5TGF5ZXJzPzogeyBba2V5OiBudW1iZXJdOiBudW1iZXIgfTtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICB9LFxuICBmb3JtYXQ/OiB7IFtrZXk6IG51bWJlcl06IEdQVVRleHR1cmVGb3JtYXQgfVxuKToge1xuICBjYW52YXM6IHtcbiAgICBidWZmZXI6IEdQVUJ1ZmZlcjtcbiAgICBkYXRhOiBVaW50MzJBcnJheTtcbiAgICB0eXBlOiBHUFVCdWZmZXJCaW5kaW5nVHlwZTtcbiAgfTtcbiAgdGV4dHVyZXM6IHsgW2tleTogbnVtYmVyXTogR1BVVGV4dHVyZSB9O1xuICBiaW5kaW5nTGF5b3V0OiB7IFtrZXk6IG51bWJlcl06IEdQVVN0b3JhZ2VUZXh0dXJlQmluZGluZ0xheW91dCB9O1xuICBzaXplOiB7XG4gICAgZGVwdGhPckFycmF5TGF5ZXJzPzogeyBba2V5OiBudW1iZXJdOiBudW1iZXIgfTtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICB9O1xufSB7XG4gIGNvbnN0IHRleHR1cmVzOiB7IFtrZXk6IG51bWJlcl06IEdQVVRleHR1cmUgfSA9IHt9O1xuICBjb25zdCBiaW5kaW5nTGF5b3V0OiB7IFtrZXk6IG51bWJlcl06IEdQVVN0b3JhZ2VUZXh0dXJlQmluZGluZ0xheW91dCB9ID0ge307XG4gIGNvbnN0IGRlcHRoT3JBcnJheUxheWVycyA9IHNpemUuZGVwdGhPckFycmF5TGF5ZXJzIHx8IHt9O1xuICBjb25zdCBERUZBVUxUX0ZPUk1BVCA9IFwicjMyZmxvYXRcIjtcblxuICBiaW5kaW5ncy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICB0ZXh0dXJlc1trZXldID0gZGV2aWNlLmNyZWF0ZVRleHR1cmUoe1xuICAgICAgdXNhZ2U6IEdQVVRleHR1cmVVc2FnZS5TVE9SQUdFX0JJTkRJTkcgfCBHUFVUZXh0dXJlVXNhZ2UuQ09QWV9EU1QsXG4gICAgICBmb3JtYXQ6IGZvcm1hdCAmJiBrZXkgaW4gZm9ybWF0ID8gZm9ybWF0W2tleV0gOiBERUZBVUxUX0ZPUk1BVCxcbiAgICAgIHNpemU6IHtcbiAgICAgICAgd2lkdGg6IHNpemUud2lkdGgsXG4gICAgICAgIGhlaWdodDogc2l6ZS5oZWlnaHQsXG4gICAgICAgIGRlcHRoT3JBcnJheUxheWVyczoga2V5IGluIGRlcHRoT3JBcnJheUxheWVycyA/IGRlcHRoT3JBcnJheUxheWVyc1trZXldIDogMSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0pO1xuXG4gIE9iamVjdC5rZXlzKHRleHR1cmVzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBjb25zdCBsYXllcnMgPSBrZXkgaW4gZGVwdGhPckFycmF5TGF5ZXJzID8gZGVwdGhPckFycmF5TGF5ZXJzW2tleV0gOiAxO1xuXG4gICAgYmluZGluZ0xheW91dFtrZXldID0ge1xuICAgICAgZm9ybWF0OiBmb3JtYXQgJiYga2V5IGluIGZvcm1hdCA/IGZvcm1hdFtrZXldIDogREVGQVVMVF9GT1JNQVQsXG4gICAgICBhY2Nlc3M6IFwicmVhZC13cml0ZVwiLFxuICAgICAgdmlld0RpbWVuc2lvbjogbGF5ZXJzID4gMSA/IFwiMmQtYXJyYXlcIiA6IFwiMmRcIixcbiAgICB9O1xuXG4gICAgY29uc3QgYXJyYXkgPSBrZXkgaW4gZGF0YSA/IG5ldyBGbG9hdDMyQXJyYXkoZmxhdHRlbihkYXRhW2tleV0pKSA6IG5ldyBGbG9hdDMyQXJyYXkoZmxhdHRlbih6ZXJvcyhzaXplLmhlaWdodCwgc2l6ZS53aWR0aCwgbGF5ZXJzKSkpO1xuXG4gICAgY29uc3QgY2hhbm5lbHMgPSBjaGFubmVsQ291bnQoYmluZGluZ0xheW91dFtrZXldLmZvcm1hdCk7XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlVGV4dHVyZShcbiAgICAgIHsgdGV4dHVyZTogdGV4dHVyZXNba2V5XSB9LFxuICAgICAgLypkYXRhPSovIGFycmF5LFxuICAgICAgLypkYXRhTGF5b3V0PSovIHtcbiAgICAgICAgb2Zmc2V0OiAwLFxuICAgICAgICBieXRlc1BlclJvdzogc2l6ZS53aWR0aCAqIGFycmF5LkJZVEVTX1BFUl9FTEVNRU5UICogY2hhbm5lbHMsXG4gICAgICAgIHJvd3NQZXJJbWFnZTogc2l6ZS5oZWlnaHQsXG4gICAgICB9LFxuICAgICAgLypzaXplPSovIHtcbiAgICAgICAgd2lkdGg6IHNpemUud2lkdGgsXG4gICAgICAgIGhlaWdodDogc2l6ZS5oZWlnaHQsXG4gICAgICAgIGRlcHRoT3JBcnJheUxheWVyczogbGF5ZXJzLFxuICAgICAgfVxuICAgICk7XG4gIH0pO1xuXG4gIGxldCBjYW52YXNEYXRhID0gbmV3IFVpbnQzMkFycmF5KFtzaXplLndpZHRoLCBzaXplLmhlaWdodCwgMCwgMCwgMCwgMF0pO1xuICBjb25zdCBjYW52YXNCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICBsYWJlbDogXCJDYW52YXMgQnVmZmVyXCIsXG4gICAgc2l6ZTogY2FudmFzRGF0YS5ieXRlTGVuZ3RoLFxuICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5VTklGT1JNIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gIH0pO1xuXG4gIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihjYW52YXNCdWZmZXIsIC8qb2Zmc2V0PSovIDAsIC8qZGF0YT0qLyBjYW52YXNEYXRhKTtcblxuICByZXR1cm4ge1xuICAgIGNhbnZhczoge1xuICAgICAgYnVmZmVyOiBjYW52YXNCdWZmZXIsXG4gICAgICBkYXRhOiBjYW52YXNEYXRhLFxuICAgICAgdHlwZTogXCJ1bmlmb3JtXCIsXG4gICAgfSxcbiAgICB0ZXh0dXJlczogdGV4dHVyZXMsXG4gICAgYmluZGluZ0xheW91dDogYmluZGluZ0xheW91dCxcbiAgICBzaXplOiBzaXplLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjaGFubmVsQ291bnQoZm9ybWF0OiBHUFVUZXh0dXJlRm9ybWF0KTogbnVtYmVyIHtcbiAgaWYgKGZvcm1hdC5pbmNsdWRlcyhcInJnYmFcIikpIHtcbiAgICByZXR1cm4gNDtcbiAgfSBlbHNlIGlmIChmb3JtYXQuaW5jbHVkZXMoXCJyZ2JcIikpIHtcbiAgICByZXR1cm4gMztcbiAgfSBlbHNlIGlmIChmb3JtYXQuaW5jbHVkZXMoXCJyZ1wiKSkge1xuICAgIHJldHVybiAyO1xuICB9IGVsc2UgaWYgKGZvcm1hdC5pbmNsdWRlcyhcInJcIikpIHtcbiAgICByZXR1cm4gMTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGZvcm1hdDogXCIgKyBmb3JtYXQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW4obmVzdGVkQXJyYXk6IG51bWJlcltdW11bXSk6IG51bWJlcltdIHtcbiAgY29uc3QgZmxhdHRlbmVkOiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKGxldCBrID0gMDsgayA8IG5lc3RlZEFycmF5WzBdWzBdLmxlbmd0aDsgaysrKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXN0ZWRBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBuZXN0ZWRBcnJheVswXS5sZW5ndGg7IGorKykge1xuICAgICAgICBmbGF0dGVuZWQucHVzaChuZXN0ZWRBcnJheVtpXVtqXVtrXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZsYXR0ZW5lZDtcbn1cblxuZnVuY3Rpb24gemVyb3MoaGVpZ2h0OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGxheWVyczogbnVtYmVyID0gMSk6IG51bWJlcltdW11bXSB7XG4gIGNvbnN0IHplcm9BcnJheTogbnVtYmVyW11bXVtdID0gW107XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBoZWlnaHQ7IGkrKykge1xuICAgIGNvbnN0IHJvdzogbnVtYmVyW11bXSA9IFtdO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgd2lkdGg7IGorKykge1xuICAgICAgY29uc3QgbGF5ZXI6IG51bWJlcltdID0gW107XG4gICAgICBmb3IgKGxldCBrID0gMDsgayA8IGxheWVyczsgaysrKSB7XG4gICAgICAgIGxheWVyLnB1c2goMCk7XG4gICAgICB9XG4gICAgICByb3cucHVzaChsYXllcik7XG4gICAgfVxuICAgIHplcm9BcnJheS5wdXNoKHJvdyk7XG4gIH1cblxuICByZXR1cm4gemVyb0FycmF5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmFuZG9tVmFsdWVzKGxlbmd0aDogbnVtYmVyKTogVWludDMyQXJyYXkge1xuICAvLyBmYXN0IGNwdS1zaWRlIHJhbmRvbSBudW1iZXIgZ2VuZXJhdGlvblxuXG4gIGNvbnN0IG1heENodW5rTGVuZ3RoID0gNjU1MzYgLyA0O1xuICBjb25zdCByZXN1bHQgPSBuZXcgVWludDMyQXJyYXkoNCAqIGxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgNCAqIGxlbmd0aDsgaSArPSBtYXhDaHVua0xlbmd0aCkge1xuICAgIGNvbnN0IGNodW5rTGVuZ3RoID0gTWF0aC5taW4obWF4Q2h1bmtMZW5ndGgsIDQgKiBsZW5ndGggLSBpKTtcbiAgICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKHJlc3VsdC5zdWJhcnJheShpLCBpICsgY2h1bmtMZW5ndGgpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9