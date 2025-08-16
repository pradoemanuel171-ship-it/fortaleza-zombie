import { NextResponse } from 'next/server'
import { setSession } from '@/lib/session'
import { verifyCloudProof } from '@worldcoin/idkit-core/server'

export async function POST(req: Request){
  try{
    const body = await req.json()
    const { app_id, action, proof, signal } = body || {}
    const res = await verifyCloudProof(body, {
      app_id: process.env.WORLD_ID_APP_ID!,
      action: process.env.WORLD_ID_ACTION!,
      verify_via: 'cloud',
    })
    if (res.success !== true) {
      return NextResponse.json({ ok:false, error:'verify_failed', detail:res }, { status:400 })
    }
    // Use nullifier hash as unique id for the user
    const uid = res.nullifier_hash
    await setSession({ uid, wid: uid })
    return NextResponse.json({ ok:true })
  }catch(e){
    return NextResponse.json({ ok:false, error:'bad_request' }, { status:400 })
  }
}
