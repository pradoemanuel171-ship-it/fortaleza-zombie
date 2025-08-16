'use client'
import { useEffect, useState } from 'react'
import { useI18n } from '@/i18n/useI18n'
export default function GatePage(){
  const [ok, setOk] = useState<boolean|undefined>(undefined)
  const { t } = useI18n()
  useEffect(()=>{
    const MiniKit = (window as any).MiniKit
    try{
      if (!MiniKit || !MiniKit.install) setOk(false)
      else{
        MiniKit.install()
        if (!MiniKit.isInstalled()) setOk(false)
        else fetch('/api/mark-wapp',{method:'POST'}).then(()=>setOk(true))
      }
    }catch{ setOk(false) }
  },[])
  if (ok===undefined) return <div className="min-h-dvh flex items-center justify-center"><div className="card">{t.authenticating}</div></div>
  if (ok===false) return <div className="min-h-dvh flex items-center justify-center"><div className="card text-center"><div className="text-lg font-semibold">{t.blocked_worldapp}</div></div></div>
  return <div className="min-h-dvh flex items-center justify-center"><div className="card">Cargando…</div></div>
}
