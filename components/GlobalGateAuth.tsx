'use client'

import { useEffect, useState } from 'react'
import { MiniAppWallet } from '@worldcoin/minikit-js'

export default function GlobalGateAuth() {
  const [auth, setAuth] = useState<'idle' | 'ok' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')
  const [nonce, setNonce] = useState('')

  useEffect(() => {
    const doAuth = async () => {
      try {
        // Obtener nonce desde backend
        const n = await fetch('/api/nonce')
          .then(res => res.json())
          .then(d => d?.nonce || '')
        if (!n) throw new Error('No se pudo obtener nonce')
        setNonce(n)

        // Iniciar flujo SIWE + MiniKit
        const finalPayload = await MiniAppWallet.signInWithWallet({
          statement: 'Sign in to Fortaleza',
        })

        // Manejo de error del payload
        if (finalPayload.status === 'error') {
          setAuth('error')
          const errMsg =
            (finalPayload as any)?.code ||
            (finalPayload as any)?.error ||
            (finalPayload as any)?.reason ||
            'auth error'
          setErrMsg(errMsg)
          return
        }

        // Enviar payload para verificar
        const r = await fetch('/api/siwe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payload: finalPayload, nonce: n }),
        })
        if (!r.ok) {
          const d = await r.json().catch(() => ({}))
          setErrMsg(d?.error || 'verify failed')
          setAuth('error')
          return
        }

        setAuth('ok')
      } catch (err: any) {
        setAuth('error')
        setErrMsg(err?.message || 'unexpected error')
      }
    }

    doAuth()
  }, [])

  if (auth === 'idle') return <div>Verificando credenciales...</div>
  if (auth === 'error')
    return (
      <div>
        Error de autenticación: {errMsg || 'Error desconocido'}
      </div>
    )

  return <>{/* El resto de la app va aquí */}</>
}
