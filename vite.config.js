import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiTarget =
  'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/gasoliprecios/' : '/',
  server: {
    port: 5173,
    proxy: {
      '/api/precios-carburantes/estaciones-terrestres': {
        target: apiTarget,
        changeOrigin: true,
        secure: true,
        rewrite: () => '',
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          map: ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
});
