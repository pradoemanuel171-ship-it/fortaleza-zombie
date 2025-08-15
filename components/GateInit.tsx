'use client'
import { useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export default function GateInit(){
  const [installed, setInstalled] = useState<boolean|undefined>(undefined)
  const [err, setErr] = useState<string>('')

  useEffect(()=>{
    (async()=>{
      try{
        MiniKit.install()
        if (!MiniKit.isInstalled()) { setInstalled(false); return }
        setInstalled(true)
        await fetch('/api/mark-wapp', { method:'POST' })
        window.location.href = '/'
      }catch(e:any){
        setErr(e?.message||'error')
      }
    })()
  },[])

  if (installed === undefined){
    return <div className="rounded-2xl bg-surface p-6 shadow-soft text-center">
      <div className="text-lg font-semibold">Verificando World App…</div>
    </div>
  }
  if (installed === false){
    return <div className="max-w-sm rounded-2xl bg-surface p-6 shadow-soft text-center space-y-3">
      <div className="text-lg font-semibold">Abrí esta miniapp desde World App</div>
      <div className="text-sm text-muted">No pudimos detectar el entorno de World App.</div>
    </div>
  }
  return null
}
