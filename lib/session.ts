import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const COOKIE_NAME = 'sess'
const SECRET = process.env.APP_SECRET || 'dev-secret-change-me'

export type AppSession = { uid: string; address: string }

function sign(dataB64: string) {
  return crypto.createHmac('sha256', SECRET).update(dataB64).digest('base64url')
}

export function getSession(): AppSession | null {
  const raw = cookies().get(COOKIE_NAME)?.value
  if (!raw) return null
  const [data, sig] = raw.split('.')
  if (!data || !sig) return null
  const expected = sign(data)
  if (sig !== expected) return null
  try {
    const json = Buffer.from(data, 'base64url').toString('utf8')
    return JSON.parse(json) as AppSession
  } catch {
    return null
  }
}

export function requireSession(): AppSession {
  const s = getSession()
  if (!s) throw new Error('unauthenticated')
  return s
}

export function setSession(res: NextResponse, sess: AppSession) {
  const data = Buffer.from(JSON.stringify(sess)).toString('base64url')
  const sig = sign(data)
  res.cookies.set(COOKIE_NAME, `${data}.${sig}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  })
}
