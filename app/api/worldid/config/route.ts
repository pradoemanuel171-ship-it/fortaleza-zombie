import { NextResponse } from 'next/server'

export async function GET(){
  return NextResponse.json({
    appId: process.env.WORLD_ID_APP_ID || null,
    action: process.env.WORLD_ID_ACTION || null
  })
}
