'use client'
export default function GatePage(){
  const ua = typeof navigator!=='undefined'? navigator.userAgent : ''
  const inWorld = /WorldApp|World\b/i.test(ua)
  return (
    <div style={{padding:'24px'}}>
      <h2>Detección World App</h2>
      <p>User-Agent:</p>
      <code style={{fontSize:12, wordBreak:'break-all'}}>{ua}</code>
      <p style={{marginTop:12}}>¿Dentro de World App?: <strong>{inWorld? 'Sí' : 'No'}</strong></p>
    </div>
  )
}
