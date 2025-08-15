
import { cookies } from 'next/headers'
import { seal, unseal } from '@/lib/crypto'
import { defaultState, accrue, State } from '@/lib/game'
const COOKIE='fx_state'; const MAX_AGE = 60*60*24*7
function secret(){ return process.env.APP_SECRET || 'dev' }
export function readState(): State { const raw=cookies().get(COOKIE)?.value; const s = unseal<State>(raw, secret(), defaultState()); accrue(s); return s }
export function writeState(s: State){ const val = seal<State>(s, secret()); cookies().set(COOKIE, val, { httpOnly:true, sameSite:'lax', secure:true, path:'/', maxAge:MAX_AGE }) }
