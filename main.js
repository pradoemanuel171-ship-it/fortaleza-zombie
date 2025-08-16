(() => {
  // ======== Utility ========
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const dist2 = (x1, y1, x2, y2) => {
    const dx = x1 - x2, dy = y1 - y2;
    return dx*dx + dy*dy;
  };

  // ======== Canvas Setup (HiDPI) ========
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d', { alpha: false });
  let DPR = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));

  function resize() {
    const { innerWidth: w, innerHeight: h } = window;
    canvas.width  = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    WORLD.w = w; WORLD.h = h;
  }
  window.addEventListener('resize', resize, { passive: true });

  // ======== World / Entities ========
  const WORLD = { w: 0, h: 0, time: 0 };

  const player = {
    x: 320, y: 240, r: 14, speed: 180, hp: 100, maxHp: 100, dirX: 1, dirY: 0,
    color: '#a3e635', lastShot: 0, fireRate: 0.2
  };

  const base = { x: 0, y: 0, r: 30, hp: 100, maxHp: 100, color: '#60a5fa' };

  const bullets = [];
  const zombies = [];
  let kills = 0;
  let running = false;
  let paused = false;

  // ======== Input (Keyboard) ========
  const keys = new Set();
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    keys.add(e.key.toLowerCase());
  });
  window.addEventListener('keyup',   (e) => keys.delete(e.key.toLowerCase()));

  // ======== Input (Touch Controls) ========
  const stick = document.getElementById('stick');
  const knob = document.getElementById('knob');
  const attackBtn = document.getElementById('attackBtn');

  const stickState = { active: false, id: null, ox: 0, oy: 0, vx: 0, vy: 0, max: 52 };
  function setKnob(dx, dy) {
    const mag = Math.hypot(dx, dy);
    const lim = Math.min(mag, stickState.max);
    const nx = (mag ? dx / mag : 0) * lim;
    const ny = (mag ? dy / mag : 0) * lim;
    knob.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
  }

  stick.addEventListener('pointerdown', (e) => {
    stick.setPointerCapture(e.pointerId);
    stickState.active = true; stickState.id = e.pointerId;
    const rect = stick.getBoundingClientRect();
    stickState.ox = rect.left + rect.width/2;
    stickState.oy = rect.top  + rect.height/2;
    const dx = e.clientX - stickState.ox;
    const dy = e.clientY - stickState.oy;
    const mag = Math.hypot(dx, dy);
    stickState.vx = mag ? dx / mag : 0;
    stickState.vy = mag ? dy / mag : 0;
    setKnob(dx, dy);
  });
  stick.addEventListener('pointermove', (e) => {
    if (!stickState.active || e.pointerId !== stickState.id) return;
    const dx = e.clientX - stickState.ox;
    const dy = e.clientY - stickState.oy;
    const mag = Math.hypot(dx, dy);
    stickState.vx = mag ? dx / mag : 0;
    stickState.vy = mag ? dy / mag : 0;
    setKnob(dx, dy);
  });
  function endStick(e){
    if (!stickState.active || (e && e.pointerId !== stickState.id)) return;
    stickState.active = false; stickState.id = null; stickState.vx = 0; stickState.vy = 0;
    knob.style.transform = 'translate(-50%,-50%)';
  }
  stick.addEventListener('pointerup', endStick);
  stick.addEventListener('pointercancel', endStick);
  stick.addEventListener('lostpointercapture', endStick);

  attackBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    shoot();
  }, { passive: false });

  // ======== DOM HUD ========
  const elHP = document.getElementById('hp');
  const elBHP = document.getElementById('basehp');
  const elKills = document.getElementById('kills');
  const elTime = document.getElementById('time');
  const overlay = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');

  startBtn.addEventListener('click', () => {
    overlay.classList.remove('show');
    reset();
    running = true;
  });

  pauseBtn.addEventListener('click', () => {
    if (!running) return;
    paused = !paused;
    overlay.classList.toggle('show', paused);
    overlay.querySelector('.panel h1').textContent = paused ? 'Pausa' : 'Fortaleza Zombie';
    overlay.querySelector('.panel p').textContent = paused ? 'Pulsa continuar.' : 'Sobrevive y protege tu base.';
    overlay.querySelector('#startBtn').textContent = paused ? 'Continuar' : 'Jugar';
  });

  // ======== Game Mechanics ========
  function reset(){
    const w = WORLD.w, h = WORLD.h;
    player.x = w*0.5; player.y = h*0.6; player.hp = player.maxHp; player.dirX=1; player.dirY=0;
    base.x = w*0.5; base.y = h*0.75; base.hp = base.maxHp;
    bullets.length = 0; zombies.length = 0;
    WORLD.time = 0; kills = 0; lastSpawn = 0; spawnInterval = 1.2; // seconds
    paused = false;
    overlay.classList.remove('show');
  }

  function spawnZombie() {
    const w = WORLD.w, h = WORLD.h;
    let x, y;
    const edge = Math.floor(Math.random()*4);
    if (edge === 0) { x = rand(0, w); y = -20; }
    else if (edge === 1) { x = w+20; y = rand(0, h); }
    else if (edge === 2) { x = rand(0, w); y = h+20; }
    else { x = -20; y = rand(0, h); }
    const speed = rand(40, 70);
    const hp = 30 + WORLD.time * 0.4;
    zombies.push({ x, y, r: 14, speed, hp, maxHp: hp, color: '#94a3b8', t: 0 });
  }

  let lastSpawn = 0;
  let spawnInterval = 1.2;

  function shoot(){
    const t = WORLD.time;
    if (t - player.lastShot < player.fireRate) return;
    player.lastShot = t;
    const aimx = player.dirX || 1, aimy = player.dirY || 0;
    const speed = 420, life = 1.2, dmg = 22;
    bullets.push({ x: player.x, y: player.y, r: 4, vx: aimx * speed, vy: aimy * speed, life, dmg });
  }

  function damage(entity, amount){
    entity.hp -= amount;
    if (entity.hp <= 0) return true;
    return false;
  }

  function step(dt){
    // Movement input (keyboard or stick)
    let mvx = 0, mvy = 0;
    if (keys.has('w') || keys.has('arrowup')) mvy -= 1;
    if (keys.has('s') || keys.has('arrowdown')) mvy += 1;
    if (keys.has('a') || keys.has('arrowleft')) mvx -= 1;
    if (keys.has('d') || keys.has('arrowright')) mvx += 1;
    if (keys.has(' ')) shoot();

    mvx += stickState.vx;
    mvy += stickState.vy;
    const mag = Math.hypot(mvx, mvy);
    if (mag > 0) {
      mvx /= mag; mvy /= mag;
      player.dirX = mvx; player.dirY = mvy; // last facing
    }
    player.x += mvx * player.speed * dt;
    player.y += mvy * player.speed * dt;
    player.x = clamp(player.x, 10, WORLD.w-10);
    player.y = clamp(player.y, 10, WORLD.h-10);

    // Spawn zombies (increase difficulty)
    if (WORLD.time - lastSpawn > spawnInterval) {
      lastSpawn = WORLD.time;
      spawnZombie();
      spawnInterval = Math.max(0.45, 1.2 - WORLD.time * 0.01);
    }

    // Update zombies (seek player, damage base if close)
    const px = player.x, py = player.y;
    for (let i=zombies.length-1; i>=0; i--) {
      const z = zombies[i];
      z.t += dt;
      // Decide target: prefer base if near it, else chase player
      const db = Math.hypot(base.x - z.x, base.y - z.y);
      const dp = Math.hypot(px - z.x, py - z.y);
      const tx = (db < 120 ? base.x : px);
      const ty = (db < 120 ? base.y : py);
      const dx = tx - z.x, dy = ty - z.y;
      const m = Math.hypot(dx, dy) || 1;
      z.x += (dx / m) * z.speed * dt;
      z.y += (dy / m) * z.speed * dt;

      // Hit player
      if (dist2(z.x, z.y, px, py) < (z.r + player.r) ** 2) {
        if (damage(player, 8 * dt)) { gameOver(); return; }
      }
      // Hit base
      if (dist2(z.x, z.y, base.x, base.y) < (z.r + base.r) ** 2) {
        if (damage(base, 10 * dt)) { gameOver(); return; }
      }
    }

    // Update bullets
    for (let i=bullets.length-1; i>=0; i--) {
      const b = bullets[i];
      b.life -= dt;
      if (b.life <= 0) { bullets.splice(i,1); continue; }
      b.x += b.vx * dt; b.y += b.vy * dt;
      // Collide with zombies
      for (let j=zombies.length-1; j>=0; j--) {
        const z = zombies[j];
        if (dist2(b.x, b.y, z.x, z.y) <= (b.r + z.r) ** 2) {
          bullets.splice(i,1);
          if (damage(z, b.dmg)) {
            zombies.splice(j,1); kills++;
          }
          break;
        }
      }
    }
  }

  function gameOver(){
    running = false;
    overlay.classList.add('show');
    overlay.querySelector('.panel h1').textContent = 'Game Over';
    overlay.querySelector('.panel p').textContent = `Duraste ${Math.floor(WORLD.time)}s — Kills: ${kills}. Pulsa "Jugar" para reiniciar.`;
    overlay.querySelector('#startBtn').textContent = 'Jugar';
  }

  // ======== Rendering ========
  function draw(){
    const w = WORLD.w, h = WORLD.h;

    // Background ground
    ctx.fillStyle = '#15202b';
    ctx.fillRect(0, 0, w, h);

    // Zones (path + toxic)
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, h*0.72, w, h*0.28);
    ctx.fillStyle = '#2a3346';
    for (let i=0;i<w;i+=48){
      ctx.fillRect(i+8, h*0.72 - 10 + Math.sin((i+WORLD.time*30)*0.01)*2, 24, 6);
    }

    // Base
    ctx.beginPath();
    ctx.arc(base.x, base.y, base.r, 0, Math.PI*2);
    ctx.fillStyle = base.color;
    ctx.fill();
    // Base HP bar
    drawBar(base.x - 30, base.y + base.r + 6, 60, 6, base.hp/base.maxHp);

    // Player
    ctx.save();
    ctx.translate(player.x, player.y);
    const angle = Math.atan2(player.dirY, player.dirX);
    ctx.rotate(angle);
    ctx.fillStyle = player.color;
    ctx.fillRect(-12, -10, 24, 20); // body
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(2, -4, 12, 8); // visor
    ctx.restore();

    // Bullets
    ctx.fillStyle = '#fde047';
    for(const b of bullets){
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
    }

    // Zombies
    for(const z of zombies){
      ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, Math.PI*2);
      ctx.fillStyle = z.color; ctx.fill();
      // small eyes
      ctx.fillStyle = '#111';
      ctx.fillRect(z.x-6, z.y-3, 3, 3);
      ctx.fillRect(z.x+3, z.y-3, 3, 3);
    }

    // HUD text (shadow)
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.fillRect(0,0, w, 36);

    // Stats text via DOM as well
    elHP.textContent = Math.max(0, player.hp|0);
    elBHP.textContent = Math.max(0, base.hp|0);
    elKills.textContent = kills;
    elTime.textContent = Math.floor(WORLD.time);
  }

  function drawBar(x,y,w,h,ratio){
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.fillRect(x,y,w,h);
    ctx.fillStyle = ratio>0.5 ? '#22c55e' : (ratio>0.25 ? '#f59e0b' : '#ef4444');
    ctx.fillRect(x,y,w*clamp(ratio,0,1),h);
    ctx.strokeStyle = 'rgba(255,255,255,.25)';
    ctx.strokeRect(x+0.5,y+0.5,w-1,h-1);
  }

  // ======== Main Loop ========
  let last = 0;
  function loop(t){
    requestAnimationFrame(loop);
    if (!running) return;
    if (paused) return;
    if (!last) last = t;
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    WORLD.time += dt;
    step(dt);
    draw();
  }

  // ======== Init ========
  resize();
  draw();
  requestAnimationFrame(loop);

  // Expose for debugging
  window.__game = { player, base, zombies, bullets, WORLD };
})();