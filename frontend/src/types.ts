/* ==========================================================================
   types.ts — Type Definitions for Recipe DSL Compiler
   --------------------------------------------------------------------------
   Define todos los tipos y estructuras de datos compartidos entre
   el frontend y el backend del compilador de recetas.

   Dominio:
     El DSL (Domain-Specific Language) de recetas culinarias permite
     escribir instrucciones de cocina estructuradas que el backend
     analiza léxicamente, sintácticamente y construye un AST.

   Categorías de tipos:
     1. TokenType & Token        → Salida del analizador léxico (Lexer)
     2. CompileError             → Errores del proceso de compilación
     3. Nodos AST                → Árbol de sintaxis abstracta
        - TimeNode, ActionNode, StepNode, IngredientNode, RecipeNode
     4. AnalyzeResponse          → Contrato de respuesta de la API
   ========================================================================== */

// ---------------------------------------------------------------------------
// TokenType: union type de todos los tokens reconocibles por el Lexer.
// Cada token representa una unidad léxica atómica del lenguaje:
//   - Palabras reservadas: INGREDIENT, STEP, GRAMS, OF, BOIL, ADD, FOR, MINUTES
//   - Valores: NUMBER (enteros), WORD (identificadores/strings)
//   - Separadores: COLON (:), SEMICOLON (;)
//   - Especiales: EOF (fin de archivo), ERROR (token inválido)
// ---------------------------------------------------------------------------
export type TokenType =
  | 'INGREDIENT'
  | 'STEP'
  | 'GRAMS'
  | 'OF'
  | 'BOIL'
  | 'ADD'
  | 'FOR'
  | 'MINUTES'
  | 'NUMBER'
  | 'WORD'
  | 'COLON'
  | 'SEMICOLON'
  | 'EOF'
  | 'ERROR';

// ---------------------------------------------------------------------------
// Token: representa un token individual producido por el analizador léxico.
//   - type:   categoría del token (TokenType)
//   - lexeme: cadena de texto original capturada del código fuente
//   - line:   número de línea (1-indexed) donde aparece el token
//   - column: número de columna (1-indexed) donde comienza el token
// ---------------------------------------------------------------------------
export interface Token {
  type: TokenType;
  lexeme: string;
  line: number;
  column: number;
}

// ---------------------------------------------------------------------------
// CompileError: error de compilación, ya sea léxico o sintáctico.
//   - type:    'LEXICO' para errores del lexer (carácter inválido)
//             'SINTACTICO' para errores del parser (gramática incorrecta)
//   - message: descripción legible del error
//   - line:    línea donde ocurrió el error
//   - column:  columna donde ocurrió el error
// ---------------------------------------------------------------------------
export interface CompileError {
  type: 'LEXICO' | 'SINTACTICO';
  message: string;
  line: number;
  column: number;
}

// ---------------------------------------------------------------------------
// TimeNode: nodo AST que representa una duración temporal.
//   - duration: valor numérico (ej: 20 en "FOR 20 MINUTES")
//   - unit:     unidad de tiempo (ej: "MINUTES")
// ---------------------------------------------------------------------------
export interface TimeNode {
  type: 'TIME';
  duration: number;
  unit: string;
}

// ---------------------------------------------------------------------------
// ActionNode: nodo AST que representa una acción culinaria.
//   - actionType: 'BOIL' (hervir) o 'ADD' (añadir)
//   - target:     ingrediente o sustancia sobre la que se actúa
//   - time:       duración opcional (BOIL requiere tiempo, ADD no)
// ---------------------------------------------------------------------------
export interface ActionNode {
  type: 'ACTION';
  actionType: 'BOIL' | 'ADD';
  target: string;
  time: TimeNode | null;
}

// ---------------------------------------------------------------------------
// StepNode: nodo AST que representa un paso numerado en la receta.
//   - number: número de paso (1, 2, 3...)
//   - action: acción a ejecutar en este paso
// ---------------------------------------------------------------------------
export interface StepNode {
  type: 'STEP';
  number: number;
  action: ActionNode;
}

// ---------------------------------------------------------------------------
// IngredientNode: nodo AST que representa el ingrediente principal.
//   - quantity: cantidad (ej: 500)
//   - unit:     unidad de medida (ej: "GRAMS")
//   - name:     nombre del ingrediente (ej: "flour")
// ---------------------------------------------------------------------------
export interface IngredientNode {
  type: 'INGREDIENT';
  quantity: number;
  unit: string;
  name: string;
}

// ---------------------------------------------------------------------------
// RecipeNode: nodo raíz del AST que contiene la receta completa.
//   - ingredient: el ingrediente principal declarado con INGREDIENT:
//   - steps:      array ordenado de pasos (STEP 1, STEP 2, ...)
// ---------------------------------------------------------------------------
export interface RecipeNode {
  type: 'RECIPE';
  ingredient: IngredientNode;
  steps: StepNode[];
}

// ---------------------------------------------------------------------------
// AnalyzeResponse: contrato de respuesta del endpoint /api/compiler/analyze.
//   - success: true si el análisis fue exitoso (sin errores críticos)
//   - tokens:  lista completa de tokens generada por el lexer
//   - ast:     árbol sintáctico (null si hay errores que lo impiden)
//   - errors:  array de errores de compilación (vacío si success es true)
// ---------------------------------------------------------------------------
export interface AnalyzeResponse {
  success: boolean;
  tokens: Token[];
  ast: RecipeNode | null;
  errors: CompileError[];
}
