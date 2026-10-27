import { MigrationModel, defaults, geometry } from "./model.mjs";

const $ = (id) => document.getElementById(id);
const model = new MigrationModel();
const cell = $("cell"),
  trace = $("trace");
const colors = { pip: "#73aeff", rac: "#f1a6d5", inhibitor: "#ecb873", actin: "#72e8bd" };
let paused = false,
  history = [],
  path = [],
  events = [],
  lastSample = -1,
  accumulator = 0;
let protocolSwitched = false,
  camera = { x: 0, y: 0 },
  view = { width: 1, height: 1, scale: 1 };

function recordEvent(action) {
  events.push({ time: model.time, action, stimulus: { ...model.stimulus }, parameters: { ...model.parameters } });
}
function setMode(mode) {
  model.stimulus.mode = mode;
  if (mode === "paired") model.stimulus.frame = "cell";
  $("frame").value = model.stimulus.frame;
  document.querySelectorAll("[data-mode]").forEach((button) => button.classList.toggle("selected", button.dataset.mode === mode));
  const directional = mode === "local" || mode === "paired";
  $("angle").disabled = !directional;
  $("frame").disabled = mode !== "local";
  $("status").textContent = { local: "Localized input", off: "No input", global: "Uniform input · no directional cue", paired: "Symmetric opposite sectors" }[
    mode
  ];
  recordEvent("stimulus");
}
function manual() {
  $("protocol").value = "manual";
}
document.querySelectorAll("[data-mode]").forEach(
  (button) =>
    (button.onclick = () => {
      manual();
      setMode(button.dataset.mode);
    })
);
function setAngle(angle) {
  model.stimulus.angle = angle;
  $("angle").value = (angle * 180) / Math.PI;
  $("angle-value").textContent = `${Math.round((angle * 180) / Math.PI)}°`;
}
$("angle").oninput = () => {
  manual();
  setAngle((Number($("angle").value) * Math.PI) / 180);
  const center = geometry(model.points).center;
  model.stimulus.x = center.x + 10 * Math.cos(model.stimulus.angle);
  model.stimulus.y = center.y + 10 * Math.sin(model.stimulus.angle);
  recordEvent("direction");
};
$("frame").onchange = () => {
  manual();
  model.stimulus.frame = $("frame").value;
  const center = geometry(model.points).center;
  model.stimulus.x = center.x + 10 * Math.cos(model.stimulus.angle);
  model.stimulus.y = center.y + 10 * Math.sin(model.stimulus.angle);
  recordEvent("reference frame");
};
function syncParameters() {
  document.querySelectorAll("[data-param]").forEach((input) => {
    input.value = model.parameters[input.dataset.param];
    $(`${input.dataset.param}-value`).textContent = Number(input.value).toFixed(input.step === "1" ? 0 : 2);
  });
  model.stimulus.radius = 10 * model.parameters.width;
}
document.querySelectorAll("[data-param]").forEach(
  (input) =>
    (input.oninput = () => {
      model.parameters[input.dataset.param] = Number(input.value);
      syncParameters();
      recordEvent(input.dataset.param);
    })
);
function reset() {
  model.reset();
  history = [];
  path = [];
  events = [];
  lastSample = -1;
  accumulator = 0;
  camera = { x: 0, y: 0 };
  protocolSwitched = false;
  if ($("protocol").value !== "manual") {
    model.stimulus.frame = "cell";
    setAngle(0);
    setMode("local");
  }
  recordEvent("reset");
  sample();
}
$("reset").onclick = reset;
$("defaults").onclick = () => {
  model.parameters = { ...defaults };
  model.stimulus.frame = "cell";
  model.stimulus.x = 10;
  model.stimulus.y = 0;
  manual();
  $("follow").checked = false;
  $("rate").value = "2";
  setAngle(0);
  setMode("local");
  syncParameters();
  reset();
};
$("protocol").onchange = reset;
$("pause").onclick = () => {
  paused = !paused;
  $("pause").textContent = paused ? "Play" : "Pause";
};
$("recenter").onclick = () => {
  camera = { ...geometry(model.points).center };
};
$("export").onclick = () => {
  const data = {
    model: "qualitative-migration-v1",
    units: "dimensionless",
    initialRadius: 10,
    count: model.count,
    dt: 0.02,
    parameters: model.parameters,
    stimulus: model.stimulus,
    events,
    history,
    points: model.points,
    note: "Bounded trace buffer; controls log and state are not experimentally calibrated data.",
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "migration-trace.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
function positionLight(event) {
  manual();
  const rect = cell.getBoundingClientRect();
  const x = (event.clientX - rect.left - view.width / 2) / view.scale + camera.x;
  const y = -(event.clientY - rect.top - view.height / 2) / view.scale + camera.y;
  const center = geometry(model.points).center;
  setAngle(Math.atan2(y - center.y, x - center.x));
  model.stimulus.x = x;
  model.stimulus.y = y;
  setMode("local");
}
cell.onpointerdown = (event) => {
  cell.setPointerCapture(event.pointerId);
  positionLight(event);
};
cell.onpointermove = (event) => {
  if (cell.hasPointerCapture(event.pointerId)) positionLight(event);
};
cell.onpointerup = (event) => cell.releasePointerCapture(event.pointerId);

function sample() {
  if (model.time - lastSample < 0.2) return;
  lastSample = model.time;
  const d = model.diagnostics();
  history.push(d);
  path.push({ ...d.center });
  if (history.length > 3000) history.shift();
  if (path.length > 3000) path.shift();
  $("time").textContent = d.time.toFixed(1);
  $("speed").textContent = d.speed.toFixed(3);
  $("area").textContent = d.areaRatio.toFixed(3);
  $("polarity").textContent = Math.hypot(d.polarity.x, d.polarity.y).toFixed(3);
}
function prepare(canvas) {
  const rect = canvas.getBoundingClientRect(),
    dpr = window.devicePixelRatio || 1;
  const w = Math.round(rect.width * dpr),
    h = Math.round(rect.height * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  return { ctx, width: rect.width, height: rect.height };
}
function drawCell() {
  const { ctx, width, height } = prepare(cell);
  const g = geometry(model.points);
  if ($("follow").checked) camera = { ...g.center };
  const scale = Math.min(width / 62, height / 47);
  view = { width, height, scale };
  const xy = (p) => ({ x: width / 2 + (p.x - camera.x) * scale, y: height / 2 - (p.y - camera.y) * scale });
  ctx.strokeStyle = "#1c292e";
  ctx.lineWidth = 1;
  for (let x = Math.floor((camera.x - width / (2 * scale)) / 5) * 5; x < camera.x + width / (2 * scale); x += 5) {
    ctx.beginPath();
    ctx.moveTo(xy({ x, y: 0 }).x, 0);
    ctx.lineTo(xy({ x, y: 0 }).x, height);
    ctx.stroke();
  }
  for (let y = Math.floor((camera.y - height / (2 * scale)) / 5) * 5; y < camera.y + height / (2 * scale); y += 5) {
    ctx.beginPath();
    ctx.moveTo(0, xy({ x: 0, y }).y);
    ctx.lineTo(width, xy({ x: 0, y }).y);
    ctx.stroke();
  }
  if (model.stimulus.mode === "global") {
    ctx.fillStyle = "#3664b513";
    ctx.fillRect(0, 0, width, height);
  }
  if (model.stimulus.mode === "local" && model.stimulus.frame === "world") {
    const p = xy(model.stimulus),
      r = model.stimulus.radius * scale;
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 2 * r);
    gradient.addColorStop(0, "#518eff60");
    gradient.addColorStop(1, "#518eff00");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#73aeff88";
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.strokeStyle = "#b6ddc5";
  ctx.lineWidth = 2;
  ctx.setLineDash([3, 5]);
  ctx.beginPath();
  path.forEach((p, i) => {
    const q = xy(p);
    i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y);
  });
  ctx.stroke();
  ctx.setLineDash([]);
  const center = xy(g.center);
  $("playback-status").textContent = paused ? "PAUSED · press Play" : "RUNNING";
  const outside = center.x < 0 || center.x > width || center.y < 0 || center.y > height;
  $("camera-status").textContent = $("follow").checked
    ? "Following cell · motion stays centered"
    : outside
      ? "Cell moved outside view · use Recenter"
      : "World-fixed camera · START marks the original position";
  $("recenter").classList.toggle("selected", outside);
  // A fixed laboratory reference makes actual displacement visible even without a trail.
  const origin = xy({ x: 0, y: 0 });
  ctx.strokeStyle = "#c5d8d0";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, 10 * scale, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(origin.x - 6, origin.y);
  ctx.lineTo(origin.x + 6, origin.y);
  ctx.moveTo(origin.x, origin.y - 6);
  ctx.lineTo(origin.x, origin.y + 6);
  ctx.stroke();
  ctx.fillStyle = "#c5d8d0";
  ctx.font = "10px system-ui";
  ctx.fillText("START", origin.x - 15, origin.y + 20);
  // Activity tiles are densities, deliberately not pictures of simulated filaments.
  for (let i = 0; i < model.points.length; i++) {
    const p = model.points[i],
      q = model.points[(i + 1) % model.count],
      pp = xy(p),
      qq = xy(q);
    ctx.fillStyle = `rgba(65,194,150,${0.04 + p.actin * 0.55})`;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(pp.x, pp.y);
    ctx.lineTo(qq.x, qq.y);
    ctx.closePath();
    ctx.fill();
    const light = model.lightAt(p, g.center);
    if (light > 0.03) {
      ctx.strokeStyle = `rgba(95,148,255,${light * 0.7})`;
      ctx.lineWidth = 17;
      ctx.beginPath();
      ctx.moveTo(pp.x, pp.y);
      ctx.lineTo(qq.x, qq.y);
      ctx.stroke();
    }
    ctx.strokeStyle = colors.actin;
    ctx.lineWidth = 1.5 + 5 * p.actin;
    ctx.beginPath();
    ctx.moveTo(pp.x, pp.y);
    ctx.lineTo(qq.x, qq.y);
    ctx.stroke();
  }
  if ($("overlays").checked)
    ["pip", "rac", "inhibitor"].forEach((key, ring) => {
      for (let i = 0; i < model.count; i++) {
        const p = model.points[i],
          q = model.points[(i + 1) % model.count];
        const b = g.boundary[i],
          c = g.boundary[(i + 1) % model.count],
          offset = 1.3 + ring * 1.05;
        const pp = xy({ x: p.x + b.nx * offset, y: p.y + b.ny * offset });
        const qq = xy({ x: q.x + c.nx * offset, y: q.y + c.ny * offset });
        ctx.globalAlpha = 0.13 + 0.87 * p[key];
        ctx.strokeStyle = colors[key];
        ctx.lineWidth = 1 + 3 * p[key];
        ctx.beginPath();
        ctx.moveTo(pp.x, pp.y);
        ctx.lineTo(qq.x, qq.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });
  ctx.fillStyle = "#b9cfc8";
  ctx.beginPath();
  ctx.arc(center.x, center.y, 2, 0, 2 * Math.PI);
  ctx.fill();
  const d = model.diagnostics(),
    v = d.polarity,
    length = Math.hypot(v.x, v.y);
  if (length > 0.005) {
    const end = xy({ x: g.center.x + v.x * 40, y: g.center.y + v.y * 40 });
    ctx.strokeStyle = "#d0ffe9";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    const angle = Math.atan2(end.y - center.y, end.x - center.x);
    ctx.beginPath();
    ctx.moveTo(end.x - 7 * Math.cos(angle - 0.5), end.y - 7 * Math.sin(angle - 0.5));
    ctx.lineTo(end.x, end.y);
    ctx.lineTo(end.x - 7 * Math.cos(angle + 0.5), end.y - 7 * Math.sin(angle + 0.5));
    ctx.stroke();
  }
  ctx.fillStyle = "#92aba4";
  ctx.font = "10px system-ui";
  ctx.fillText(`x ${g.center.x.toFixed(1)}   y ${g.center.y.toFixed(1)}${width > 500 ? "  ·  arrow: actin polarity" : ""}`, 20, height - 18);
  ctx.fillText("5 relative length units", width - 150, height - 18);
  ctx.strokeStyle = "#92aba4";
  ctx.beginPath();
  ctx.moveTo(width - 150, height - 30);
  ctx.lineTo(width - 150 + 5 * scale, height - 30);
  ctx.stroke();
}
function drawTrace() {
  const { ctx, width, height } = prepare(trace),
    from = Math.max(0, model.time - 120),
    to = Math.max(120, model.time);
  const y = (value) => height - 15 - ((value + 0.2) / 1.2) * (height - 20);
  ctx.strokeStyle = "#283a3c";
  ctx.beginPath();
  ctx.moveTo(0, y(0));
  ctx.lineTo(width, y(0));
  ctx.stroke();
  const curves = [
    ...["rac", "inhibitor", "actin"].map((key) => ({ color: colors[key], value: (d) => d.means[key] })),
    { color: "#dbece7", value: (d) => d.polarity.x, dashed: true },
    { color: colors.pip, value: (d) => d.polarity.y, dashed: true },
  ];
  for (const curve of curves) {
    ctx.strokeStyle = curve.color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash(curve.dashed ? [4, 3] : []);
    ctx.beginPath();
    let first = true;
    for (const d of history)
      if (d.time >= from) {
        const x = ((d.time - from) / (to - from)) * width;
        first ? ctx.moveTo(x, y(curve.value(d))) : ctx.lineTo(x, y(curve.value(d)));
        first = false;
      }
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.fillStyle = "#8fa4a0";
  ctx.font = "9px system-ui";
  ctx.fillText(`${from.toFixed(0)}`, 0, height - 1);
  ctx.fillText(`${to.toFixed(0)} t`, width - 28, height - 1);
}
function tick(dt) {
  model.step(dt);
  if (!protocolSwitched && model.time >= 40 && $("protocol").value !== "manual") {
    protocolSwitched = true;
    if ($("protocol").value === "turn") {
      setAngle(Math.PI / 2);
      recordEvent("protocol turn");
    } else setMode("global");
  }
  sample();
}
let previous = performance.now();
function animate(now) {
  // Fixed integration step; discard background-tab wall time, cap per-frame work.
  if (!paused && !document.hidden) accumulator += Math.min(0.05, (now - previous) / 1000) * Number($("rate").value);
  previous = now;
  try {
    let budget = 50;
    while (!paused && accumulator >= 0.02 && budget-- > 0) {
      tick(0.02);
      accumulator -= 0.02;
    }
  } catch (error) {
    paused = true;
    $("pause").textContent = "Play";
    $("status").textContent = `Paused: ${error.message}`;
    console.error(error);
  }
  drawCell();
  drawTrace();
  requestAnimationFrame(animate);
}
// Inspectable state uses exactly the same model as the headless behavior checks.
window.migration = {
  model,
  diagnostics: () => model.diagnostics(),
  get view() {
    return { ...view, camera: { ...camera }, following: $("follow").checked, paused };
  },
  get history() {
    return history;
  },
};
syncParameters();
reset();
requestAnimationFrame(animate);
