
'use client'
import { useState } from 'react'
export function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  async function set(loc: 'es'|'en') {
    await fetch('/api/locale', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ loc }) })
    window.location.reload()
  }
  return (
    <div className="relative">
      <button onClick={()=>setOpen(!open)} className="rounded-md bg-white/5 px-2 py-1 text-sm">🌐</button>
      {open && (
        <div className="absolute right-0 mt-2 rounded-md bg-surface shadow-soft border border-white/10 overflow-hidden">
          <button onClick={()=>set('es')} className="block px-3 py-2 text-sm hover:bg-white/5 w-full text-left">Español</button>
          <button onClick={()=>set('en')} className="block px-3 py-2 text-sm hover:bg-white/5 w-full text-left">English</button>
        </div>
      )}
    </div>
  )
}
