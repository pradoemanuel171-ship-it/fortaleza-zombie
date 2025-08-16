'use client';

import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';
import { useState } from 'react';

export default function WorldIdGate(){
  const [busy, setBusy] = useState(false);
  const appId = process.env.NEXT_PUBLIC_WORLD_ID_APP_ID as string;
  const action = process.env.NEXT_PUBLIC_WORLD_ID_ACTION || 'login-fortaleza';

  async function onSuccess(payload: any){
    // Send to server to set httpOnly cookie
    setBusy(true);
    try{
      const r = await fetch('/api/worldid/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if(r.ok){
        location.reload();
      }else{
        const j = await r.json().catch(()=>({}));
        alert(j?.error || 'No se pudo verificar.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card anim" style={{textAlign:'center'}}>
      <h3>Autentícate con World ID</h3>
      <p className="hint">Requerido para jugar.</p>
      <div style={{display:'flex',justifyContent:'center',marginTop:8}}>
        <IDKitWidget
          app_id={appId}
          action={action}
          onSuccess={onSuccess}
          verification_level={VerificationLevel.Device}
        >
          {({ open }) => (
            <button className="btn" onClick={open} disabled={busy}>
              {busy ? 'Verificando…' : 'Verificar con World ID'}
            </button>
          )}
        </IDKitWidget>
      </div>
    </div>
  );
}
