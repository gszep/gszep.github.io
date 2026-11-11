const JUMPERS = { L: 'Red_L', B: 'Red_B', K: 'Blue_K', J: 'Green_J' };
function componentOf(part) {
  const id = part.id;
  if (id.startsWith('body.')) return part.chain[1];
  if (id.startsWith('external.')) return part.chain[1];
  if (part.chain.includes('YAAJ_DCDC_StepDown_LM2596_cp')) return 'converter';
  if (part.chain.includes('PCA9685')) return 'hub';
  if (id.startsWith('s3.component.')) return 's3';
  if (part.chain.length === 1 && part.chain[0] === 'AssembledElectronics') return 'carrier';
  if (id === 'tape') return 'tape';
  const rules = [
    [/^(?:pins|offcut|spacer|top_solder|converter_hole_fill|carrier_hole_fill|bottom_solder)\.(\w+)$/, 'converter-pin.'],
    [/^underside\.(?:wire|solder)\.(\d+)/, 'wire.'],
    [/^jumper\.(?:core|insulation)\.(\w+)$/, 'jumper.'],
    [/^(?:auxiliary\.(?:pin|spacer)|aux\.solder)\.([A-Z])/, 'aux-header.'],
    [/^(?:hub\.male_pin\.|hub\.(?:Original|Donor)Spacer\.|HubHeaderSolder_)([A-Z])/, 'hub-header.'],
    [/^(?:hub\.socket_(?:contact|tail|housing)\.|SocketBottomSolder_)([A-Z])/, 'hub-socket.'],
    [/^s3\.(?:male_pin|top_solder|male_spacer)\.[A-Z]?(\d+)$/, 's3-header.'],
    [/^s3\.(?:socket_contact|socket_tail|socket_housing|bottom_solder)\.[A-Z]?(\d+)$/, 's3-socket.'],
  ];
  for (const [re, prefix] of rules) {
    const m = id.match(re);
    if (m) return prefix + m[1];
  }
  const solder = id.match(/^jumper\.solder\.([A-Z])/);
  if (solder) return 'jumper.' + JUMPERS[solder[1]];
  return id;
}


export { componentOf };
