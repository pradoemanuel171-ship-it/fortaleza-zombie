
import { headers, cookies } from 'next/headers'
import es from '@/messages/es.json'
import en from '@/messages/en.json'
export type Locale = 'es'|'en'

export function detectLocale(): Locale {
  const jar = cookies()
  const saved = jar.get('fx_locale')?.value as Locale | undefined
  if (saved === 'es' || saved === 'en') return saved
  const h = headers()
  const acc = (h.get('accept-language')||'').toLowerCase()
  if (acc.startsWith('es')) return 'es'
  return 'en'
}
export function setLocale(loc: Locale){
  cookies().set('fx_locale', loc, { httpOnly: false, sameSite:'lax', secure: true, path:'/', maxAge: 60*60*24*365 })
}
const dict = { es, en } as const
export function t(loc: Locale, key: string, vars?: Record<string,string|number>){
  const base = (dict[loc] as any)[key] || key
  if (!vars) return base
  return Object.keys(vars).reduce((acc,k)=>acc.replace(new RegExp(`{${k}}`,'g'), String(vars[k])), base)
}
