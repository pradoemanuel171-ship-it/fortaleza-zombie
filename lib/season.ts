import { cookies } from 'next/headers'

export type Session = {
  userId: string
  wallet?: string
  world?: string
}

function decode(base64: string) {
  try {
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

export function getSession(): Session | null {
  try {
    const raw = cookies().get('sess')?.value
    if (!raw) return null
    const obj = decode(raw)
    if (obj && typeof obj.userId === 'string') return obj as Session
    return null
  } catch {
    return null
  }
}

export async function requireSession() {
  const s = getSession()
  if (!s) {
    throw new Error('UNAUTH')
  }
  return s
}
