
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { readState, writeState } from '@/lib/state'
export async function POST(){ const s=readState(); writeState(s); return NextResponse.json({ ok:true, obrix: s.obrix }) }
