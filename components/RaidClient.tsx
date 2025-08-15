
'use client'
import { useEffect, useState, useCallback } from 'react'
import { CirclePerfect } from '@/components/CirclePerfect'
import { tClient, Locale } from '@/lib/clientI18n'

type Rival = { id: string, name: string, level: number, obrixEstimate: number, hint: string, isBot: boolean }
type LoadState = 'idle'|'loading'|'ready'|'attacking'|'result'

export default function RaidClient({ loc }: { loc: Locale }) {
  const [state, setState] = useState<LoadState>('idle')
  const [rival, setRival] = useState<Rival|null>(null)
  const [skips, setSkips] = useState(0)
  const [message, setMessage] = useState('')


  async function startOrNext(skip=false) {
    setState('loading')
    const res = await fetch(skip?'/api/skip':'/api/rival', { method:'POST' })
    const data = await res.json()
    if (!res.ok) { setMessage(data.error || 'Error'); setState('result'); return }
    if (data.done) { setMessage(tClient(loc,'raid.deploy_failed')); setState('result'); return }
    setRival(data.rival); setSkips(data.skips); setState('ready')
  }

  useEffect(()=>{ startOrNext(false) }, [])

  async function onAttackResult(hit: boolean) {
    setState('attacking')
    const res = await fetch('/api/attack', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ targetId: rival?.id, result: hit? 'hit':'miss' }) })
    const data = await res.json()
    if (!res.ok) setMessage(data.error || 'Error')
    else setMessage(data.msg)
    setState('result')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{tClient(loc,'raid.title')}</h1>

      {state==='loading' && <div className="rounded-2xl bg-surface p-4">{tClient(loc,'raid.finding')}</div>}

      {state==='ready' && rival && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-surface p-4 shadow-soft">
            <div className="text-sm text-muted">{tClient(loc,'raid.target')}</div>
            <div className="flex items-center justify-between mt-1">
              <div>
                <div className="text-lg font-semibold">{rival.name} · {tClient(loc,'raid.level')} {rival.level}</div>
                <div className="text-sm text-muted">{tClient(loc,'raid.estimate',{n:String(rival.obrixEstimate)})}</div>
                <div className="text-sm">{tClient(loc,'raid.hint',{hint:rival.hint})}</div>
              </div>
              <div className="text-xs text-muted">{tClient(loc,'raid.skips',{used:String(skips)})}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => startOrNext(true)} className="rounded-xl bg-white/5 py-3 hover:bg-white/10">{tClient(loc,'raid.skip')}</button>
            <button onClick={() => setState('attacking')} className="rounded-xl bg-brand.atq/20 text-brand.atq py-3 font-semibold hover:bg-brand.atq/30">{tClient(loc,'raid.attack')}</button>
          </div>
        </div>
      )}

      {state==='attacking' && (
        <div className="rounded-2xl bg-surface p-6">
          <CirclePerfect onDone={onAttackResult} />
        </div>
      )}

      {state==='result' && (
        <div className="rounded-2xl bg-surface p-4 space-y-3">
          <div>{message}</div>
          <a href="/" className="inline-block rounded-xl bg-brand.obrix/20 text-brand.obrix px-4 py-2">Volver</a>
        </div>
      )}
    </div>
  )
}
