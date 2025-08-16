'use client'
import { useEffect, useMemo, useState } from 'react'

type Dict = Record<string,string>
const EN: Dict = {
  home: 'Home',
  raid: 'Raid',
  collect: 'Collect',
  createBase: 'Create base',
  baseCreated: 'Base created',
  authenticate: 'Authenticate',
  openInWorldApp: 'Open in World App to play.',
  authenticated: 'Authenticated.',
  yourObrix: 'Your Obrix',
  perDayCap: 'Daily cap',
  buyBase: 'Buy base',
  youNeedBase: 'You need to create your base first.',
  findTarget: 'Find target',
  skip: 'Skip',
  attack: 'Attack',
  victory: 'Victory!',
  defeat: 'Defeat',
  loot: 'Loot',
  cost: 'Cost'
}
const ES: Dict = {
  home: 'Inicio',
  raid: 'Saqueo',
  collect: 'Recolectar',
  createBase: 'Crear base',
  baseCreated: 'Base creada',
  authenticate: 'Autenticar',
  openInWorldApp: 'Ábrelo en World App para jugar.',
  authenticated: 'Autenticado.',
  yourObrix: 'Tus Obrix',
  perDayCap: 'Tope diario',
  buyBase: 'Comprar base',
  youNeedBase: 'Primero debes crear tu base.',
  findTarget: 'Buscar objetivo',
  skip: 'Saltar',
  attack: 'Atacar',
  victory: '¡Victoria!',
  defeat: 'Derrota',
  loot: 'Botín',
  cost: 'Costo'
}
export type Locale = 'en' | 'es'
export function useI18n(initial?: Locale){
  const [locale, setLocale] = useState<Locale>(initial ?? 'es')
  useEffect(() => {
    if (initial) return
    try{
      const nav = (navigator?.language || '').toLowerCase()
      setLocale(nav.startsWith('es') ? 'es' : 'en')
    }catch{}
  }, [initial])
  const dict = useMemo(() => locale==='es' ? ES : EN, [locale])
  const t = (k: string) => dict[k] ?? k
  return { t, locale, setLocale }
}
export default useI18n
