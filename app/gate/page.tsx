'use client'
import { useI18n } from '@/i18n/useI18n'
import { useEffect, useState } from 'react'

export default function Gate(){
  const { t } = useI18n()
  const [ua, setUa] = useState('')
  const [auth, setAuth] = useState<null | string>(null)

  useEffect(() => {
    setUa(navigator.userAgent || '')
  }, [])

  const handleAuth = async () => {
    const r = await fetch('/api/siwe', { method: 'POST' })
    if (r.ok) { setAuth('ok'); window.location.href='/' }
    else setAuth('error')
  }

  const isWorld = /WorldApp/i.test(ua)

  return (
    <div className="space-y-4">
      <h1 className="h1">Fortaleza</h1>
      {!isWorld && (
        <div className="card p-4">
          <p className="mb-2">{t('openInWorldApp')}</p>
          <p className="small break-all">UA: {ua}</p>
        </div>
      )}
      <div className="card p-4">
        <button className="btn" onClick={handleAuth}>{t('authenticate')}</button>
        {auth==='ok' && <p className="small mt-2 text-emerald-400">{t('authenticated')}</p>}
        {auth==='error' && <p className="small mt-2 text-red-400">Auth error</p>}
      </div>
    </div>
  )
}
