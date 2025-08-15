
import es from '@/messages/es.json'
import en from '@/messages/en.json'
export type Locale = 'es'|'en'
const dict = { es, en } as const
export function tClient(loc: Locale, key: string, vars?: Record<string,string|number>){
  const base = (dict[loc] as any)[key] || key
  if (!vars) return base
  return Object.keys(vars).reduce((acc,k)=>acc.replace(new RegExp(`{${k}}`,'g'), String(vars[k])), base)
}
