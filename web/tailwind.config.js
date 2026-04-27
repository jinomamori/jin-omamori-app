/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: '#8B0000',
          50: '#FFF5F5',
          100: '#FFE0E0',
          200: '#FFC0C0',
          300: '#FF8080',
          400: '#FF4040',
          500: '#CC0000',
          600: '#8B0000',
          700: '#6B0000',
          800: '#4B0000',
          900: '#2B0000',
        },
        gold: {
          DEFAULT: '#DAA520',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#DAA520',
          600: '#B8860B',
          700: '#92680A',
          800: '#6B4A07',
          900: '#452C04',
        },
        washi: '#FAF6F0',
        ink: '#1A0A0A',
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
        serif: ['Noto Serif JP', 'serif'],
      },
      backgroundImage: {
        'wa-pattern': "url('/images/wa-pattern.svg')",
      },
    },
  },
  plugins: [],
};
