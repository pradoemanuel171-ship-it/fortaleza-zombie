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

  const R = 48
  const C = 2 * Math.PI * R
  const dash = (zoneSize / (2*Math.PI)) * C
  const dashArray = `${dash} ${C}`
  const startDeg = (zoneStart * 180) / Math.PI
  const markerDeg = (angle * 180) / Math.PI

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-sm text-muted">Toca cuando el marcador pase por la zona verde</div>

      <div onClick={handleTap} className="relative w-44 h-44 rounded-full bg-black/40 flex items-center justify-center active:scale-[0.99] select-none anim-pop">
        <svg className="absolute inset-0" viewBox="0 0 100 100" shapeRendering="geometricPrecision">
          <circle cx="50" cy="50" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none"/>
          <g transform={`rotate(${startDeg} 50 50)`}>
            <circle cx="50" cy="50" r={R} stroke="#22C55E" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={dashArray} strokeDashoffset="0"/>
          </g>
          <g transform={`rotate(${markerDeg} 50 50)`}>
            <rect x="50" y={50-R-4} width="3" height="12" rx="1.5" fill="#F97316" />
            <circle cx="51.5" cy={50-R-4} r="1.5" fill="#F97316" opacity="0.85" />
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.8" flood-color="#F97316" flood-opacity="0.8"/>
            </filter>
            <rect x="50" y={50-R-4} width="3" height="12" rx="1.5" fill="#F97316" filter="url(#glow)" opacity="0.8"/>
          </g>
        </svg>
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow:'inset 0 0 30px rgba(0,0,0,0.4)' }} />
      </div>

      <div className="text-xs text-muted">Intento {attempt} de 2</div>
      <button onClick={handleTap} className="rounded-xl bg-brand.atq/20 text-brand.atq px-4 py-2 transition-soft active:scale-[0.98]">¡Golpear ahora!</button>
    </div>
  )
}
