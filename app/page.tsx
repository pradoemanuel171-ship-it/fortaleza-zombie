'use client'
import { useI18n } from '@/i18n/useI18n'
import { useEffect, useState } from 'react'

type State = {
  obrixTotal: number
  basePurchased: boolean
  pool: number
  dailyCap: number
}

export default function Home(){
  const { t } = useI18n()
  const [s, setS] = useState<State | null>(null)
  const [loading, setLoading] = useState(false)

  async function refresh(){
    try{
      const r = await fetch('/api/collect?preview=1')
      if (!r.ok) throw new Error('fail')
      const d = await r.json()
      setS(d)
    }catch{
      setS(null)
    }
  }

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 1500)
    return () => clearInterval(id)
  }, [])

  const buy = async () => {
    setLoading(true)
    const r = await fetch('/api/buy-base', { method: 'POST' })
    setLoading(false)
    if (r.ok) refresh()
  }
  const collect = async () => {
    setLoading(true)
    const r = await fetch('/api/collect', { method: 'POST' })
    setLoading(false)
    if (r.ok) refresh()
  }

  if (!s) return <div className="space-y-3">
    <h1 className="h1">Fortaleza</h1>
    <p className="small">Cargando…</p>
  </div>

  return (
    <div className="space-y-4">
      <h1 className="h1">Fortaleza</h1>
      <div className="card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span>{t('yourObrix')}</span>
          <span className="text-emerald-400 font-semibold">{s.obrixTotal}</span>
        </div>
        <div className="flex items-center justify-between small">
          <span>Pool</span>
          <span>{s.pool} / {t('perDayCap')} {s.dailyCap}</span>
        </div>
      </div>

      {!s.basePurchased ? (
        <div className="card p-4">
          <p className="small mb-2">{t('youNeedBase')}</p>
          <button className="btn" onClick={buy} disabled={loading}>{t('buyBase')}</button>
        </div>
      ) : (
        <div className="card p-4">
          <button className="btn" onClick={collect} disabled={loading || s.pool<=0}>{t('collect')}</button>
        </div>
      )}
    </div>
  )
}
