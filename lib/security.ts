
import { cookies, headers } from 'next/headers'
import jwt from 'jsonwebtoken'

const CSRF_COOKIE = 'fx_csrf'
const SID_COOKIE = 'fx_sid'

function secret() { return process.env.APP_SECRET || 'dev-secret-change-me' }

export function createSession(addr: string, username?: string, ttlSec=60*60*24*7) {
  const payload = { addr, username, exp: Math.floor(Date.now()/1000) + ttlSec }
  const token = jwt.sign(payload, secret())
  cookies().set(SID_COOKIE, token, { httpOnly: true, sameSite:'lax', secure: true, path: '/', maxAge: ttlSec })
  return payload
}

export function getSession() {
  try {
    const tok = cookies().get(SID_COOKIE)?.value
    if (!tok) return null
    const data = jwt.verify(tok, secret()) as any
    if (data.exp * 1000 < Date.now()) return null
    return data
  } catch { return null }
}

export function requireSession() {
  const s = getSession()
  if (!s) throw new Error('Not authenticated')
  return s
}

export function requireCsrf() {
  const jar = cookies()
  const token = jar.get(CSRF_COOKIE)?.value
  const hdr = headers()
  const passed = hdr.get('x-csrf') || hdr.get('X-CSRF')
  if (!token || !passed || token !== passed) {
    throw new Error('CSRF invalid')
  }
}
