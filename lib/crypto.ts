
import { createHmac, randomBytes } from 'crypto'

export function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

export function seal<T>(obj: T, secret: string): string {
  const payload = Buffer.from(JSON.stringify(obj), 'utf8').toString('base64url')
  const sig = sign(payload, secret)
  return `${payload}.${sig}`
}

export function unseal<T>(cookieValue: string | undefined, secret: string, fallback: T): T {
  if (!cookieValue) return fallback
  const parts = cookieValue.split('.')
  if (parts.length !== 2) return fallback
  const [payload, sig] = parts
  const good = sign(payload, secret)
  if (good !== sig) return fallback
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return fallback
  }
}

export function randomHex(n=4) {
  return randomBytes(n).toString('hex')
}
