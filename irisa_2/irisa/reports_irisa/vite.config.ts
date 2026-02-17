import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: "./",
  server: {
    host: true,        // Esto es igual a 0.0.0.0, permite conexiones externas
    port: 5173,
    watch: {
      usePolling: true // Necesario para que detecte cambios de archivos en Windows (WSL/Docker)
    },
    hmr: {
      clientPort: 5173 // Asegura que el navegador sepa a qué puerto conectar el WebSocket
    }
  }
})