import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cornell: {
          red: '#B31B1B',
          'dark-gray': '#222222',
          'light-gray': '#F7F7F7',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      fontSize: {
        base: ['18px', { lineHeight: '1.65' }],
      },
      maxWidth: {
        'reading': '65ch', // ~60-75 characters for optimal reading
      },
    },
  },
  plugins: [],
}
export default config
