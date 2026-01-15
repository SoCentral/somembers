/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'Arial', 'sans-serif'],
        serif: ['Crimson Pro', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        // Site background color (beige/cream)
        background: 'rgb(225, 225, 219)',
        // Primary action color
        primary: {
          DEFAULT: '#1d4ed8', // blue-700 equivalent
          hover: '#1e40af', // blue-800 equivalent
        },
      },
      backgroundColor: {
        site: 'rgb(225, 225, 219)',
      },
    },
  },
  plugins: [],
};
