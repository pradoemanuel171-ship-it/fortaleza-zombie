'use client'
import { useEffect, useState } from 'react'

const dicts: Record<string, Record<string,string>> = {
  es: {
    welcome: 'Bienvenido a Fortaleza',
    create_base: 'Crear base (1 WLD)',
    buy_base_hint: 'Necesitas comprar la base para empezar a generar Orbix.',
    collect: 'Recolectar',
    attack: 'Atacar',
  },
  en: {
    welcome: 'Welcome to Fortaleza',
    create_base: 'Create base (1 WLD)',
    buy_base_hint: 'You must buy a base to start generating Orbix.',
    collect: 'Collect',
    attack: 'Raid',
  }
}

export function useI18n(){
  const [loc, setLoc] = useState<'en'|'es'>('es')
  useEffect(()=>{
    const l = navigator.language?.startsWith('es') ? 'es' : 'en'
    setLoc(l as any)
  },[])
  const t = (k:string)=> dicts[loc]?.[k] ?? k
  return { t, loc }
}
