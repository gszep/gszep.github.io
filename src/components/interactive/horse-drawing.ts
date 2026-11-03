import { graphiteStroke, pencilRandom } from './pencil-brush';
import { planarStroke, type DrawingPoint } from './pencil-facades';
import { horseBlocks, type HorseSettings, type HorseState, type Vec3 } from './horse-model';

const faceDefinitions = [
  {ids:[0,4,6,2],n:[-1,0,0]}, {ids:[1,3,7,5],n:[1,0,0]},
  {ids:[0,1,5,4],n:[0,-1,0]}, {ids:[2,6,7,3],n:[0,1,0]},
  {ids:[0,2,3,1],n:[0,0,-1]}, {ids:[4,5,7,6],n:[0,0,1]},
];
type DrawFace = {id:number; points:DrawingPoint[]; depth:number; tone:number};
export class HorseDrawing {
  private ctx: CanvasRenderingContext2D;
  private paper: CanvasPattern | string;
  constructor(private canvas:HTMLCanvasElement) {
    const ctx=canvas.getContext('2d',{alpha:false});
    if (!ctx) throw new Error('Canvas drawing is unavailable');
    this.ctx=ctx;
    const tile=document.createElement('canvas');tile.width=tile.height=128;
    const tc=tile.getContext('2d')!;
    const image=tc.createImageData(128,128),random=pencilRandom(8817);
    for(let i=0;i<image.data.length;i+=4){
      const grain=(random()-.5)*9;
      image.data[i]=218+grain;image.data[i+1]=187+grain;image.data[i+2]=139+grain;image.data[i+3]=255;
    }
    tc.putImageData(image,0,0);
    this.paper=ctx.createPattern(tile,'repeat')||'#dabb8b';
  }
  draw(state:HorseState,settings:HorseSettings,yaw:number,elevation:number,shading:boolean) {
    const {canvas,ctx}=this;
    const dpr=canvas.height/600,w=canvas.width/dpr,h=600;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle=this.paper;ctx.fillRect(0,0,w,h);
    ctx.lineCap='round';ctx.lineJoin='round';
    const hop=Math.max(0,state.height-1.8);
    const scale=Math.min(w/6.9,h/(5.25+hop*.95));
    const rotate=([x,y,z]:Vec3):Vec3=>{
      const a=Math.cos(yaw)*x-Math.sin(yaw)*z, d=Math.sin(yaw)*x+Math.cos(yaw)*z;
      return [a,Math.cos(elevation)*y-Math.sin(elevation)*d,Math.sin(elevation)*y+Math.cos(elevation)*d];
    };
    const project=(p:Vec3)=>{
      const v=rotate([p[0]-.2,p[1]-2.02-hop*.52,p[2]]);
      return {x:w/2+v[0]*scale,y:h*.5-v[1]*scale,depth:v[2]};
    };
    const mark=(points:DrawingPoint[],width:number,opacity:number,seed:number)=>graphiteStroke(ctx,points,width,opacity,seed,.65);
    // The ground moves; the horse runs in place so the sketch stays on the page.
    for(let i=0;i<20;i++){
      const x=((i*.43-state.time*settings.speed*1.9)%8.6+8.6)%8.6-4.3;
      const z=(pencilRandom(i+53)()-.5)*1.5;
      const a=project([x,-.03,z]),b=project([x+.12,-.03,z]);
      mark([a,{x:(a.x+b.x)/2,y:(a.y+b.y)/2+.4},b],.6,.18,i+311);
    }
    for(let i=0;i<7;i++){
      const z=(i-3)*.09,a=project([-1.3,0,z]),b=project([1.2,0,z]);
      mark([a,{x:(a.x+b.x)/2,y:(a.y+b.y)/2+.5},b],1.3,.08/(1+hop),i+481);
    }
    const faces:DrawFace[]=[];
    for(const block of horseBlocks(state,settings)){
      const turn=([x,y,z]:Vec3):Vec3=>[x*Math.cos(block.angle)-y*Math.sin(block.angle),x*Math.sin(block.angle)+y*Math.cos(block.angle),z];
      const vertices=Array.from({length:8},(_,i)=>{
        const p=turn([(i&1?1:-1)*block.size[0]/2,(i&2?1:-1)*block.size[1]/2,(i&4?1:-1)*block.size[2]/2]);
        return project([p[0]+block.center[0],p[1]+block.center[1],p[2]+block.center[2]]);
      });
      faceDefinitions.forEach((face,index)=>{
        const normal=rotate(turn(face.n as Vec3));
        if(normal[2]<.015)return;
        const light=Math.max(0,normal[0]*-.4+normal[1]*.7+normal[2]*.55);
        faces.push({id:block.id*6+index,points:face.ids.map(i=>vertices[i]),
          depth:face.ids.reduce((sum,i)=>sum+vertices[i].depth,0)/4,tone:.12+.75*(1-light)});
      });
    }
    faces.sort((a,b)=>a.depth-b.depth);
    for(const face of faces){
      const p=face.points,random=pencilRandom(face.id*171+73);
      // Paper-colour hidden-surface masks, not solid coloured/shaded faces.
      ctx.beginPath();p.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.closePath();
      ctx.fillStyle=this.paper;ctx.fill();
      if(shading){
        ctx.save();ctx.clip();
        const area=Math.abs(p.reduce((sum,v,i)=>{const b=p[(i+1)%4];return sum+v.x*b.y-b.x*v.y},0))/2;
        const count=Math.min(22,Math.floor(area/190*face.tone));
        const angle=Math.atan2(p[1].y-p[0].y+(p[3].y-p[0].y)*.3,p[1].x-p[0].x+(p[3].x-p[0].x)*.3);
        for(let i=0;i<count;i++){
          const u=random(),v=random();
          const start={x:(1-v)*(p[0].x+(p[1].x-p[0].x)*u)+v*(p[3].x+(p[2].x-p[3].x)*u),
            y:(1-v)*(p[0].y+(p[1].y-p[0].y)*u)+v*(p[3].y+(p[2].y-p[3].y)*u)};
          const path=planarStroke(start,angle,8+random()*22,(random()-.5)*1.5,random()*6.28,p,1.6);
          mark(path,.55+random()*.65,.3+face.tone*.4,face.id*719+i);
        }
        ctx.restore();
      }
      // Broken, slightly misregistered contour sweeps retain the original sketch.
      for(let e=0;e<4;e++){
        const r=pencilRandom(face.id*43+e*137+89),a=p[e],b=p[(e+1)%4];
        const length=Math.hypot(b.x-a.x,b.y-a.y);
        if(length<2)continue;
        const begin=r()*.13,end=.84+r()*.22;
        const points=Array.from({length:6},(_,j)=>{
          const t=begin+(end-begin)*j/5;
          return {x:a.x+(b.x-a.x)*t+(r()-.5)*1.6,y:a.y+(b.y-a.y)*t+(r()-.5)*1.6};
        });
        mark(points,.65+r()*.8,.48+face.tone*.38,face.id*101+e);
      }
    }
  }
}
