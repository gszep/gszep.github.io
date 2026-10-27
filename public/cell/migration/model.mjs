// Reduced signaling → effective actin → overdamped, area-constrained boundary.
// Dimensionless qualitative model; no experimental parameter fit or explicit filaments.
export const defaults = Object.freeze({
  intensity: 1,
  width: 0.55,
  pipTime: 0.8,
  adaptationTime: 12,
  inhibition: 4,
  turnover: 0.35,
  polymerization: 0.7,
  coupling: 2,
  tension: 8,
  feedback: 0.7,
});
const fields = ["pip", "rac", "inhibitor", "actin"];
const clamp = (x) => Math.max(0, Math.min(1, x));

export function geometry(points) {
  let twiceArea = 0,
    cx = 0,
    cy = 0;
  const n = points.length;
  const edges = points.map((p, i) => {
    const q = points[(i + 1) % n];
    const cross = p.x * q.y - q.x * p.y;
    twiceArea += cross;
    cx += (p.x + q.x) * cross;
    cy += (p.y + q.y) * cross;
    return Math.hypot(q.x - p.x, q.y - p.y);
  });
  const center = { x: cx / (3 * twiceArea), y: cy / (3 * twiceArea) };
  const perimeter = edges.reduce((a, b) => a + b, 0);
  const boundary = points.map((p, i) => {
    const before = points[(i + n - 1) % n],
      after = points[(i + 1) % n];
    const lm = edges[(i + n - 1) % n],
      lp = edges[i];
    const tx = after.x - before.x,
      ty = after.y - before.y;
    const length = Math.hypot(tx, ty),
      nx = ty / length,
      ny = -tx / length;
    const ds = (lm + lp) / 2;
    const kx = ((after.x - p.x) / lp - (p.x - before.x) / lm) / ds;
    const ky = ((after.y - p.y) / lp - (p.y - before.y) / lm) / ds;
    return { nx, ny, ds, curvature: kx * nx + ky * ny, lm, lp };
  });
  return { area: twiceArea / 2, center, perimeter, edges, boundary };
}

export class MigrationModel {
  constructor(parameters = {}, count = 64) {
    this.parameters = { ...defaults, ...parameters };
    this.count = count;
    this.stimulus = { mode: "local", angle: 0, frame: "cell", x: 10, y: 0, radius: 6 };
    this.reset();
  }

  reset() {
    this.points = Array.from({ length: this.count }, (_, i) => {
      const angle = (2 * Math.PI * i) / this.count;
      return { x: 10 * Math.cos(angle), y: 10 * Math.sin(angle), pip: 0, rac: 0, inhibitor: 0, actin: 0 };
    });
    this.targetArea = geometry(this.points).area;
    this.time = 0;
    this.steps = 0;
    this.velocity = { x: 0, y: 0 };
  }

  lightAt(p, center = geometry(this.points).center) {
    const s = this.stimulus,
      a = this.parameters;
    if (s.mode === "off") return 0;
    if (s.mode === "global") return a.intensity;
    if (s.frame === "world" && s.mode === "local") {
      const d2 = (p.x - s.x) ** 2 + (p.y - s.y) ** 2;
      return a.intensity * Math.exp(-d2 / (2 * s.radius ** 2));
    }
    const angle = Math.atan2(p.y - center.y, p.x - center.x) - s.angle;
    const bump = (offset) => Math.exp((Math.cos(angle + offset) - 1) / a.width ** 2);
    return a.intensity * (s.mode === "paired" ? Math.max(bump(0), bump(Math.PI)) : bump(0));
  }

  // Keep a well-spaced polygon; interpolate attached intensive activities, not molecular counts.
  remesh() {
    const { edges, perimeter } = geometry(this.points);
    const arc = [0];
    for (const length of edges) arc.push(arc[arc.length - 1] + length);
    // Zero-mean tangential redistribution. Pinning node zero instead introduces
    // index-dependent field transport and breaks rotational symmetry during motion.
    const offset = this.points.reduce((sum, _, i) => sum + arc[i] - (i * perimeter) / this.count, 0) / this.count;
    this.points = this.points.map((_, i, points) => {
      const distance = ((i * perimeter) / points.length + offset + perimeter) % perimeter;
      let lo = 0,
        hi = points.length;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (arc[mid] <= distance) lo = mid;
        else hi = mid;
      }
      const segment = lo,
        t = (distance - arc[segment]) / edges[segment];
      const p = points[segment],
        q = points[(segment + 1) % points.length];
      return Object.fromEntries(["x", "y", ...fields].map((key) => [key, p[key] * (1 - t) + q[key] * t]));
    });
  }

  step(dt = 0.02) {
    if (!(dt > 0 && dt <= 0.02)) throw new RangeError("Use 0 < dt <= 0.02; substep longer intervals.");
    const a = this.parameters,
      points = this.points,
      n = points.length;
    const g = geometry(points);
    const meanRac = points.reduce((sum, p, i) => sum + p.rac * g.boundary[i].ds, 0) / g.perimeter;
    const updated = points.map((p, i) => {
      const before = points[(i + n - 1) % n],
        after = points[(i + 1) % n];
      const { lm, lp, ds } = g.boundary[i];
      const lap = (key) => ((after[key] - p[key]) / lp - (p[key] - before[key]) / lm) / ds;
      const light = this.lightAt(p, g.center);
      const recruitment = 2 * p.pip + (a.feedback * p.rac ** 2) / (0.2 ** 2 + p.rac ** 2);
      return {
        ...p,
        pip: clamp(p.pip + dt * ((light - p.pip) / a.pipTime + 0.15 * lap("pip"))),
        rac: clamp(p.rac + dt * ((recruitment * (1 - p.rac)) / (1 + 2 * meanRac) - (0.5 + a.inhibition * p.inhibitor) * p.rac + 0.12 * lap("rac"))),
        inhibitor: clamp(p.inhibitor + dt * ((p.rac - p.inhibitor) / a.adaptationTime + 0.02 * lap("inhibitor"))),
        actin: clamp(p.actin + dt * (a.polymerization * p.rac * (1 - p.actin) - a.turnover * p.actin)),
      };
    });
    // Local active protrusion is an effective substrate-anchored actin traction.
    // There is no light, desired heading, or centroid target in this force law.
    const speeds = points.map((p, i) => a.coupling * p.actin + a.tension * g.boundary[i].curvature);
    const pressure = -speeds.reduce((sum, speed, i) => sum + speed * g.boundary[i].ds, 0) / g.perimeter;
    this.points = updated.map((p, i) => ({
      ...p,
      x: p.x + dt * (speeds[i] + pressure) * g.boundary[i].nx,
      y: p.y + dt * (speeds[i] + pressure) * g.boundary[i].ny,
    }));
    this.remesh();
    // Small projection removes discretization/remeshing area error, around actual centroid.
    const next = geometry(this.points);
    if (!(next.area > 0) || !Number.isFinite(next.area)) throw new Error("Boundary lost orientation/stability");
    const scale = Math.sqrt(this.targetArea / next.area);
    for (const p of this.points) {
      p.x = next.center.x + scale * (p.x - next.center.x);
      p.y = next.center.y + scale * (p.y - next.center.y);
    }
    this.velocity = { x: (next.center.x - g.center.x) / dt, y: (next.center.y - g.center.y) / dt };
    this.time += dt;
    this.steps++;
  }

  advance(duration, dt = 0.02) {
    for (let i = 0; i < Math.round(duration / dt); i++) this.step(dt);
    return this.diagnostics();
  }

  diagnostics() {
    const g = geometry(this.points);
    const means = Object.fromEntries(fields.map((key) => [key, this.points.reduce((s, p, i) => s + p[key] * g.boundary[i].ds, 0) / g.perimeter]));
    const polarity = this.points.reduce(
      (v, p, i) => {
        const b = g.boundary[i];
        return { x: v.x + (p.actin * b.nx * b.ds) / g.perimeter, y: v.y + (p.actin * b.ny * b.ds) / g.perimeter };
      },
      { x: 0, y: 0 }
    );
    return {
      time: this.time,
      center: g.center,
      areaRatio: g.area / this.targetArea,
      perimeter: g.perimeter,
      speed: Math.hypot(this.velocity.x, this.velocity.y),
      velocity: this.velocity,
      polarity,
      means,
    };
  }
}
