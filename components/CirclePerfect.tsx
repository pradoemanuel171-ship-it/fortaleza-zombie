'use client'
import React, { useEffect, useRef, useState } from 'react'

type Props = {
  onDone: (hit: boolean) => void
  radius?: number
}

export function CirclePerfect({ onDone, radius = 48 }: Props) {
  const [angle, setAngle] = useState(0)
  const [start, setStart] = useState(Math.random() * 2 * Math.PI)
  const [size, setSize] = useState(Math.PI / 6) // 30°
  const [attempt, setAttempt] = useState(1)
  const runningRef = useRef(true)

  useEffect(() => {
    runningRef.current = true
    let raf = 0
    let last = performance.now()
    const speed = 1.8 // rad/s
    const loop = (t: number) => {
      const dt = (t - last) / 1000
      last = t
      setAngle(a => (a + speed * dt) % (2 * Math.PI))
      if (runningRef.current) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { runningRef.current = false; cancelAnimationFrame(raf) }
  }, [])

  const R = radius
  const C = 2 * Math.PI * R

  const onClick = () => {
    const a = angle
    const s = start
    const e = (start + size) % (2 * Math.PI)
    let inZone = false
    if (size > 0) {
      if (e >= s) inZone = a >= s && a <= e
      else inZone = a >= s || a <= e // envuelve 2π
    }
    if (inZone) onDone(true)
    else if (attempt === 1) { setAttempt(2); setStart(Math.random() * 2 * Math.PI) }
    else onDone(false)
  }

  const zoneDash = `${(size / (2 * Math.PI)) * C} ${C}`
  const zoneOffset = (1 - (start / (2 * Math.PI))) * C
  const markerDeg = (angle * 180) / Math.PI

  return (
    <div className="w-40 h-40 mx-auto select-none" onClick={onClick}>
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g transform="translate(60,60)">
          <circle r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10"/>
          <circle
            r={R}
            fill="none"
            stroke="#22c55e"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={zoneDash}
            strokeDashoffset={zoneOffset}
            filter="url(#glow)"
          />
          <line
            x1="0" y1={-R - 2} x2="0" y2={-R + 10}
            stroke="white" strokeWidth="3" transform={`rotate(${markerDeg})`}
          />
        </g>
      </svg>
      <div className="text-center mt-2 text-sm opacity-70">
        Intento {attempt}/2 · toca cuando esté en verde
      </div>
    </div>
  )
}
export default CirclePerfect
