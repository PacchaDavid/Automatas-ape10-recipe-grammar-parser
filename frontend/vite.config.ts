/* ==========================================================================
   vite.config.ts — Configuración de Vite
   --------------------------------------------------------------------------
   Define la configuración del bundler Vite para el frontend React.

   Configuraciones clave:
     1. Plugin @vitejs/plugin-react: HMR rápido, transformación JSX,
        soporte para React Compiler (opcional).
     2. Proxy de desarrollo: redirige /api/* al backend en localhost:9090
        para evitar CORS en desarrollo.
   ========================================================================== */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/*
  defineConfig: helper tipado de Vite que provee autocompletado.
  Recibe un objeto de configuración.
*/
export default defineConfig({
  /*
    plugins: array de plugins de Vite.
    @vitejs/plugin-react utiliza Oxc (Oxidation Compiler) para
    transformaciones ultrarrápidas de JSX/TSX.
  */
  plugins: [react()],

  /*
    server: configuración del servidor de desarrollo.
    proxy: mapea rutas específicas a servidores externos.
    Útil para desarrollo cuando el frontend y backend están en
    puertos diferentes (evita CORS en desarrollo).
  */
  server: {
    proxy: {
      /*
        /api/* → http://localhost:9090/api/*
        Ejemplo: fetch('/api/compiler/analyze') se redirige a
        http://localhost:9090/api/compiler/analyze
        changeOrigin: true modifica el header Host para que el
        backend reciba la solicitud como propia.
      */
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      },
    },
  },
})
