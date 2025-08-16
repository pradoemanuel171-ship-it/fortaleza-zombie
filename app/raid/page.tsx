'use client';
import { useState } from 'react';
import CirclePerfect from '@/components/CirclePerfect';

export default function RaidPage(){
  const [result, setResult] = useState<string|null>(null);

  return (
    <div className="grid anim">
      <div className="card">
        <h2>⚔️ Asalto</h2>
        <p className="hint">Detén el marcador dentro del arco verde.</p>
        <CirclePerfect onDone={(ok)=> setResult(ok ? '✅ ¡Éxito!' : '❌ Fallo')} />
        {result && <p className={result.includes('✅')?'success':'err'} style={{marginTop:8}}>{result}</p>}
      </div>
    </div>
  );
}
