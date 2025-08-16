'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/i18n/useI18n'
export default function BottomNav(){
  const p = usePathname()
  const { t } = useI18n()
  const items = [
    { href: '/', label: t.base, icon: '🏚️' },
    { href: '/raid', label: t.raid, icon: '⚔️' },
    { href: '/revenge', label: t.revenge, icon: '💢' },
    { href: '/store', label: t.store, icon: '🛒' },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur border-t border-white/5">
      <div className="mx-auto max-w-md px-3 py-2 grid grid-cols-4 gap-2">
        {items.map(it=>(
          <Link key={it.href} href={it.href} className={"flex flex-col items-center py-1 rounded-lg transition-soft " + (p===it.href?"bg-white/5":"hover:bg-white/5")}>
            <div className="text-lg">{it.icon}</div>
            <div className="text-[11px] text-muted">{it.label}</div>
          </Link>
        ))}
      </div>
    </nav>
  )
}
