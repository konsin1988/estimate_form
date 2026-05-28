import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// prod
//export default defineConfig({
//  plugins: [
//    react(),
//    tailwindcss(),
//  ],
//  server: [
//    'astra.rtt.digital'
//  ]
//})

// dev
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
