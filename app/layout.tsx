export const metadata = {
  title: 'Fortaleza',
  description: 'Mini App - World ID gated',
}

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="es">
      <body style={{minHeight:'100dvh', background:'#0a0a0a', color:'#eaeaea', fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'}}>
        <div style={{maxWidth: 520, margin: '0 auto', minHeight:'100dvh', display:'flex', flexDirection:'column'}}>
          <header style={{padding:'16px 12px', borderBottom:'1px solid #222'}}>
            <strong>🧟 Fortaleza</strong>
          </header>
          <main style={{flex:1, padding:'12px'}}>{children}</main>
          <nav style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, padding:12, borderTop:'1px solid #222'}}>
            <a href="/" style={{textDecoration:'none', color:'#eaeaea', textAlign:'center'}}>🏠 Home</a>
            <a href="/raid" style={{textDecoration:'none', color:'#eaeaea', textAlign:'center'}}>⚔️ Asalto</a>
            <a href="/gate" style={{textDecoration:'none', color:'#eaeaea', textAlign:'center'}}>🔒 Gate</a>
          </nav>
        </div>
      </body>
    </html>
  )
}
