import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '#components': resolve(__dirname, './src/components'),
      '#constants': resolve(__dirname, './src/constants'),
      '#store': resolve(__dirname, './src/store'),
      '#hoc': resolve(__dirname, './src/hoc'),
      '#windows': resolve(__dirname, './src/windows'),
      '#context': resolve(__dirname, './src/context'),
      '#utils': resolve(__dirname, './src/utils'),
    },
  },
})
