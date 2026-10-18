type V3 = [number, number, number];
type Point = { x: number; y: number };
type Face = { indices: number[]; normal: V3; tone: number; direction: number; depth: number };
type Edge = { a: Point; b: Point; tone: number; id: number };
export interface PencilDrawing {
  pitch: number; yaw: number; zoom: number; pressure: number;
  tooth: number; wander: number; light: number; emphasis: number; frame: number;
}

function random(seed: number) {
  let state = seed | 0;
  return () => {
    state = Math.imul(state ^ (state >>> 16), 0x21f0aaad);
    state = Math.imul(state ^ (state >>> 15), 0x735a2d97);
    state ^= state >>> 15;
    return (state >>> 0) / 4294967296;
  };
}
const distance = (a: Point, b: Point) => Math.hypot(a.x-b.x, a.y-b.y);
const mix = (a: Point, b: Point, t: number): Point => ({ x:a.x+(b.x-a.x)*t, y:a.y+(b.y-a.y)*t });
const angleDelta = (a: number, b: number) => Math.atan2(Math.sin(a-b),Math.cos(a-b));

/** Screen-space pencil walkers. Geometry is guidance only, never a visible fill.
 * Each walker has a seed, heading, finite lifetime and pressure envelope. Three
 * forward sensors seek an edge/tone field; deposited ink discourages crowding.
 * The same seed is replayed for a changed view, avoiding random per-frame noise.
 * This is a bounded, CPU interpretation of the original HLSL experiment, not a
 * port of its full compute pipeline or a persistent physical graphite model.
 */
export class PencilAgents {
  private ctx: CanvasRenderingContext2D;
  private field = document.createElement('canvas');
  private fieldCtx: CanvasRenderingContext2D;
  private ink = document.createElement('canvas');
  private inkCtx: CanvasRenderingContext2D;
  private grain = document.createElement('canvas');
  private grainPattern: CanvasPattern | null = null;
  private fieldSize = 128;
  private tone = new Float32Array(128*128);
  private direction = new Float32Array(128*128);
  private edgeSignal = new Float32Array(128*128);
  private deposited = new Float32Array(128*128);

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false });
    const field = this.field.getContext('2d', { willReadFrequently: true });
    const ink = this.ink.getContext('2d');
    if (!ctx || !field || !ink) throw new Error('Canvas drawing unavailable');
    this.ctx = ctx; this.fieldCtx = field; this.inkCtx = ink;
    this.field.width = this.field.height = this.fieldSize;
    this.grain.width = this.grain.height = 128;
    const grain = this.grain.getContext('2d')!;
    const pixels = grain.createImageData(128,128);
    const rng = random(32173);
    for (let i=0; i<pixels.data.length; i+=4) {
      // Sparse paper pores, applied to the deposited ink rather than the shape.
      pixels.data[i+3] = rng() > .65 ? 60+rng()*195 : rng()*35;
    }
    grain.putImageData(pixels,0,0);
    this.grainPattern = ink.createPattern(this.grain,'repeat');
  }

  draw(settings: PencilDrawing) {
    const { canvas, ctx, inkCtx, fieldCtx, fieldSize: size } = this;
    const width=canvas.width, height=canvas.height;
    if (this.ink.width !== width || this.ink.height !== height) {
      this.ink.width=width; this.ink.height=height;
    }
    // Work in a fixed drawing coordinate system; line widths survive DPR/resize.
    const h=600, w=h*width/height, scale=height/h;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle='#faf9f5'; ctx.fillRect(0,0,width,height);
    inkCtx.setTransform(1,0,0,1,0,0); inkCtx.clearRect(0,0,width,height);
    inkCtx.setTransform(scale,0,0,scale,0,0);
    inkCtx.lineCap='round'; inkCtx.lineJoin='round';
    const rng = random(18031+settings.frame*193);
    const rotate = ([x,y,z]: V3): V3 => {
      const cy=Math.cos(settings.yaw), sy=Math.sin(settings.yaw);
      const cx=Math.cos(settings.pitch), sx=Math.sin(settings.pitch);
      const yy=cx*y-sx*z, zz=sx*y+cx*z;
      return [cy*x+sy*zz, yy, -sy*x+cy*zz];
    };
    const lens=2.65*h*.52*settings.zoom*Math.min(1,width/height*.9);
    const vertices: V3[] = Array.from({length:8},(_,i)=>rotate([(i&1)? .8:-.8,(i&2)? .8:-.8,(i&4)? .8:-.8]));
    const points = vertices.map(([x,y,z],i) => {
      const jitter=random(97+i*131);
      // Shared loose construction: all strokes agree roughly, not perfectly.
      return {x:w/2+x/(4.8-z)*lens+(jitter()-.5)*(3+settings.wander*12),
              y:h/2-y/(4.8-z)*lens+(jitter()-.5)*(3+settings.wander*12)};
    });
    const lamp: V3 = [Math.cos(settings.light),.85,Math.sin(settings.light)];
    const length=Math.hypot(...lamp);
    const definitions: {indices:number[]; normal:V3}[] = [
      {indices:[0,4,6,2],normal:[-1,0,0]}, {indices:[1,3,7,5],normal:[1,0,0]},
      {indices:[0,1,5,4],normal:[0,-1,0]}, {indices:[2,6,7,3],normal:[0,1,0]},
      {indices:[0,2,3,1],normal:[0,0,-1]}, {indices:[4,5,7,6],normal:[0,0,1]},
    ];
    const faces: Face[] = definitions.map(face => {
      const normal=rotate(face.normal);
      const a=points[face.indices[0]], b=points[face.indices[1]], c=points[face.indices[3]];
      return {...face,normal, tone:Math.max(.04,.8-.8*Math.max(0,normal.reduce((s,n,i)=>s+n*lamp[i]/length,0))),
        direction:Math.atan2(b.y-a.y+(c.y-a.y)*.45,b.x-a.x+(c.x-a.x)*.45),
        depth:face.indices.reduce((s,i)=>s+vertices[i][2],0)/4};
    }).filter(face=>face.normal[2]*4.8>.8).sort((a,b)=>a.depth-b.depth);
    const front=vertices.reduce((best,v,i)=>v[2]>vertices[best][2]?i:best,0);
    const focus=points[front];
    const attention=(p:Point)=>.23+.77*Math.exp(-Math.pow(distance(p,focus)/210,2));
    const selected=(p:Point)=>1-settings.emphasis+settings.emphasis*attention(p);
    const edges=new Map<string,Edge>();
    fieldCtx.clearRect(0,0,size,size);
    faces.forEach((face,index)=>{
      fieldCtx.beginPath();
      face.indices.forEach((id,i)=>{
        const p=points[id];
        if (i===0) fieldCtx.moveTo(p.x/w*size,p.y/h*size);
        else fieldCtx.lineTo(p.x/w*size,p.y/h*size);
        const other=face.indices[(i+1)%4], key=[id,other].sort((a,b)=>a-b).join(':');
        const old=edges.get(key);
        edges.set(key,{a:points[id],b:points[other],tone:Math.max(old?.tone||0,face.tone),id:Math.min(id,other)*8+Math.max(id,other)});
      });
      fieldCtx.closePath(); fieldCtx.fillStyle=`rgb(${(index+1)*40},0,0)`; fieldCtx.fill();
    });
    const faceIds=fieldCtx.getImageData(0,0,size,size).data;
    this.deposited.fill(0); this.edgeSignal.fill(0);
    const allEdges=[...edges.values()];
    for (let y=0;y<size;y++) for (let x=0;x<size;x++) {
      const i=y*size+x, face=faces[Math.round(faceIds[i*4]/40)-1];
      this.tone[i]=face?.tone||0; this.direction[i]=face?.direction||0;
      const p={x:(x+.5)*w/size,y:(y+.5)*h/size};
      let signal=0;
      for (const edge of allEdges) {
        const dx=edge.b.x-edge.a.x, dy=edge.b.y-edge.a.y;
        const t=Math.max(0,Math.min(1,((p.x-edge.a.x)*dx+(p.y-edge.a.y)*dy)/(dx*dx+dy*dy)));
        const d=distance(p,mix(edge.a,edge.b,t));
        signal=Math.max(signal,Math.exp(-d*d/55)*(.45+edge.tone*.55));
      }
      this.edgeSignal[i]=signal;
    }
    const cell=(p:Point)=>{
      const x=Math.floor(p.x/w*size), y=Math.floor(p.y/h*size);
      return x<0||x>=size||y<0||y>=size ? -1 : y*size+x;
    };
    const sample=(p:Point,contour:boolean)=>{
      const i=cell(p);
      if (i<0) return -1;
      return (contour ? this.edgeSignal[i] : this.tone[i]*.7+this.edgeSignal[i]*.15) - this.deposited[i]*.1;
    };
    const trace=(start:Point,heading:number,steps:number,contour:boolean,seed:number)=>{
      const r=random(seed+settings.frame*193);
      const path=[start];
      let p=start, drift=0, outside=0;
      const step=2.5+r()*2;
      for (let k=0;k<steps;k++) {
        // Forward left/right sensors reproduce the essential steering mechanism.
        const sense=(a:number)=>sample({x:p.x+Math.cos(a)*8,y:p.y+Math.sin(a)*8},contour);
        const left=sense(heading-.4), center=sense(heading), right=sense(heading+.4);
        if (left>center || right>center) heading+=(right>left ? 1:-1)*(contour ? .12 : .055);
        const i=cell(p);
        if (!contour && i>=0 && this.tone[i]>0) {
          let target=this.direction[i];
          if (Math.abs(angleDelta(target,heading))>Math.PI/2) target+=Math.PI;
          heading+=angleDelta(target,heading)*.035;
        }
        drift=drift*.72+(r()-.5)*(.025+settings.wander*.13);
        heading+=drift;
        p={x:p.x+Math.cos(heading)*step,y:p.y+Math.sin(heading)*step};
        path.push(p);
        if (i>=0) this.deposited[i]+=.2;
        // Marks may overshoot the guide for a few steps, rather than being clipped.
        if (sample(p,contour)<.025) outside++; else outside=0;
        if (outside>4) break;
      }
      return path;
    };
    const stroke=(path:Point[],weight:number,opacity:number,seed:number)=>{
      if (path.length<3) return;
      const r=random(seed);
      // A pressure-shaped ribbon, not a uniform tube; dry filaments break it up.
      const sides: Point[][] = [[],[]];
      path.forEach((p,i)=>{
        const before=path[Math.max(0,i-1)], after=path[Math.min(path.length-1,i+1)];
        const len=Math.max(.01,distance(before,after));
        const envelope=.12+.88*Math.pow(Math.sin(Math.PI*i/(path.length-1)),.65);
        const radius=weight*envelope*(.65+r()*.3);
        const nx=-(after.y-before.y)/len*radius, ny=(after.x-before.x)/len*radius;
        sides[0].push({x:p.x+nx,y:p.y+ny}); sides[1].push({x:p.x-nx,y:p.y-ny});
      });
      inkCtx.beginPath();
      [...sides[0],...sides[1].reverse()].forEach((p,i)=>i?inkCtx.lineTo(p.x,p.y):inkCtx.moveTo(p.x,p.y));
      inkCtx.closePath(); inkCtx.fillStyle=`rgba(42,42,36,${opacity*.34})`; inkCtx.fill();
      const fibers=3+Math.ceil(weight*.8);
      for (let f=0;f<fibers;f++) {
        const ox=(r()-.5)*weight, oy=(r()-.5)*weight;
        inkCtx.beginPath(); let drawing=false;
        for (let j=0;j<path.length;j++) {
          const p=path[j], envelope=Math.sin(Math.PI*j/(path.length-1));
          if (r()<settings.tooth*.07 || (envelope<.3 && r()<.2)) {drawing=false;continue;}
          const x=p.x+ox+(r()-.5)*.9, y=p.y+oy+(r()-.5)*.9;
          if (drawing) inkCtx.lineTo(x,y); else inkCtx.moveTo(x,y);
          drawing=true;
        }
        inkCtx.lineWidth=(.35+r()*.65)*(1+weight*.2);
        inkCtx.strokeStyle=`rgba(35,36,30,${opacity*(.3+r()*.35)})`; inkCtx.stroke();
      }
    };

    // Loose structural accents, broken into several independently steered marks.
    for (const edge of allEdges) {
      const r=random(901+edge.id*307+settings.frame*193);
      const len=distance(edge.a,edge.b), middle=mix(edge.a,edge.b,.5);
      const importance=selected(middle)*(.35+edge.tone*.65);
      const count=Math.ceil(2+importance*7);
      for (let i=0;i<count;i++) {
        const t=(i+r()*.7)/count;
        if (r()> .28+importance*.8) continue;
        const start=mix(edge.a,edge.b,t);
        start.x+=(r()-.5)*(2+settings.wander*9); start.y+=(r()-.5)*(2+settings.wander*9);
        const heading=Math.atan2(edge.b.y-edge.a.y,edge.b.x-edge.a.x)+(r()-.5)*.12;
        const steps=Math.ceil((len/count)*(1.0+r()*.9)/3.5);
        const path=trace(start,heading,steps,true,edge.id*991+i*107+1);
        stroke(path,(1.+r()*3.4)*settings.pressure*(.4+importance),.5+importance*.45,edge.id*71+i+11);
      }
      // A few decisive structural accents earn their weight near the focus.
      const near=distance(edge.a,focus)<distance(edge.b,focus)?edge.a:edge.b;
      const far=near===edge.a?edge.b:edge.a;
      if (distance(near,focus)<25 && edge.tone>.28) {
        const start=mix(near,far,.015+r()*.04);
        const path=trace(start,Math.atan2(far.y-near.y,far.x-near.x),Math.ceil(len*(.28+r()*.22)/3.5),true,edge.id*71+719);
        stroke(path,(2.6+r()*2.6)*settings.pressure,.9,edge.id+471);
      }
    }
    // Tone is represented by unequal, locally grouped marks, never a face fill.
    let accepted=0;
    const budget=190;
    for (let attempt=0;attempt<budget*6 && accepted<budget;attempt++) {
      const face=faces[Math.floor(rng()*faces.length)];
      if (!face) break;
      const u=rng(),v=rng();
      const start=mix(mix(points[face.indices[0]],points[face.indices[1]],u),mix(points[face.indices[3]],points[face.indices[2]],u),v);
      const local=selected(start);
      if (rng()>face.tone*local*.65) continue;
      const seed=accepted*211+131;
      let heading=face.direction+(rng()-.5)*(.3+settings.wander*.7);
      if (rng()<.17*face.tone) heading+=1.0;
      const steps=5+Math.floor(rng()*17*(.6+local));
      const path=trace(start,heading,steps,false,seed);
      const width=(1.1+rng()*4.5)*settings.pressure*(.5+face.tone*.7);
      stroke(path,width,(.40+face.tone*.5)*(.55+local*.45),seed);
      accepted++;
    }
    // Preserve grain inside heavy accents, with no exact geometric mask.
    inkCtx.setTransform(1,0,0,1,0,0);
    inkCtx.globalCompositeOperation='destination-out';
    inkCtx.globalAlpha=settings.tooth*.8;
    if (this.grainPattern) { inkCtx.fillStyle=this.grainPattern; inkCtx.fillRect(0,0,width,height); }
    inkCtx.globalAlpha=1; inkCtx.globalCompositeOperation='source-over';
    ctx.drawImage(this.ink,0,0);
  }
}
