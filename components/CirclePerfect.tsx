'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function CirclePerfect({ onDone }:{ onDone:(ok:boolean)=>void }){
  const [running, setRunning] = useState(false);
  const [angle, setAngle] = useState(0); // radians, 0..2π
  const [zoneStart, zoneSize] = useMemo(()=>{
    // zona entre 20° y 60°
    const size = (Math.random() * (Math.PI/3 - Math.PI/9)) + Math.PI/9;
    const start = Math.random() * (2*Math.PI - size);
    return [start, size] as const;
  }, []);
  const raf = useRef<number|undefined>(undefined);
  const R = 48;
  const C = 2*Math.PI*R;

  useEffect(()=>{
    if(!running) return;
    let a = angle;
    let last = performance.now();
    const tick = (t:number)=>{
      const dt = (t - last)/1000;
      last = t;
      a += dt * (2*Math.PI) * 0.8; // 0.8 rev/s
      if(a > 2*Math.PI) a -= 2*Math.PI;
      setAngle(a);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return ()=>{ if(raf.current) cancelAnimationFrame(raf.current); };
  }, [running]);

  function stop(){
    setRunning(false);
    const s = zoneStart;
    const e = (zoneStart + zoneSize) % (2*Math.PI);
    let ok = false;
    if(zoneSize <= 0) ok = false;
    else if(e >= s) ok = angle >= s && angle <= e;
    else ok = angle >= s || angle <= e;
    onDone(ok);
  }

  // Arc visuals
  const dash = (zoneSize/(2*Math.PI)) * C;
  const startFraction = zoneStart/(2*Math.PI);
  // Offset so that the arc's visible segment begins at zoneStart (we rotate -90° to align 0 at top)
  const offset = C * (1 - startFraction);

  const markerDeg = (angle * 180) / Math.PI;

  return (
    <div className="center" style={{padding:16}}>
      <svg viewBox="0 0 100 100" width="220" height="220" className="anim">
        {/* background circle */}
        <g transform="rotate(-90 50 50)">
          <circle cx="50" cy="50" r={R} fill="none" stroke="#243041" strokeWidth="8"/>
          {/* success arc */}
          <circle cx="50" cy="50" r={R} fill="none"
            stroke="#4BE1AB" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`} strokeDashoffset={offset}
          />
        </g>
        {/* moving marker */}
        <g transform={`rotate(${markerDeg - 90} 50 50)`}>
          <line x1="50" y1="6" x2="50" y2="18" stroke="#9bb3d6" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="50" cy="10" r="2.8" fill="#e6f0ff"/>
        </g>
      </svg>
      <div style={{display:'flex',gap:8}}>
        {!running ? (
          <button className="btn" onClick={()=>{ setAngle(0); setRunning(true); }}>Iniciar</button>
        ) : (
          <button className="btn" onClick={stop}>Detener</button>
        )}
        <button className="btn secondary" onClick={()=>location.reload()}>Nuevo</button>
      </div>
    </div>
  );
}
