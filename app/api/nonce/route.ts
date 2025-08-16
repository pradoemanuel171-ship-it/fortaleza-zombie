export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
export async function GET(){ return NextResponse.json({ nonce: Math.random().toString(36).slice(2) }) }
