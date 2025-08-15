
import { createHmac } from 'crypto'
export function seal<T>(obj: T, secret: string): string {
  const payload = Buffer.from(JSON.stringify(obj),'utf8').toString('base64url')
  const sig = createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}.${sig}`
}
export function unseal<T>(cookieValue: string|undefined, secret: string, fallback: T): T {
  if (!cookieValue) return fallback
  const [payload, sig] = cookieValue.split('.')
  const test = createHmac('sha256', secret).update(payload).digest('hex')
  if (sig !== test) return fallback
  try { return JSON.parse(Buffer.from(payload,'base64url').toString('utf8')) } catch { return fallback }
}
