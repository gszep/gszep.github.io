// Column-major camera math adapted from this guide's main.js.
export const sub = (a, b) => a.map((v, i) => v - b[i]);
export const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
export const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
export const normalize = a => { const n = Math.hypot(...a) || 1; return a.map(v => v/n); };
export function perspective(fovy, aspect, near, far, zeroToOne) {
  const f = 1 / Math.tan(fovy / 2), m = new Float32Array(16);
  m[0] = f/aspect; m[5] = f; m[11] = -1;
  m[10] = (zeroToOne ? far : far+near)/(near-far);
  m[14] = (zeroToOne ? near*far : 2*far*near)/(near-far);
  return m;
}
export function lookAt(eye, target, up) {
  const z = normalize(sub(eye,target)), x = normalize(cross(up,z)), y = cross(z,x);
  return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);
}
export function multiply(a,b) {
  const out = new Float32Array(16);
  for(let c=0;c<4;c++) for(let r=0;r<4;r++) for(let k=0;k<4;k++) out[c*4+r] += a[k*4+r]*b[c*4+k];
  return out;
}
export function project(p,m,width,height) {
  const v = [0,0,0,0];
  for(let r=0;r<4;r++) v[r] = m[r]*p[0]+m[4+r]*p[1]+m[8+r]*p[2]+m[12+r];
  return {x:(v[0]/v[3]+1)*width/2,y:(1-v[1]/v[3])*height/2,depth:v[3]};
}
