import { createClient } from '@supabase/supabase-js'

export function supabaseAdmin(){
  const url = process.env.SUPABASE_URL as string
  const key = process.env.SUPABASE_SERVICE_ROLE as string
  if (!url || !key) throw new Error('Missing Supabase env')
  return createClient(url, key, { auth: { persistSession: false } })
}
