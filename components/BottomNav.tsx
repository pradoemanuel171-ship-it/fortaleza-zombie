'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Item = ({ href, label, icon }: { href: string, label: string, icon: string }) => {
  const p = usePathname()
  const active = p === href
  return (
    <Link href={href} className={`flex-1 flex flex-col items-center justify-center py-2 ${active ? 'text-emerald-400' : 'text-neutral-400'}`}>
      <span className="text-xl">{icon}</span>
      <span className="text-xs mt-0.5">{label}</span>
    </Link>
  )
}

export default function BottomNav(){
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-neutral-800 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto max-w-md grid grid-cols-3">
        <Item href="/" label="Home" icon="🏠" />
        <Item href="/raid" label="Raid" icon="⚔️" />
        <Item href="/gate" label="Gate" icon="🔒" />
      </div>
    </nav>
  )
}
