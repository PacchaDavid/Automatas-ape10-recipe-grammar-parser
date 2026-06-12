/* ==========================================================================
   App.tsx — Componente Principal (Recipe Parser CFG Frontend)
   --------------------------------------------------------------------------
   Este componente constituye la interfaz de usuario completa del
   compilador DSL de recetas culinarias. Proporciona:

     1. Editor de código con gutter de números de línea
     2. Selector de ejemplos preconfigurados (éxito y error)
     3. Panel de estado del análisis
     4. Visualizador de errores (léxicos y sintácticos)
     5. Renderizador del AST (Árbol Sintáctico Abstracto)
     6. Visualizador de tokens (salida del lexer)

   Arquitectura:
     - Grid de dos columnas responsivo (1.1fr + 1fr -> 1fr en mobile)
     - Estado manejado con useState (sin Redux ni librerías externas)
     - Llamada asíncrona al backend via fetch() con proxy Vite
   ========================================================================== */

import { useState, useRef } from 'react';
import './App.css';
import type { Token, CompileError, RecipeNode, AnalyzeResponse } from './types';


/* ==========================================================================
   EJEMPLOS PREDEFINIDOS
   --------------------------------------------------------------------------
   Recetas DSL de ejemplo extraídas de la documentación del compilador.
   Divididas en dos categorías:
     - Casos de Éxito: recetas sintácticamente válidas
     - Casos de Error: recetas con errores léxicos o sintácticos intencionales

   Cada caso prueba una característica específica del compilador.
   ========================================================================== */
const EXAMPLES = {
  /* --- 5 Casos de Éxito --- */

  /* Harina Básico: receta mínima, 1 ingrediente + 2 pasos */
  basico: `INGREDIENT: 500 GRAMS OF flour;
STEP 1: BOIL water FOR 20 MINUTES;
STEP 2: ADD salt;`,

  /* Pasta Completo: receta con 4 pasos secuenciales */
  pasta: `INGREDIENT: 400 GRAMS OF pasta;
STEP 1: BOIL water FOR 10 MINUTES;
STEP 2: ADD pasta;
STEP 3: BOIL pasta FOR 8 MINUTES;
STEP 4: ADD salt;`,

  /* Azúcar Simple: receta mínima, 2 pasos sin temporizador en ADD */
  simple: `INGREDIENT: 100 GRAMS OF sugar;
STEP 1: ADD salt;`,

  /* Ensalada Rápida: ingrediente + 2 pasos ADD */
  ensalada: `INGREDIENT: 200 GRAMS OF lettuce;
STEP 1: ADD lettuce;
STEP 2: ADD salt;`,

  /* Café con Azúcar: mezcla de BOIL + ADD con temporizador */
  cafe: `INGREDIENT: 15 GRAMS OF sugar;
STEP 1: BOIL water FOR 5 MINUTES;
STEP 2: ADD coffee;
STEP 3: ADD sugar;`,

  /* --- 5 Casos de Error --- */

  /* Error Léxico: coma no es un carácter válido en el DSL */
  errorLexico: `INGREDIENT: 500 GRAMS OF flour;
STEP 1: BOIL water FOR 20, MINUTES; // Error: ',' no es un caracter valido`,

  /* Error Sintáctico: palabras clave en minúscula no son reconocidas */
  errorSintactico: `ingredient: 500 grams of flour; // Error: palabras clave en minuscula
STEP 1: BOIL water FOR 20 MINUTES;`,

  /* Error Sintáctico: falta punto y coma al final de la declaración */
  errorMissingSemicolon: `INGREDIENT: 500 GRAMS OF flour // Error: falta ';'
STEP 1: BOIL water FOR 20 MINUTES;`,

  /* Error Sintáctico: BAKE no es una acción válida (solo BOIL y ADD) */
  errorInvalidAction: `INGREDIENT: 500 GRAMS OF flour;
STEP 1: BAKE flour FOR 30 MINUTES; // Error: BAKE no es accion valida`,

  /* Error Léxico: guion no es un carácter válido en números */
  errorNegativeNumber: `INGREDIENT: -500 GRAMS OF flour; // Error: '-' no es valido`
};


/* ==========================================================================
   App — Componente Principal
   --------------------------------------------------------------------------
   Estados cubiertos:
     - initial:    estado vacío/inicial, sin análisis ejecutado
     - loading:    solicitud en curso al backend
     - success:    análisis completado sin errores (status 200)
     - error:      análisis completado con errores de compilación
   ========================================================================== */
export default function App() {
  /* --- Estado del editor --- */
  const [text, setText] = useState<string>(EXAMPLES.basico);
  /* --- Estado del análisis --- */
  const [status, setStatus] = useState<'initial' | 'loading' | 'success' | 'error'>('initial');
  /* --- Resultados del backend --- */
  const [tokens, setTokens] = useState<Token[]>([]);
  const [ast, setAst] = useState<RecipeNode | null>(null);
  const [errors, setErrors] = useState<CompileError[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* --- Refs para el editor sincronizado --- */
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  /* ========================================================================
     handleScroll: Sincroniza el scroll del textarea con el gutter.
     Cuando el usuario scrollea en el textarea, el gutter se desplaza
     en paralelo para mantener los números de línea alineados.
     ======================================================================== */
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  /* ========================================================================
     lines / totalLines / lineNumbers: Cálculo de números de línea.
     Se recalcula en cada render para reflejar cambios en el texto.
     ======================================================================== */
  const lines = text.split('\n');
  const totalLines = Math.max(lines.length, 1);
  const lineNumbers = Array.from({ length: totalLines }, (_, i) => i + 1);

  /* ========================================================================
     handleLoadExample: Carga un ejemplo predefinido en el editor.
     Resetea todos los estados de resultados al cargar un nuevo ejemplo.
     ======================================================================== */
  const handleLoadExample = (key: keyof typeof EXAMPLES) => {
    setText(EXAMPLES[key]);
    setStatus('initial');
    setTokens([]);
    setAst(null);
    setErrors([]);
    setErrorMsg(null);
  };

  /* ========================================================================
     handleClear: Limpia el editor y todos los resultados.
     Mantiene el foco en el textarea para escritura inmediata.
     ======================================================================== */
  const handleClear = () => {
    setText('');
    setStatus('initial');
    setTokens([]);
    setAst(null);
    setErrors([]);
    setErrorMsg(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  /* ========================================================================
     handleAnalyze: Envía el texto DSL al backend para análisis.
     ------------------------------------------------------------------------
     Flujo:
       1. Resetea resultados previos
       2. Establece estado 'loading'
       3. Envía POST a /api/compiler/analyze (proxy Vite -> backend)
       4. Procesa la respuesta JSON
       5. Si success, muestra AST y tokens; si no, muestra errores

     Error handling:
       - Error HTTP (response no OK) -> errorMsg
       - Error de red/fetch -> catch -> errorMsg
       - Errores del compilador -> errors[] (léxicos o sintácticos)
     ======================================================================== */
  const handleAnalyze = async () => {
    setStatus('loading');
    setErrorMsg(null);
    setErrors([]);
    setAst(null);
    setTokens([]);

    try {
      const response = await fetch('/api/compiler/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status} ${response.statusText}`);
      }

      const data: AnalyzeResponse = await response.json();
      setTokens(data.tokens || []);
      setErrors(data.errors || []);
      setAst(data.ast);

      if (data.success && (!data.errors || data.errors.length === 0)) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || 'Error de conexión con el compilador.');
    }
  };

  /* ========================================================================
     focusErrorLocation: Navega a la línea/columna de un error en el editor.
     ------------------------------------------------------------------------
     Calcula la posición absoluta en el texto (offset) a partir del número
     de línea y columna, y selecciona 5 caracteres alrededor para resaltar
     visualmente la ubicación del error.

     Útil para UX: el usuario hace clic en un error y el editor salta allí.
     ======================================================================== */
  const focusErrorLocation = (lineNum: number, colNum: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const linesArray = text.split('\n');
    let targetIndex = 0;

    /* Itera sobre líneas anteriores para calcular el offset total */
    for (let i = 0; i < Math.min(lineNum - 1, linesArray.length); i++) {
      targetIndex += linesArray[i].length + 1; /* +1 por el carácter de nueva línea */
    }

    /* Ajusta por columna (1-indexed -> 0-indexed) */
    targetIndex += Math.max(0, colNum - 1);

    textarea.focus();
    /* Selecciona 5 caracteres desde la posición del error para resaltar */
    textarea.setSelectionRange(targetIndex, targetIndex + 5);
  };

  /* ==========================================================================
     RENDER
     --------------------------------------------------------------------------
     Estructura del layout:
       .app-container
         ├── .app-header          (título, badge, subtítulo)
         └── .app-grid            (grid 2 columnas)
              ├── .column-editor  (izquierda: editor + guía)
              │    ├── .editor-panel    (textarea + gutter + acciones)
              │    └── .guide-panel     (palabras clave del DSL)
              └── .column-results (derecha: resultados)
                   ├── .status-card      (indicador de estado)
                   ├── .error-panel      (errores, condicional)
                   ├── .ast-panel        (árbol AST, condicional)
                   └── .tokens-panel     (tokens, condicional)
     ========================================================================== */
  return (
    <div className="app-container">
      {/* Header: identidad visual de la aplicación */}
      <header className="app-header">
        <div className="header-badge">Compiler DSL</div>
        <h1>Recipe Parser CFG</h1>
        <p className="header-subtitle">
          Analizador lexico, sintactico y constructor AST para lenguaje de recetas culinarias.
        </p>
      </header>

      {/* Grid principal: editor + resultados */}
      <main className="app-grid">

        {/* ================================================================ */}
        {/* COLUMNA IZQUIERDA: Editor de recetas + Guía de referencia        */}
        {/* ================================================================ */}
        <section className="column-editor">

          {/* Panel del editor de código */}
          <div className="panel editor-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                {/* Icono de documento (SVG inline) */}
                <svg className="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <line x1="10" y1="9" x2="8" y2="9"/>
                </svg>
                <h2>Editor de Recetas</h2>
              </div>

              {/* Selector de ejemplos predefinidos */}
              <div className="examples-wrapper">
                <span className="select-label">Ejemplos:</span>
                <select
                  className="example-select"
                  onChange={(e) => handleLoadExample(e.target.value as keyof typeof EXAMPLES)}
                  defaultValue="basico"
                >
                  <optgroup label="Casos de Exito">
                    <option value="basico">1. Harina Basico</option>
                    <option value="pasta">2. Pasta Completo</option>
                    <option value="simple">3. Azucar Simple</option>
                    <option value="ensalada">4. Ensalada Rapida</option>
                    <option value="cafe">5. Cafe con Azucar</option>
                  </optgroup>
                  <optgroup label="Casos de Error">
                    <option value="errorLexico">🔴 Caracter Invalido (Lexico)</option>
                    <option value="errorNegativeNumber">🔴 Numero Negativo (Lexico)</option>
                    <option value="errorSintactico">🔴 Minusculas Reservadas (Sintactico)</option>
                    <option value="errorMissingSemicolon">🔴 Falta Punto y Coma (Sintactico)</option>
                    <option value="errorInvalidAction">🔴 Accion Invalida (Sintactico)</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Editor de código con gutter de números de línea */}
            {/*
              Estructura del editor:
                .code-editor-container
                  ├── .gutter           (columna de números de línea)
                  │    └── .line-number (cada número, ocupa 1.5rem = 1 línea)
                  └── .code-textarea    (textarea real, sincronizado con gutter)
            */}
            <div className="code-editor-container">
              {/*
                Gutter: columna izquierda con números de línea.
                El scroll está sincronizado con el textarea via handleScroll.
                Los números se renderizan como spans absolutos.
                El overflow-y:hidden permite que el scroll del padre controle
                la posición (sincronizado desde el textarea).
              */}
              <div className="gutter" ref={lineNumbersRef}>
                {lineNumbers.map((num) => (
                  <span key={num} className="line-number">{num}</span>
                ))}
              </div>
              {/*
                Textarea principal: monospace, sin resize, sin spellcheck.
                El valor (value) está controlado por React (estado text).
                onChange actualiza el estado en cada pulsación de tecla.
                onScroll sincroniza el gutter mediante handleScroll.
              */}
              <textarea
                ref={textareaRef}
                className="code-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onScroll={handleScroll}
                placeholder="Escribe tu receta aqui utilizando el DSL..."
                spellCheck={false}
              />
            </div>

            {/* Botones de acción del editor */}
            <div className="editor-actions">
              <button className="btn btn-secondary" onClick={handleClear}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                </svg>
                Limpiar
              </button>
              <button className="btn btn-primary" onClick={handleAnalyze}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Analizar Receta
              </button>
            </div>
          </div>

          {/* Panel de guía rápida: palabras clave del DSL */}
          <div className="panel guide-panel">
            <h3>Palabras Clave & Reglas</h3>
            <div className="guide-grid">
              <div className="guide-item">
                <span className="guide-keyword">INGREDIENT:</span> Declara ingrediente base
              </div>
              <div className="guide-item">
                <span className="guide-keyword">STEP [N]:</span> Define paso secuencial
              </div>
              <div className="guide-item">
                <span className="guide-keyword">BOIL</span> Hervir por un tiempo
              </div>
              <div className="guide-item">
                <span className="guide-keyword">ADD</span> Anadir ingrediente
              </div>
              <div className="guide-item">
                <span className="guide-keyword">GRAMS OF</span> Unidades e ingrediente
              </div>
              <div className="guide-item">
                <span className="guide-keyword">FOR ... MINUTES;</span> Duracion requerida
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* COLUMNA DERECHA: Estado + Resultados + AST + Tokens              */}
        {/* ================================================================ */}
        <section className="column-results">

          {/* -------------------------------------------------------------- */}
          {/* Tarjeta de Estado del Análisis                                 */}
          {/* Maneja 4 estados: initial, loading, success, error             */}
          {/* -------------------------------------------------------------- */}
          {/*
            .status-card usa clases condicionales:
              - status-initial: estado por defecto
              - status-loading: muestra spinner + mensaje de proceso
              - status-success: borde verde, mensaje de éxito
              - status-error:   borde rojo, mensaje de error
          */}
          <div className={`status-card status-${status}`}>
            <div className="status-header">
              {/*
                .status-indicator-dot: punto de color que cambia según estado.
                - initial: gris
                - loading: amarillo con pulso
                - success: verde con glow
                - error:   rojo con pulso
              */}
              <div className="status-indicator-dot" />
              <span>Estado del Analisis:</span>
              <strong className="status-badge">
                {status === 'initial' && 'Esperando'}
                {status === 'loading' && 'Procesando...'}
                {status === 'success' && 'Correcto (200 OK)'}
                {status === 'error' && 'Error de Compilacion'}
              </strong>
            </div>

            {status === 'initial' && (
              <p className="status-desc">Presiona "Analizar Receta" para compilar el DSL de entrada.</p>
            )}
            {status === 'loading' && (
              <div className="status-loading-content">
                {/*
                  Spinner CSS: borde circular animado con rotate infinito.
                  El border-top-color usa el color de acento para efecto visual.
                */}
                <div className="spinner" />
                <p>Enviando payload a la API y parseando la gramatica...</p>
              </div>
            )}
            {status === 'success' && (
              <p className="status-desc success-text">
                ✓ ¡La receta cumple con la gramatica libre de contexto definida por el backend!
              </p>
            )}
            {status === 'error' && (
              <p className="status-desc error-text">
                ✗ Se encontraron errores lexicos o sintacticos en el codigo.
              </p>
            )}
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Panel de Errores de Compilación                                */}
          {/* Solo se muestra si hay errores (errors.length > 0)             */}
          {/* o si ocurrió un error de comunicación (errorMsg != null)       */}
          {/* -------------------------------------------------------------- */}
          {(errors.length > 0 || errorMsg) && (
            <div className="panel error-panel-results">
              <div className="panel-header error-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="panel-icon">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h2>Errores de Compilacion ({errors.length})</h2>
              </div>

              <div className="errors-list">
                {/*
                  Error de sistema: ocurre cuando la petición HTTP falla
                  (error de red, servidor caído, etc.)
                */}
                {errorMsg && (
                  <div className="error-item">
                    <div className="error-meta">
                      <span className="error-badge-type red">SISTEMA</span>
                    </div>
                    <p className="error-message">{errorMsg}</p>
                  </div>
                )}

                {/*
                  Errores del compilador: cada error tiene tipo (LÉXICO o
                  SINTÁCTICO), ubicación (línea:columna) y mensaje.
                  Son interactivos: al hacer clic, el editor navega al error.
                */}
                {errors.map((err, idx) => (
                  <div
                    key={idx}
                    className="error-item interactive"
                    onClick={() => focusErrorLocation(err.line, err.column)}
                    title="Hacer clic para ir al error en el editor"
                  >
                    <div className="error-meta">
                      {/*
                        Badge de tipo: color naranja para LÉXICO,
                        rojo coral para SINTÁCTICO.
                      */}
                      <span className={`error-badge-type ${err.type === 'LEXICO' ? 'orange' : 'coral'}`}>
                        {err.type}
                      </span>
                      <span className="error-coord">Linea {err.line}, Col {err.column}</span>
                      {/*
                        Flecha "Ir al editor" que aparece al hacer hover.
                        Implementada con opacity + translate para animación suave.
                      */}
                      <span className="go-to-arrow">Ir al editor →</span>
                    </div>
                    <p className="error-message">{err.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------- */}
          {/* Panel del AST (Árbol Sintáctico Abstracto)                     */}
          {/* Solo se muestra en estado success y cuando ast no es null      */}
          {/* -------------------------------------------------------------- */}
          {status === 'success' && ast && (
            <div className="panel ast-panel">
              <div className="panel-header">
                <div className="panel-title-group">
                  <svg className="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                  <h2>Arbol Sintactico (AST)</h2>
                </div>
              </div>

              {/*
                Visualización jerárquica del AST.
                Estructura del árbol:
                  RECETA (Root)
                    ├── INGREDIENT (nombre, cantidad, unidad)
                    └── PASOS (lista numerada)
                         ├── Paso 1 → Acción (BOIL/ADD) + target + [tiempo]
                         ├── Paso 2 → ...
                         └── ...
              */}
              <div className="ast-tree-viewport">
                <div className="ast-tree-node root-node">
                  {/* Nodo raíz: RECETA */}
                  <div className="node-badge node-type-recipe">
                    <span className="node-emoji">🍳</span>
                    <span className="node-title">RECETA (Root)</span>
                  </div>

                  {/* Contenedor de hijos: ingrediente + pasos */}
                  <div className="node-children-container">

                    {/* Nodo: INGREDIENTE */}
                    {ast.ingredient && (
                      <div className="ast-tree-branch">
                        {/*
                          .branch-line: línea vertical que conecta el padre
                          con este hijo en el árbol.
                        */}
                        <div className="branch-line" />
                        <div className="ast-tree-node">
                          <div className="node-badge node-type-ingredient">
                            <span className="node-emoji">🌾</span>
                            <span className="node-title">INGREDIENT</span>
                          </div>
                          {/*
                            Detalles del ingrediente: nombre, cantidad, unidad.
                            Renderizados como pares clave:valor.
                          */}
                          <div className="node-details">
                            <div><span className="lbl">Nombre:</span> <strong>{ast.ingredient.name}</strong></div>
                            <div><span className="lbl">Cantidad:</span> <strong>{ast.ingredient.quantity}</strong></div>
                            <div><span className="lbl">Unidad:</span> <code>{ast.ingredient.unit}</code></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Nodo: PASOS */}
                    {ast.steps && ast.steps.length > 0 && (
                      <div className="ast-tree-branch">
                        <div className="branch-line" />
                        <div className="ast-tree-node">
                          <div className="node-badge node-type-steps-container">
                            <span className="node-emoji">📋</span>
                            <span className="node-title">PASOS ({ast.steps.length})</span>
                          </div>

                          {/*
                            Lista jerárquica de pasos.
                            Cada paso tiene:
                              - Número (círculo con el índice)
                              - Acción (BOIL o ADD con color distintivo)
                              - Target (ingrediente afectado)
                              - Tiempo opcional (solo BOIL tiene duración)
                          */}
                          <div className="steps-hierarchy-container">
                            {ast.steps.map((step, idx) => (
                              <div key={idx} className="step-leaf-branch">
                                {/*
                                  .leaf-line: línea horizontal que conecta
                                  la línea vertical de la lista con cada paso.
                                */}
                                <div className="leaf-line" />
                                <div className="ast-tree-node step-leaf-node">
                                  <div className="node-badge node-type-step">
                                    <span className="node-index">{step.number}</span>
                                    <span className="node-title">Paso {step.number}</span>
                                  </div>

                                  {step.action && (
                                    <div className="action-details">
                                      {/*
                                        Línea principal: tag de acción + target.
                                        BOIL se muestra como "🔥 Hervir"
                                        ADD se muestra como "➕ Anadir"
                                      */}
                                      <div className="action-main-line">
                                        <span className={`action-tag action-${step.action.actionType.toLowerCase()}`}>
                                          {step.action.actionType === 'BOIL' ? '🔥 Hervir' : '➕ Anadir'}
                                        </span>
                                        <span className="action-target">{step.action.target}</span>
                                      </div>

                                      {/*
                                        Línea de tiempo: solo visible si la
                                        acción tiene duración (BOIL siempre,
                                        ADD nunca). Muestra reloj + duración.
                                      */}
                                      {step.action.time && (
                                        <div className="action-time-line">
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                          </svg>
                                          <span>{step.action.time.duration} {step.action.time.unit.toLowerCase()}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------- */}
          {/* Panel de Tokens (resultado del analizador léxico)              */}
          {/* Se muestra siempre que haya tokens generados                   */}
          {/* -------------------------------------------------------------- */}
          {tokens.length > 0 && (
            <div className="panel tokens-panel">
              <div className="panel-header">
                <div className="panel-title-group">
                  <svg className="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="3" x2="9" y2="21"/>
                    <line x1="15" y1="3" x2="15" y2="21"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="3" y1="15" x2="21" y2="15"/>
                  </svg>
                  <h2>Tokens Reconocidos ({tokens.length})</h2>
                </div>
              </div>

              <p className="tokens-intro">Secuencia resultante del analisis lexico (Lexer):</p>

              {/*
                Cuadrícula de tokens: cada token se muestra como un chip
                con el tipo, coordenadas (línea:columna) y lexema.
                Los chips se categorizan por color:
                  - keyword:   palabras reservadas (índigo)
                  - number:    valores numéricos (ámbar)
                  - word:      identificadores (verde)
                  - separator: signos de puntuación (gris)
                  - eof:       marcador de fin (atenuado)
                  - error:     tokens inválidos (rojo)
              */}
              <div className="tokens-grid">
                {tokens.map((token, idx) => {
                  /* Determina la categoría visual según el tipo de token */
                  const typeLower = token.type.toLowerCase();
                  let badgeCategory = 'other';
                  if (['ingredient', 'step', 'grams', 'of', 'boil', 'add', 'for', 'minutes'].includes(typeLower)) {
                    badgeCategory = 'keyword';
                  } else if (typeLower === 'number') {
                    badgeCategory = 'number';
                  } else if (typeLower === 'word') {
                    badgeCategory = 'word';
                  } else if (['colon', 'semicolon'].includes(typeLower)) {
                    badgeCategory = 'separator';
                  } else if (typeLower === 'eof') {
                    badgeCategory = 'eof';
                  } else if (typeLower === 'error') {
                    badgeCategory = 'error';
                  }

                  return (
                    <div
                      key={idx}
                      className={`token-chip category-${badgeCategory}`}
                      title={`Tipo: ${token.type}\nLinea: ${token.line}, Columna: ${token.column}`}
                    >
                      <div className="token-header">
                        <span className="token-type">{token.type}</span>
                        <span className="token-coord">{token.line}:{token.column}</span>
                      </div>
                      {/*
                        Lexema: el texto original del token.
                        Si está vacío (como EOF), muestra <em>EOF</em>.
                      */}
                      <div className="token-lexeme">
                        {token.lexeme === '' ? <em>EOF</em> : token.lexeme}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
