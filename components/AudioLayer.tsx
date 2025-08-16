'use client'
import { useEffect, useRef, useState } from 'react'
export default function AudioLayer(){
  const [muted, setMuted] = useState(true)
  const ref = useRef<HTMLAudioElement|null>(null)
  useEffect(()=>{ const m = localStorage.getItem('fx_mute'); if (m==='0') setMuted(false) },[])
  useEffect(()=>{
    if (!ref.current) return
    ref.current.muted = muted
    if (!muted){ ref.current.play().catch(()=>{}) }
    localStorage.setItem('fx_mute', muted?'1':'0')
  },[muted])
  return (
    <div className="fixed top-2 left-2 z-20">
      <button className="btn" onClick={()=>setMuted(m=>!m)}>{muted?'🔇':'🔊'}</button>
      <audio ref={ref} loop src="/ambient.ogg" preload="auto" />
    </div>
  )
}
