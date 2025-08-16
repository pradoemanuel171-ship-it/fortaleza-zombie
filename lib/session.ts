import { cookies } from 'next/headers'
import * as jose from 'jose'

const COOKIE = 'fx_sess'
const MAX_AGE = 60*60*24*7 // 7d

export type AppSession = { uid: string, wid?: string }

export async function getSession(): Promise<AppSession|null>{
  const c = (await cookies()).get(COOKIE)?.value
  if (!c) return null
  try{
    const secret = new TextEncoder().encode(process.env.APP_SECRET!)
    const { payload } = await jose.jwtVerify(c, secret)
    return payload as unknown as AppSession
  }catch{ return null }
}

export async function setSession(s: AppSession){
  const secret = new TextEncoder().encode(process.env.APP_SECRET!)
  const token = await new jose.SignJWT(s as any).setProtectedHeader({alg:'HS256'}).setExpirationTime(`${MAX_AGE}s`).sign(secret)
  ;(await cookies()).set(COOKIE, token, { httpOnly:true, sameSite:'lax', secure:true, path:'/', maxAge: MAX_AGE })
}

export async function requireSession(): Promise<AppSession>{
  const s = await getSession()
  if (!s) throw new Error('no_session')
  return s
}
