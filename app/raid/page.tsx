'use client'
import { useI18n } from '@/i18n/useI18n'
import { useEffect, useState } from 'react'
import CirclePerfect from '@/components/CirclePerfect'

type Target = { id: string, kind: 'weak'|'even'|'strong', obrix: number }

export default function RaidPage(){
  const { t } = useI18n()
  const [targets, setTargets] = useState<Target[] | null>(null)
  const [pick, setPick] = useState<Target | null>(null)
  const [phase, setPhase] = useState<'idle'|'choose'|'aim'|'result'>('idle')
  const [result, setResult] = useState<{ win: boolean, loot: number, cost: number } | null>(null)
  const [skips, setSkips] = useState(0)

  const findTargets = async () => {
    const r = await fetch('/api/raid/targets')
    if (!r.ok) return
    const d = await r.json()
    setTargets(d.targets)
    setPick(null)
    setPhase('choose')
    setSkips(0)
  }

  useEffect(() => { findTargets() }, [])

  const skip = () => {
    setSkips(s => {
      const n = s + 1
      if (n >= 3) setPhase('idle')
      return n
    })
    findTargets()
  }

  const attack = async (hit: boolean) => {
    if (!pick) return
    const r = await fetch('/api/raid/attack', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ target: pick, hit })
    })
    if (!r.ok) return
    const d = await r.json()
    setResult({ win: d.result === 'win', loot: d.loot, cost: d.cost })
    setPhase('result')
  }

  return (
    <div className="space-y-4">
      <h1 className="h1">{t('raid')}</h1>

      {phase==='idle' && (
        <div className="card p-4">
          <button className="btn" onClick={findTargets}>{t('findTarget')}</button>
        </div>
      )}

      {phase==='choose' && targets && (
        <div className="space-y-3">
          {targets.map((tg) => (
            <div key={tg.id} className="card p-4 flex items-center justify-between">
              <div>
                <div className="font-medium capitalize">{tg.kind}</div>
                <div className="small">{tg.obrix} Obrix</div>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={skip}>{t('skip')}</button>
                <button className="btn" onClick={() => { setPick(tg); setPhase('aim') }}>{t('attack')}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {phase==='aim' && pick && (
        <div className="card p-4 flex flex-col items-center gap-3">
          <CirclePerfect onDone={attack} />
          <div className="small">Objetivo: {pick.obrix} Obrix</div>
        </div>
      )}

      {phase==='result' && result && (
        <div className="card p-4">
          <div className="text-xl font-semibold mb-2">{result.win ? t('victory') : t('defeat')}</div>
          <div className="small">{t('loot')}: {result.loot} • {t('cost')}: {result.cost}</div>
          <div className="mt-3">
            <button className="btn" onClick={() => { setResult(null); setPhase('idle'); }}>{t('findTarget')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
