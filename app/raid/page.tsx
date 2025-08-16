'use client'
import React, { useEffect, useState } from 'react'
import WorldIdGate from '@/components/WorldIdGate'
import CirclePerfect from '@/components/CirclePerfect'

export default function RaidPage(){
  return (
    <WorldIdGate>
      <RaidClient />
    </WorldIdGate>
  )
}

function RaidClient(){
  const [angle, setAngle] = useState(0)
  const [zoneStart, setZoneStart] = useState(Math.random()*Math.PI*2)
  const [zoneSize, setZoneSize] = useState(Math.PI/5)

  useEffect(()=>{
    let a = 0
    const id = setInterval(()=>{
      a = (a + Math.PI/50)%(Math.PI*2)
      setAngle(a)
    }, 16)
    return ()=> clearInterval(id)
  }, [])

  function onHit(){
    // naive evaluation, server will judge on /api/raid/attack (TODO)
    const a = angle, s=zoneStart, e=(zoneStart+zoneSize)%(Math.PI*2)
    const inZone = e>=s ? (a>=s && a<=e) : (a>=s || a<=e)
    alert(inZone? '¡Golpe perfecto!' : 'Fallaste')
  }

  return (
    <div style={{display:'grid', gap:12}}>
      <h2>Asalto</h2>
      <CirclePerfect angle={angle} zoneStart={zoneStart} zoneSize={zoneSize} onHit={onHit} />
    </div>
  )
}
