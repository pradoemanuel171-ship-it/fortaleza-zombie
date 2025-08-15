'use client'
import { useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { tClient, Locale } from '@/lib/clientI18n'

export default function MiniKitBootstrap({ loc }: { loc: Locale }){
  const [stage, setStage] = useState<'installing'|'auth'|'ok'|'blocked'|'error'>('installing')
  const [err, setErr] = useState<string>('')

  useEffect(()=>{
    (async()=>{
      try{
        const st = await fetch('/api/session', { cache:'no-store' })
        if (st.ok) { setStage('ok'); return }

        MiniKit.install()
        if (!MiniKit.isInstalled()) { setStage('blocked'); return }

        setStage('auth')
        const nres = await fetch('/api/nonce', { cache:'no-store' })
        const { nonce } = await nres.json()

        const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
          nonce, requestId: 'login-0',
          expirationTime: new Date(Date.now()+7*24*60*60*1000),
          notBefore: new Date(Date.now()-24*60*60*1000),
          statement: 'Sign in to Fortaleza'
        })
        if (finalPayload.status === 'error'){
          setErr((finalPayload as any)?.error || (finalPayload as any)?.reason || 'auth error')
          setStage('error'); return
        }

        const vr = await fetch('/api/siwe', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ payload: finalPayload, nonce })
        })
        if (!vr.ok){ const d = await vr.json().catch(()=>({})); setErr(d?.error||'verify failed'); setStage('error'); return }

        setStage('ok')
      }catch(e:any){ setErr(e?.message||'unexpected'); setStage('error') }
    })()
  },[])

  if (stage === 'ok') return null
  if (stage === 'blocked'){
    return <div className="fixed inset-0 bg-bg text-text flex items-center justify-center p-6">
      <div className="max-w-sm text-center space-y-2">
        <div className="text-lg font-semibold">{tClient(loc,'app.blocked')}</div>
      </div>
    </div>
  }
  return (
    <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm text-text flex items-center justify-center p-6">
      <div className="max-w-sm text-center space-y-3 rounded-2xl bg-surface p-5 border border-white/5">
        <div className="text-lg font-semibold">{stage==='auth' ? tClient(loc,'app.auth_loading') : 'Inicializando…'}</div>
        {stage==='error' && <div className="text-sm text-red-400">Error: {err}</div>}
      </div>
    </div>
  )
}
