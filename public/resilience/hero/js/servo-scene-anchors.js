// Audited against APS 1325448ebc0a6b8da7d933bd0cf14d0132096166.
// Channel order was read from the actual triangulated top silkscreen glyphs in
// assembly.bin (not inferred from object-number order). CH0..7 glyph objects:
// 244="0", 247="1", 280="2", 190="3", 198="4", 201="5", 202="6", 209="7".
// Each sits directly behind the corresponding three-pin column below. The
// source CAD contains two coincident header copies, which are retained as aliases.
// Row meanings: scripts/export_sesame_build.py::split_servo_pins and
// js/steps.js::SERVO_COLUMN explicitly say edge-inwards 0=GND, 1=V+, 2=PWM.
const COLUMNS = [115,116,117,118,119,121,122,120];
const GLYPHS = [244,247,280,190,198,201,202,209];
export const CONDUCTORS = [
  {signal:'GND',color:'#754a2b',rgb:[117,74,43]},
  {signal:'V+',color:'#d33333',rgb:[211,51,51]},
  {signal:'PWM',color:'#f3cc2e',rgb:[243,204,46]},
];
export const ANCHOR_EVIDENCE = {
  repository:'aps',revision:'1325448ebc0a6b8da7d933bd0cf14d0132096166',
  manifest:'docs/ii/sesame-build/assets/assembly.json',
  manifestSha256:'8ef6fbdef4b51c96b49e3432be0da74270e90d9de1340c71bed708a56d064518',
  binarySha256:'f3d48ca85b8bb8acac69b05d85c13ca44ccc10b62b9439b0e746b37e674341d2',
  pinRows:'scripts/export_sesame_build.py:split_servo_pins; js/steps.js:SERVO_COLUMN',
  channels:'Native top silkscreen digits 0–7, checked against column centres. Not a measured robot joint/channel assignment.',
  usb:'s3.component.Part__Feature022 is labelled S3 USB-C shell. sim2real fcb9cc710a751bc3a5dfc6d16de7bd27a60d299f assets/cad/instructions/s3-installation.json places USB toward A (carrier +X). Opening centre inferred from that shell envelope, not connector fit measurement.',
};

export function sceneAnchors(manifest,offset=[-35,-25,0],rotation=0) {
  const requirePart=id=>{
    const found=manifest.parts.filter(p=>p.id===id);
    if(found.length!==1)throw new Error(`Missing or ambiguous scene anchor: ${id}`);
    return found[0];
  };
  const centre=p=>p.bbox[0].map((v,i)=>(v+p.bbox[1][i])/2);
  const moved=p=>{const [x,y,z]=p.map((v,i)=>v+offset[i]);return [x*Math.cos(rotation)-y*Math.sin(rotation),x*Math.sin(rotation)+y*Math.cos(rotation),z];};
  const channels=COLUMNS.map((column,channel)=>{
    const prefix=`cad.Part__Feature${column}`,also=`cad.Part__Feature${column+16}`;
    const housing=requirePart(prefix),glyph=requirePart(`cad.Part__Feature${GLYPHS[channel]}`);
    // Glyph ink is not centred identically (notably the sloping "7"); allow
    // its native offset, still less than half of the 2.54-mm column pitch.
    if(Math.abs(centre(glyph)[0]-centre(housing)[0])>1)throw new Error(`Channel ${channel} label/column alignment changed`);
    const pins=CONDUCTORS.map((conductor,row)=>{
      const part=requirePart(`${prefix}.pin.${row}`),duplicate=requirePart(`${also}.pin.${row}`);
      if(part.bbox.some((v,i)=>v.some((x,j)=>Math.abs(x-duplicate.bbox[i][j])>0.001)))throw new Error('Coincident header copies changed');
      const c=centre(part),point=moved([c[0],c[1],part.bbox[1][2]]);
      return {...conductor,part:part.id,also:[duplicate.id],point};
    });
    if(pins.some((p,i)=>i&&Math.hypot(...p.point.map((v,k)=>v-pins[i-1].point[k]-[-Math.sin(rotation)*2.54,Math.cos(rotation)*2.54,0][k]))>0.001))throw new Error('Header row orientation changed');
    return {channel,part:prefix,also:[also],labelPart:glyph.id,point:[...pins[1].point],
      plugBaseZ:housing.bbox[1][2]+offset[2]+0.3,pins};
  });
  const shell=requirePart('s3.component.Part__Feature022'),c=centre(shell);
  if(shell.label!=='S3 USB-C shell')throw new Error('USB shell anchor identity changed');
  const tip=id=>{const p=requirePart(id),mid=centre(p);return {part:id,point:moved([mid[0],mid[1],p.bbox[1][2]])};};
  const clock={
    output:{...tip('cad.Part__Feature128.pin.2'),label:'CH15 · SIGNAL',referenceCadOnly:true},
    input:{...tip('s3.male_pin.F17'),label:'GPIO4 · F17'},
    evidence:'S3 GPIO4/F17 follows the instructor photo supplied 2026-10-22, right row 7,6,5,4,3,2,1,RX,TX with USB toward A. Hub CH15 uses reference-CAD silkscreen; actual photographed hub end orientation differs/needs printed-number confirmation. Never select an end by guesswork.',
  };
  return {channels,clock,usb:{part:shell.id,point:moved([shell.bbox[1][0],c[1],c[2]]),approach:[Math.cos(rotation),Math.sin(rotation),0]},evidence:ANCHOR_EVIDENCE};
}
