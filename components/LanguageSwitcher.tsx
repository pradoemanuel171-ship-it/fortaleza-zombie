
'use client'
export function LanguageSwitcher() {
  async function set(loc: 'es'|'en') {
    await fetch('/api/locale', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ loc }) })
    window.location.reload()
  }
  return (
    <div className="flex items-center gap-2">
      <button onClick={()=>set('es')} className="rounded-md bg-white/5 px-2 py-1 text-sm">ES</button>
      <button onClick={()=>set('en')} className="rounded-md bg-white/5 px-2 py-1 text-sm">EN</button>
    </div>
  )
}
