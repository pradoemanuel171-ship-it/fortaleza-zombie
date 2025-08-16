'use client'
import { useEffect, useState } from 'react'
import { CirclePerfect } from '@/components/CirclePerfect'
import { useI18n } from '@/i18n/useI18n'
type Target = { id: string, kind: 'weak'|'even'|'strong', obrix: number }
export default function RaidPage(){
  const [targets, setTargets] = useState<Target[]>([])
  const [message, setMessage] = useState<string>('')
  const [hit, setHit] = useState<boolean|undefined>(undefined)
  const { t } = useI18n()
  async function load(){ const r = await fetch('/api/raid/targets', { cache:'no-store' }); if (r.ok){ const d = await r.json(); setTargets(d.targets) } }
  useEffect(()=>{ load() }, [])
  async function attack(tg: Target){
    setMessage('')
    const r = await fetch('/api/raid/attack', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ targetId: tg.id, hit: !!hit }) })
    if (!r.ok){ setMessage('Error'); return }
    const d = await r.json()
    if (d.result==='win') setMessage(`+${d.loot} Obrix`); else setMessage('Derrota')
    setHit(undefined); load()
  }
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t.raid}</h1>
      <div className="card">
        <div className="text-sm text-muted mb-2">{t.targets}</div>
        <div className="grid2">
          {targets.map(x=> (
            <div key={x.id} className="card">
              <div className="text-sm text-muted">{x.kind}</div>
              <div className="text-lg font-semibold">{x.obrix} {t.obrix}</div>
              <button className="btn btn-primary w-full mt-2" onClick={()=>attack(x)}>{t.attack}</button>
            </div>
          ))}
        </div>
      </div>
      <div className="card"><CirclePerfect onDone={(h)=>setHit(h)} />{hit!==undefined && <div className="mt-2 badge">{hit ? t.hit : t.miss}</div>}</div>
      {message && <div className="card anim-pop">{message}</div>}
    </div>
  )
}
