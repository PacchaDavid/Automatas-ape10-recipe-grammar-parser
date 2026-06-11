/**
 * Integration Test Suite for Recipe Parser CFG Backend compiler
 * Runs on Node.js using native global fetch.
 */

const BACKEND_URL = 'http://localhost:9090/api/compiler/analyze';

// 5 Success test cases
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

// 5 Error test cases
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

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
