'use client'
import { useEffect, useState } from 'react'
import { useI18n } from '@/i18n/useI18n'
export default function HomeClient(){
  const [data, setData] = useState<any>({ obrix: 0, pool: 0, basePurchased: false, remainingDaily: 50 })
  const { t } = useI18n()
  useEffect(()=>{
    let alive = true
    const load = async()=>{
      const r = await fetch('/api/status', { cache: 'no-store' }).catch(()=>null)
      if (!alive) return
      if (r && r.ok){ setData(await r.json()) }
      setTimeout(load, 2000)
    }
    load()
    return ()=>{ alive=false }
  },[])
  return (
    <div className="space-y-6">
      <div className="hud py-2">
        <div className="flex items-center justify-between">
          <div className="badge">{t.obrix}: <b>{data.obrix}</b></div>
          <div className="badge">{t.daily_cap}: 50</div>
        </div>
      </div>
      <div className="card anim-pop">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted">{t.pool_uncollected}</div>
            <div className="text-2xl font-semibold">{data.pool}</div>
          </div>
          <div className="rad" style={{["--p" as any]: (Math.min(50, 50-data.remainingDaily)/50*100)+'%'}} data-label={(50-data.remainingDaily)+"/50"}></div>
        </div>
        <div className="grid2 mt-3">
          <form action="/api/collect" method="post"><button className="btn btn-primary w-full">{t.collect}</button></form>
          <a href="/raid" className="btn" style={{background:"color-mix(in oklab, var(--atq) 18%, transparent)"}}>{t.raid}</a>
        </div>
      </div>
      {!data.basePurchased && (
        <div className="card anim-pop">
          <div className="text-sm text-muted mb-2">{t.start_generating}</div>
          <form action="/api/buy-base" method="post"><button className="btn btn-primary w-full">{t.buy_base}</button></form>
          <div className="mt-3">
            <div className="relative overflow-hidden rounded-xl" style={{height:140, background:"#101519"}} aria-label="build-animation">
              <div className="absolute inset-0" style={{background:"repeating-linear-gradient(90deg, #0d1217, #0d1217 12px, #0b0f14 12px, #0b0f14 24px)"}}/>
              <div className="absolute bottom-0 left-4 right-4 h-2 bg-[#2a2f37] rounded"></div>
              <div className="absolute bottom-2 left-8 w-28 h-8 bg-[#3a414b] rounded anim-pop"></div>
              <div className="absolute bottom-10 left-14 w-20 h-6 bg-[#464e59] rounded anim-pop" style={{animationDelay:".1s"}}></div>
              <div className="absolute bottom-16 left-20 w-12 h-4 bg-[#4f5863] rounded anim-pop" style={{animationDelay:".2s"}}></div>
              <div className="absolute bottom-20 left-24 w-8 h-3 bg-[#59636e] rounded anim-pop" style={{animationDelay:".3s"}}></div>
            </div>
          </div>
        </div>
      )}
      <div className="grid2">
        <a href="/revenge" className="card">{t.revenge}</a>
        <a href="/store" className="card">{t.store}</a>
      </div>
    </div>
  )
}
