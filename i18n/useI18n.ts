'use client'
import { useEffect, useMemo, useState } from 'react'

const M = {
  es: {
    home: 'Base',
    raid: 'Saqueo',
    revenge: 'Venganza',
    store: 'Tienda',
    createBase: 'Crear base',
    buyBaseHint: 'Compra tu base para empezar a generar Obrix.',
    collect: 'Recolectar',
    generating: 'Generando...',
    obrix: 'Obrix',
    pool: 'Listo para recolectar'
  },
  en: {
    home: 'Base',
    raid: 'Raid',
    revenge: 'Revenge',
    store: 'Store',
    createBase: 'Create base',
    buyBaseHint: 'Buy your base to start generating Obrix.',
    collect: 'Collect',
    generating: 'Generating...',
    obrix: 'Obrix',
    pool: 'Ready to collect'
  }
} as const

export function useI18n() {
  const [loc, setLoc] = useState<'es'|'en'>('es')
  useEffect(() => {
    const n = typeof navigator !== 'undefined' ? navigator.language : 'es'
    setLoc(n.toLowerCase().startsWith('es') ? 'es' : 'en')
  }, [])
  const t = useMemo(() => M[loc], [loc])
  return { t, loc, setLoc }
}
