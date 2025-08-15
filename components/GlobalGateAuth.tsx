'use client'
import { useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { tClient, Locale } from '@/lib/clientI18n'

export default function GlobalGateAuth({ loc }: { loc: Locale }){
  const [ready, setReady] = useState<boolean|null>(null)
  const [auth, setAuth] = useState<'idle'|'ok'|'error'>('idle')

  useEffect(()=>{
    if (!MiniKit.isInstalled()) { setReady(false); return }
    setReady(true)
  },[])

  useEffect(()=>{
    (async()=>{
      if (ready!==true) return
      try{
        const nr = await fetch('/api/nonce',{cache:'no-store'})
        const { nonce } = await nr.json()
        const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
          nonce, requestId: '0',
          expirationTime: new Date(Date.now()+7*24*60*60*1000),
          notBefore: new Date(Date.now()-24*60*60*1000),
          statement: 'Sign in to Fortaleza'
        })
        if (finalPayload.status==='error'){ setAuth('error'); return }
        const r = await fetch('/api/siwe',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ payload: finalPayload, nonce }) })
        setAuth(r.ok?'ok':'error')
      }catch{ setAuth('error') }
    })()
  },[ready])

  if (ready===false){
    return <div className="fixed inset-0 bg-bg text-text flex items-center justify-center p-6"><div className="max-w-sm text-center space-y-3"><div className="text-lg font-semibold">{tClient(loc,'app.blocked')}</div></div></div>
  }
  return null
}
