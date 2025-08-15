
'use client'
import { useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
function getCsrf(){ return (document.cookie.split('; ').find(c=>c.startsWith('fx_csrf='))||'').split('=')[1] || '' }
export default function AutoLogin(){
  useEffect(()=>{
    (async()=>{
      try{
        if (!MiniKit.isInstalled()) return
        const nres = await fetch('/api/nonce', { cache:'no-store' })
        const { nonce } = await nres.json()
        const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
          nonce, requestId: '0',
          expirationTime: new Date(Date.now()+7*24*60*60*1000),
          notBefore: new Date(Date.now()-24*60*60*1000),
          statement: 'Sign in to Fortaleza (demo)'
        })
        if (finalPayload.status === 'error') return
        await fetch('/api/complete-siwe', {
          method: 'POST',
          headers: { 'Content-Type':'application/json', 'x-csrf': getCsrf() },
          body: JSON.stringify({ payload: finalPayload, nonce })
        })
      }catch{}
    })()
  },[])
  return null
}
