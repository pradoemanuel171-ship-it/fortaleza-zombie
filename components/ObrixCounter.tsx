'use client'
import { useEffect, useState } from 'react'

export default function ObrixCounter({ initial }: { initial: number }){
  const [value, setValue] = useState(initial)
  useEffect(()=>{
    let alive = true
    async function tick(){
      try{
        const r = await fetch('/api/status', { cache:'no-store' })
        if (!r.ok) return
        const d = await r.json()
        if (alive && typeof d?.obrix === 'number') setValue(d.obrix)
      } catch {}
    }
    tick()
    const id = setInterval(tick, 2000)
    return () => { alive=false; clearInterval(id) }
  },[])
  return <div className="text-4xl font-bold text-brand.obrix">{value}</div>
}
