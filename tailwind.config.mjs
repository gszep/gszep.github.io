/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'Noto Sans JP', 'sans-serif'],
      },
      maxWidth: {
        'body': '700px',
        'page': '900px',
      },
      colors: {
        gray: {
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#b0b0b0',
          400: '#8a8a8a',
          500: '#a0a0a0',
          600: '#6a6a6a',
          700: '#404040',
          800: '#2a2a2a',
          900: '#171717',
        },
      },
    },
  },
  plugins: [],
};
