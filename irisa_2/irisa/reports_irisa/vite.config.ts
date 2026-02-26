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
  build: {
    // Esto ayuda a que Rollup no falle con estructuras complejas de dependencias
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'jspdf', 'jspdf-autotable'],
        },
      },
    },
    // Aumenta el límite para evitar advertencias de tamaño de chunk
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true 
    },
    hmr: {
      clientPort: 5173 
    }
  }
})