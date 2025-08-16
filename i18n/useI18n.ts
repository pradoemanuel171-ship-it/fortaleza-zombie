'use client';

const M = {
  es: {
    openInWorld: 'Abre esta miniapp dentro de World App para jugar.',
    verifyTitle: 'Autentícate con World ID',
    verifyBtn: 'Verificar con World ID',
    verified: '¡Autenticado!',
    goRaid: 'Ir a Asalto',
    buildBase: 'Construir Base',
    youAreIn: 'Estás dentro. ¡A jugar!',
  },
  en: {
    openInWorld: 'Open this miniapp inside World App to play.',
    verifyTitle: 'Sign in with World ID',
    verifyBtn: 'Verify with World ID',
    verified: 'Authenticated!',
    goRaid: 'Go to Raid',
    buildBase: 'Build Base',
    youAreIn: 'You are in. Let’s play!',
  }
} as const;

export function useI18n(){
  const lang = (typeof navigator !== 'undefined' && navigator.language?.startsWith('es')) ? 'es' : 'en';
  return M[lang as 'es'|'en'];
}
