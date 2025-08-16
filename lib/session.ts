import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
const SID = 'fx_sid'
function secret(){ return process.env.APP_SECRET || 'dev' }
export type Session = { uid: string, addr: string, exp: number }
export function setSession(uid: string, addr: string){
  const exp = Math.floor(Date.now()/1000) + 60*60*24*7
  const token = jwt.sign({ uid, addr, exp } as Session, secret())
  cookies().set(SID, token, { httpOnly:true, sameSite:'lax', secure:true, path:'/' })
}
export function getSession(): Session | null {
  try{
    const v = cookies().get(SID)?.value
    if (!v) return null
    const d = jwt.verify(v, secret()) as Session
    if ((d.exp*1000) < Date.now()) return null
    return d
  }catch{ return null }
}
export function requireSession(){
  const s = getSession()
  if (!s) throw new Error('Not authenticated')
  return s
}
