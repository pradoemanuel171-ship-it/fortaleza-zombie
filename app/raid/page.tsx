'use client'
import { useEffect, useState } from 'react'
import CirclePerfect from '@/components/CirclePerfect'

type Target = { id: string; label: string; obrix: number; kind: 'weak'|'even'|'strong' }

export default function RaidPage() {
  const [targets, setTargets] = useState<Target[]>([])
  const [chosen, setChosen] = useState<Target | null>(null)
  const [phase, setPhase] = useState<'choose'|'minigame'|'result'>('choose')
  const [result, setResult] = useState<{ outcome: 'win'|'lose'; loot: number; cost: number; cooldownUntil?: string }|null>(null)

  const refresh = async () => {
    const r = await fetch('/api/raid/targets', { cache: 'no-store' })
    if (r.ok) setTargets(await r.json())
  }

  useEffect(() => { refresh() }, [])

  const pick = (t: Target) => {
    setChosen(t)
    setPhase('minigame')
  }

  const onDone = async (hit: boolean) => {
    if (!chosen) return
    const r = await fetch('/api/raid/attack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: chosen, hit })
    })
    if (!r.ok) {
      const d = await r.json().catch(()=>({error:'error'}))
      alert(d.error || 'error')
      setPhase('choose')
      setChosen(null)
      return
    }
    const d = await r.json()
    setResult({ outcome: d.result, loot: d.loot, cost: d.cost, cooldownUntil: d.cooldownUntil })
    setPhase('result')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Saqueo</h1>
      {phase==='choose' && (
        <div className="grid grid-cols-1 gap-3">
          {targets.map(t => (
            <button key={t.id} className="card text-left active:scale-[0.99] transition" onClick={()=>pick(t)}>
              <div className="flex items-center justify-between">
                <div className="font-semibold">{t.label}</div>
                <div className={`text-xs ${t.kind==='weak'?'text-emerald-400':t.kind==='even'?'text-sky-400':'text-rose-400'}`}>{t.kind}</div>
              </div>
              <div className="text-sm text-white/70">Obrix: <span className="font-bold">{t.obrix}</span></div>
            </button>
          ))}
          <button className="btn btn-ghost w-full" onClick={refresh}>Buscar otros</button>
        </div>
      )}
      {phase==='minigame' && chosen && (
        <div className="card space-y-3">
          <div className="text-sm text-white/70">Objetivo: <span className="font-semibold">{chosen.label}</span></div>
          <CirclePerfect onDone={onDone} />
        </div>
      )}
      {phase==='result' && result && (
        <div className="card space-y-2">
          <div className={`text-lg font-bold ${result.outcome==='win'?'text-emerald-400':'text-rose-400'}`}>
            {result.outcome === 'win' ? '¡Victoria!' : 'Derrota'}
          </div>
          <div className="text-sm">Loot: <span className="font-semibold">{result.loot}</span></div>
          <div className="text-sm">Costo: <span className="font-semibold">{result.cost}</span></div>
          <button className="btn btn-secondary w-full" onClick={()=>{ setPhase('choose'); setChosen(null); setResult(null); refresh(); }}>Seguir</button>
        </div>
      )}
    </div>
  )
}
