/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans', 'system-ui', 'sans-serif'],
        serif: ['Noto Serif Display', 'Georgia', 'serif']
      },
      colors: {
        paper: '#f1ebe0',
        'paper-2': '#e9e1d3',
        ink: '#1d1b16',
        'ink-2': '#3a362c',
        muted: '#7a7264',
        ochre: '#8a4a18',
        madder: '#9a2f1c',
        moss: '#39472e'
      }
    }
  },
  plugins: []
};
