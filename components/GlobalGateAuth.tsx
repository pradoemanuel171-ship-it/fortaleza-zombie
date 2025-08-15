'use client'
import { useEffect, useState, useCallback } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { tClient, Locale } from '@/lib/clientI18n'

const APP_ID = process.env.NEXT_PUBLIC_WLD_APP_ID

export default function GlobalGateAuth({ loc }: { loc: Locale }){
  const [installed, setInstalled] = useState<boolean|null>(null)
  const [auth, setAuth] = useState<'idle'|'working'|'ok'|'error'>('idle')
  const [errMsg, setErrMsg] = useState<string>('')

  useEffect(()=>{
    try {
      // Ensure SDK knows our app id (some versions require init)
      // If not supported, it won't break.
      // @ts-ignore
      if (APP_ID && (MiniKit as any).init) { (MiniKit as any).init({ app_id: APP_ID }) }
    } catch {}
    setInstalled(MiniKit.isInstalled())
  }, [])

  const doAuth = useCallback(async()=>{
    if (!MiniKit.isInstalled()) { setInstalled(false); return }
    setAuth('working'); setErrMsg('')
    try{
      const nr = await fetch('/api/nonce',{cache:'no-store'})
      const { nonce } = await nr.json()
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce, requestId: 'login-0',
        expirationTime: new Date(Date.now()+7*24*60*60*1000),
        notBefore: new Date(Date.now()-24*60*60*1000),
        statement: 'Sign in to Fortaleza'
      })
      if (finalPayload.status==='error'){ setAuth('error'); setErrMsg(finalPayload.code || 'auth error'); return }
      const r = await fetch('/api/siwe',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ payload: finalPayload, nonce }) })
      if (!r.ok) { const d=await r.json().catch(()=>({})); setErrMsg(d?.error||'verify failed'); setAuth('error'); return }
      setAuth('ok')
    }catch(e:any){ setAuth('error'); setErrMsg(e?.message||'unexpected error') }
  }, [])

  useEffect(()=>{
    // Auto attempt once when inside World App
    if (installed === true && auth==='idle') { void doAuth() }
  }, [installed, auth, doAuth])

  if (installed === null){
    return <div className="fixed inset-0 bg-bg text-text flex items-center justify-center p-6"><div>Cargando…</div></div>
  }
  if (installed === false){
    return <div className="fixed inset-0 bg-bg text-text flex items-center justify-center p-6">
      <div className="max-w-sm text-center space-y-3">
        <div className="text-lg font-semibold">{tClient(loc,'app.blocked')}</div>
      </div>
    </div>
  }

  // installed === true
  if (auth === 'ok') return null
  return (
    <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm text-text flex items-center justify-center p-6">
      <div className="max-w-sm text-center space-y-3 rounded-2xl bg-surface p-5 border border-white/5">
        <div className="text-lg font-semibold">Autenticación requerida</div>
        {auth==='error' && <div className="text-sm text-red-400">Error: {errMsg}</div>}
        <button onClick={doAuth} className="rounded-xl bg-brand.obrix/20 text-brand.obrix px-4 py-2 font-semibold hover:bg-brand.obrix/30">
          {auth==='working' ? 'Autenticando…' : 'Autenticar con World ID'}
        </button>
      </div>
    </div>
  )
}
