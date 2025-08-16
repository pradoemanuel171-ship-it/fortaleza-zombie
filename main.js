(() => {
  // ================== Helpers ==================
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rand =(a,b)=>a+Math.random()*(b-a);
  const dist2=(x1,y1,x2,y2)=>{const dx=x1-x2,dy=y1-y2;return dx*dx+dy*dy};

  // ================== Canvas ===================
  const canvas=document.getElementById('game');
  const ctx = canvas.getContext('2d',{alpha:false});
  let DPR=Math.max(1,Math.min(window.devicePixelRatio||1,3));
  ctx.imageSmoothingEnabled=false;

  const WORLD={w:0,h:0,time:0,tileSize:16, themeIndex:0};

  function resize(){
    const w=window.innerWidth,h=window.innerHeight;
    canvas.width=Math.floor(w*DPR); canvas.height=Math.floor(h*DPR);
    canvas.style.width=w+'px'; canvas.style.height=h+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    WORLD.w=w; WORLD.h=h;
    rebuildTiles();
  }
  window.addEventListener('resize', resize, {passive:true});

  // ================== Themes / Palettes ===================
  const THEMES=[
    {name:'Noche Neón', ground:['#0e1326','#111827','#0a0f1d'], hero:'#a3e635', visor:'#0b0f19', bunker:'#8ab6ff', ui:'#1f2937', zombie1:'#93c5fd', zombie2:'#fca5a5', zombie3:'#a7f3d0'},
    {name:'Desierto Ocre', ground:['#4a3823','#6d5030','#8b5e34'], hero:'#ffe082', visor:'#2b1d0f', bunker:'#d7a15e', ui:'#573b22', zombie1:'#88b06a', zombie2:'#c3946b', zombie3:'#8dbe9b'},
    {name:'Bosque Teal', ground:['#0a1e20','#0e2a2b','#12383a'], hero:'#9ae6b4', visor:'#071e22', bunker:'#5fd1d9', ui:'#0f2a30', zombie1:'#76c2b0', zombie2:'#9ad49a', zombie3:'#7bb8e0'},
    {name:'Nieve Gris', ground:['#1a1d24','#20242b','#2a2f37'], hero:'#cbd5e1', visor:'#0a0c0f', bunker:'#d1d5db', ui:'#1f232b', zombie1:'#c4cfd6', zombie2:'#b8c1c9', zombie3:'#aab3bb'},
  ];
  function nextTheme(){
    WORLD.themeIndex=(WORLD.themeIndex+1)%THEMES.length;
    rebuildTiles();
  }

  // ================== Tiles / Patterns ===================
  let groundPattern=null, stripePattern=null;
  function rebuildTiles(){
    const t=THEMES[WORLD.themeIndex];
    // 16x16 ground tile
    const g=document.createElement('canvas'); g.width=g.height=16;
    const gx=g.getContext('2d',{alpha:true}); gx.imageSmoothingEnabled=false;
    for(let y=0;y<16;y++){
      for(let x=0;x<16;x++){
        const k=(x*13+y*7)%16;
        gx.fillStyle=t.ground[(k%3)];
        gx.fillRect(x,y,1,1);
      }
    }
    groundPattern=ctx.createPattern(g,'repeat');

    // Stripe tile for path
    const s=document.createElement('canvas'); s.width=16; s.height=16;
    const sx=s.getContext('2d'); sx.imageSmoothingEnabled=false;
    sx.fillStyle='rgba(255,255,255,.06)';
    sx.fillRect(3,7,10,2);
    stripePattern=ctx.createPattern(s,'repeat');

    // Update document theme color for sticks
    document.querySelectorAll('.stick').forEach(el=>{
      el.style.background = 'rgba(15,20,35,.35)';
      el.style.borderColor = 'rgba(255,255,255,.12)';
    });
  }

  // ================== Sprites (pixel grids) ===================
  function spriteFromGrid(grid, colors, scale=3){
    const w=grid[0].length, h=grid.length;
    const c=document.createElement('canvas'); c.width=w; c.height=h;
    const cx=c.getContext('2d'); cx.imageSmoothingEnabled=false;
    for(let y=0;y<h;y++){
      const row=grid[y];
      for(let x=0;x<w;x++){
        const ch=row[x];
        if(ch==='.'||colors[ch]==null) continue;
        cx.fillStyle=colors[ch];
        cx.fillRect(x,y,1,1);
      }
    }
    // Upscale to avoid sampling seams
    const out=document.createElement('canvas'); out.width=w*scale; out.height=h*scale;
    const ox=out.getContext('2d'); ox.imageSmoothingEnabled=false;
    ox.drawImage(c,0,0,out.width,out.height);
    return out;
  }

  // Soldier grid (16x16) — letters map to palette
  const SOLDIER_GRID=[
    "................",
    ".....ggggg......",
    "....ggggggg.....",
    "....ggggggg.....",
    "......bbbb......",
    "...bbbbbbbb.....",
    "..bbbbbbbbbb....",
    "..bbbbbbbbbb....",
    "...bbbbbbbb.....",
    ".....vvvv.......",
    "....cccccc......",
    "....cccccc......",
    "......cccc......",
    "......cccc......",
    "......cccc......",
    "................",
  ];
  // Zombie grid (16x16)
  const ZOMBIE_GRID=[
    "................",
    "......zzzz......",
    "....zzzzzzzz....",
    "...zzzzzzzzzz...",
    "..zzzzzzzzzzzz..",
    "..zzzzzzzzzzzz..",
    "..zzzzzzzzzzzz..",
    "..zzzzzzzzzzzz..",
    "..zzzzzzzzzzzz..",
    "..zzzzzzzzzzzz..",
    "...zzzzzzzzzz...",
    "....zzzzzzzz....",
    "......ee..ee....",
    "......ee..ee....",
    "................",
    "................",
  ];
  // Bunker grid (24x24) hex-ish
  const BUNKER_GRID=[
    "........................",
    "........hhhhhhhh........",
    "......hhhhhhhhhhhh......",
    ".....hhAAAAAAAAAAhh.....",
    "....hhAAAAAAAAAAAAhh....",
    "...hhAAAAAAAAAAAAAAhh...",
    "..hhAAAAAAAAAAAAAAAAhh..",
    "..hAAAAAAAAAAAAAAAAAAh..",
    "..hAAAAAAAAAAAAAAAAAAh..",
    "..hAAAAAaaaaaaAAAAAAAh..",
    "..hAAAAAaaaaaaAAAAAAAh..",
    "..hAAAAAaaaaaaAAAAAAAh..",
    "..hAAAAAaaaaaaAAAAAAAh..",
    "..hAAAAAaaaaaaAAAAAAAh..",
    "..hAAAAAAAAAAAAAAAAAAh..",
    "..hAAAAAAAAAAAAAAAAAAh..",
    "..hhAAAAAAAAAAAAAAAAhh..",
    "...hhAAAAAAAAAAAAAAhh...",
    "....hhAAAAAAAAAAAAhh....",
    ".....hhAAAAAAAAAAhh.....",
    "......hhhhhhhhhhhh......",
    "........hhhhhhhh........",
    "........................",
    "........................",
  ];

  function buildSprites(theme){
    const colorsSoldier={
      'g': theme.hero,        // helmet
      'b': shade(theme.hero,-25), // suit darker
      'v': theme.visor,      // visor
      'c': shade(theme.hero,-40), // boots/arms
    };
    const colorsZombie=(base)=>({'z':base,'e':'#0b0f19'});
    const colorsBunker={'h': shade(theme.bunker,-40), 'A': theme.bunker, 'a': shade(theme.bunker,20)};

    const soldier = spriteFromGrid(SOLDIER_GRID, colorsSoldier, 3);
    const zombie1 = spriteFromGrid(ZOMBIE_GRID, colorsZombie(theme.zombie1), 3);
    const zombie2 = spriteFromGrid(ZOMBIE_GRID, colorsZombie(theme.zombie2), 3);
    const zombie3 = spriteFromGrid(ZOMBIE_GRID, colorsZombie(theme.zombie3), 3);
    const bunker  = spriteFromGrid(BUNKER_GRID, colorsBunker, 2);
    return { soldier, zombie1, zombie2, zombie3, bunker };
  }

  function shade(hex, amt){
    // hex: #rrggbb
    const p = parseInt(hex.slice(1),16);
    let r = (p>>16)&255, g=(p>>8)&255, b=p&255;
    r=clamp(r+amt,0,255); g=clamp(g+amt,0,255); b=clamp(b+amt,0,255);
    return `#${(r<<16|g<<8|b).toString(16).padStart(6,'0')}`;
  }

  let sprites = buildSprites(THEMES[WORLD.themeIndex]);

  // ================== Entities ===================
  const player={ x:320,y:240,r:10,speed:120,hp:100,maxHp:100,aimX:1,aimY:0,lastShot:-999,fireRate:0.18 };
  const base={ x:0,y:0, r:22, hp:120, maxHp:120 };
  const bullets=[], zombies=[], hits=[];
  let kills=0, running=false, paused=false;

  // ================== Controls ===================
  const keys=new Set();
  window.addEventListener('keydown',(e)=>{
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    keys.add(e.key.toLowerCase());
  });
  window.addEventListener('keyup',(e)=>keys.delete(e.key.toLowerCase()));

  function setupStick(id){
    const el=document.getElementById(id);
    const knob=el.querySelector('.knob');
    const state={active:false,id:null,ox:0,oy:0,vx:0,vy:0,max:52,dead:0.18};
    function setKnob(dx,dy){
      const m=Math.hypot(dx,dy),lim=Math.min(m,state.max);
      const nx=(m?dx/m:0)*lim, ny=(m?dy/m:0)*lim;
      knob.style.transform=`translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
    }
    el.addEventListener('pointerdown',(e)=>{
      el.setPointerCapture(e.pointerId);
      state.active=true; state.id=e.pointerId;
      const r=el.getBoundingClientRect(); state.ox=r.left+r.width/2; state.oy=r.top+r.height/2;
      const dx=e.clientX-state.ox, dy=e.clientY-state.oy, m=Math.hypot(dx,dy);
      state.vx=m>r.width*state.dead/2?dx/m:0; state.vy=m>r.width*state.dead/2?dy/m:0;
      setKnob(dx,dy);
    });
    el.addEventListener('pointermove',(e)=>{
      if(!state.active||e.pointerId!==state.id) return;
      const r=el.getBoundingClientRect();
      const dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2), m=Math.hypot(dx,dy);
      state.vx=m>r.width*state.dead/2?dx/m:0; state.vy=m>r.width*state.dead/2?dy/m:0;
      setKnob(dx,dy);
    });
    function end(e){
      if(!state.active||(e&&e.pointerId!==state.id)) return;
      state.active=false; state.id=null; state.vx=0; state.vy=0; knob.style.transform='translate(-50%,-50%)';
    }
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); el.addEventListener('lostpointercapture', end);
    return state;
  }
  const moveStick=setupStick('stickMove');
  const aimStick =setupStick('stickAim');
  const attackBtn=document.getElementById('attackBtn');
  attackBtn.addEventListener('pointerdown', (e)=>{e.preventDefault(); shoot();}, {passive:false});

  // Mouse aim
  canvas.addEventListener('pointermove',(e)=>{
    const rect=canvas.getBoundingClientRect();
    const dx=(e.clientX-rect.left)-player.x;
    const dy=(e.clientY-rect.top)-player.y;
    const m=Math.hypot(dx,dy); if(m>0){ player.aimX=dx/m; player.aimY=dy/m; }
  });

  // ================== HUD / Overlay ===================
  const elHP=document.getElementById('hp');
  const elBHP=document.getElementById('basehp');
  const elKills=document.getElementById('kills');
  const elTime=document.getElementById('time');
  const overlay=document.getElementById('overlay');
  const startBtn=document.getElementById('startBtn');
  const pauseBtn=document.getElementById('pauseBtn');
  const themeBtn=document.getElementById('themeBtn');

  startBtn.addEventListener('click', ()=>{ overlay.classList.remove('show'); reset(); running=true; });
  pauseBtn.addEventListener('click', ()=>{ if(!running) return; paused=!paused; overlay.classList.toggle('show', paused); });
  themeBtn.addEventListener('click', ()=>{ nextTheme(); sprites=buildSprites(THEMES[WORLD.themeIndex]); });

  // ================== Game Logic ===================
  function reset(){
    const w=WORLD.w,h=WORLD.h;
    player.x=w*0.5; player.y=h*0.6; player.hp=player.maxHp; player.aimX=1; player.aimY=0; player.lastShot=-999;
    base.x=w*0.5; base.y=h*0.75; base.hp=base.maxHp;
    bullets.length=0; zombies.length=0; hits.length=0;
    WORLD.time=0; kills=0; lastSpawn=0; spawnInterval=1.1; paused=false; keys.clear();
  }

  function shoot(){
    const t=WORLD.time;
    if (t - player.lastShot < player.fireRate) return;
    player.lastShot=t;
    const speed=520, life=1.1, dmg=22;
    bullets.push({x:player.x,y:player.y,r:2,vx:player.aimX*speed,vy:player.aimY*speed,life,dmg});
    hits.push({x:player.x+player.aimX*12,y:player.y+player.aimY*8,t:0});
  }

  let lastSpawn=0, spawnInterval=1.1;
  function spawnZombie(){
    const w=WORLD.w,h=WORLD.h;
    let x,y; const edge=(Math.random()*4)|0;
    if(edge===0){x=rand(0,w); y=-20}else if(edge===1){x=w+20;y=rand(0,h)}else if(edge===2){x=rand(0,w);y=h+20}else{x=-20;y=rand(0,h)}
    const typeRand=Math.random();
    let speed,hp,kind,scale=1;
    if(typeRand<0.6){ speed=rand(40,65); hp=32+WORLD.time*0.4; kind='zombie1'; scale=1; }
    else if(typeRand<0.9){ speed=rand(75,105); hp=26+WORLD.time*0.35; kind='zombie2'; scale=0.9; }
    else { speed=rand(28,40); hp=60+WORLD.time*0.6; kind='zombie3'; scale=1.1; }
    zombies.push({x,y,r:10*scale,speed,hp,maxHp:hp, kind, t:0, scale});
  }

  function aimAssist(){
    const ax=aimStick.vx, ay=aimStick.vy;
    const active=Math.abs(ax)+Math.abs(ay) > 0.01;
    if (active){ player.aimX=ax; player.aimY=ay; return; }
    // fallback: nearest enemy
    let best=null, bestd=360*360;
    for(const z of zombies){
      const d=dist2(player.x,player.y,z.x,z.y);
      if (d<bestd){ best=z; bestd=d; }
    }
    if(best){
      const dx=best.x-player.x, dy=best.y-player.y, m=Math.hypot(dx,dy);
      if(m>0){ player.aimX=dx/m; player.aimY=dy/m; }
    }
  }

  function step(dt){
    // move
    let mvx=0,mvy=0;
    if(keys.has('w')||keys.has('arrowup')) mvy-=1;
    if(keys.has('s')||keys.has('arrowdown')) mvy+=1;
    if(keys.has('a')||keys.has('arrowleft')) mvx-=1;
    if(keys.has('d')||keys.has('arrowright')) mvx+=1;
    mvx+=moveStick.vx; mvy+=moveStick.vy;
    const mag=Math.hypot(mvx,mvy); if(mag>0){ mvx/=mag; mvy/=mag; }
    player.x+=mvx*player.speed*dt; player.y+=mvy*player.speed*dt;
    player.x=clamp(player.x,12,WORLD.w-12); player.y=clamp(player.y,12,WORLD.h-12);

    // aim + fire
    aimAssist();
    if (keys.has(' ')) shoot();
    if (Math.abs(aimStick.vx)+Math.abs(aimStick.vy) > 0.1) shoot();

    // spawn
    if (WORLD.time-lastSpawn > spawnInterval){
      lastSpawn=WORLD.time; spawnZombie();
      spawnInterval=Math.max(0.45, 1.1 - WORLD.time*0.01);
    }

    // zombies
    for (let i=zombies.length-1;i>=0;i--){
      const z=zombies[i]; z.t+=dt;
      const db=Math.hypot(base.x-z.x,base.y-z.y);
      const tx = (db<120? base.x : player.x);
      const ty = (db<120? base.y : player.y);
      const dx=tx-z.x, dy=ty-z.y, m=Math.hypot(dx,dy)||1;
      z.x += (dx/m)*z.speed*dt; z.y += (dy/m)*z.speed*dt;
      if (dist2(z.x,z.y,player.x,player.y) < (z.r+player.r)**2){ player.hp -= 8*dt; if(player.hp<=0){ gameOver(); return; } }
      if (dist2(z.x,z.y,base.x,base.y)   < (z.r+base.r)**2)   { base.hp   -= 10*dt; if(base.hp<=0){ gameOver(); return; } }
    }

    // bullets
    for (let i=bullets.length-1;i>=0;i--){
      const b=bullets[i]; b.life-=dt; if(b.life<=0){ bullets.splice(i,1); continue; }
      b.x+=b.vx*dt; b.y+=b.vy*dt;
      for (let j=zombies.length-1;j>=0;j--){
        const z=zombies[j];
        if (dist2(b.x,b.y,z.x,z.y) <= (b.r+z.r)**2){
          bullets.splice(i,1); z.hp-=b.dmg; if(z.hp<=0){ zombies.splice(j,1); kills++; } break;
        }
      }
    }

    // hits
    for (let i=hits.length-1;i>=0;i--){ const h=hits[i]; h.t+=dt; if(h.t>0.12) hits.splice(i,1); }
  }

  function gameOver(){
    running=false; overlay.classList.add('show');
    overlay.querySelector('.panel h1').textContent='Game Over';
    overlay.querySelector('.panel p').textContent=`Duraste ${Math.floor(WORLD.time)}s — Kills: ${kills}.`;
    overlay.querySelector('#startBtn').textContent='Jugar';
  }

  // ================== Rendering ===================
  function draw(){
    const w=WORLD.w,h=WORLD.h,t=WORLD.time;
    // ground
    ctx.fillStyle=groundPattern; ctx.fillRect(0,0,w,h);
    // path
    ctx.save(); ctx.globalAlpha=0.9; ctx.fillStyle=THEMES[WORLD.themeIndex].ui; ctx.fillRect(0,h*0.72,w,h*0.28); ctx.restore();
    ctx.save(); ctx.globalAlpha=1; ctx.fillStyle=stripePattern;
    for(let y=h*0.72-10; y<h*0.72+4; y+=16){ ctx.translate(0, Math.sin((t*80+y)*0.01)*0.5); ctx.fillRect(0,y,w,2); ctx.setTransform(DPR,0,0,DPR,0,0); ctx.setTransform(1,0,0,1,0,0); } // decorative
    ctx.restore();

    // bunker sprite
    const b = sprites.bunker;
    ctx.drawImage(b, base.x-b.width/2, base.y-b.height/2);

    // player
    drawRotated(sprites.soldier, player.x, player.y, Math.atan2(player.aimY, player.aimX));

    // bullets + muzzle hits
    ctx.fillStyle='#fde047';
    for(const x of bullets){ ctx.fillRect(Math.round(x.x)-2, Math.round(x.y)-2, 4,4); }
    for(const hfx of hits){ const a=1-hfx.t/0.12; ctx.globalAlpha=a; ctx.fillStyle='#fff8c5'; ctx.fillRect(Math.round(hfx.x)-3, Math.round(hfx.y)-3, 6,6); ctx.globalAlpha=1; }

    // zombies
    for(const z of zombies){
      const sp = sprites[z.kind];
      drawSprite(sp, z.x, z.y, z.scale);
      // optional hp ring (minimalist omitted for pixel purity)
    }

    // HUD
    elHP.textContent=Math.max(0,player.hp|0);
    elBHP.textContent=Math.max(0,base.hp|0);
    elKills.textContent=kills;
    elTime.textContent=Math.floor(WORLD.time);
  }

  function drawSprite(img, cx, cy, scale=1){
    const w=img.width*scale, h=img.height*scale;
    ctx.drawImage(img, Math.round(cx - w/2), Math.round(cy - h/2), w, h);
  }
  function drawRotated(img, cx, cy, angle){
    ctx.save(); ctx.translate(Math.round(cx), Math.round(cy)); ctx.rotate(angle);
    ctx.drawImage(img, -img.width/2, -img.height/2);
    ctx.restore();
  }

  // ================== Loop ===================
  let last=0;
  function loop(t){
    requestAnimationFrame(loop);
    if(!running||paused) return;
    if(!last) last=t;
    const dt=Math.min(0.05,(t-last)/1000); last=t;
    WORLD.time+=dt; step(dt); draw();
  }

  // ================== Init ===================
  resize(); rebuildTiles(); draw(); requestAnimationFrame(loop);
  window.__game={WORLD,player,base,zombies,bullets,THEMES};

})();