/* ==========================================================================
   eslint.config.js — Configuración de ESLint (Flat Config)
   --------------------------------------------------------------------------
   Utiliza el nuevo sistema de configuración plana de ESLint v9+ (flat config).

   Reglas configuradas:
     1. @eslint/js:      reglas base recomendadas de JavaScript
     2. typescript-eslint: reglas de TypeScript (tseslint.configs.recommended)
     3. react-hooks:     reglas para React Hooks (exhaustive-deps, rules-of-hooks)
     4. react-refresh:   regla para React Refresh (HMR en desarrollo)

   Excluye la carpeta dist/ de los análisis.
   ========================================================================== */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

/*
  defineConfig: función de ESLint para crear la configuración.
  globalIgnores: establece patrones globales de ignorados (dist/).
  El array de configuraciones se aplica secuencialmente, fusionándose.
*/
export default defineConfig([
  /*
    Ignora la carpeta dist/ (output de build).
    Los archivos en dist/ no necesitan linting.
  */
  globalIgnores(['dist']),

  /*
    Configuración principal para archivos TypeScript/TSX.
    files: patrón de archivos a los que aplicar estas reglas.
    extends: combina múltiples conjuntos de reglas.
  */
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,             /* Reglas JS base */
      tseslint.configs.recommended,        /* Reglas TS base */
      reactHooks.configs.flat.recommended, /* Reglas de React Hooks */
      reactRefresh.configs.vite,           /* Regla de React Refresh para Vite */
    ],
    languageOptions: {
      globals: globals.browser, /* Variables globales del navegador */
    },
  },
])
