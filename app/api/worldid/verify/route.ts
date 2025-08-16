import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request){
  // In production: call World ID verify API here.
  // For this demo, we only check that payload contains a nullifier or proof.
  const body = await req.json().catch(()=>null) as any;
  if(!body || (!body.nullifier_hash && !body.proof)){
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const secret = process.env.WORLD_ID_APP_SECRET || 'dev-secret-change-me';
  const now = Date.now();
  const value = `1.${now}`; // wid_verified=1 with timestamp
  const sig = crypto.createHmac('sha256', secret).update(value).digest('hex');

  const res = NextResponse.json({ ok: true });
  res.cookies.set('wid_verified', value, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 7*24*3600 });
  res.cookies.set('wid_sig', sig,        { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 7*24*3600 });
  return res;
}
