'use client'
import { useMemo } from 'react'

const ES = {
  home_title: 'Fortaleza',
  buy_base: 'Comprar base',
  collect: 'Recolectar',
  raid: 'Saqueo',
  store: 'Tienda',
}
const EN = {
  home_title: 'Fortress',
  buy_base: 'Buy base',
  collect: 'Collect',
  raid: 'Raid',
  store: 'Store',
}

export function useI18n() {
  const lang = useMemo(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en'
    }
    return 'en'
  }, [])
  const dict = lang === 'es' ? ES : EN
  function t(key: keyof typeof ES) {
    return (dict as any)[key] ?? String(key)
  }
  return { t, lang }
}
export default useI18n
