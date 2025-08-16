import WorldIdGate from '@/components/WorldIdGate';
import Link from 'next/link';
import { cookies, headers } from 'next/headers';

function isWorldApp(ua: string | null){
  if(!ua) return false;
  const u = ua.toLowerCase();
  // Heurística: World App user-agent suele incluir "worldapp" o "worldcoin"
  return u.includes('worldapp') || u.includes('world coin') || u.includes('worldcoin');
}

function verified(){
  const c = cookies();
  const v = c.get('wid_verified')?.value || '';
  const sig = c.get('wid_sig')?.value || '';
  if(!v || !sig) return false;
  // No recalculamos HMAC en el server demo para ahorrar lectura del secret en server component.
  // En producción validarías la firma aquí o usarías middleware.
  return v.startsWith('1.');
}

export default function Page(){
  const ua = headers().get('user-agent');
  const inside = isWorldApp(ua);
  const ok = verified();

  if(!inside){
    return (
      <div className="card anim">
        <h3>Abre en World App</h3>
        <p className="hint">Para jugar, abre esta miniapp desde World App (no desde un navegador común).</p>
      </div>
    );
  }

  if(!ok){
    return <WorldIdGate/>;
  }

  return (
    <div className="grid anim">
      <div className="card">
        <h2>🏚️ Tu Base</h2>
        <p className="hint">Demo sin base de datos: una vez verificado, ya puedes probar el mini–juego de asalto.</p>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <Link href="/raid" className="btn">⚔️ Ir a Asalto</Link>
          <button className="btn secondary" onClick={()=>alert('Próximo: construir base con animaciones y economía.')}>
            Construir Base
          </button>
        </div>
      </div>
    </div>
  );
}
