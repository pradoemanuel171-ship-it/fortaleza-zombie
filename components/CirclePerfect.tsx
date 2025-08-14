
'use client'
import { useEffect, useRef, useState } from 'react'

export function CirclePerfect({ onDone }: { onDone: (hit: boolean) => void }) {
  const [attempt, setAttempt] = useState(1)
  const [angle, setAngle] = useState(0)
  const [speed, setSpeed] = useState(3.2) // radians/s
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
    setAttempt(n)
    setAngle(0)
    // randomize zone
    const start = Math.random() * Math.PI * 2
    const size = Math.PI * (n===1 ? 0.35 : 0.25)
    setZoneStart(start)
    setZoneSize(size)
    setSpeed(n===1 ? (2.8 + Math.random()*1.2) : (3.6 + Math.random()*1.6))
  }

  useEffect(() => { resetForAttempt(1) }, [])

  function handleTap() {
    const inZone = angle >= zoneStart && angle <= (zoneStart + zoneSize) % (Math.PI*2) ||
                   (zoneStart + zoneSize > Math.PI*2 && (angle <= (zoneStart+zoneSize)%(Math.PI*2) || angle >= zoneStart))
    if (inZone) {
      onDone(true)
    } else if (attempt === 1) {
      resetForAttempt(2)
    } else {
      onDone(false)
    }
  }

  // simple visual
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-sm text-muted">Tocá cuando el marcador pase por la zona verde</div>
      <div onClick={handleTap} className="relative w-44 h-44 rounded-full bg-black/40 flex items-center justify-center active:scale-[0.99] select-none">
        {/* zone arc as gradient */}
        <svg className="absolute inset-0" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none"/>
          {/* zone */}
          <path d={describeArc(50,50,48, rad2deg(zoneStart), rad2deg((zoneStart+zoneSize)%(Math.PI*2)) )} stroke="#22C55E" strokeWidth="6" fill="none" strokeLinecap="round"/>
        </svg>
        {/* marker */}
        <div className="absolute" style={{
          transform: `rotate(${angle}rad)`
        }}>
          <div className="w-2 h-8 bg-[#F97316] rounded-md translate-x-[84px] shadow-[0_0_10px_#F97316]"></div>
        </div>
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4)'}} />
      </div>
      <div className="text-xs text-muted">Intento {attempt} de 2</div>
      <button onClick={handleTap} className="rounded-xl bg-brand.atq/20 text-brand.atq px-4 py-2">¡Golpear ahora!</button>
    </div>
  )
}

function polarToCartesian(centerX:number, centerY:number, radius:number, angleInDegrees:number) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x:number, y:number, radius:number, startAngle:number, endAngle:number){
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  var d = [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");

  return d;       
}

function rad2deg(r:number){ return r * 180 / Math.PI }
