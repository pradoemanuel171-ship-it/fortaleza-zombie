
'use client'
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (<html><body style={{padding:16,fontFamily:'system-ui'}}><h2>Hubo un problema</h2><p style={{opacity:.7}}>{error.message}</p><button onClick={()=>reset()} style={{padding:'8px 12px',marginTop:12,background:'#10A37F',borderRadius:8,color:'#fff'}}>Reintentar</button></body></html>)
}
