
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { readState, writeState } from '@/lib/state'
import { requireSession } from '@/lib/session'
export async function POST(){ requireSession(); const s=readState(); writeState(s); return NextResponse.json({ ok:true, obrix: s.obrix }) }
