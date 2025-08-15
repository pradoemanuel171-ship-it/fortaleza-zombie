export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { setLocale, Locale } from '@/lib/i18n'
export async function POST(req: Request){ const body = await req.json().catch(()=>null) as any; const loc = body?.loc as Locale|undefined; if (loc!=='es' && loc!=='en') return NextResponse.json({error:'bad locale'},{status:400}); setLocale(loc); return NextResponse.json({ok:true}) }
