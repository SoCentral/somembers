/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'Arial', 'sans-serif'],
        serif: ['Crimson Pro', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
