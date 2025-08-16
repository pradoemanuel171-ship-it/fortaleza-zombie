(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d',{alpha:false});
  ctx.imageSmoothingEnabled=false;
  let DPR=Math.max(1,Math.min(window.devicePixelRatio||1,3));

  const WORLD={w:0,h:0,time:0};

  function resize(){
    const w=innerWidth,h=innerHeight;
    canvas.width=Math.floor(w*DPR); canvas.height=Math.floor(h*DPR);
    canvas.style.width=w+'px'; canvas.style.height=h+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    WORLD.w=w; WORLD.h=h;
  }
  addEventListener('resize', resize, {passive:true});

  // Load assets
  function load(src){ return new Promise(r=>{ const i=new Image(); i.onload=()=>r(i); i.src=src; }); }
  const ASSETS={};

  const GROUND_TILE_SRC = 'assets/tile.png';
  const BUNKER_SRC      = 'assets/bunker.png';
  const PLAYER_SRC      = 'assets/player.png';
  const ZW_SRC          = 'assets/zombie_walker.png';
  const ZR_SRC          = 'assets/zombie_runner.png';
  const ZT_SRC          = 'assets/zombie_tank.png';

  // ---- Entities ----
  const player={x:320,y:240,r:10,speed:120,hp:100,maxHp:100,aimX:1,aimY:0,lastShot:-999,fireRate:0.18};
  const base={x:0,y:0,r:26,hp:120,maxHp:120};
  const bullets=[], zombies=[], flashes=[];
  let kills=0, running=false, paused=false;

  // ---- Controls ----
  const keys=new Set();
  addEventListener('keydown', e=>{ if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault(); keys.add(e.key.toLowerCase()); });
  addEventListener('keyup',   e=> keys.delete(e.key.toLowerCase()));

  const moveStick=setupStick('stickMove');
  const aimStick =setupStick('stickAim');
  const attackBtn=document.getElementById('attackBtn');
  attackBtn.addEventListener('pointerdown',(e)=>{e.preventDefault(); shoot();},{passive:false});

  function setupStick(id){
    const el=document.getElementById(id), knob=el.querySelector('.knob');
    const st={active:false,id:null,ox:0,oy:0,vx:0,vy:0,max:52,dead:0.18};
    function setKnob(dx,dy){ const m=Math.hypot(dx,dy),lim=Math.min(m,st.max); const nx=(m?dx/m:0)*lim, ny=(m?dy/m:0)*lim; knob.style.transform=`translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`; }
    el.addEventListener('pointerdown',e=>{ el.setPointerCapture(e.pointerId); st.active=true; st.id=e.pointerId; const r=el.getBoundingClientRect(); st.ox=r.left+r.width/2; st.oy=r.top+r.height/2; const dx=e.clientX-st.ox, dy=e.clientY-st.oy, m=Math.hypot(dx,dy); st.vx=m>r.width*st.dead/2?dx/m:0; st.vy=m>r.width*st.dead/2?dy/m:0; setKnob(dx,dy); });
    el.addEventListener('pointermove',e=>{ if(!st.active||e.pointerId!==st.id) return; const r=el.getBoundingClientRect(); const dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2), m=Math.hypot(dx,dy); st.vx=m>el.clientWidth*st.dead/2?dx/m:0; st.vy=m>el.clientWidth*st.dead/2?dy/m:0; setKnob(dx,dy); });
    function end(e){ if(!st.active||(e&&e.pointerId!==st.id)) return; st.active=false; st.id=null; st.vx=0; st.vy=0; knob.style.transform='translate(-50%,-50%)'; }
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); el.addEventListener('lostpointercapture', end);
    return st;
  }

  canvas.addEventListener('pointermove',(e)=>{ const r=canvas.getBoundingClientRect(); const dx=(e.clientX-r.left)-player.x; const dy=(e.clientY-r.top)-player.y; const m=Math.hypot(dx,dy); if(m>0){ player.aimX=dx/m; player.aimY=dy/m; }});

  // ---- HUD ----
  const elHP=document.getElementById('hp'), elBHP=document.getElementById('basehp'), elKills=document.getElementById('kills'), elTime=document.getElementById('time');
  const overlay=document.getElementById('overlay'), startBtn=document.getElementById('startBtn'), pauseBtn=document.getElementById('pauseBtn');
  startBtn.addEventListener('click',()=>{ overlay.classList.remove('show'); reset(); running=true; });
  pauseBtn.addEventListener('click',()=>{ if(!running) return; paused=!paused; overlay.classList.toggle('show', paused); });

  function reset(){ const w=WORLD.w,h=WORLD.h; player.x=w*0.5; player.y=h*0.6; player.hp=player.maxHp; player.aimX=1; player.aimY=0; player.lastShot=-999; base.x=w*0.5; base.y=h*0.75; base.hp=base.maxHp; bullets.length=0; zombies.length=0; flashes.length=0; WORLD.time=0; kills=0; lastSpawn=0; spawnInterval=1.1; paused=false; keys.clear(); }

  function shoot(){ const t=WORLD.time; if(t-player.lastShot<player.fireRate) return; player.lastShot=t; const speed=520, life=1.1, dmg=22; bullets.push({x:player.x,y:player.y,r:2,vx:player.aimX*speed,vy:player.aimY*speed,life,dmg}); flashes.push({x:player.x+player.aimX*12,y:player.y+player.aimY*8,t:0}); }

  let lastSpawn=0, spawnInterval=1.1;
  function spawnZombie(){ const w=WORLD.w,h=WORLD.h; let x,y; const edge=(Math.random()*4)|0; if(edge===0){x=Math.random()*w;y=-20}else if(edge===1){x=w+20;y=Math.random()*h}else if(edge===2){x=Math.random()*w;y=h+20}else{x=-20;y=Math.random()*h} const r=Math.random(); let speed,hp,kind; if(r<0.6){speed=40+Math.random()*25;hp=32+WORLD.time*0.4;kind='walker'} else if(r<0.9){speed=75+Math.random()*30;hp=26+WORLD.time*0.35;kind='runner'} else {speed=28+Math.random()*12;hp=60+WORLD.time*0.6;kind='tank'} zombies.push({x,y,r:10,speed,hp,maxHp:hp,kind,t:0}); }

  function aimAssist(){ const ax=aimStick.vx, ay=aimStick.vy; if(Math.abs(ax)+Math.abs(ay)>0.01){ player.aimX=ax; player.aimY=ay; return; } let best=null, bestd=360*360; for(const z of zombies){ const d=(player.x-z.x)**2+(player.y-z.y)**2; if(d<bestd){ best=z; bestd=d; } } if(best){ const dx=best.x-player.x, dy=best.y-player.y, m=Math.hypot(dx,dy); if(m>0){ player.aimX=dx/m; player.aimY=dy/m; } } }

  function step(dt){ // movement
    let mvx=0,mvy=0; if(keys.has('w')||keys.has('arrowup')) mvy-=1; if(keys.has('s')||keys.has('arrowdown')) mvy+=1; if(keys.has('a')||keys.has('arrowleft')) mvx-=1; if(keys.has('d')||keys.has('arrowright')) mvx+=1; mvx+=moveStick.vx; mvy+=moveStick.vy; const mag=Math.hypot(mvx,mvy); if(mag>0){ mvx/=mag; mvy/=mag; } player.x+=mvx*player.speed*dt; player.y+=mvy*player.speed*dt; player.x=Math.max(12,Math.min(WORLD.w-12,player.x)); player.y=Math.max(12,Math.min(WORLD.h-12,player.y));
    aimAssist(); if(keys.has(' ')) shoot(); if(Math.abs(aimStick.vx)+Math.abs(aimStick.vy)>0.1) shoot();
    if(WORLD.time-lastSpawn>spawnInterval){ lastSpawn=WORLD.time; spawnZombie(); spawnInterval=Math.max(0.45,1.1-WORLD.time*0.01); }
    for(let i=zombies.length-1;i>=0;i--){ const z=zombies[i]; z.t+=dt; const db=Math.hypot(base.x-z.x,base.y-z.y); const tx=(db<120?base.x:player.x), ty=(db<120?base.y:player.y); const dx=tx-z.x, dy=ty-z.y; const m=Math.hypot(dx,dy)||1; z.x+=(dx/m)*z.speed*dt; z.y+=(dy/m)*z.speed*dt; const pr=(z.r+player.r)**2, br=(z.r+base.r)**2; if((player.x-z.x)**2+(player.y-z.y)**2<pr){ player.hp-=8*dt; if(player.hp<=0){ gameOver(); return; } } if((base.x-z.x)**2+(base.y-z.y)**2<br){ base.hp-=10*dt; if(base.hp<=0){ gameOver(); return; } } }
    for(let i=bullets.length-1;i>=0;i--){ const b=bullets[i]; b.life-=dt; if(b.life<=0){ bullets.splice(i,1); continue; } b.x+=b.vx*dt; b.y+=b.vy*dt; for(let j=zombies.length-1;j>=0;j--){ const z=zombies[j]; if((b.x-z.x)**2+(b.y-z.y)**2 <= (b.r+z.r)**2){ bullets.splice(i,1); z.hp-=b.dmg; if(z.hp<=0){ zombies.splice(j,1); kills++; } break; } } }
    for(let i=flashes.length-1;i>=0;i--){ const f=flashes[i]; f.t+=dt; if(f.t>0.12) flashes.splice(i,1); }
  }

  function gameOver(){ running=false; overlay.classList.add('show'); overlay.querySelector('.panel h1').textContent='Game Over'; overlay.querySelector('.panel p').textContent=`Duraste ${Math.floor(WORLD.time)}s — Kills: ${kills}.`; overlay.querySelector('#startBtn').textContent='Jugar'; }

  // ---- Draw ----
  let groundPattern;
  function makeGround(){ const t=document.createElement('canvas'); t.width=t.height=16; const i=new Image(); i.onload=()=>{ const g=t.getContext('2d'); g.imageSmoothingEnabled=false; g.drawImage(i,0,0); groundPattern=ctx.createPattern(t,'repeat'); }; i.src=GROUND_TILE_SRC; }
  function draw(){ const w=WORLD.w,h=WORLD.h; if(groundPattern){ ctx.fillStyle=groundPattern; ctx.fillRect(0,0,w,h); } else { ctx.fillStyle='#111827'; ctx.fillRect(0,0,w,h); }
    // path
    ctx.fillStyle='rgba(31,41,55,.85)'; ctx.fillRect(0,h*0.72,w,h*0.28);
    // bunker
    const b=ASSETS.bunker; ctx.drawImage(b, base.x-b.width/2, base.y-b.height/2);
    // player
    drawRot(ASSETS.player, player.x, player.y, Math.atan2(player.aimY,player.aimX));
    // bullets & flashes
    ctx.fillStyle='#fde047'; for(const bt of bullets){ ctx.fillRect(Math.round(bt.x)-2, Math.round(bt.y)-2,4,4); }
    for(const f of flashes){ const a=1-f.t/0.12; ctx.globalAlpha=a; ctx.fillStyle='#fff8c5'; ctx.fillRect(Math.round(f.x)-3, Math.round(f.y)-3,6,6); ctx.globalAlpha=1; }
    // zombies
    for(const z of zombies){ const img = z.kind==='walker'?ASSETS.zw: z.kind==='runner'?ASSETS.zr:ASSETS.zt; drawSprite(img, z.x, z.y); }
    // HUD text
    elHP.textContent=Math.max(0,player.hp|0); elBHP.textContent=Math.max(0,base.hp|0); elKills.textContent=kills; elTime.textContent=Math.floor(WORLD.time);
  }
  function drawSprite(img, cx, cy){ ctx.drawImage(img, Math.round(cx - img.width/2), Math.round(cy - img.height/2)); }
  function drawRot(img, cx, cy, a){ ctx.save(); ctx.translate(Math.round(cx), Math.round(cy)); ctx.rotate(a); ctx.drawImage(img, -img.width/2, -img.height/2); ctx.restore(); }

  // ---- Loop ----
  let last=0;
  function loop(t){ requestAnimationFrame(loop); if(!running||paused) return; if(!last) last=t; const dt=Math.min(0.05,(t-last)/1000); last=t; WORLD.time+=dt; step(dt); draw(); }

  // ---- Boot ----
  async function boot(){
    resize(); makeGround();
    ASSETS.bunker = await load(BUNKER_SRC);
    ASSETS.player = await load(PLAYER_SRC);
    ASSETS.zw     = await load(ZW_SRC);
    ASSETS.zr     = await load(ZR_SRC);
    ASSETS.zt     = await load(ZT_SRC);
    draw(); requestAnimationFrame(loop);
  }
  boot();

  // expose
  window.__game={WORLD,player,base,zombies,bullets};

})();