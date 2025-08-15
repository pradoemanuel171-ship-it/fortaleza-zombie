
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Swords, Gift, Trophy, ShoppingBag } from 'lucide-react'

const tabs = [
  { href: '/', label: 'Base', icon: Home },
  { href: '/raid', label: 'Saqueo', icon: Swords },
  { href: '/events', label: 'Eventos', icon: Gift },
  { href: '/ranking', label: 'Ranking', icon: Trophy },
  { href: '/shop', label: 'Tienda', icon: ShoppingBag },
]

export function BottomNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-md rounded-t-2xl bg-surface/90 backdrop-blur border-t border-white/5 shadow-soft">
        <ul className="grid grid-cols-5">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = path === href
            return (
              <li key={href} className="relative">
                <Link href={href} className="flex flex-col items-center gap-1 py-3 text-sm transition-soft active:scale-[0.98]">
                  <div className={active ? 'text-brand.obrix' : 'text-muted'}><Icon size={22} /></div>
                  <span className={active ? 'text-brand.obrix' : 'text-muted'}>{label}</span>
                </Link>
                {active && <div className="absolute inset-x-6 -bottom-1 h-1 rounded-full bg-brand.obrix/60" />}
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
