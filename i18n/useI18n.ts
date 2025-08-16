'use client'
import { useEffect, useMemo, useState } from 'react'
import es from './es.json'
import en from './en.json'
type Dict = typeof es
const dicts: Record<string, Dict> = { es, en }
const pick = (lang: string) => lang?.toLowerCase().startsWith('es') ? 'es' : 'en'
export function useI18n(){
  const [lang, setLang] = useState<string>('es')
  useEffect(()=>{
    const saved = localStorage.getItem('fx_lang')
    if (saved) setLang(saved)
    else setLang(pick(navigator.language || 'en'))
  },[])
  const t = useMemo(()=> dicts[lang] ?? dicts['es'], [lang])
  function set(l: string){ localStorage.setItem('fx_lang', l); setLang(l) }
  return { t, lang, setLang: set }
}
