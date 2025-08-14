
import Link from 'next/link'
import { cookies } from 'next/headers'
import { readState, writeState } from '@/lib/state'
import { now } from '@/lib/game'

export default function Home() {
  const s = readState()
  // write back state after accrue
  writeState(s)
  const cd = Math.max(0, s.cooldownUntil - now())

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tu Base</h1>
        <span className="text-sm text-muted">Demo sin DB</span>
      </header>

      <div className="rounded-2xl bg-surface p-4 shadow-soft space-y-2">
        <div className="text-sm text-muted">Tus Obrix</div>
        <div className="text-4xl font-bold text-brand.obrix">{s.obrix}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <form action="/api/collect" method="post">
          <button className="w-full rounded-xl bg-brand.obrix/15 text-brand.obrix py-3 font-semibold hover:bg-brand.obrix/25 active:scale-[0.99]">Recolectar</button>
        </form>
        <Link href="/raid" className={`w-full text-center rounded-xl bg-brand.atq/15 text-brand.atq py-3 font-semibold hover:bg-brand.atq/25 active:scale-[0.99] ${cd>0?'pointer-events-none opacity-50':''}`}>
          {cd>0? `Saqueo (${Math.ceil(cd/1000)}s)` : 'Saqueo'}
        </Link>
      </div>

      <div className="rounded-2xl bg-surface p-4 text-sm text-muted">
        Reglas demo: ataque cuesta 1.5% de tus Obrix (min 25, máx 250). Botín por victoria = 5% del objetivo.
      </div>
    </div>
  )
}
