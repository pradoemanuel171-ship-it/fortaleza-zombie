'use client'
import React, { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'

const IDKitWidget = dynamic(async () => (await import('@worldcoin/idkit')).IDKitWidget, { ssr: false })

function isWorldAppUA(){
  if (typeof navigator==='undefined') return false
  const ua = navigator.userAgent || ''
  return /WorldApp|World\b/i.test(ua)
}

export default function WorldIdGate({ children }:{ children: React.ReactNode }){
  const [authed, setAuthed] = useState<boolean>(false)
  const [needWorld, setNeedWorld] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [config, setConfig] = useState<{appId:string, action:string}|null>(null)

  useEffect(()=>{
    // fetch session
    fetch('/api/session').then(r=>r.json()).then(s=>{
      if (s?.ok && s.auth==='ok') { setAuthed(true); return }
      if (!isWorldAppUA()) { setNeedWorld(true); return }
      setNeedWorld(false)
      setOpen(true)
    }).catch(()=>{})
  }, [])

  useEffect(()=>{
    fetch('/api/worldid/config').then(r=>r.json()).then((d)=>{
      if (d?.appId && d?.action) setConfig({appId:d.appId, action:d.action})
    }).catch(()=>{})
  }, [])

  if (authed) return <>{children}</>

  if (needWorld){
    return (
      <div style={{padding:'24px'}}>
        <h2>🔒 Solo en World App</h2>
        <p>Abre esta miniapp dentro de <strong>World App</strong> para continuar.</p>
      </div>
    )
  }

  return (
    <div style={{padding:'24px'}}>
      <h2>Verifica con World ID</h2>
      {config && (
        <IDKitWidget
          app_id={config.appId}
          action={config.action}
          autoClose
          onSuccess={async (res:any)=>{
            const r = await fetch('/api/worldid/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(res) })
            const j = await r.json().catch(()=>({}))
            if (j?.ok){ setAuthed(true); setOpen(false) }
          }}
        >
          {({ open }) => (
            <button onClick={()=>open()} style={{padding:'10px 16px', borderRadius:8, border:'1px solid #333', background:'#2d2d2d', color:'#fff'}}>
              Continuar
            </button>
          )}
        </IDKitWidget>
      )}
      {!config && <p>Configuración de World ID faltante.</p>}
    </div>
  )
}
