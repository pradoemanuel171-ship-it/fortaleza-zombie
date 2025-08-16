'use client'
import { useEffect, useState } from 'react'
import { useI18n } from '@/i18n/useI18n'

type State = {
  basePurchased: boolean
  obrixTotal: number
  pool: number
  dailyRemaining: number
}

export default function HomePage() {
  const { t } = useI18n()
  const [state, setState] = useState<State>({ basePurchased: false, obrixTotal: 0, pool: 0, dailyRemaining: 0 })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  async function refresh() {
    const r = await fetch('/api/state', { cache: 'no-store' })
    if (r.ok) {
      const d = await r.json()
      setState(d)
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    const h = setInterval(refresh, 3000)
    return () => clearInterval(h)
  }, [])

  const buyBase = async () => {
    setBusy(true)
    await fetch('/api/buy-base', { method: 'POST' })
    setBusy(false)
    refresh()
  }
  const collect = async () => {
    setBusy(true)
    await fetch('/api/collect', { method: 'POST' })
    setBusy(false)
    refresh()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Fortaleza</h1>
      <div className="card space-y-3">
        <div className="text-sm text-white/70">{t.obrix}</div>
        <div className="text-3xl font-bold">{state.obrixTotal}</div>
        <div className="text-xs text-white/60">{t.pool}: <span className="font-semibold text-emerald-400">{state.pool}</span></div>
        {!state.basePurchased ? (
          <div className="space-y-2">
            <div className="text-sm text-white/70">{t.buyBaseHint}</div>
            <button className="btn btn-primary w-full" onClick={buyBase} disabled={busy}>{t.createBase}</button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm text-white/70">{t.generating}</div>
            <button className="btn btn-secondary w-full" onClick={collect} disabled={busy || state.pool<=0}>{t.collect}</button>
          </div>
        )}
      </div>
    </div>
  )
}
