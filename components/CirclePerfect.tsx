
'use client'
import { useEffect, useRef, useState } from 'react'

export function CirclePerfect({ onDone }: { onDone: (hit: boolean) => void }) {
  const [attempt, setAttempt] = useState(1)
  const [angle, setAngle] = useState(0)
  const [speed, setSpeed] = useState(3.2)
  const [zoneStart, setZoneStart] = useState(Math.PI * 0.4)
  const [zoneSize, setZoneSize] = useState(Math.PI * 0.3)
  const raf = useRef<number|undefined>()

  useEffect(() => {
    let last = performance.now()
    const tick = (t: number) => {
      const dt = (t - last) / 1000
      last = t
      setAngle((a) => (a + speed * dt) % (Math.PI*2))
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [speed])

  function resetForAttempt(n: number) {
    setAttempt(n); setAngle(0)
    const start = Math.random() * Math.PI * 2
    const size = Math.PI * (n===1 ? 0.35 : 0.25)
    setZoneStart(start); setZoneSize(size)
    setSpeed(n===1 ? (2.8 + Math.random()*1.2) : (3.6 + Math.random()*1.6))
  }
  useEffect(() => { resetForAttempt(1) }, [])

  function handleTap() {
    const two = Math.PI*2
    const s = ((zoneStart % two) + two) % two
    const e = ((zoneStart + zoneSize) % two + two) % two
    const a = ((angle % two) + two) % two
    let inZone = false
    if (zoneSize <= 0) inZone = false
    else if (e >= s) inZone = a >= s && a <= e
    else inZone = a >= s || a <= e
    if (inZone) onDone(true)
    else if (attempt === 1) resetForAttempt(2)
    else onDone(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-sm text-muted">Toca cuando el marcador pase por la zona verde</div>
      <div onClick={handleTap} className="relative w-44 h-44 rounded-full bg-black/40 flex items-center justify-center active:scale-[0.99] select-none">
        <svg className="absolute inset-0" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none"/>
          {renderZoneArc(50,50,48, zoneStart, zoneSize)}
        </svg>
        <div className="absolute" style={{ transform: `rotate(${angle}rad)` }}>
          <div className="w-2 h-8 bg-[#F97316] rounded-md translate-x-[84px] shadow-[0_0_10px_#F97316]"></div>
        </div>
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{boxShadow:'inset 0 0 30px rgba(0,0,0,0.4)'}}/>
      </div>
      <div className="text-xs text-muted">Intento {attempt} de 2</div>
      <button onClick={handleTap} className="rounded-xl bg-brand.atq/20 text-brand.atq px-4 py-2">¡Golpear ahora!</button>
    </div>
  )
}

function polarToCartesian(cx:number, cy:number, r:number, deg:number){
  const rad = (deg-90) * Math.PI / 180
  return { x: cx + r*Math.cos(rad), y: cy + r*Math.sin(rad) }
}
function describeArc(x:number, y:number, r:number, startDeg:number, endDeg:number){
  const start = polarToCartesian(x,y,r,endDeg)
  const end = polarToCartesian(x,y,r,startDeg)
  const large = endDeg - startDeg <= 180 ? "0" : "1"
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`
}
function rad2deg(r:number){ return r*180/Math.PI }
function norm(rad:number){ const two=Math.PI*2; let x=rad%two; if (x<0) x+=two; return x }
function renderZoneArc(cx:number, cy:number, r:number, start:number, size:number){
  const s = norm(start); const e = norm(start+size)
  if (size<=0.0001) return <></>
  if (e < s){
    const d1 = describeArc(cx,cy,r, rad2deg(s), 360)
    const d2 = describeArc(cx,cy,r, 0, rad2deg(e))
    return (<>
      <path d={d1} stroke="#22C55E" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d={d2} stroke="#22C55E" strokeWidth="6" fill="none" strokeLinecap="round"/>
    </>)
  } else {
    const d = describeArc(cx,cy,r, rad2deg(s), rad2deg(e))
    return <path d={d} stroke="#22C55E" strokeWidth="6" fill="none" strokeLinecap="round"/>
  }
}
