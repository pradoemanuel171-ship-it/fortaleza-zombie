'use client'

import { useEffect, useMemo, useState } from 'react'

export type Locale = 'es' | 'en'

const MESSAGES: Record<Locale, Record<string, string>> = {
  es: {
    'nav.home': 'Inicio',
    'nav.raid': 'Saqueo',
    'nav.revenge': 'Venganza',
    'nav.store': 'Tienda',
    'nav.base': 'Base',
    'action.collect': 'Recolectar',
    'action.buyBase': 'Comprar Base',
    'gate.blocked.title': 'Abrir en World App',
    'gate.blocked.body': 'Esta miniapp solo funciona dentro de World App.',
    'raid.tap': 'Tocar ahora',
    'raid.last': 'Última chance',
  },
  en: {
    'nav.home': 'Home',
    'nav.raid': 'Raid',
    'nav.revenge': 'Revenge',
    'nav.store': 'Store',
    'nav.base': 'Base',
    'action.collect': 'Collect',
    'action.buyBase': 'Buy Base',
    'gate.blocked.title': 'Open in World App',
    'gate.blocked.body': 'This miniapp only works inside World App.',
    'raid.tap': 'Tap now',
    'raid.last': 'Last chance',
  },
}

function detect(): Locale {
  if (typeof navigator !== 'undefined') {
    const n = navigator.language.toLowerCase()
    if (n.startsWith('es')) return 'es'
  }
  return 'en'
}

export function useI18n() {
  const [loc, setLoc] = useState<Locale>(() => detect())

  useEffect(() => {
    try {
      const v = localStorage.getItem('loc') as Locale | null
      if (v === 'es' || v === 'en') setLoc(v)
    } catch {}
  }, [])

  const t = useMemo(
    () => (key: string) => (MESSAGES[loc]?.[key] ?? key),
    [loc]
  )

  const setLocale = (l: Locale) => {
    setLoc(l)
    try {
      localStorage.setItem('loc', l)
    } catch {}
  }

  return { t, loc, setLocale }
}
