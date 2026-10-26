import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: '#0b0e13',
          base: '#0f1218',
          elevated: '#161a22',
        },
        accent: {
          DEFAULT: '#a3acd9',
          glow: 'rgba(163,172,217,0.35)',
          dim: 'rgba(163,172,217,0.12)',
        },
        text: {
          primary: '#f2f2f2',
          secondary: '#d6d9e0',
          body: '#8a92a6',
          subtle: '#6b7285',
          muted: '#4a5061',
        },
        hairline: 'rgba(255,255,255,0.06)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        // Legacy aliases: older pages still use font-serif / font-mono.
        serif: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
