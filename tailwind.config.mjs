/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      maxWidth: {
        'body': '700px',
        'page': '900px',
      },
      colors: {
        gray: {
          300: '#b0b0b0',
          400: '#8a8a8a',
          500: '#a0a0a0',
          600: '#6a6a6a',
          800: '#2a2a2a',
        },
      },
    },
  },
  plugins: [],
};
