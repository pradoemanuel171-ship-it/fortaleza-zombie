'use client'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/i18n/useI18n'

export function CirclePerfect({ onDone }: { onDone: (hit: boolean) => void }) {
  const { t } = useI18n()
  const [attempt, setAttempt] = useState(1)
  const [angle, setAngle] = useState(0)
  const [speed, setSpeed] = useState(3.0)
  const [zoneStart, setZoneStart] = useState(Math.PI * 0.4)
  const [zoneSize, setZoneSize] = useState(Math.PI * 0.28)
  const raf = useRef<number | undefined>()

  useEffect(() => {
    let last = performance.now()
    const tick = (t: number) => {
      const dt = (t - last) / 1000
      last = t
      setAngle((a) => (a + speed * dt) % (Math.PI * 2))
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [speed])

  function resetForAttempt(n: number) {
    setAttempt(n); setAngle(0)
    const start = Math.random() * Math.PI * 2
    const size = Math.PI * (n === 1 ? 0.32 : 0.22)
    setZoneStart(start); setZoneSize(size)
    setSpeed(n === 1 ? (2.6 + Math.random() * 1.0) : (3.5 + Math.random() * 1.2))
  }
  useEffect(() => { resetForAttempt(1) }, [])

  function handleTap() {
    const two = Math.PI * 2
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

  const R = 50
  const C = 2 * Math.PI * R
  const dashArray = `${(zoneSize / (2 * Math.PI)) * C} ${C}`
  const startDeg = (zoneStart * 180) / Math.PI
  const markerDeg = (angle * 180) / Math.PI

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-sm text-muted">{t.tap_hint}</div>
      <div onClick={handleTap} className="relative w-44 h-44 rounded-full bg-black/40 flex items-center justify-center active:scale-[0.99] select-none anim-pop">
        <svg className="absolute inset-0" viewBox="0 0 120 120" shapeRendering="geometricPrecision">
          <defs>
            <linearGradient id="gArc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34D399"/>
              <stop offset="100%" stopColor="#22C55E"/>
            </linearGradient>
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.6" floodColor="#22C55E" floodOpacity="0.55"/>
            </filter>
          </defs>
          <circle cx="60" cy="60" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" vectorEffect="non-scaling-stroke"/>
          <g transform={`rotate(${startDeg} 60 60)`}>
            <circle cx="60" cy="60" r={R} stroke="url(#gArc)" strokeWidth="8" fill="none"
              strokeLinecap="round" strokeDasharray={dashArray} strokeDashoffset="0"
              filter="url(#softGlow)" vectorEffect="non-scaling-stroke"/>
          </g>
          <g transform={`rotate(${markerDeg} 60 60)`}>
            <circle cx="60" cy={60 - R} r="3" fill="#F59E0B"/>
            <rect x="59" y={60 - R} width="2" height="12" rx="1" fill="#F97316" />
            <filter id="ptrGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#F59E0B" floodOpacity="0.9"/>
            </filter>
            <circle cx="60" cy={60 - R} r="3" fill="#F59E0B" filter="url(#ptrGlow)" opacity="0.9"/>
          </g>
        </svg>
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow:'inset 0 0 30px rgba(0,0,0,0.45)' }} />
      </div>
      <div className="text-xs text-muted">Intento {attempt} de 2</div>
      <button onClick={handleTap} className="btn" style={{background:"color-mix(in oklab, var(--atq) 18%, transparent)"}}>¡Golpear ahora!</button>
    </div>
  )
}
