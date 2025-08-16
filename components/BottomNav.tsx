'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav(){
  const p = usePathname();
  const Item = ({href,label,emoji}:{href:string,label:string,emoji:string}) => (
    <Link href={href} className="bottom-pad" style={{display:'inline-flex',gap:8,alignItems:'center',fontWeight:700,opacity:p===href?1:.6}}>
      <span style={{fontSize:18}}>{emoji}</span><span>{label}</span>
    </Link>
  );
  return (
    <nav style={{display:'flex',justifyContent:'space-around'}}>
      <Item href="/" label="Base" emoji="🏚️"/>
      <Item href="/raid" label="Asalto" emoji="⚔️"/>
    </nav>
  );
}
