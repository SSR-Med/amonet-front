import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'violet-lab': '#7C4DCC',
        'lavanda-soft': '#F5F0FA',
        'lila-50': '#EDE9FB',
        'lila-100': '#CECBF6',
        'lila-400': '#7F77DD',
        'lila-800': '#3C3489',
        'lila-900': '#26215C',
        'rosa-polvo': '#D4A0C0',
        'verde-exito': '#1D9E75',
        'coral-alerta': '#D85A30',
        'advertencia': '#BA7517',
        'gris-tecnico': '#888780',
        'border-tabla': '#D3D1C7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '8': '8px',
        '12': '12px',
      },
      spacing: {
        '15': '3.75rem',
        '17': '4.25rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
