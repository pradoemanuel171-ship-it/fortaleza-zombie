
import { cookies } from 'next/headers'
import { seal, unseal } from '@/lib/crypto'
import { defaultState, accrueProduction, now, startOfLocalDay, resetDailyIfNeeded, State } from '@/lib/game'

const COOKIE_NAME = 'fx_state'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function secret(): string {
  const s = process.env.APP_SECRET || 'dev-secret-change-me'
  return s
}

export function readState(): State {
  const jar = cookies()
  const raw = jar.get(COOKIE_NAME)?.value
  const s = unseal<State>(raw, secret(), defaultState())
  // accrue production & reset daily cap if new day
  resetDailyIfNeeded(s)
  accrueProduction(s, now())
  return s
}

export function writeState(s: State) {
  const jar = cookies()
  const value = seal<State>(s, secret())
  jar.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: MAX_AGE
  })
}
