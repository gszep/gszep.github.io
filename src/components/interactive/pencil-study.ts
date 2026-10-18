import fragment from './pencil-study.frag.glsl?raw';
import { PencilAgents } from './pencil-agents';
import type { FacadeMode } from './pencil-facades';

const vertex = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

export function initPencilStudy(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('.pencil-surface-canvas')!;
  const agentCanvas = root.querySelector<HTMLCanvasElement>('.pencil-agent-canvas')!;
  const tools = root.querySelector('fieldset')!;
  const status = root.querySelector<HTMLElement>('[role="status"]')!;
  const spin = root.querySelector<HTMLButtonElement>('[data-spin]')!;
  const boil = root.querySelector<HTMLInputElement>('[data-boil]')!;
  const facade = root.querySelector<HTMLSelectElement>('[data-facade]')!;
  const sliders = [...root.querySelectorAll<HTMLInputElement>('[data-param]')];
  const styles = [...root.querySelectorAll<HTMLButtonElement>('[data-style]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ja = root.dataset.lang === 'ja';
  let gl: WebGL2RenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let uniforms: Record<string, WebGLUniformLocation | null> = {};
  let agents: PencilAgents | null = null;
  let pitch = .42, yaw = .58, zoom = 1, style = 4;
  let rotating = !reduced.matches, visible = false, lost = false;
  let frame = 0, last = 0, clock = 0, lastPaint = 0;
  let drag: { id: number; x: number; y: number } | null = null;

  function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
  function requestDraw() {
    if (!frame && visible && !document.hidden && (style === 4 ? agents : !lost && program)) frame = requestAnimationFrame(draw);
  }
  function setRotating(value: boolean) {
    rotating = value;
    spin.setAttribute('aria-pressed', String(value));
    requestDraw();
  }
  function fail(error: unknown) {
    stop();
    styles.filter(button => Number(button.dataset.style) !== 4).forEach(button => button.disabled = true);
    if (agents) {
      tools.disabled = false;
      if (style !== 4) {
        chooseStyle(styles.find(button => Number(button.dataset.style) === 4)!);
        status.hidden = false;
        status.textContent = ja ? '素材シェーダーを利用できないため、線の描画に切り替えました。' : 'Material shaders are unavailable; switched to the pencil drawing.';
      }
      requestDraw();
      return;
    }
    delete root.dataset.ready;
    tools.disabled = true;
    status.hidden = false;
    status.textContent = ja ? '描画を利用できません。静止画を表示しています。再読み込みで再試行できます。' : 'Live rendering is unavailable. Showing a still image; reload to try again.';
    console.warn('Pencil study:', error);
  }
  function initialize() {
    try {
      gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'low-power' });
      if (!gl) throw new Error('WebGL 2 unavailable');
      const shaders: WebGLShader[] = [];
      const next = gl.createProgram();
      if (!next) throw new Error('Cannot create shader program');
      try {
        for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
          const shader = gl.createShader(type);
          if (!shader) throw new Error('Cannot create shader');
          shaders.push(shader);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'Shader compilation failed');
          gl.attachShader(next, shader);
        }
        gl.linkProgram(next);
        if (!gl.getProgramParameter(next, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(next) || 'Shader linking failed');
      } catch (error) {
        gl.deleteProgram(next);
        throw error;
      } finally {
        shaders.forEach(shader => gl!.deleteShader(shader));
      }
      program = next;
      uniforms = Object.fromEntries(['Resolution','Rotation','Zoom','Pressure','Tooth','Wander','Light','Frame','Style'].map(name => [name, gl!.getUniformLocation(program!, `u${name}`)]));
      lost = false;
      tools.disabled = false;
      styles.forEach(button => button.disabled = Number(button.dataset.style) === 4 && !agents);
      status.hidden = true;
      resize();
      requestDraw();
    } catch (error) { fail(error); }
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 1.75, Math.sqrt(1_500_000 / Math.max(1, rect.width * rect.height)));
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width; canvas.height = height;
      agentCanvas.width = width; agentCanvas.height = height;
    }
    requestDraw();
  }
  function draw(time: number) {
    frame = 0;
    if (!visible || document.hidden || (style === 4 ? !agents : !gl || !program || lost)) { last = 0; return; }
    // The bounded agent solve is capped at 24 Hz while in motion; a paused drawing
    // is rendered only when an input changes. No background simulation is running.
    if (style === 4 && (rotating || boil.checked) && time-lastPaint < 1000/24) {
      requestDraw(); return;
    }
    lastPaint = time;
    const dt = last ? Math.min((time-last)/1000, .05) : 0;
    last = time;
    if (rotating && !drag) yaw += dt * .15;
    if (boil.checked) clock += dt;
    const values = Object.fromEntries(sliders.map(input => [input.dataset.param!, Number(input.value)/100]));
    if (style === 4 && agents) {
      agents.draw({pitch,yaw,zoom,pressure:.3+values.pressure*1.4,tooth:values.tooth,
        wander:values.wander,light:values.light*Math.PI*2,emphasis:values.emphasis,
        frame:boil.checked ? Math.floor(clock*8) : 0,facade:facade.value as FacadeMode});
    } else if (gl && program) {
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.useProgram(program);
    gl.uniform2f(uniforms.Resolution,canvas.width,canvas.height);
    gl.uniform2f(uniforms.Rotation,pitch,yaw);
    // Fit the same cube into portrait and landscape canvases.
    gl.uniform1f(uniforms.Zoom,.52*zoom*Math.min(1,canvas.width/canvas.height*.9));
    gl.uniform1f(uniforms.Pressure,.3+values.pressure*1.4);
    gl.uniform1f(uniforms.Tooth,values.tooth);
    gl.uniform1f(uniforms.Wander,values.wander);
    gl.uniform1f(uniforms.Light,values.light*Math.PI*2);
    gl.uniform1f(uniforms.Frame,boil.checked ? Math.floor(clock*8) : 0);
    gl.uniform1i(uniforms.Style,style);
    gl.drawArrays(gl.TRIANGLES,0,3);
    }
    root.dataset.ready = '';
    if (rotating || boil.checked) requestDraw();
    else last = 0;
  }
  function chooseStyle(button: HTMLButtonElement) {
    style = Number(button.dataset.style);
    root.toggleAttribute('data-agent',style === 4);
    root.querySelector<HTMLElement>('[data-facade-controls]')!.hidden = style !== 4;
    sliders.find(input => input.dataset.param === 'emphasis')!.disabled = style !== 4;
    styles.forEach(b => b.setAttribute('aria-pressed',String(b === button)));
    root.querySelector('.study-mood')!.textContent = button.dataset.mood!;
    requestDraw();
  }
  styles.forEach(button => button.addEventListener('click',() => chooseStyle(button)));
  sliders.forEach(input => input.addEventListener('input',() => {
    input.closest('label')!.querySelector('output')!.value = input.value;
    requestDraw();
  }));
  spin.addEventListener('click',() => setRotating(!rotating));
  const facadeNotes = ja ? {
    planar: '輪郭はそのままに、面の陰影だけを比較。短い線を面ごとの方向にまとめ、境界の手前で止めます。',
    contained: '以前の操舵ルールを保ち、線の太さ全体が隣の面に渡る前に止めます。',
    loose: '以前の描画。陰影の線も輪郭に引かれ、面をまたいだり外へはみ出したりします。',
  } : {
    planar: 'Same contour drawing, different shading rules. Short, grouped strokes follow each face and stop before its boundary.',
    contained: 'The earlier steering rules, with each stroke stopped before its full width crosses onto another face.',
    loose: 'The previous drawing: shading agents also chase edges and may wander across faces or beyond the silhouette.',
  };
  function updateFacade() {
    root.querySelector('[data-facade-note]')!.textContent = facadeNotes[facade.value as FacadeMode];
    requestDraw();
  }
  facade.addEventListener('change',updateFacade);
  boil.addEventListener('change',() => { clock = 0; requestDraw(); });
  root.querySelector('[data-reset]')!.addEventListener('click',() => {
    pitch = .42; yaw = .58; zoom = 1; clock = 0;
    boil.checked = false;
    facade.value = 'planar'; updateFacade();
    sliders.forEach(input => { input.value = input.defaultValue; input.closest('label')!.querySelector('output')!.value = input.value; });
    chooseStyle(styles[0]);
    setRotating(!reduced.matches);
  });
  canvas.addEventListener('pointerdown',event => {
    if (!event.isPrimary || event.button !== 0 || (style === 4 ? !agents : !program || lost)) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
    setRotating(false);
  });
  canvas.addEventListener('pointermove',event => {
    if (!drag || drag.id !== event.pointerId) return;
    yaw += (event.clientX-drag.x)*.008;
    pitch = Math.max(-1.35,Math.min(1.35,pitch+(event.clientY-drag.y)*.008));
    drag.x = event.clientX; drag.y = event.clientY;
    requestDraw();
  });
  const release = (event: PointerEvent) => { if (drag?.id === event.pointerId) drag = null; };
  canvas.addEventListener('pointerup',release);
  canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('lostpointercapture',release);
  canvas.addEventListener('keydown',event => {
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(event.key)) return;
    event.preventDefault(); setRotating(false);
    if (event.key === 'ArrowLeft') yaw -= .12;
    if (event.key === 'ArrowRight') yaw += .12;
    if (event.key === 'ArrowUp') pitch -= .12;
    if (event.key === 'ArrowDown') pitch += .12;
    if (event.key === '+' || event.key === '=') zoom = Math.min(1.25,zoom+.06);
    if (event.key === '-') zoom = Math.max(.65,zoom-.06);
    if (event.key === 'Home') { pitch = .42; yaw = .58; zoom = 1; }
    pitch = Math.max(-1.35,Math.min(1.35,pitch));
    requestDraw();
  });
  canvas.addEventListener('webglcontextlost',event => {
    event.preventDefault(); lost = true; program = null; fail('WebGL context lost');
  });
  canvas.addEventListener('webglcontextrestored',initialize);
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) requestDraw(); else stop();
  });
  observer.observe(canvas);
  const resizer = new ResizeObserver(resize);
  resizer.observe(canvas);
  const visibility = () => { if (document.hidden) stop(); else requestDraw(); };
  const motion = () => { if (reduced.matches) { setRotating(false); boil.checked = false; requestDraw(); } };
  document.addEventListener('visibilitychange',visibility);
  reduced.addEventListener('change',motion);
  // This site uses full-page navigation; retain resources across bfcache restores.
  addEventListener('pagehide',event => {
    stop();
    if (!event.persisted) { observer.disconnect(); resizer.disconnect(); if (program) gl?.deleteProgram(program); }
  });
  addEventListener('pageshow',requestDraw);
  spin.setAttribute('aria-pressed',String(rotating));
  try { agents = new PencilAgents(agentCanvas); }
  catch (error) { console.warn('Pencil agents:',error); style = 1; }
  chooseStyle(styles.find(button => Number(button.dataset.style) === style)!);
  initialize();
}
