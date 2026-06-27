import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // For local dev with Vercel serverless functions, run: vercel dev
    // The /api routes will be handled by Vercel's dev server
    // If using only `npm run dev`, the /api/live-match calls will return 404 locally
    // (this is expected — the live match feature works in production on Vercel)
  },
})
