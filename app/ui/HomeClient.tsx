'use client'
import React, { useEffect, useState } from 'react'
import { useI18n } from '@/i18n/useI18n'

type State = {
  base_purchased: boolean
  base_started_at?: string
  last_collected_at?: string
  generated_today?: number
  obrix_total: number
}

export default function HomeClient(){
  const { t } = useI18n()
  const [state, setState] = useState<State|null>(null)
  const [pool, setPool] = useState<number>(0)
  const [tick, setTick] = useState(0)
  const [loading, setLoading] = useState(false)

  // fetch state
  useEffect(()=>{ refresh() },[])
  // live pool update per second
  useEffect(()=>{
    const id = setInterval(()=> setTick(x=>x+1), 1000)
    return ()=> clearInterval(id)
  },[])

  useEffect(()=>{
    if (!state) return
    fetch('/api/state?calc=1').then(r=>r.json()).then(j=>{
      if (j?.ok){ setPool(j.pool); setState(j.state) }
    }).catch(()=>{})
  },[tick])

  async function refresh(){
    const r = await fetch('/api/state').then(r=>r.json()).catch(()=>null)
    if (r?.ok){ setState(r.state); setPool(r.pool) }
  }

  async function buyBase(){
    setLoading(true)
    const r = await fetch('/api/buy-base', { method:'POST' })
    setLoading(false)
    await refresh()
  }
  async function collect(){
    setLoading(true)
    await fetch('/api/collect', { method:'POST' })
    setLoading(false)
    await refresh()
  }

  return (
    <div style={{display:'grid', gap:12}}>
      <h2>{t('welcome')}</h2>
      {!state?.base_purchased && (
        <div style={{padding:12, border:'1px solid #333', borderRadius:8}}>
          <p>{t('buy_base_hint')}</p>
          <button onClick={buyBase} disabled={loading} style={{padding:'10px 16px', borderRadius:8, border:'1px solid #333', background:'#1f2937', color:'#fff'}}>
            {t('create_base')}
          </button>
        </div>
      )}
      {state?.base_purchased && (
        <div style={{padding:12, border:'1px solid #333', borderRadius:8, display:'grid', gap:8}}>
          <div>💠 Orbix totales: <strong>{state.obrix_total}</strong></div>
          <div>⏳ Listos para recolectar: <strong>{Math.floor(pool)}</strong></div>
          <button onClick={collect} disabled={loading || pool<1} style={{padding:'10px 16px', borderRadius:8, border:'1px solid #333', background: pool>=1?'#14532d':'#374151', color:'#fff'}}>
            Recolectar
          </button>
        </div>
      )}
    </div>
  )
}
