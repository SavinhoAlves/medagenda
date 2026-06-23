/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './composables/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
