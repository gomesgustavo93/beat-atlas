import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // Permite acesso via localhost, 127.0.0.1, e IP local
    port: 5173,
    strictPort: false,
  },
})
