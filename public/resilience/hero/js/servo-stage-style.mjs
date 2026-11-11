// Line mode makes all physical parts, including wires, monochrome. Keep only
// the instructional neutral-position indicators and active OLED face graphics.
export const PRINTED_PLASTIC_RGB=Object.freeze([238,238,232]);
export function preserveLineColour(part){
  return ['layout','face'].includes(part.kind);
}
