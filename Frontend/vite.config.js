// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })



import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.FRONTEND_PORT) || 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: process.env.HOST_IP || 'localhost',
      port: parseInt(process.env.FRONTEND_PORT) || 5173,
    },
  },
  preview: {
    host: process.env.HOST_IP || 'localhost',
    port: parseInt(process.env.FRONTEND_PORT) || 5173,
  },
})
