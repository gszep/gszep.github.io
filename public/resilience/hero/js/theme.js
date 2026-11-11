// Read once after the optional stylesheet has loaded. Reload to
// preview edits: CSS and both GPU backends always use the same token snapshot.
export function readTheme() {
  const style = getComputedStyle(document.documentElement);
  const value = (name) => style.getPropertyValue(`--${name}`).trim();
  const rgb = (name) => {
    const components = value(name).split(/\s+/).map(Number);
    if (components.length !== 3 || components.some((n) => !Number.isFinite(n) || n < 0 || n > 1)) {
      throw new Error(`Invalid --${name}: expected three RGB values from 0 to 1`);
    }
    return components;
  };
  const hex = (name) => {
    const text = value(name);
    if (!/^#[\da-f]{6}$/i.test(text)) throw new Error(`Invalid --${name}: expected #rrggbb`);
    return text.slice(1).match(/../g).map((n) => parseInt(n, 16));
  };
  return {
    background: rgb('scene-background'), highlight: rgb('scene-highlight'),
    hover: rgb('scene-hover'), ink: rgb('scene-ink'),
    lineSurface: rgb('scene-line-surface'), lightTint: rgb('scene-light-tint'),
    materials: Object.fromEntries(['carrier', 'converter', 'converter-edge', 'hub', 's3', 'upper-leg', 'lower-leg']
      .map((name) => [name, hex(`part-${name}`)])),
  };
}

// Explicit allowlist of decorative surfaces. Original byte colours identify
// substrate faces in multi-material CAD parts; they are NOT palette defaults.
// Nothing in cable-routing.json, test probes or physical hardware is rewritten.
export function applyMaterials(mesh, parts, theme) {
  const substrates = {
    'carrier.display': [[20, 107, 61, 'carrier']],
    'converter.pcb': [[50, 76, 52, 'converter'], [26, 51, 26, 'converter-edge']],
    'servo_hub.body': [[43, 82, 123, 'hub']],
    's3.component.Part__Feature030': [[22, 23, 24, 's3']],
  };
  mesh.decorative = new Uint8Array(mesh.positions.length / 3);
  for (const part of parts) {
    const leg = part.id.match(/^external\.leg\.[LR]([1-4])$/);
    const rules = leg ? [Number(leg[1]) <= 2
      ? [224, 173, 135, 'upper-leg'] : [140, 181, 196, 'lower-leg']] : substrates[part.id];
    if (!rules) continue;
    const [start, count] = part.vertices;
    for (let v = start; v < start + count; v++) {
      const i = v * 3;
      const match = rules.find(([r, g, b]) => mesh.colors[i] === r && mesh.colors[i + 1] === g && mesh.colors[i + 2] === b);
      if (!match) continue;
      mesh.colors.set(theme.materials[match[3]], i);
      mesh.decorative[v] = 255;
    }
  }
}

// These colours identify conductors, polarity, controls or test expectations.
// Keep their legacy highlight/edge colours too, even under a branded theme.
export function isPhysicalColour(part) {
  return !!part.metadata?.CableKind || !!part.metadata?.Signal
    || /(?:wire|jumper|pin|solder|socket|terminal|spacer|offcut|adjustment_screw|battery|\.oled\.|\.power\.|\.i2c\.|\.switch\.)/i.test(part.id);
}
