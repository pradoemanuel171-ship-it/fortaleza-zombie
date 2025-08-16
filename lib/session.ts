import { cookies, headers } from 'next/headers'
import crypto from 'node:crypto'

export type AppSession = {
  uid: string
  wallet?: string
  worldId?: string
}

const COOKIE = 'sid'
const SECRET = process.env.APP_SECRET || 'dev-secret-change-me'

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
}
function sign(data: string) {
  return b64url(crypto.createHmac('sha256', SECRET).update(data).digest())
}
function encode(payload: AppSession) {
  const p = b64url(JSON.stringify(payload))
  const s = sign(p)
  return `${p}.${s}`
}
function decode(token: string): AppSession | null {
  const [p, s] = token.split('.')
  if (!p || !s) return null
  const ok = crypto.timingSafeEqual(Buffer.from(s), Buffer.from(sign(p)))
  if (!ok) return null
  try { return JSON.parse(Buffer.from(p, 'base64').toString()) as AppSession } catch { return null }
}

export function getSession(): AppSession | null {
  const c = cookies().get(COOKIE)?.value
  if (!c) return null
  return decode(c)
}
export function requireSession(): AppSession {
  const s = getSession()
  if (!s) throw new Error('unauthorized')
  return s
}
export function setSession(s: AppSession) {
  const value = encode(s)
  cookies().set(COOKIE, value, { httpOnly:true, sameSite:'lax', secure:true, path:'/', maxAge: 60*60*24*7 })
}
export function clearSession() {
  cookies().set(COOKIE, '', { httpOnly:true, sameSite:'lax', secure:true, path:'/', maxAge: 0 })
}
export function isWorldApp(): boolean {
  const ua = headers().get('user-agent') || ''
  return /WorldApp/i.test(ua)
}
