'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  size?: number
  zoneSizeDeg?: number
  speedDegPerSec?: number
  onDone: (hit: boolean) => void
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export function CirclePerfect({
  size = 132,
  zoneSizeDeg = 42,
  speedDegPerSec = 360,
  onDone
}: Props) {
  const R = (size / 2) - 10
  const C = 2 * Math.PI * R
  const [angleDeg, setAngleDeg] = useState(0)
  const [running, setRunning] = useState(true)
  const startRef = useRef<number | null>(null)

  const [zoneStartDeg] = useState(() => Math.floor(Math.random() * 360))
  const zoneLenDeg = clamp(zoneSizeDeg, 6, 330)

  const zoneArc = useMemo(() => {
    const arcLen = (zoneLenDeg / 360) * C
    const dash = `${arcLen} ${C}`
    const offset = ((360 - zoneStartDeg) / 360) * C
    return { dash, offset }
  }, [C, zoneLenDeg, zoneStartDeg])

  useEffect(() => {
    setRunning(true)
    const loop = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const dt = (ts - startRef.current) / 1000
      const next = (dt * speedDegPerSec) % 360
      setAngleDeg(next)
      if (running) requestAnimationFrame(loop)
    }
    const id = requestAnimationFrame(loop)
    return () => {
      setRunning(false)
      cancelAnimationFrame(id)
      startRef.current = null
    }
  }, [speedDegPerSec, running])

  const handleClick = () => {
    const a = angleDeg % 360
    const s = zoneStartDeg % 360
    const e = (zoneStartDeg + zoneLenDeg) % 360
    let inZone = false
    if (zoneLenDeg > 0) {
      if (e >= s) inZone = a >= s && a <= e
      else inZone = a >= s || a <= e
    }
    setRunning(false)
    onDone(inZone)
  }

  const marker = useMemo(() => {
    const rad = (angleDeg - 90) * (Math.PI / 180)
    const cx = size / 2 + R * Math.cos(rad)
    const cy = size / 2 + R * Math.sin(rad)
    return { cx, cy }
  }, [angleDeg, R, size])

  return (
    <div style={{ width: size, height: size, userSelect: 'none' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} onClick={handleClick}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={10} />
        <circle
          cx={size/2} cy={size/2} r={R}
          fill="none"
          stroke="rgb(34,197,94)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={zoneArc.dash}
          strokeDashoffset={zoneArc.offset}
          style={{ transition: 'stroke-dashoffset 0.2s linear' }}
        />
        <circle cx={marker.cx} cy={marker.cy} r={6} fill="white" />
      </svg>
    </div>
  )
}

export default CirclePerfect
