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
        background: '#FDFBFF',
        primary: '#CAB8FF',
        highlight: '#8D79E6',
        sky: '#B3D4FF',
        pink: '#FFCCE0',
        text: '#5A4B41',
      },
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
        score: ['S-CoreDream', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config 