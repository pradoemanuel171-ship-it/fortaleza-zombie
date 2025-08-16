'use client'
import React from 'react'

/**
 * Perfect circular timing mini-game.
 * Props:
 *  - angle: current angle [0..2π)
 *  - zoneStart, zoneSize: radians
 *  - onHit(): called when user taps while in green zone
 */
export default function CirclePerfect({
  angle, zoneStart, zoneSize, onHit
}: { angle: number; zoneStart: number; zoneSize: number; onHit: ()=>void }){

  const R = 56
  const C = 2 * Math.PI * R

  // Stroke dash for green zone arc
  const dashLen = (zoneSize / (2*Math.PI)) * C
  const dashArray = `${dashLen} ${C}`
  const startDeg = (zoneStart * 180) / Math.PI
  const markerDeg = (angle * 180) / Math.PI

  const inZone = (()=>{
    let a = angle, s=zoneStart, e=(zoneStart+zoneSize)%(2*Math.PI)
    if (zoneSize<=0) return false
    if (e>=s) return a>=s && a<=e
    return a>=s || a<=e
  })()

  return (
    <div style={{display:'grid', placeItems:'center'}}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <g transform="translate(80,80)">
          <circle r={R} cx="0" cy="0" fill="none" stroke="#2a2a2a" strokeWidth="10" />
          {/* green zone */}
          <g transform={`rotate(${startDeg})`}>
            <circle r={R} cx="0" cy="0" fill="none"
              stroke="#10b981" strokeWidth="10"
              strokeDasharray={dashArray} strokeDashoffset="0"
              strokeLinecap="round"
            />
          </g>
          {/* moving marker */}
          <g transform={`rotate(${markerDeg})`}>
            <circle r="6" cx={R} cy="0" fill={inZone?'#10b981':'#e11d48'} />
          </g>
        </g>
      </svg>
      <button
        onClick={onHit}
        style={{marginTop:12, padding:'10px 16px', borderRadius:8, border:'1px solid #333', background: inZone?'#0f5132':'#2d2d2d', color:'#fff'}}
      >
        {inZone? '¡ATAQUE PERFECTO!' : 'Golpear'}
      </button>
    </div>
  )
}
