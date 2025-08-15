
'use client'
import { useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export default function EnvGate({ onReady }: { onReady: () => void }) {
  const [state, setState] = useState<'checking'|'blocked'|'ready'>('checking')
  useEffect(()=>{
    if (!MiniKit.isInstalled()) { setState('blocked'); return }
    setState('ready'); onReady()
  },[onReady])
  if (state==='checking') return <div className="rounded-2xl bg-surface p-4">Cargando…</div>
  if (state==='blocked') return <div className="rounded-2xl bg-surface p-6 text-center space-y-2">
    <div>Esta miniapp solo funciona dentro de <b>World App</b>.</div>
    <div>Ábrela desde World App.</div>
  </div>
  return null
}
