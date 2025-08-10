// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  // If deploying to https://<user>.github.io/week-planner/
  base: '/week-planner/',
  plugins: [react(), tailwind()],
})
