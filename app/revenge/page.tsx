'use client'
import { useEffect, useState } from 'react'
export default function RevengePage(){
  const [slots, setSlots] = useState<any[]>([])
  useEffect(()=>{ (async()=>{ const r = await fetch('/api/revenge/slots', { cache:'no-store' }).catch(()=>null); if (r && r.ok){ const d = await r.json(); setSlots(d.slots || []) } })() },[])
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Venganza</h1>
      <div className="grid2">
        {(slots||[]).slice(0,4).map((s:any, i:number)=>(
          <div key={i} className="card">
            <div className="text-sm text-muted">Slot {i+1}</div>
            {s.locked ? <div className="text-muted">Bloqueado</div> : <div>Objetivo listo</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
