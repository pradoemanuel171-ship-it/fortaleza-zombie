// lib/session.ts
import { cookies } from 'next/headers'

/** Usamos un nombre único para evitar colisiones con tipos globales `Session` */
export type AppSession = {
  userId: string
  wallet?: string
  world?: string
}

function encode(sess: AppSession): string {
  return Buffer.from(JSON.stringify(sess)).toString('base64')
}

function decode(base64: string): AppSession | null {
  try {
    const obj = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))
    if (obj && typeof obj.userId === 'string') {
      return {
        userId: obj.userId,
        wallet: typeof obj.wallet === 'string' ? obj.wallet : undefined,
        world: typeof obj.world === 'string' ? obj.world : undefined,
      }
    }
    return null
  } catch {
    return null
  }
}

export function getSession(): AppSession | null {
  try {
    const raw = cookies().get('sess')?.value
    if (!raw) return null
    return decode(raw)
  } catch {
    return null
  }
}

export async function requireSession(): Promise<AppSession> {
  const s = getSession()
  if (!s) throw new Error('UNAUTH')
  return s
}

/** Setea la cookie de sesión httpOnly (se usa en /api/siwe) */
export function setSession(sess: AppSession) {
  const val = encode(sess)
  cookies().set('sess', val, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 días
  })
}
