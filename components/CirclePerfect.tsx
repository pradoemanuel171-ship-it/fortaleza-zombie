'use client'
import { useEffect, useRef, useState } from 'react'

type Props = {
  zoneSizeDeg?: number
  speedDegPerSec?: number
  onDone: (hit: boolean) => void
}

export default function CirclePerfect({ zoneSizeDeg = 60, speedDegPerSec = 180, onDone }: Props) {
  const [angle, setAngle] = useState(0) // 0..360
  const [attempt, setAttempt] = useState(1)
  const req = useRef<number | null>(null)
  const start = useRef<number | null>(null)
  const zoneStart = useRef(Math.floor(Math.random() * 360))

  useEffect(() => {
    const step = (ts: number) => {
      if (start.current == null) start.current = ts
      const dt = (ts - start.current) / 1000 // sec
      const deg = (dt * speedDegPerSec) % 360
      setAngle(deg)
      req.current = requestAnimationFrame(step)
    }
    req.current = requestAnimationFrame(step)
    return () => { if (req.current) cancelAnimationFrame(req.current) }
  }, [speedDegPerSec])

  const onTap = () => {
    const a = angle
    const s = zoneStart.current
    const e = (s + zoneSizeDeg) % 360
    let inZone = false
    if (zoneSizeDeg <= 0) inZone = false
    else if (e >= s) inZone = a >= s && a <= e
    else inZone = a >= s || a <= e

    if (inZone) onDone(true)
    else if (attempt === 1) { setAttempt(2); zoneStart.current = Math.floor(Math.random()*360) }
    else onDone(false)
  }

  // SVG arc math
  const R = 48
  const C = 2 * Math.PI * R
  const arcLen = (zoneSizeDeg / 360) * C
  const dashArray = `${arcLen} ${C}`
  const startDeg = zoneStart.current
  const markerDeg = angle
  const dashOffset = ((360 - startDeg) / 360) * C

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="relative" style={{ width: 140, height: 140 }}>
        <svg viewBox="0 0 120 120" width={140} height={140}>
          <circle cx="60" cy="60" r={R} stroke="rgba(255,255,255,0.15)" strokeWidth="12" fill="none" />
          {/* perfect zone */}
          <circle
            cx="60" cy="60" r={R}
            stroke="#22c55e" strokeWidth="12" fill="none"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.2s ease' }}
          />
          {/* rotating marker */}
          <g transform={`rotate(${markerDeg} 60 60)`}>
            <circle cx="60" cy="12" r="6" fill="#fff" />
          </g>
        </svg>
        <button
          onClick={onTap}
          className="absolute inset-0 w-full h-full rounded-full focus:outline-none active:scale-95 transition-transform"
          aria-label="Tap"
        />
      </div>
      <div className="text-sm text-white/80">{attempt === 1 ? 'Intento 1/2' : 'Intento 2/2'}</div>
    </div>
  )
}
