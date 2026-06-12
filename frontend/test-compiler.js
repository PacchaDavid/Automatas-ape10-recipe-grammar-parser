/* ==========================================================================
   test-compiler.js — Integration Test Suite for Recipe Parser CFG
   --------------------------------------------------------------------------
   Suite de pruebas de integración para el backend del compilador DSL.
   Ejecuta casos de prueba contra el endpoint REST del compilador.

   Casos de prueba:
     - 5 casos de ÉXITO: recetas sintácticamente válidas
     - 5 casos de ERROR: recetas con errores léxicos o sintácticos

   Cada caso tiene:
     - name:   nombre descriptivo del caso
     - text:   código DSL de entrada
     - assert: función validadora que verifica la respuesta del backend

   Uso:
     node test-compiler.js

   Requisitos:
     - Backend corriendo en http://localhost:9090
     - Node.js 18+ (con fetch global nativo)
   ========================================================================== */

/* URL base del backend (configurable si cambia el puerto) */
const BACKEND_URL = 'http://localhost:9090/api/compiler/analyze';

/* ========================================================================
   5 SUCCESS TEST CASES
   --------------------------------------------------------------------------
   Recetas sintácticamente válidas que deberían pasar la compilación.
   Cada caso prueba combinaciones específicas del DSL.
   ======================================================================== */
const SUCCESS_CASES = [
  {
    name: '1. Harina Básico',
    text: `INGREDIENT: 500 GRAMS OF flour;
STEP 1: BOIL water FOR 20 MINUTES;
STEP 2: ADD salt;`,
    assert: (res) => {
      if (!res.success) throw new Error('Debería ser exitoso');
      if (res.errors.length > 0) throw new Error('No debería contener errores');
      if (res.tokens.length !== 23) throw new Error(`Tokens esperados: 23, obtenidos: ${res.tokens.length}`);
      if (!res.ast) throw new Error('Falta el nodo AST');
      if (res.ast.ingredient.name !== 'flour') throw new Error('Nombre del ingrediente incorrecto');
    }
  },
  {
    name: '2. Pasta Completo',
    text: `INGREDIENT: 400 GRAMS OF pasta;
STEP 1: BOIL water FOR 10 MINUTES;
STEP 2: ADD pasta;
STEP 3: BOIL pasta FOR 8 MINUTES;
STEP 4: ADD salt;`,
    assert: (res) => {
      if (!res.success) throw new Error('Debería ser exitoso');
      if (res.errors.length > 0) throw new Error('No debería contener errores');
      if (!res.ast) throw new Error('Falta el nodo AST');
      if (res.ast.steps.length !== 4) throw new Error(`Pasos esperados: 4, obtenidos: ${res.ast.steps.length}`);
    }
  },
  {
    name: '3. Azúcar Simple',
    text: `INGREDIENT: 100 GRAMS OF sugar;
STEP 1: ADD salt;`,
    assert: (res) => {
      if (!res.success) throw new Error('Debería ser exitoso');
      if (res.ast.ingredient.quantity !== 100) throw new Error('Cantidad esperada: 100');
    }
  },
  {
    name: '4. Ensalada Rápida',
    text: `INGREDIENT: 200 GRAMS OF lettuce;
STEP 1: ADD lettuce;
STEP 2: ADD salt;`,
    assert: (res) => {
      if (!res.success) throw new Error('Debería ser exitoso');
      if (res.ast.steps[0].action.actionType !== 'ADD') throw new Error('El paso 1 debería ser ADD');
    }
  },
  {
    name: '5. Café con Azúcar',
    text: `INGREDIENT: 15 GRAMS OF sugar;
STEP 1: BOIL water FOR 5 MINUTES;
STEP 2: ADD coffee;
STEP 3: ADD sugar;`,
    assert: (res) => {
      if (!res.success) throw new Error('Debería ser exitoso');
      if (res.ast.steps[0].action.time.duration !== 5) throw new Error('Duración esperada: 5');
    }
  }
];

/* ========================================================================
   5 ERROR TEST CASES
   --------------------------------------------------------------------------
   Recetas con errores intencionales que deberían fallar la compilación.
   Cada caso prueba un tipo específico de error:
     - Léxico: caracteres inválidos (coma, guion)
     - Sintáctico: palabras clave en minúscula, falta punto y coma, acción inválida
   ======================================================================== */
const ERROR_CASES = [
  {
    name: '1. Carácter Inválido (Léxico - Coma)',
    text: `INGREDIENT: 500 GRAMS OF flour;
STEP 1: BOIL water FOR 20, MINUTES;`,
    assert: (res) => {
      if (res.success) throw new Error('Debería fallar');
      const err = res.errors.find(e => e.type === 'LEXICO');
      if (!err) throw new Error('Se esperaba un error LÉXICO');
      if (!err.message.includes('Caracter invalido')) throw new Error('Mensaje de error incorrecto');
    }
  },
  {
    name: '2. Número Negativo (Léxico - Guion)',
    text: `INGREDIENT: -500 GRAMS OF flour;`,
    assert: (res) => {
      if (res.success) throw new Error('Debería fallar');
      const err = res.errors.find(e => e.type === 'LEXICO');
      if (!err) throw new Error('Se esperaba un error LÉXICO para "-"');
    }
  },
  {
    name: '3. Minúsculas Reservadas (Sintáctico)',
    text: `ingredient: 500 grams of flour;
STEP 1: BOIL water FOR 20 MINUTES;`,
    assert: (res) => {
      if (res.success) throw new Error('Debería fallar');
      const err = res.errors.find(e => e.type === 'SINTACTICO');
      if (!err) throw new Error('Se esperaba un error SINTÁCTICO');
      if (!err.message.includes('Se esperaba INGREDIENT')) throw new Error('Mensaje de error incorrecto');
    }
  },
  {
    name: '4. Falta Punto y Coma (Sintáctico)',
    text: `INGREDIENT: 500 GRAMS OF flour
STEP 1: BOIL water FOR 20 MINUTES;`,
    assert: (res) => {
      if (res.success) throw new Error('Debería fallar');
      const err = res.errors.find(e => e.type === 'SINTACTICO');
      if (!err) throw new Error('Se esperaba un error SINTÁCTICO');
    }
  },
  {
    name: '5. Acción Inválida (Sintáctico - BAKE)',
    text: `INGREDIENT: 500 GRAMS OF flour;
STEP 1: BAKE flour FOR 30 MINUTES;`,
    assert: (res) => {
      if (res.success) throw new Error('Debería fallar');
      const err = res.errors.find(e => e.type === 'SINTACTICO');
      if (!err) throw new Error('Se esperaba un error SINTÁCTICO para BAKE');
    }
  }
];

/* ========================================================================
   runTests: Ejecuta todos los casos de prueba secuencialmente.
   --------------------------------------------------------------------------
   Flujo:
     1. Itera sobre SUCCESS_CASES y ejecuta cada uno
     2. Itera sobre ERROR_CASES y ejecuta cada uno
     3. Muestra resultados formateados con colores ANSI
     4. Si hay fallos, termina con exit code 1

   Formato de output:
     ✓ PASS: Nombre del caso (verde)
     ✗ FAIL: Nombre del caso (rojo)
     Total: X | Pasados: Y | Fallados: Z

   Nota: usa fetch nativo (Node 18+) sin axios ni librerías externas.
   ======================================================================== */
async function runTests() {
  console.log('\x1b[36m%s\x1b[0m', '=== INICIANDO PRUEBAS DE INTEGRACIÓN DEL COMPILADOR ===\n');
  let passed = 0;
  let failed = 0;

  console.log('\x1b[35m%s\x1b[0m', '--- CASOS DE ÉXITO ---');
  for (const tc of SUCCESS_CASES) {
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: tc.text })
      });
      const data = await response.json();
      tc.assert(data);
      console.log('\x1b[32m%s\x1b[0m', `  ✓ PASS: ${tc.name}`);
      passed++;
    } catch (err) {
      console.log('\x1b[31m%s\x1b[0m', `  ✗ FAIL: ${tc.name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  console.log('\n\x1b[35m%s\x1b[0m', '--- CASOS DE ERROR ---');
  for (const tc of ERROR_CASES) {
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: tc.text })
      });
      const data = await response.json();
      tc.assert(data);
      console.log('\x1b[32m%s\x1b[0m', `  ✓ PASS: ${tc.name}`);
      passed++;
    } catch (err) {
      console.log('\x1b[31m%s\x1b[0m', `  ✗ FAIL: ${tc.name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  console.log('\n\x1b[36m%s\x1b[0m', '====================================================');
  console.log(`TOTAL: ${passed + failed} | \x1b[32mPASADOS: ${passed}\x1b[0m | \x1b[31mFALLADOS: ${failed}\x1b[0m`);
  console.log('\x1b[36m%s\x1b[0m', '====================================================');

  /* Si hay fallos, exit code 1 para integración CI/CD */
  if (failed > 0) {
    process.exit(1);
  }
}

/* Punto de entrada: ejecuta las pruebas */
runTests();
