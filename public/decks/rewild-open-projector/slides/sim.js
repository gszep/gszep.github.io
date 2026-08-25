(() => {
  const canvas = document.querySelector('canvas.sim');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--ct-punk').trim();
    const white = getComputedStyle(document.documentElement).getPropertyValue('--ct-white').trim();
    const black = getComputedStyle(document.documentElement).getPropertyValue('--ct-black').trim();
    const mode = document.body.dataset.sim;
    let w, h, tick = 0, mouse = { x: 0, y: 0, down: false };
    const dots = Array.from({length: mode === 'rewild' ? 95 : 46}, (_, i) => ({
      x: ((i * 83) % 997) / 997, y: ((i * 149) % 991) / 991,
      vx: Math.sin(i * 9.1) * .28, vy: Math.cos(i * 5.7) * .28,
      wild: i % 7 === 0
    }));
    const resize = () => { w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * 2; canvas.height = h * 2; ctx.setTransform(2,0,0,2,0,0); };
    const pointer = e => { const r=canvas.getBoundingClientRect(); mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top; };
    canvas.addEventListener('pointermove', pointer);
    canvas.addEventListener('pointerdown', e => { pointer(e); mouse.down=true; for(let i=0;i<9;i++) dots.push({x:mouse.x/w,y:mouse.y/h,vx:Math.sin(i)*1.2,vy:Math.cos(i)*1.2,wild:true}); });
    canvas.addEventListener('pointerup', () => mouse.down=false);
    resize(); addEventListener('resize', resize);
    const draw = () => {
      tick += .014; ctx.fillStyle = black; ctx.fillRect(0,0,w,h);
      for (let i=0;i<dots.length;i++) {
        const p=dots[i]; p.x += (p.vx + Math.sin(tick+i)*.08)/w; p.y += (p.vy + Math.cos(tick*.7+i)*.08)/h;
        if(p.x<0||p.x>1)p.vx*=-1; if(p.y<0||p.y>1)p.vy*=-1; p.x=Math.max(0,Math.min(1,p.x));p.y=Math.max(0,Math.min(1,p.y));
        const x=p.x*w,y=p.y*h;
        if(mouse.down){ const dx=mouse.x-x,dy=mouse.y-y,d=Math.hypot(dx,dy)||1;if(d<150){p.vx-=dx/d*.04;p.vy-=dy/d*.04;} }
        for(let j=i+1;j<dots.length;j++){ const q=dots[j], dx=x-q.x*w,dy=y-q.y*h,d=Math.hypot(dx,dy); if(d<(mode==='rewild'?72:125)){ctx.globalAlpha=(1-d/(mode==='rewild'?72:125))*.48;ctx.strokeStyle=p.wild||q.wild?accent:white;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(q.x*w,q.y*h);ctx.stroke();} }
        ctx.globalAlpha=1;ctx.fillStyle=p.wild?accent:white;ctx.fillRect(x-(p.wild?4:2),y-(p.wild?4:2),p.wild?8:4,p.wild?8:4);
      }
      requestAnimationFrame(draw);
    }; draw();
  }
  document.querySelectorAll('.check').forEach(el => el.addEventListener('click', () => el.classList.toggle('on')));
  document.querySelectorAll('.action').forEach(el => el.addEventListener('click', () => el.classList.toggle('active')));
  document.querySelector('.delta')?.addEventListener('click', () => document.querySelector('.sovereignty')?.classList.toggle('shifted'));
  const techGrid = document.querySelector('.tech-grid');
  if (techGrid) {
    const techs = [...techGrid.querySelectorAll('.tech')];
    const gap = 3, columns = 8;
    const layout = items => {
      const total = items.reduce((sum, item) => sum + item.weight, 0);
      const rows = Array.from({ length: Math.ceil(items.length / columns) }, (_, index) => items.slice(index * columns, (index + 1) * columns));
      const boxes = [];
      let y = 0;
      for (const row of rows) {
        const rowWeight = row.reduce((sum, item) => sum + item.weight, 0);
        const height = techGrid.clientHeight * rowWeight / total;
        let x = 0;
        for (const item of row) {
          const width = techGrid.clientWidth * item.weight / rowWeight;
          boxes.push({ tech: item.tech, x, y, width, height });
          x += width;
        }
        y += height;
      }
      return boxes;
    };
    const paint = () => {
      const items = techs.map(tech => ({ tech, weight: Number(tech.dataset.count) + 1 }));
      for (const box of layout(items)) {
        const width = Math.max(1, box.width - gap * 2), height = Math.max(1, box.height - gap * 2);
        Object.assign(box.tech.style, { left: box.x + gap + 'px', top: box.y + gap + 'px', width: width + 'px', height: height + 'px' });
        const count = Number(box.tech.dataset.count);
        box.tech.dataset.votes = count ? String(count) : '';
        box.tech.classList.toggle('has-votes', count > 0);
        box.tech.classList.toggle('compact', width < 165 || height < 48);
        box.tech.classList.toggle('tiny', width < 42 || height < 30);
        const label = box.tech.querySelector('span')?.textContent.trim() || 'technology';
        box.tech.setAttribute('aria-label', `${label}: ${count} room vote${count === 1 ? '' : 's'}`);
      }
    };
    for (const tech of techs) {
      tech.addEventListener('click', event => {
        const count = Number(tech.dataset.count);
        tech.dataset.count = String(event.shiftKey ? Math.max(0, count - 1) : count + 1);
        paint();
      });
      tech.addEventListener('contextmenu', event => {
        event.preventDefault();
        tech.dataset.count = String(Math.max(0, Number(tech.dataset.count) - 1));
        paint();
      });
    }
    addEventListener('resize', paint);
    paint();
  }
})();
