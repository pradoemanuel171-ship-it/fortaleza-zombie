
import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#1B1B1D',
        surface: '#242427',
        text: '#E4E4E7',
        muted: '#A1A1AA',
        brand: { atq: '#F97316', ok: '#22C55E', err: '#EF4444', obrix: '#10A37F' }
      },
      boxShadow: { soft: '0 6px 24px rgba(0,0,0,0.25)' },
      borderRadius: { '2xl': '1rem' }
    }
  },
  plugins: []
} satisfies Config
