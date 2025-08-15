
import { cookies, headers } from 'next/headers'
import es from '@/messages/es.json'
import en from '@/messages/en.json'

export type Locale = 'es'|'en'
const LOCALE_COOKIE = 'fx_locale'

export function detectLocale(): Locale {
  const jar = cookies()
  const saved = jar.get(LOCALE_COOKIE)?.value as Locale | undefined
  if (saved) return saved
  const accept = headers().get('accept-language') || ''
  const first = accept.split(',')[0]?.toLowerCase() || ''
  if (first.startsWith('es')) return 'es'
  return 'en'
}

export function setLocale(loc: Locale) {
  cookies().set(LOCALE_COOKIE, loc, { httpOnly: false, sameSite: 'lax', secure: true, path: '/', maxAge: 60*60*24*365 })
}

const dict = { es, en }
export function t(loc: Locale, key: string, vars?: Record<string,string|number>) {
  const msg = (dict[loc] as any)[key] || key
  if (!vars) return msg
  return Object.keys(vars).reduce((acc, k) => acc.replace(new RegExp(`{${k}}`, 'g'), String(vars[k])), msg)
}
