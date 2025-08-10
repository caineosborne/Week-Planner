// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  base: '/Week-Planner/',   // <-- match exact repo name + case
  plugins: [react(), tailwind()],
})