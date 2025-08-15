
import type { Config } from 'tailwindcss'
export default {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: { extend: {
    colors:{ bg:'#0F1115', surface:'#171923', text:'#E5E7EB', muted:'#9CA3AF', brand:{obrix:'#10A37F', atq:'#F97316', ok:'#22C55E'} },
    boxShadow:{ soft:'0 6px 24px rgba(0,0,0,.25)' },
    borderRadius:{ '2xl':'1rem' }
  } },
  plugins: []
} satisfies Config
