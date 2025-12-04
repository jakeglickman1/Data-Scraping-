import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.GITHUB_ACTIONS ? '/Travel-Advisor-Trip-Memories/' : '/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
})
