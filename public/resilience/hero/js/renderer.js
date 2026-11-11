// WebGPU-first renderer with a WebGL2 fallback, after the kumiki joinery viewer
// (github.com/tim003/JointMCP, Tim/webgpu-kumiki-tim). Every CAD part is drawn
// separately so it can carry its own offset, pop-in scale, highlight tint and
// edge colour while the assembly timeline plays.

import { createGpuDeformations } from './gpu-deformations.mjs?v=20261103-battery';
import { createGpuRigid } from './gpu-rigid.mjs?v=20261104-two-eyes';

const PART_STRIDE = 96; // tightly packed pose/style + temporary print-flex records
const VERTEX_STRIDE = 28; // position f32x3, normal f32x3, colour unorm8x4

const WGSL = /* wgsl */ `
struct Global { viewProj: mat4x4f, eye: vec4f, light: vec4f, style: vec4f, lineSurface: vec4f, lightTint: vec4f }
struct Part { offset: vec4f, pivot: vec4f, tint: vec4f, edge: vec4f, options: vec4f, bend: vec4f }
@group(0) @binding(0) var<uniform> g: Global;
@group(1) @binding(0) var<storage, read> parts: array<Part>;

// pivot.w is radians; options.yzw is a unit axis (Z for legacy callers).
// options.x preserves wire/indicator colours independently of structural surfaces.
// For skinned wires bend.xyz is the secondary body's Rest origin and bend.w is
// -10000 minus its part index; vertex alpha stores its weight, not decoration.
// bend.w <= -1e6 is a design-variant stretch: vertices beyond |x-bend.z| >
// bend.x move inward by up to bend.y, collapsing the widened span. Below -2e6
// the same rule applies along Y (a far centre makes it one-sided).
fn rotateZ(v: vec3f, p: Part) -> vec3f {
  let c = cos(p.pivot.w); let s = sin(p.pivot.w);
  let axis=p.options.yzw;
  return v*c+cross(axis,v)*s+axis*dot(axis,v)*(1.0-c);
}
fn skinned(p: Part) -> bool { return p.bend.w<=-10000.0 && p.bend.w>-1000000.0; }
fn flexed(pos: vec3f, p: Part) -> vec3f {
  if(p.bend.w<=-2000000.0){let d=pos.y-p.bend.z;return select(pos,vec3f(pos.x,p.bend.z+sign(d)*max(p.bend.x,abs(d)-p.bend.y),pos.z),abs(d)>p.bend.x);}
  if(p.bend.w<=-1000000.0){let d=pos.x-p.bend.z;return select(pos,vec3f(p.bend.z+sign(d)*max(p.bend.x,abs(d)-p.bend.y),pos.y,pos.z),abs(d)>p.bend.x);}
  if(p.bend.w<=-10000.0){return pos;}
  let along=sign(p.bend.x)*(pos.x-p.bend.y);
  let lower=select(0.0,clamp((35.0-along)/40.5,0.0,1.0),pos.z<p.bend.w-5.5);
  let weight=select(lower,1.0,along< -5.5);
  return pos+vec3f(-p.bend.x*weight*weight,0,0);
}
fn flexNormal(pos: vec3f,n: vec3f,p: Part) -> vec3f {
  if(p.bend.w<=-10000.0){return n;}
  let along=sign(p.bend.x)*(pos.x-p.bend.y);let weight=(35.0-along)/40.5;
  let gradient=select(0.0,2.0*abs(p.bend.x)*weight/40.5,pos.z<p.bend.w-5.5&&along>= -5.5&&weight>0.0&&weight<1.0);
  return vec3f(n.x/(1.0+gradient),n.y,n.z);
}
fn place(pos: vec3f, p: Part) -> vec3f {
  return p.pivot.xyz + rotateZ((flexed(pos,p) - p.pivot.xyz) * p.offset.w, p) + p.offset.xyz;
}

struct VOut {
  @builtin(position) clip: vec4f,
  @location(0) world: vec3f,
  @location(1) normal: vec3f,
  @location(2) color: vec3f,
  @location(3) decorative: f32,
  @location(4) @interpolate(flat) partIndex: u32,
}

@vertex fn vsBody(@location(0) pos: vec3f, @location(1) normal: vec3f, @location(2) color: vec4f, @builtin(instance_index) instance: u32) -> VOut {
  let p = parts[instance];
  var o: VOut;
  var world = place(pos, p);
  var n=rotateZ(flexNormal(pos,normal,p),p);
  if(skinned(p)){let other=parts[u32(-p.bend.w-10000.0)];world=mix(world,place(pos-p.bend.xyz,other),color.a);n=mix(n,rotateZ(normal,other),color.a);}
  o.clip = g.viewProj * vec4f(world, 1.0);
  o.world = world;
  o.normal = n;
  o.color = color.rgb;
  o.decorative = select(color.a,0.0,skinned(p));
  o.partIndex = instance;
  return o;
}

@fragment fn fsBody(i: VOut) -> @location(0) vec4f {
  let p = parts[i.partIndex];
  if(p.options.x>=2.0){return vec4f(p.tint.rgb,1.0);}
  var n = normalize(i.normal);
  let v = normalize(g.eye.xyz - i.world);
  if (dot(n, v) < 0.0) { n = -n; }
  let l = normalize(g.light.xyz);
  let line = g.style.x;
  // Physical surfaces retain their original illustration palette and neutral
  // illumination. Only allowlisted decorative vertices receive theme lighting.
  let surface = mix(vec3f(0.965, 0.96, 0.95), g.lineSurface.rgb, i.decorative);
  let base = mix(mix(i.color, surface, line * (1.0 - p.options.x)), p.tint.rgb, p.tint.a);
  let key = max(dot(n, l), 0.0);
  let fill = max(dot(n, normalize(vec3f(-0.4, -0.7, 0.35))), 0.0) * 0.25;
  let sky = 0.5 + 0.5 * n.z;
  let spec = pow(max(dot(n, normalize(l + v)), 0.0), 48.0) * 0.18 * (1.0 - line);
  let shaded = base * (0.34 + 0.16 * sky + key * 0.58 + fill) + vec3f(spec);
  let flat = base * (0.86 + 0.14 * key);
  return vec4f(mix(shaded, flat, line) * mix(vec3f(1.0), g.lightTint.rgb, i.decorative), 1.0);
}

struct EdgeOut { @builtin(position) clip: vec4f, @location(0) color: vec4f }
@vertex fn vsEdge(@location(0) pos: vec3f, @builtin(instance_index) instance: u32) -> EdgeOut {
  var o: EdgeOut;
  o.clip = g.viewProj * vec4f(place(pos, parts[instance]), 1.0);
  o.color = parts[instance].edge;
  return o;
}

@fragment fn fsEdge(i: EdgeOut) -> @location(0) vec4f {
  return i.color;
}
`;

const GLSL_PLACE = `
uniform mat4 viewProj;
uniform vec4 offset;
uniform vec4 pivot;
uniform vec3 rotationAxis;
uniform vec4 bend;
vec3 rotateZ(vec3 v) {
  float c = cos(pivot.w), s = sin(pivot.w);
  return v*c+cross(rotationAxis,v)*s+rotationAxis*dot(rotationAxis,v)*(1.0-c);
}
vec3 flexed(vec3 pos) { if(bend.w<=-2000000.0){float d=pos.y-bend.z;return abs(d)>bend.x?vec3(pos.x,bend.z+sign(d)*max(bend.x,abs(d)-bend.y),pos.z):pos;} if(bend.w<=-1000000.0){float d=pos.x-bend.z;return abs(d)>bend.x?vec3(bend.z+sign(d)*max(bend.x,abs(d)-bend.y),pos.y,pos.z):pos;} if(bend.w<=-10000.0)return pos;float a=sign(bend.x)*(pos.x-bend.y);float w=a< -5.5?1.0:pos.z<bend.w-5.5?clamp((35.0-a)/40.5,0.0,1.0):0.0;return pos+vec3(-bend.x*w*w,0,0); }
vec3 flexNormal(vec3 pos,vec3 n) { if(bend.w<=-10000.0)return n;float a=sign(bend.x)*(pos.x-bend.y);float w=(35.0-a)/40.5;float g=(pos.z<bend.w-5.5&&a>= -5.5&&w>0.0&&w<1.0)?2.0*abs(bend.x)*w/40.5:0.0;return vec3(n.x/(1.0+g),n.y,n.z); }
vec3 place(vec3 pos) { return pivot.xyz + rotateZ((flexed(pos) - pivot.xyz) * offset.w) + offset.xyz; }
`;

const GL_BODY_VS = `#version 300 es
precision highp float;
${GLSL_PLACE}
in vec3 position; in vec3 normal; in vec4 color;
uniform vec4 skinOffset; uniform vec4 skinPivot; uniform vec3 skinAxis;
vec3 skinRotate(vec3 v){float c=cos(skinPivot.w),s=sin(skinPivot.w);return v*c+cross(skinAxis,v)*s+skinAxis*dot(skinAxis,v)*(1.0-c);}
out vec3 vWorld; out vec3 vNormal; out vec3 vColor; out float vDecorative;
void main() {
  vec3 world = place(position);
  vec3 n=rotateZ(flexNormal(position,normal));
  if(bend.w<=-10000.0&&bend.w>-1000000.0){world=mix(world,skinPivot.xyz+skinRotate((position-bend.xyz-skinPivot.xyz)*skinOffset.w)+skinOffset.xyz,color.a);n=mix(n,skinRotate(normal),color.a);}
  gl_Position = viewProj * vec4(world, 1.0);
  vWorld = world; vNormal = n; vColor = color.rgb;
  vDecorative = (bend.w<=-10000.0&&bend.w>-1000000.0)?0.0:color.a;
}`;

const GL_BODY_FS = `#version 300 es
precision highp float;
uniform vec4 eye; uniform vec4 light; uniform vec4 style; uniform vec4 tint;
uniform vec4 lineSurface; uniform vec4 lightTint;
uniform float preserveColor;
in vec3 vWorld; in vec3 vNormal; in vec3 vColor; in float vDecorative;
out vec4 outColor;
void main() {
  vec3 n = normalize(vNormal);
  if(preserveColor>=2.0){outColor=vec4(tint.rgb,1.0);return;}
  vec3 v = normalize(eye.xyz - vWorld);
  if (dot(n, v) < 0.0) n = -n;
  vec3 l = normalize(light.xyz);
  float line = style.x;
  vec3 surface = mix(vec3(0.965, 0.96, 0.95), lineSurface.rgb, vDecorative);
  vec3 base = mix(mix(vColor, surface, line * (1.0-preserveColor)), tint.rgb, tint.a);
  float key = max(dot(n, l), 0.0);
  float fill = max(dot(n, normalize(vec3(-0.4, -0.7, 0.35))), 0.0) * 0.25;
  float sky = 0.5 + 0.5 * n.z;
  float spec = pow(max(dot(n, normalize(l + v)), 0.0), 48.0) * 0.18 * (1.0 - line);
  vec3 shaded = base * (0.34 + 0.16 * sky + key * 0.58 + fill) + vec3(spec);
  vec3 flatc = base * (0.86 + 0.14 * key);
  outColor = vec4(mix(shaded, flatc, line) * mix(vec3(1.0), lightTint.rgb, vDecorative), 1.0);
}`;

const GL_EDGE_VS = `#version 300 es
precision highp float;
${GLSL_PLACE}
in vec3 position;
void main() { gl_Position = viewProj * vec4(place(position), 1.0); }`;

const GL_EDGE_FS = `#version 300 es
precision highp float;
uniform vec4 edge;
out vec4 outColor;
void main() { outColor = edge; }`;

function interleave(mesh, start = 0, count = mesh.positions.length / 3) {
  const buffer = new ArrayBuffer(count * VERTEX_STRIDE);
  const f32 = new Float32Array(buffer);
  const u8 = new Uint8Array(buffer);
  for (let j = 0; j < count; j++) {
    const i = start + j;
    const f = j * 7;
    f32[f] = mesh.positions[i * 3];
    f32[f + 1] = mesh.positions[i * 3 + 1];
    f32[f + 2] = mesh.positions[i * 3 + 2];
    f32[f + 3] = mesh.normals[i * 3];
    f32[f + 4] = mesh.normals[i * 3 + 1];
    f32[f + 5] = mesh.normals[i * 3 + 2];
    const b = j * VERTEX_STRIDE + 24;
    u8[b] = mesh.colors[i * 3];
    u8[b + 1] = mesh.colors[i * 3 + 1];
    u8[b + 2] = mesh.colors[i * 3 + 2];
    u8[b + 3] = mesh.decorative[i];
  }
  return buffer;
}

export async function createRenderer(canvas, mesh, { prefer = 'webgpu' } = {}) {
  if (prefer !== 'webgl' && 'gpu' in navigator) {
    try {
      return await createWebGpuRenderer(canvas, mesh);
    } catch (error) {
      console.warn('WebGPU unavailable, falling back to WebGL2:', error);
    }
  }
  return createWebGlRenderer(canvas, mesh);
}

function canvasSize(canvas,maxPixelRatio=2) {
  const dpr = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
  const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
  const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  return { width, height };
}

async function createWebGpuRenderer(canvas, mesh) {
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' })
    || await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error('No WebGPU adapter');
  const timingEnabled=new URLSearchParams(location.search).get('gpuTiming')==='1'&&adapter.features.has('timestamp-query');
  const device = await adapter.requestDevice(timingEnabled?{requiredFeatures:['timestamp-query']}:{});
  const timing=timingEnabled?{set:device.createQuerySet({type:'timestamp',count:4}),resolve:device.createBuffer({size:32,usage:GPUBufferUsage.QUERY_RESOLVE|GPUBufferUsage.COPY_SRC}),read:device.createBuffer({size:32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ}),busy:false,count:0}:null;
  if(new URLSearchParams(location.search).get('gpuTiming')==='1')window.__sesameGpuTiming={supported:timingEnabled,adapter:{vendor:adapter.info?.vendor,architecture:adapter.info?.architecture,device:adapter.info?.device,isFallbackAdapter:adapter.isFallbackAdapter??adapter.info?.isFallbackAdapter??null},samples:[]};
  device.addEventListener('uncapturederror',event=>console.error('WebGPU validation:',event.error.message));
  const context = canvas.getContext('webgpu');
  if (!context) throw new Error('No WebGPU canvas context');
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: 'opaque' });

  const makeBuffer = (data, usage) => {
    const size = Math.max(4, Math.ceil(data.byteLength / 4) * 4);
    const buffer = device.createBuffer({ size, usage, mappedAtCreation: true });
    new Uint8Array(buffer.getMappedRange()).set(new Uint8Array(data.buffer ?? data, data.byteOffset ?? 0, data.byteLength));
    buffer.unmap();
    return buffer;
  };
  const vertexBuffer = makeBuffer(new Uint8Array(interleave(mesh)), GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE);
  const indexBuffer = makeBuffer(mesh.indices, GPUBufferUsage.INDEX);
  const edgeBuffer = makeBuffer(mesh.edges, GPUBufferUsage.VERTEX);
  const globalBuffer = device.createBuffer({ size: 144, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  const partCount = mesh.parts.length;
  const partBuffer = device.createBuffer({ size: PART_STRIDE * partCount, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
  const partData = new Float32Array(PART_STRIDE / 4 * partCount);
  const previousParts = new Float32Array(partData.length).fill(NaN);

  const globalLayout = device.createBindGroupLayout({ entries: [{ binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: {} }] });
  const partLayout = device.createBindGroupLayout({ entries: [{ binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } }] });
  const layout = device.createPipelineLayout({ bindGroupLayouts: [globalLayout, partLayout] });
  const globalGroup = device.createBindGroup({ layout: globalLayout, entries: [{ binding: 0, resource: { buffer: globalBuffer } }] });
  const partGroup = device.createBindGroup({ layout: partLayout, entries: [{ binding: 0, resource: { buffer: partBuffer } }] });
  const module = device.createShaderModule({ code: WGSL });
  const sampleCount = 4;
  const bodyPipeline = device.createRenderPipeline({
    layout,
    vertex: {
      module, entryPoint: 'vsBody',
      buffers: [{ arrayStride: VERTEX_STRIDE, attributes: [
        { shaderLocation: 0, offset: 0, format: 'float32x3' },
        { shaderLocation: 1, offset: 12, format: 'float32x3' },
        { shaderLocation: 2, offset: 24, format: 'unorm8x4' },
      ] }],
    },
    fragment: { module, entryPoint: 'fsBody', targets: [{ format }] },
    primitive: { topology: 'triangle-list', cullMode: 'none' },
    depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less', depthBias: 2, depthBiasSlopeScale: 1.5 },
    multisample: { count: sampleCount },
  });
  const blend = { color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' } };
  const edgePipeline = device.createRenderPipeline({
    layout,
    vertex: { module, entryPoint: 'vsEdge', buffers: [{ arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] }] },
    fragment: { module, entryPoint: 'fsEdge', targets: [{ format, blend }] },
    primitive: { topology: 'line-list' },
    depthStencil: { format: 'depth24plus', depthWriteEnabled: false, depthCompare: 'less-equal' },
    multisample: { count: sampleCount },
  });

  let targets = { width: 0, height: 0, msaa: null, depth: null };
  const globalData = new Float32Array(36);
  const previousGlobal = new Float32Array(36).fill(NaN);
  const deformations = await createGpuDeformations(device, vertexBuffer, mesh.deformations || []);
  let gpuPhysics=null;
  if(mesh.rigidPhysics)try{gpuPhysics=await createGpuRigid(device,partBuffer,mesh,mesh.rigidPhysics);}catch(error){console.warn('WebGPU rigid solver unavailable; using MuJoCo reference physics.',error);}

  return {
    backend: 'WebGPU',
    gpuPhysics,
    deform: deformations.update,
    updateVertices(start, count) {
      if(mesh.deformations?.some(d=>start<d.start+d.count&&start+count>d.start))throw Error('CPU upload overlaps GPU-owned geometry');
      device.queue.writeBuffer(vertexBuffer, start * VERTEX_STRIDE, interleave(mesh, start, count));
    },
    releaseTargets(){targets.msaa?.destroy();targets.depth?.destroy();targets={width:0,height:0,msaa:null,depth:null};canvas.width=canvas.height=1;},
    destroy() { gpuPhysics?.destroy();context.unconfigure(); device.destroy(); },
    render(frame) {
      const { width, height } = canvasSize(canvas,frame.maxPixelRatio??2);
      if (targets.width !== width || targets.height !== height) {
        targets.msaa?.destroy();
        targets.depth?.destroy();
        targets = {
          width, height,
          msaa: device.createTexture({ size: [width, height], format, sampleCount, usage: GPUTextureUsage.RENDER_ATTACHMENT }),
          depth: device.createTexture({ size: [width, height], format: 'depth24plus', sampleCount, usage: GPUTextureUsage.RENDER_ATTACHMENT }),
        };
      }
      globalData.set(frame.viewProj, 0);
      globalData.set([...frame.eye, 1], 16);
      globalData.set([...frame.light, 0], 20);
      globalData.set([frame.style, 0, 0, 0], 24);
      globalData.set([...frame.lineSurface, 0], 28);
      globalData.set([...frame.lightTint, 0], 32);
      if(globalData.some((v,i)=>v!==previousGlobal[i])){
        device.queue.writeBuffer(globalBuffer, 0, globalData);previousGlobal.set(globalData);
      }
      let dirtyStart=-1,dirtyEnd=0;
      const flushParts=()=>{if(dirtyStart<0)return;device.queue.writeBuffer(partBuffer,dirtyStart*4,partData,dirtyStart,dirtyEnd-dirtyStart);previousParts.set(partData.subarray(dirtyStart,dirtyEnd),dirtyStart);dirtyStart=-1;};
      for (let i = 0; i < partCount; i++) {
        const s = frame.parts[i];
        if (!s.visible) continue;
        const o = i * PART_STRIDE / 4;
        partData.set(s.offset, o); partData[o + 3] = s.scale;
        partData.set(s.pivot, o + 4);
        partData[o + 7] = s.rotation ?? s.rotationZ ?? 0;
        partData.set(s.tint, o + 8);
        partData.set(s.edge, o + 12);
        partData[o+16]=s.unlit?2:s.preserveColor?1:0;
        partData.set(s.rotationAxis??[0,0,1],o+17);
        partData.set(s.bend??[0,0,0,0],o+20);
        let changed=false;for(let j=o;j<o+24;j++)if(partData[j]!==previousParts[j]){changed=true;break;}
        // Coalesce nearby changed records, without resending a whole scene for
        // one hover/transform. At most 256 unchanged bytes bridge two changes.
        if(changed){if(dirtyStart>=0&&(o-dirtyEnd)*4>256)flushParts();if(dirtyStart<0)dirtyStart=o;dirtyEnd=o+24;}
      }
      flushParts();

      const encoder = device.createCommandEncoder();
      deformations.encode(encoder);
      const sample=timing&&!timing.busy&&++timing.count%10===0;
      const physicsWork=frame.gpuRigid?gpuPhysics?.encode(encoder,sample?{querySet:timing.set,beginningOfPassWriteIndex:0,endOfPassWriteIndex:1}:undefined):null;
      const pass = encoder.beginRenderPass({
        ...(sample?{timestampWrites:{querySet:timing.set,beginningOfPassWriteIndex:2,endOfPassWriteIndex:3}}:{}),
        colorAttachments: [{
          view: targets.msaa.createView(), resolveTarget: context.getCurrentTexture().createView(),
          clearValue: { r: frame.clear[0], g: frame.clear[1], b: frame.clear[2], a: 1 }, loadOp: 'clear', storeOp: 'discard',
        }],
        depthStencilAttachment: { view: targets.depth.createView(), depthClearValue: 1, depthLoadOp: 'clear', depthStoreOp: 'discard' },
      });
      pass.setBindGroup(0, globalGroup);
      pass.setBindGroup(1, partGroup);
      pass.setPipeline(bodyPipeline);
      pass.setVertexBuffer(0, vertexBuffer);
      pass.setIndexBuffer(indexBuffer, 'uint32');
      mesh.parts.forEach((part, i) => {
        if (!frame.parts[i].visible || frame.parts[i].edgeOnly || !part.indexCount) return;
        pass.drawIndexed(part.indexCount, 1, part.indexStart, 0, i);
      });
      pass.setPipeline(edgePipeline);
      pass.setVertexBuffer(0, edgeBuffer);
      mesh.parts.forEach((part, i) => {
        const s = frame.parts[i];
        if (!s.visible || !part.edgeCount || s.edge[3] <= 0) return;
        pass.draw(part.edgeCount, 1, part.edgeStart, i);
      });
      pass.end();
      if(sample){encoder.resolveQuerySet(timing.set,0,4,timing.resolve,0);encoder.copyBufferToBuffer(timing.resolve,0,timing.read,0,32);timing.busy=true;}
      device.queue.submit([encoder.finish()]);
      if(frame.gpuRigid)gpuPhysics?.afterSubmit();
      if(sample)timing.read.mapAsync(GPUMapMode.READ).then(()=>{
        const t=new BigUint64Array(timing.read.getMappedRange());window.__sesameGpuTiming.samples.push({physicsMs:frame.gpuRigid?Number(t[1]-t[0])/1e6:null,renderMs:Number(t[3]-t[2])/1e6,...physicsWork});timing.read.unmap();timing.busy=false;
      }).catch(error=>{timing.busy=false;console.warn('GPU timing readback',error);});
    },
  };
}

function glProgram(gl, vs, fs) {
  const program = gl.createProgram();
  for (const [type, source] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  const uniforms = {};
  const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const name = gl.getActiveUniform(program, i).name;
    uniforms[name] = gl.getUniformLocation(program, name);
  }
  return { program, uniforms };
}

function createWebGlRenderer(canvas, mesh) {
  const gl = canvas.getContext('webgl2', { antialias: true });
  if (!gl) throw new Error('Neither WebGPU nor WebGL2 is available. Enable hardware acceleration in your browser settings and reload.');
  const body = glProgram(gl, GL_BODY_VS, GL_BODY_FS);
  const edge = glProgram(gl, GL_EDGE_VS, GL_EDGE_FS);

  const bodyVao = gl.createVertexArray();
  gl.bindVertexArray(bodyVao);
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, interleave(mesh), gl.DYNAMIC_DRAW);
  const attrib = (program, name, size, type, normalized, offset) => {
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, type, normalized, VERTEX_STRIDE, offset);
  };
  attrib(body.program, 'position', 3, gl.FLOAT, false, 0);
  attrib(body.program, 'normal', 3, gl.FLOAT, false, 12);
  attrib(body.program, 'color', 4, gl.UNSIGNED_BYTE, true, 24);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

  const edgeVao = gl.createVertexArray();
  gl.bindVertexArray(edgeVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, mesh.edges, gl.STATIC_DRAW);
  const edgeLocation = gl.getAttribLocation(edge.program, 'position');
  gl.enableVertexAttribArray(edgeLocation);
  gl.vertexAttribPointer(edgeLocation, 3, gl.FLOAT, false, 12, 0);
  gl.bindVertexArray(null);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  return {
    backend: 'WebGL2',
    releaseTargets(){canvas.width=canvas.height=1;},
    updateVertices(start, count) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, start * VERTEX_STRIDE, new Uint8Array(interleave(mesh, start, count)));
    },
    destroy() { gl.getExtension('WEBGL_lose_context')?.loseContext(); },
    render(frame) {
      const { width, height } = canvasSize(canvas,frame.maxPixelRatio??2);
      gl.viewport(0, 0, width, height);
      gl.clearColor(frame.clear[0], frame.clear[1], frame.clear[2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(body.program);
      gl.bindVertexArray(bodyVao);
      gl.uniformMatrix4fv(body.uniforms.viewProj, false, frame.viewProj);
      gl.uniform4f(body.uniforms.eye, ...frame.eye, 1);
      gl.uniform4f(body.uniforms.light, ...frame.light, 0);
      gl.uniform4f(body.uniforms.style, frame.style, 0, 0, 0);
      gl.uniform4f(body.uniforms.lineSurface, ...frame.lineSurface, 0);
      gl.uniform4f(body.uniforms.lightTint, ...frame.lightTint, 0);
      gl.enable(gl.POLYGON_OFFSET_FILL);
      gl.polygonOffset(1, 2);
      mesh.parts.forEach((part, i) => {
        const s = frame.parts[i];
        if (!s.visible || s.edgeOnly || !part.indexCount) return;
        gl.uniform4f(body.uniforms.offset, ...s.offset, s.scale);
        gl.uniform4f(body.uniforms.pivot, ...s.pivot, s.rotation ?? s.rotationZ ?? 0);
        gl.uniform3fv(body.uniforms.rotationAxis,s.rotationAxis??[0,0,1]);
        gl.uniform4fv(body.uniforms.bend,s.bend??[0,0,0,0]);
        if(part.skin){const other=frame.parts[part.skin.part];gl.uniform4f(body.uniforms.skinOffset,...other.offset,other.scale);gl.uniform4f(body.uniforms.skinPivot,...other.pivot,other.rotation??other.rotationZ??0);gl.uniform3fv(body.uniforms.skinAxis,other.rotationAxis??[0,0,1]);}
        gl.uniform4fv(body.uniforms.tint, s.tint);
        gl.uniform1f(body.uniforms.preserveColor,s.unlit?2:s.preserveColor?1:0);
        gl.drawElements(gl.TRIANGLES, part.indexCount, gl.UNSIGNED_INT, part.indexStart * 4);
      });
      gl.disable(gl.POLYGON_OFFSET_FILL);

      gl.useProgram(edge.program);
      gl.bindVertexArray(edgeVao);
      gl.uniformMatrix4fv(edge.uniforms.viewProj, false, frame.viewProj);
      gl.depthMask(false);
      gl.depthFunc(gl.LEQUAL);
      mesh.parts.forEach((part, i) => {
        const s = frame.parts[i];
        if (!s.visible || !part.edgeCount || s.edge[3] <= 0) return;
        gl.uniform4f(edge.uniforms.offset, ...s.offset, s.scale);
        gl.uniform4f(edge.uniforms.pivot, ...s.pivot, s.rotation ?? s.rotationZ ?? 0);
        gl.uniform3fv(edge.uniforms.rotationAxis,s.rotationAxis??[0,0,1]);
        gl.uniform4fv(edge.uniforms.bend,s.bend??[0,0,0,0]);
        gl.uniform4fv(edge.uniforms.edge, s.edge);
        gl.drawArrays(gl.LINES, part.edgeStart, part.edgeCount);
      });
      gl.depthMask(true);
      gl.depthFunc(gl.LESS);
      gl.bindVertexArray(null);
    },
  };
}
