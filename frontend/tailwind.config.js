/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        accent: {
          pink: 'var(--accent-pink)',
          purple: 'rgb(var(--accent-rgb))',
        },
      },
    },
  },
  plugins: [],
}
