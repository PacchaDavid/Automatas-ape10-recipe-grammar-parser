/* ==========================================================================
   main.tsx — Entry Point (React 19)
   --------------------------------------------------------------------------
   Punto de entrada principal de la aplicación React.
   Aquí se monta el componente raíz <App /> en el DOM, envuelto en
   <StrictMode> para detectar efectos secundarios y problemas de
   renderización durante el desarrollo.

   Flujo:
     1. Importa React 19 y createRoot (React DOM)
     2. Importa estilos globales (index.css) — Vite los incluye en el bundle
     3. Importa el componente App (raíz de la aplicación)
     4. Busca el <div id="root"> en el DOM y monta la app
   ========================================================================== */

/* StrictMode: ejecuta efectos dos veces en desarrollo para detectar
   problemas de limpieza. En producción tiene comportamiento normal. */
import { StrictMode } from 'react'

/* createRoot: API de React 18+ para crear un root concurrente.
   Reemplaza al antiguo ReactDOM.render(). */
import { createRoot } from 'react-dom/client'

/* Estilos globales: CSS variables, reset, tipografía, animaciones base.
   Vite importa esto como un side-effect, inyectando el CSS en el <head>. */
import './index.css'

/* Componente raíz de la aplicación: contiene toda la UI del compilador DSL. */
import App from './App.tsx'

/*
  createRoot(): Crea un React Root concurrente en el contenedor #root.
  El operador "!" (non-null assertion) le dice a TypeScript que confíe
  en que el elemento existe en el DOM (definido en index.html).

  StrictMode: Renderiza App dos veces en desarrollo para validar
  que no haya efectos secundarios incorrectos.
*/
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
