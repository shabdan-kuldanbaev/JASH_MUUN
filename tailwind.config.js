/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        serif: ['Figtree', 'system-ui', 'sans-serif']
      },
      colors: {
        paper: '#FAFAF7',
        'paper-2': '#F0EEEA',
        ink: '#1A1A1A',
        'ink-2': '#444444',
        muted: '#888888',
        shyrdak: '#C84B31',
        indigo: '#3A5BA0',
        steppe: '#C49A2A',
        valley: '#2A7A6A',
        clay: '#A0522D'
      }
    }
  },
  plugins: []
};
