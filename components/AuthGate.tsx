'use client'

import { useEffect, useRef, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export default function AuthGate() {
  const [status, setStatus] = useState<'checking'|'ok'|'need-worldapp'|'error'>('checking')
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const run = async () => {
      // Detectar si estamos dentro de World App
      if (!MiniKit.isInstalled()) {
        setStatus('need-worldapp')
        return
      }
      // Si ya hay cookie de sesión, no re-autenticar
      if (document.cookie.includes('sess=')) {
        setStatus('ok')
        return
      }
      try {
        const n = await fetch('/api/nonce', { cache: 'no-store' })
        const { nonce } = await n.json()

        const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
          nonce,
          statement: 'Sign in to Fortaleza',
        })
        if (finalPayload.status === 'error') {
          setStatus('error')
          return
        }
        const r = await fetch('/api/complete-siwe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payload: finalPayload })
        })
        if (!r.ok) throw new Error('verify_failed')
        setStatus('ok')
      } catch (e) {
        console.error(e)
        setStatus('error')
      }
    }
    run()
  }, [])

  if (status === 'need-worldapp') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="rounded-2xl bg-white p-6 text-center max-w-sm">
          <h2 className="font-bold text-xl mb-2 text-black">Abrir en World App</h2>
          <p className="text-sm text-gray-700">
            Esta miniapp solo funciona dentro de World App. Ábrela desde tu World App para continuar.
          </p>
        </div>
      </div>
    )
  }
  return null
}
