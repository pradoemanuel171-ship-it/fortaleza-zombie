
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
const SID='fx_sid'
function secret(){ return process.env.APP_SECRET || 'dev' }
export function createSession(addr: string){ const p={addr,exp:Math.floor(Date.now()/1000)+60*60*24*7}; const tok=jwt.sign(p, secret()); cookies().set(SID, tok, { httpOnly:true, sameSite:'lax', secure:true, path:'/' }); return p }
export function hasSession(){ try{ const v=cookies().get(SID)?.value; if(!v) return false; const d=jwt.verify(v, secret()) as any; return d.exp*1000>Date.now() }catch{return false} }
export function requireSession(){ if(!hasSession()) throw new Error('Not authenticated') }
