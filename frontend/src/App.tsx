import { useState, useRef } from 'react';
import './App.css';
import type { Token, CompileError, RecipeNode, AnalyzeResponse } from './types';


// Preconfigured example DSL recipes from documentation
const EXAMPLES = {
  basico: `INGREDIENT: 500 GRAMS OF flour;
STEP 1: BOIL water FOR 20 MINUTES;
STEP 2: ADD salt;`,
  pasta: `INGREDIENT: 400 GRAMS OF pasta;
STEP 1: BOIL water FOR 10 MINUTES;
STEP 2: ADD pasta;
STEP 3: BOIL pasta FOR 8 MINUTES;
STEP 4: ADD salt;`,
  simple: `INGREDIENT: 100 GRAMS OF sugar;
STEP 1: ADD salt;`,
  errorLexico: `INGREDIENT: 500 GRAMS OF flour;
STEP 1: BOIL water FOR 20, MINUTES; // Error: ',' no es un caracter valido`,
  errorSintactico: `ingredient: 500 grams of flour; // Error: palabras clave en minuscula
STEP 1: BOIL water FOR 20 MINUTES;`
};

export default function App() {
  const [text, setText] = useState<string>(EXAMPLES.basico);
  const [status, setStatus] = useState<'initial' | 'loading' | 'success' | 'error'>('initial');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [ast, setAst] = useState<RecipeNode | null>(null);
  const [errors, setErrors] = useState<CompileError[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Sync scroll between textarea and line numbers gutter
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Sync line numbers count when text changes
  const lines = text.split('\n');
  const totalLines = Math.max(lines.length, 1);
  const lineNumbers = Array.from({ length: totalLines }, (_, i) => i + 1);

  // Load a recipe example
  const handleLoadExample = (key: keyof typeof EXAMPLES) => {
    setText(EXAMPLES[key]);
    setStatus('initial');
    setTokens([]);
    setAst(null);
    setErrors([]);
    setErrorMsg(null);
  };

  // Clear editor and results
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

  // Trigger analysis in the backend
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

  // Focus a specific line and column in the editor when clicking an error
  const focusErrorLocation = (lineNum: number, colNum: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const linesArray = text.split('\n');
    let targetIndex = 0;

    // Calculate index position of the start of the target line
    for (let i = 0; i < Math.min(lineNum - 1, linesArray.length); i++) {
      targetIndex += linesArray[i].length + 1; // +1 for the newline character
    }
    
    // Add column index (0-indexed offset)
    targetIndex += Math.max(0, colNum - 1);

    textarea.focus();
    // Select the character or line start
    textarea.setSelectionRange(targetIndex, targetIndex + 5);
  };

  return (
    <div className="app-container">
      {/* Header section */}
      <header className="app-header">
        <div className="header-badge">Compiler DSL</div>
        <h1>Recipe Parser CFG</h1>
        <p className="header-subtitle">
          Analizador léxico, sintáctico y constructor AST para lenguaje de recetas culinarias.
        </p>
      </header>

      {/* Main Layout Grid */}
      <main className="app-grid">
        {/* Left Column: Editor & Actions */}
        <section className="column-editor">
          <div className="panel editor-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <svg className="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <line x1="10" y1="9" x2="8" y2="9"/>
                </svg>
                <h2>Editor de Recetas</h2>
              </div>
              
              {/* Examples Selector */}
              <div className="examples-wrapper">
                <span className="select-label">Ejemplos:</span>
                <select 
                  className="example-select" 
                  onChange={(e) => handleLoadExample(e.target.value as keyof typeof EXAMPLES)}
                  defaultValue="basico"
                >
                  <option value="basico">1. Harina Básico</option>
                  <option value="pasta">2. Pasta Completo</option>
                  <option value="simple">3. Azúcar Simple</option>
                  <option value="errorLexico">⚠️ Error Léxico</option>
                  <option value="errorSintactico">⚠️ Error Sintáctico</option>
                </select>
              </div>
            </div>

            {/* Custom Code Editor with Gutter */}
            <div className="code-editor-container">
              <div className="gutter" ref={lineNumbersRef}>
                {lineNumbers.map((num) => (
                  <span key={num} className="line-number">{num}</span>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                className="code-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onScroll={handleScroll}
                placeholder="Escribe tu receta aquí utilizando el DSL..."
                spellCheck={false}
              />
            </div>

            {/* Editor Action Buttons */}
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

          {/* Guide Card (Brief compiler keywords rules) */}
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
                <span className="guide-keyword">ADD</span> Añadir ingrediente
              </div>
              <div className="guide-item">
                <span className="guide-keyword">GRAMS OF</span> Unidades e ingrediente
              </div>
              <div className="guide-item">
                <span className="guide-keyword">FOR ... MINUTES;</span> Duración requerida
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Status & Results */}
        <section className="column-results">
          {/* Status Indicator Card */}
          <div className={`status-card status-${status}`}>
            <div className="status-header">
              <div className="status-indicator-dot" />
              <span>Estado del Análisis:</span>
              <strong className="status-badge">
                {status === 'initial' && 'Esperando'}
                {status === 'loading' && 'Procesando...'}
                {status === 'success' && 'Correcto (200 OK)'}
                {status === 'error' && 'Error de Compilación'}
              </strong>
            </div>
            
            {status === 'initial' && (
              <p className="status-desc">Presiona "Analizar Receta" para compilar el DSL de entrada.</p>
            )}
            {status === 'loading' && (
              <div className="status-loading-content">
                <div className="spinner" />
                <p>Enviando payload a la API y parseando la gramática...</p>
              </div>
            )}
            {status === 'success' && (
              <p className="status-desc success-text">
                ✓ ¡La receta cumple con la gramática libre de contexto definida por el backend!
              </p>
            )}
            {status === 'error' && (
              <p className="status-desc error-text">
                ✗ Se encontraron errores léxicos o sintácticos en el código.
              </p>
            )}
          </div>

          {/* Error Details Section */}
          {(errors.length > 0 || errorMsg) && (
            <div className="panel error-panel-results">
              <div className="panel-header error-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="panel-icon">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h2>Errores de Compilación ({errors.length})</h2>
              </div>
              
              <div className="errors-list">
                {errorMsg && (
                  <div className="error-item">
                    <div className="error-meta">
                      <span className="error-badge-type red">SISTEMA</span>
                    </div>
                    <p className="error-message">{errorMsg}</p>
                  </div>
                )}
                {errors.map((err, idx) => (
                  <div 
                    key={idx} 
                    className="error-item interactive"
                    onClick={() => focusErrorLocation(err.line, err.column)}
                    title="Hacer clic para ir al error en el editor"
                  >
                    <div className="error-meta">
                      <span className={`error-badge-type ${err.type === 'LEXICO' ? 'orange' : 'coral'}`}>
                        {err.type}
                      </span>
                      <span className="error-coord">Línea {err.line}, Col {err.column}</span>
                      <span className="go-to-arrow">Ir al editor →</span>
                    </div>
                    <p className="error-message">{err.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AST Section */}
          {status === 'success' && ast && (
            <div className="panel ast-panel">
              <div className="panel-header">
                <div className="panel-title-group">
                  <svg className="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                  <h2>Árbol Sintáctico (AST)</h2>
                </div>
              </div>

              {/* AST Graphic Tree Renderer */}
              <div className="ast-tree-viewport">
                <div className="ast-tree-node root-node">
                  <div className="node-badge node-type-recipe">
                    <span className="node-emoji">🍳</span>
                    <span className="node-title">RECETA (Root)</span>
                  </div>
                  
                  <div className="node-children-container">
                    {/* Ingredient Child Node */}
                    {ast.ingredient && (
                      <div className="ast-tree-branch">
                        <div className="branch-line" />
                        <div className="ast-tree-node">
                          <div className="node-badge node-type-ingredient">
                            <span className="node-emoji">🌾</span>
                            <span className="node-title">INGREDIENT</span>
                          </div>
                          <div className="node-details">
                            <div><span className="lbl">Nombre:</span> <strong>{ast.ingredient.name}</strong></div>
                            <div><span className="lbl">Cantidad:</span> <strong>{ast.ingredient.quantity}</strong></div>
                            <div><span className="lbl">Unidad:</span> <code>{ast.ingredient.unit}</code></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Steps Parent Node */}
                    {ast.steps && ast.steps.length > 0 && (
                      <div className="ast-tree-branch">
                        <div className="branch-line" />
                        <div className="ast-tree-node">
                          <div className="node-badge node-type-steps-container">
                            <span className="node-emoji">📋</span>
                            <span className="node-title">PASOS ({ast.steps.length})</span>
                          </div>
                          
                          <div className="steps-hierarchy-container">
                            {ast.steps.map((step, idx) => (
                              <div key={idx} className="step-leaf-branch">
                                <div className="leaf-line" />
                                <div className="ast-tree-node step-leaf-node">
                                  <div className="node-badge node-type-step">
                                    <span className="node-index">{step.number}</span>
                                    <span className="node-title">Paso {step.number}</span>
                                  </div>
                                  
                                  {step.action && (
                                    <div className="action-details">
                                      <div className="action-main-line">
                                        <span className={`action-tag action-${step.action.actionType.toLowerCase()}`}>
                                          {step.action.actionType === 'BOIL' ? '🔥 Hervir' : '➕ Añadir'}
                                        </span>
                                        <span className="action-target">{step.action.target}</span>
                                      </div>
                                      
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

          {/* Tokens Visualizer Section (Shown if tokens are generated) */}
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
              
              <p className="tokens-intro">Secuencia resultante del análisis léxico (Lexer):</p>
              
              <div className="tokens-grid">
                {tokens.map((token, idx) => {
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
                      title={`Tipo: ${token.type}\nLínea: ${token.line}, Columna: ${token.column}`}
                    >
                      <div className="token-header">
                        <span className="token-type">{token.type}</span>
                        <span className="token-coord">{token.line}:{token.column}</span>
                      </div>
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
                  




