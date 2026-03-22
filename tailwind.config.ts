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
          deep: '#050505',
          base: '#080808',
          elevated: '#0a0a0a',
        },
        accent: {
          DEFAULT: '#5ba4cf',
          glow: 'rgba(91,164,207,0.4)',
          dim: 'rgba(91,164,207,0.15)',
        },
        text: {
          primary: '#ffffff',
          secondary: '#e0e0e0',
          body: '#888888',
          subtle: '#666666',
          muted: '#444444',
        },
      },
      fontFamily: {
        serif: ['var(--font-dm-serif)', 'serif'],
        mono: ['var(--font-ibm-plex)', 'monospace'],
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
