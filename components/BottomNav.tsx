'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/i18n/useI18n'

function Item({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link href={href} className={`flex flex-col items-center gap-1 ${active ? 'text-emerald-400' : 'text-white/70'}`}>
      <span className="text-2xl">{icon}</span>
      <span className="text-xs">{label}</span>
    </Link>
  )
}

export default function BottomNav() {
  const { t, loc, setLoc } = useI18n()
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/60 backdrop-blur">
      <div className="mx-auto max-w-md px-6 py-3 flex items-center justify-between">
        <Item href="/" label={t.home} icon="🏠" />
        <Item href="/raid" label={t.raid} icon="⚔️" />
        <Item href="/revenge" label={t.revenge} icon="🧿" />
        <Item href="/store" label={t.store} icon="🛒" />
        <button className="text-xs px-2 py-1 rounded bg-white/10" onClick={()=>setLoc(loc==='es'?'en':'es')}>{loc.toUpperCase()}</button>
      </div>
    </div>
  )
}
