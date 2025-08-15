
'use client'
import { useCallback, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export default function AutoLogin() {
  const [status, setStatus] = useState<'idle'|'ok'|'error'>('idle')
  const start = useCallback(async()=>{
    try{
      if (!MiniKit.isInstalled()) return
      const nonceRes = await fetch('/api/nonce', { cache:'no-store' })
      const { nonce } = await nonceRes.json()
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce, requestId: '0',
        expirationTime: new Date(Date.now()+7*24*60*60*1000),
        notBefore: new Date(Date.now()-24*60*60*1000),
        statement: 'Sign in to Fortaleza'
      })
      if (finalPayload.status==='error') { setStatus('error'); return }
      const r = await fetch('/api/siwe', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ payload: finalPayload, nonce }) })
      if (!r.ok) { setStatus('error'); return }
      setStatus('ok')
    }catch{ setStatus('error') }
  },[])
  return <></>
}
