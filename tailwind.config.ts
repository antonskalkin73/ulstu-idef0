import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f4f7fb',
        panel: '#ffffff',
        line: '#d7dde7',
      },
      boxShadow: {
        panel: '0 8px 24px rgba(15, 23, 42, 0.08)',
      },
    },
  },
} satisfies Config
