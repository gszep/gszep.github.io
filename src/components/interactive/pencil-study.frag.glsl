#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform vec2 uRotation;
uniform float uZoom;
uniform float uPressure;
uniform float uTooth;
uniform float uWander;
uniform float uLight;
uniform float uFrame;
uniform int uStyle;
out vec4 outColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * .1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);
}
mat3 turn(vec2 a) {
  float x = cos(a.x), y = sin(a.x), c = cos(a.y), s = sin(a.y);
  return mat3(c,0,-s, 0,1,0, s,0,c) * mat3(1,0,0, 0,x,y, 0,-y,x);
}

// Analytic geometry keeps this first study small: no model or texture downloads.
vec2 box(vec3 ro, vec3 rd) {
  vec3 inv = 1. / (sign(rd) * max(abs(rd),vec3(.00001)) + vec3(.0000001));
  vec3 a = (-vec3(.8)-ro)*inv, b = (vec3(.8)-ro)*inv;
  vec3 lo = min(a,b), hi = max(a,b);
  return vec2(max(lo.x,max(lo.y,lo.z)),min(hi.x,min(hi.y,hi.z)));
}

float strokes(vec2 uv, float angle, float density, float weight, float bend, float seed) {
  vec2 p = mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*uv*density;
  float lane = floor(p.y);
  float drift = noise(vec2(p.x*.16,lane*.31+seed)+uFrame*1.7)-.5;
  float v = p.y + bend*(drift + .25*sin(p.x*.75+lane));
  float dist = abs(fract(v)-.5);
  float footprint = fwidth(v);
  float aa = clamp(footprint*.6,.015,.25);
  float line = 1.-smoothstep(weight-aa,weight+aa,dist);
  // Resolve subpixel hatches to their mean coverage rather than moire stripes.
  line = mix(line,2.*weight,smoothstep(.25,.85,footprint));
  // Finite, staggered marks rather than perfectly continuous stripes.
  float ends = smoothstep(.04,.19,fract(p.x*.085+hash(vec2(lane,seed))));
  float graphite = .60+.40*noise(vec2(p.x*2.4,lane*7.1)+seed);
  return line*ends*graphite;
}

void main() {
  vec2 screen = (gl_FragCoord.xy-.5*uResolution)/uResolution.y;
  vec2 paperUV = gl_FragCoord.xy * (700./uResolution.y);
  float paperGrain = noise(paperUV*.8)*.65 + noise(paperUV*2.7)*.35;
  vec3 paper = vec3(.958,.945,.909) + (paperGrain-.5)*.045*uTooth;
  vec3 ink = vec3(.16,.155,.15);
  mat3 rotation = turn(uRotation);
  vec3 ro = transpose(rotation)*vec3(0,0,4.8);
  vec3 rd = transpose(rotation)*normalize(vec3(screen/uZoom,-2.65));
  vec2 hit = box(ro,rd);
  vec3 color = paper;
  // A restrained drawing-table vignette, independent of the cube's shading.
  color -= .018*dot(screen,screen);
  if (hit.y >= max(hit.x,0.)) {
    vec3 p = ro + rd*hit.x;
    vec3 ap = abs(p);
    vec3 n;
    vec2 uv;
    float face;
    if (ap.x > ap.y && ap.x > ap.z) {
      n=vec3(sign(p.x),0,0); uv=p.zy; face=1.;
    } else if (ap.y > ap.z) {
      n=vec3(0,sign(p.y),0); uv=p.xz; face=2.;
    } else {
      n=vec3(0,0,sign(p.z)); uv=p.xy; face=3.;
    }
    vec3 light=normalize(vec3(cos(uLight),.85,sin(uLight)));
    float diffuse=max(0.,dot(rotation*n,light));
    float tone=clamp((.83-.72*diffuse)*uPressure,.02,.95);
    // Surface-space grain and stroke positions stay attached during rotation.
    vec2 grainUV=uv*330.+face*71.;
    float grain=noise(grainUV)*.6+noise(grainUV*2.3)*.4;
    float tooth=mix(1.,smoothstep(.12,.8,grain),uTooth*.8);
    float a=strokes(uv,.48,33.,.035+tone*.11,uWander*.55,face);
    float b=strokes(uv,-.65,37.,.035+tone*.10,uWander*.7,face+9.);
    float coverage;
    if (uStyle == 0) {
      coverage=tone*.13 + a*smoothstep(.02,.6,tone)*.9;
    } else if (uStyle == 1) {
      float c=strokes(uv,1.3,46.,.035+tone*.10,uWander*.5,face+17.);
      coverage=tone*.12+a*.64+b*smoothstep(.25,.65,tone)*.7+c*smoothstep(.55,.9,tone)*.5;
    } else if (uStyle == 2) {
      float rubbed=noise(uv*vec2(5.,28.)+face)*.26+noise(uv*vec2(16.,85.))*.16;
      coverage=tone*(.65+rubbed)+a*.16;
    } else {
      vec2 flow=uv+vec2(sin(uv.y*5.+face),sin(uv.x*4.-face))*(.07+uWander*.14);
      float c=strokes(flow,.2,29.,.055+tone*.14,1.1+uWander*2.,face+23.);
      float d=strokes(flow,-.8,35.,.035+tone*.13,.8+uWander,face+41.);
      coverage=tone*.12+c*.9+d*smoothstep(.17,.75,tone)*.75;
    }
    coverage*=tooth;
    // Face boundaries: pressure-modulated pencil lines, no triangle diagonals.
    float edge=.8-max(abs(uv.x),abs(uv.y));
    float px=max(fwidth(edge),.0003);
    float edgeWidth=px*(.55+uPressure*.55);
    float broken=.55+.45*noise(uv*70.+face+uFrame);
    float outline=(1.-smoothstep(edgeWidth,edgeWidth+px,edge))*broken;
    coverage=max(coverage,outline*.78);
    color=mix(paper,ink,clamp(coverage,0.,.94));
  }
  outColor=vec4(color,1.);
}
