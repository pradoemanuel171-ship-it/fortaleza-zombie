'use client'

import React, { useEffect, useRef, useState } from 'react'

type Props = {
  onDone: (ok: boolean) => void
  durationMs?: number
  zoneSizeDeg?: number
}

function CirclePerfectImpl({
  onDone,
  durationMs = 2500,
  zoneSizeDeg = 60,
}: Props) {
  const [angle, setAngle] = useState(0) // rad
  const [attempt, setAttempt] = useState(1)
  const frameRef = useRef<number>()
  const startRef = useRef<number>(0)
  const [zoneStart, setZoneStart] = useState(() => Math.random() * 2 * Math.PI)
  const zoneSize = (zoneSizeDeg * Math.PI) / 180

  useEffect(() => {
    const loop = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const p = (ts - startRef.current) / durationMs
      const theta = (p % 1) * 2 * Math.PI
      setAngle(theta)
      frameRef.current = requestAnimationFrame(loop)
    }
    frameRef.current = requestAnimationFrame(loop)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [durationMs])

  const onTap = () => {
    const a = angle
    const s = zoneStart
    const e = (zoneStart + zoneSize) % (2 * Math.PI)
    let inZone = false
    if (zoneSize <= 0) inZone = false
    else if (s <= e) inZone = a >= s && a <= e
    else inZone = a >= s || a <= e
    if (inZone) onDone(true)
    else if (attempt === 1) {
      setAttempt(2)
      setZoneStart(Math.random() * 2 * Math.PI)
    } else onDone(false)
  }

  const R = 48
  const C = 2 * Math.PI * R
  const zoneLen = (zoneSize / (2 * Math.PI)) * C
  const offset = (zoneStart / (2 * Math.PI)) * C
  const markerDeg = (angle * 180) / Math.PI

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width="140"
        height="140"
        viewBox="0 0 120 120"
        onClick={onTap}
        className="cursor-pointer select-none"
      >
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.35" />
          </filter>
        </defs>
        <g transform="translate(60, 60)">
          <circle r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
          {/* arco de zona perfecto */}
          <circle
            r={R}
            fill="none"
            stroke="#22c55e"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${zoneLen} ${C}`}
            strokeDashoffset={C - offset}
            transform="rotate(-90)"
            filter="url(#shadow)"
          />
          {/* marcador */}
          <g transform={`rotate(${markerDeg - 90})`}>
            <circle cx={R} cy={0} r={5} fill="#fff" />
          </g>
        </g>
      </svg>

      <button
        className="px-4 py-2 rounded bg-white/10 hover:bg-white/20"
        onClick={onTap}
      >
        {attempt === 1 ? 'Tocar ahora' : 'Última chance'}
      </button>
    </div>
  )
}

// Export default y named para cubrir ambos estilos de import
export default CirclePerfectImpl
export { CirclePerfectImpl as CirclePerfect }
