'use client'
import { useI18n } from '@/i18n/useI18n'
export default function LangSwitch(){
  const { lang, setLang } = useI18n()
  return (
    <div className="fixed top-2 right-2 z-20">
      <select value={lang} onChange={e=>setLang(e.target.value)} className="bg-surface text-white border border-white/10 rounded px-2 py-1 text-xs">
        <option value="es">ES</option><option value="en">EN</option>
      </select>
    </div>
  )
}
