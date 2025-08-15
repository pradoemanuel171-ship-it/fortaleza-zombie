'use client'
import { useState } from 'react'

export default function CollectButton({ label = 'Recolectar', onOk }: { label?: string, onOk?: (obrix:number)=>void }) {
  const [working, setWorking] = useState(false)
  const [ok, setOk] = useState<boolean | null>(null)

  async function onClick() {
    try {
      setWorking(true)
      const r = await fetch('/api/collect', { method: 'POST' })
      const d = await r.json()
      setOk(r.ok && d?.ok === true)
      if (r.ok && d?.obrix && onOk) onOk(d.obrix)
    } finally {
      setWorking(false)
      setTimeout(()=>setOk(null), 1200)
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={working}
      className={"w-full rounded-xl bg-brand.obrix/15 text-brand.obrix py-3 font-semibold active:scale-[0.99] transition-soft hover:bg-brand.obrix/25 " + (ok ? "anim-pulse-soft" : "")}
      aria-busy={working}
    >
      {working ? '...' : label}
    </button>
  )
}
