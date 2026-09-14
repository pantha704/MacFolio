import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { IncomingMessage, ServerResponse } from 'node:http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Match the production exception for the official Spotify SDK's child page.
// Every desktop route still has the isolation required by WebContainer.
const isolation = (
  request: IncomingMessage,
  response: ServerResponse,
  next: () => void,
) => {
  response.setHeader(
    'Cross-Origin-Embedder-Policy',
    request.url?.split('?')[0] === '/spotify-player.html'
      ? 'unsafe-none'
      : 'require-corp',
  )
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  next()
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'desktop-isolation',
      configureServer(server) {
        server.middlewares.use(isolation)
      },
      configurePreviewServer(server) {
        server.middlewares.use(isolation)
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['terminal.local'],
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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          icons: ['lucide-react', 'react-icons'],
          gsap: ['gsap', '@gsap/react'],
          terminal: ['xterm', '@xterm/addon-fit'],
        },
      },
    },
  },
})
