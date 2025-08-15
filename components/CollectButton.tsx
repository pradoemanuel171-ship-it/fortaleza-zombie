
'use client'
function getCsrf(){ return (document.cookie.split('; ').find(c=>c.startsWith('fx_csrf='))||'').split('=')[1] || '' }
export default function CollectButton(){
  async function onClick(){
    await fetch('/api/collect', { method:'POST', headers: { 'x-csrf': getCsrf() } })
    window.location.reload()
  }
  return <button onClick={onClick} className="w-full rounded-xl bg-brand.obrix/15 text-brand.obrix py-3 font-semibold hover:bg-brand.obrix/25 active:scale-[0.99]">Recolectar</button>
}
