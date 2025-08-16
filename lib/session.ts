import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export type AppSession = { uid: string; wallet?: string; iat: number; exp: number }

const COOKIE = 'fort_session'
const secret = process.env.APP_SECRET || 'dev-secret'

function sign(payload: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url')
}
function serialize(s: AppSession) {
  const body = JSON.stringify(s)
  const sig = sign(body)
  return Buffer.from(`${sig}.${body}`).toString('base64url')
}
function deserialize(raw: string): AppSession | null {
  try {
    const data = Buffer.from(raw, 'base64url').toString('utf8')
    const [sig, body] = data.split('.', 2)
    if (!sig || !body) return null
    if (sign(body) !== sig) return null
    const obj = JSON.parse(body) as AppSession
    if (obj.exp && Date.now() > obj.exp) return null
    return obj
  } catch { return null }
}

export function getSession(): AppSession | null {
  const raw = cookies().get(COOKIE)?.value
  if (!raw) return null
  return deserialize(raw)
}

export function requireSession(): AppSession {
  const s = getSession()
  if (!s) throw new Error('unauthorized')
  return s
}

export function setSession(resp: NextResponse, s: AppSession) {
  const value = serialize(s)
  resp.cookies.set({
    name: COOKIE,
    value,
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: Math.max(1, Math.floor((s.exp - Date.now()) / 1000)),
  })
}

export function clearSession(resp: NextResponse) {
  resp.cookies.delete(COOKIE)
}
