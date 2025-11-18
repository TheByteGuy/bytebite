import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use relative asset paths so GitHub Pages (served from a subpath) can find the compiled CSS/JS.
  base: './',
})
