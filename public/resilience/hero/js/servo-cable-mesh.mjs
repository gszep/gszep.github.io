// Smooth shared-vertex sweeps of the existing elastic-rod solver's poses.
// Three strands share ONE transported frame and continuous insulation webs.
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const mul=(a,s)=>a.map(v=>v*s);
const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>mul(a,1/Math.max(1e-12,Math.hypot(...a)));
const project=(a,t)=>{const n=sub(a,mul(t,dot(a,t)));return Math.hypot(...n)>1e-8?unit(n):unit(cross(t,Math.abs(t[2])<.9?[0,0,1]:[0,1,0]));};
const smooth=t=>t*t*(3-2*t);
export const CABLE_STYLE={radius:.675,pitch:1.25,terminalPitch:2.54,radial:16,fanoutMm:10,webHalfThickness:.16};

export function cableSweep(points, colors, ribbon=true, options={}) {
  const {radius,pitch,terminalPitch,radial,fanoutMm,webHalfThickness}={...CABLE_STYLE,...options};
  const positions=[],normals=[],rgb=[],indices=[],centers=colors.map(()=>[]);
  const tangents=points.map((_,i)=>unit(sub(points[Math.min(i+1,points.length-1)],points[Math.max(0,i-1)])));
  tangents[0]=options.startTangent||(ribbon?[0,1,0]:[0,0,1]);tangents[tangents.length-1]=options.endTangent||[0,0,-1];
  const arc=[0];for(let i=1;i<points.length;i++)arc.push(arc[i-1]+Math.hypot(...sub(points[i],points[i-1])));
  const length=arc.at(-1),transport=[];
  let n=project(options.startSide||[1,0,0],tangents[0]);
  for(const t of tangents){n=project(n,t);transport.push(n);}
  const end=project(options.endSide||(ribbon?[0,1,0]:[1,0,0]),tangents.at(-1));
  const angle=Math.atan2(dot(cross(transport.at(-1),end),tangents.at(-1)),dot(transport.at(-1),end));
  const anchors=[{index:0,angle:0}];
  for(const guide of [...(options.sideGuides||[]),{index:points.length-1,side:end}].sort((a,b)=>a.index-b.index)){
    const i=Math.max(0,Math.min(points.length-1,guide.index)),target=project(guide.side,tangents[i]);
    let value=Math.atan2(dot(cross(transport[i],target),tangents[i]),dot(transport[i],target));
    const previous=anchors.at(-1).angle;while(value-previous>Math.PI)value-=2*Math.PI;while(value-previous< -Math.PI)value+=2*Math.PI;
    if(i===anchors.at(-1).index)anchors[anchors.length-1]={index:i,angle:value};else anchors.push({index:i,angle:value});
  }
  let segment=0;
  const frames=points.map((point,i)=>{
    while(segment<anchors.length-2&&i>anchors[segment+1].index)segment++;
    const left=anchors[segment],right=anchors[Math.min(segment+1,anchors.length-1)];
    const twist=options.sideGuides?left.angle+(right.angle-left.angle)*smooth((arc[i]-arc[left.index])/Math.max(1e-12,arc[right.index]-arc[left.index])):angle*smooth(arc[i]/length),t=tangents[i],a=transport[i];
    const side=add(mul(a,Math.cos(twist)),mul(cross(t,a),Math.sin(twist)));
    const up=unit(cross(t,side));
    const spread=pitch+(terminalPitch-pitch)*smooth(Math.max(0,1-(length-arc[i])/fanoutMm));
    return {point,side,up,spread};
  });
  const vertex=(p,n,c)=>{const index=positions.length/3;positions.push(...p);normals.push(...n);rgb.push(...c);return index;};
  const strip=(base,columns)=>{
    for(let i=0;i<points.length-1;i++)for(let j=0;j<columns;j++){
      const a=base+i*columns+j,b=base+i*columns+(j+1)%columns;
      indices.push(a,b,a+columns,b,b+columns,a+columns);
    }
  };
  colors.forEach((color,c)=>{
    const base=positions.length/3;
    frames.forEach(({point,side,up,spread})=>{
      const center=add(point,mul(side,ribbon?(c-1)*spread:0));centers[c].push(center);
      for(let j=0;j<radial;j++){
        const angle=j*2*Math.PI/radial,normal=add(mul(side,Math.cos(angle)),mul(up,Math.sin(angle)));
        vertex(add(center,mul(normal,radius)),normal,color);
      }
    });
    strip(base,radial);
  });
  if(ribbon)for(let c=0;c<2;c++) {
    // Web joins the coloured insulation lobes, ending before the short fan-out
    // into the housing. It is a fused ribbon, not three unrelated wire curves.
    const base=positions.length/3;
    frames.forEach(({point,side,up,spread},i)=>{
      const joined=1-smooth(Math.max(0,1-(length-arc[i])/fanoutMm));
      const web=webHalfThickness*joined,mid=(c-.5)*spread,half=spread*.5*joined;
      for(const [offset,sign] of [[mid-half,1],[mid+half,1],[mid+half,-1],[mid-half,-1]]){
        vertex(add(add(point,mul(side,offset)),mul(up,sign*web)),mul(up,sign),colors[c]);
      }
    });
    strip(base,4);
  }
  return {positions:Float32Array.from(positions),normals:Float32Array.from(normals),colors:Uint8Array.from(rgb),indices:Uint32Array.from(indices),centers,length};
}

export function posePair(route,lift) {
  const value=Math.max(0,Math.min(12,lift)),index=value<=6?0:1;
  return {a:route.states[index],b:route.states[index+1],fraction:(value-index*6)/6};
}

export function cablePoints(route,lift) {
  const {a,b,fraction}=posePair(route,lift);
  return a.points.map((point,i)=>point.map((v,k)=>v+(b.points[i][k]-v)*fraction));
}
