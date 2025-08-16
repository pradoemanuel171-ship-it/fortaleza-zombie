'use client'
import { useEffect, useState } from 'react'
import { useI18n } from '@/i18n/useI18n'
declare global { interface Window { MiniKit?: any } }
const getMini = () => typeof window !== 'undefined' ? window.MiniKit : undefined
export function MiniKitBootstrap(){
  const [stage, setStage] = useState<'ok'|'blocked'|'auth'|'installing'>('installing')
  const { t } = useI18n()
  useEffect(()=>{
    (async()=>{
      const sess = await fetch('/api/session', { cache:'no-store' })
      if (sess.ok){ setStage('ok'); return }
      const MiniKit = getMini()
      if (!MiniKit || !MiniKit.install){ setStage('blocked'); return }
      try{
        MiniKit.install()
        if (!MiniKit.isInstalled()){ setStage('blocked'); return }
        await fetch('/api/mark-wapp', { method:'POST' })
        setStage('auth')
        const { nonce } = await (await fetch('/api/nonce')).json()
        const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
          nonce, requestId: 'login-0',
          expirationTime: new Date(Date.now()+7*24*60*60*1000),
          notBefore: new Date(Date.now()-24*60*60*1000),
          statement: 'Sign in to Fortaleza'
        })
        const r = await fetch('/api/siwe', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ payload: finalPayload, nonce }) })
        if (r.ok) setStage('ok'); else setStage('blocked')
      }catch{ setStage('blocked') }
    })()
  },[])
  if (stage==='ok') return null
  if (stage==='blocked') return <div className="fixed inset-0 bg-[rgba(11,14,16,.95)] text-white flex items-center justify-center p-6"><div className="card text-center"><div className="text-lg font-semibold">{t.blocked_worldapp}</div></div></div>
  return <div className="fixed inset-0 bg-[rgba(11,14,16,.6)] backdrop-blur-sm flex items-center justify-center"><div className="card">{t.authenticating}</div></div>
}
