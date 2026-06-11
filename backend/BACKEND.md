# Recipe Parser Backend - Documentación

## Descripción General

**Recipe Parser CFG** es un backend Spring Boot que implementa un compilador para un lenguaje específico de dominio (DSL) diseñado para analizar y procesar recetas de cocina. Utiliza un analizador léxico (Lexer) y sintáctico (Parser) para generar un árbol de sintaxis abstracta (AST) a partir de textos de recetas.

## Tecnologías

- **Java 21+** (compatible con Java 26)
- **Spring Boot 3.4.3**
- **Maven** para gestión de dependencias y construcción
- **Tomcat** (servidor embebido)

## Estructura del Proyecto

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/recipeparser/
│   │   │       ├── RecipeParserApplication.java    # Punto de entrada
│   │   │       ├── controller/
│   │   │       │   └── CompilerController.java     # Endpoints REST
│   │   │       ├── dto/
│   │   │       │   ├── AnalyzeRequest.java         # Estructura de entrada
│   │   │       │   └── AnalyzeResponse.java        # Estructura de salida
│   │   │       ├── lexer/
│   │   │       │   └── Lexer.java                  # Análisis léxico
│   │   │       ├── model/
│   │   │       │   ├── Token.java                  # Representación de tokens
│   │   │       │   ├── TokenType.java              # Tipos de tokens
│   │   │       │   ├── CompileError.java           # Errores de compilación
│   │   │       │   └── ast/
│   │   │       │       ├── RecipeNode.java         # Nodo raíz AST
│   │   │       │       ├── IngredientNode.java     # Nodo de ingrediente
│   │   │       │       ├── StepNode.java           # Nodo de paso
│   │   │       │       ├── ActionNode.java         # Nodo de acción
│   │   │       │       └── TimeNode.java           # Nodo de tiempo
│   │   │       └── parser/
│   │   │           ├── Parser.java                 # Análisis sintáctico
│   │   │           └── ParseException.java         # Excepciones del parser
│   │   └── resources/
│   │       └── application.yml                     # Configuración Spring
│   └── test/
└── pom.xml                                         # Configuración Maven

```

## Instalación y Ejecución

### Requisitos Previos

- **Java 21 o superior** (probado con Java 26)
- **Maven 3.6+**

### Pasos para Ejecutar

1. **Compilar el proyecto:**
   ```bash
   cd backend
   mvn clean install
   ```

2. **Ejecutar el servidor:**
   ```bash
   java -jar target/recipe-parser-cfg-1.0.0.jar
   ```

El servidor estará disponible en: **http://localhost:9090**

## API REST

### Endpoint: Analizar Receta

**Método:** `POST`  
**URL:** `/api/compiler/analyze`  
**Content-Type:** `application/json`

#### Request

```json
{
  "text": "string - Texto de la receta en DSL"
}
```

#### Response

```json
{
  "success": boolean,
  "tokens": [
    {
      "type": "string - Tipo de token",
      "lexeme": "string - Valor del token",
      "line": number,
      "column": number
    }
  ],
  "ast": {
    "type": "RECIPE",
    "ingredient": {...},
    "steps": [...]
  },
  "errors": [
    {
      "type": "string - LEXICO|SINTACTICO",
      "message": "string - Descripción del error",
      "line": number,
      "column": number
    }
  ]
}
```

## Sintaxis del Lenguaje DSL

El lenguaje de recetas utiliza palabras clave en **MAYÚSCULAS** y tiene la siguiente estructura:

### Palabras Clave Reservadas

| Palabra | Función |
|---------|---------|
| `INGREDIENT` | Declara un ingrediente |
| `STEP` | Declara un paso en la receta |
| `GRAMS` | Unidad de medida (gramos) |
| `OF` | Preposición para ingrediente |
| `BOIL` | Acción de hervir |
| `ADD` | Acción de añadir |
| `FOR` | Preposición para duración |
| `MINUTES` | Unidad de tiempo (minutos) |

### Estructura General

```
INGREDIENT: <cantidad> GRAMS OF <nombre>;
STEP <número>: <acción>;
STEP <número>: <acción>;
...
```

### Acciones Disponibles

1. **BOIL (Hervir):**
   ```
   STEP 1: BOIL <ingrediente> FOR <tiempo> MINUTES;
   ```

2. **ADD (Añadir):**
   ```
   STEP 2: ADD <ingrediente>;
   ```

## Ejemplo Completo

### Entrada (DSL)

```
INGREDIENT: 500 GRAMS OF flour;
STEP 1: BOIL water FOR 20 MINUTES;
STEP 2: ADD salt;
```

### Solicitud cURL

```bash
curl -X POST http://localhost:9090/api/compiler/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "INGREDIENT: 500 GRAMS OF flour;\nSTEP 1: BOIL water FOR 20 MINUTES;\nSTEP 2: ADD salt;"}'
```

### Respuesta Exitosa

```json
{
  "success": true,
  "tokens": [
    {
      "type": "INGREDIENT",
      "lexeme": "INGREDIENT",
      "line": 1,
      "column": 1
    },
    {
      "type": "COLON",
      "lexeme": ":",
      "line": 1,
      "column": 11
    },
    {
      "type": "NUMBER",
      "lexeme": "500",
      "line": 1,
      "column": 13
    },
    {
      "type": "GRAMS",
      "lexeme": "GRAMS",
      "line": 1,
      "column": 17
    },
    {
      "type": "OF",
      "lexeme": "OF",
      "line": 1,
      "column": 23
    },
    {
      "type": "WORD",
      "lexeme": "flour",
      "line": 1,
      "column": 26
    },
    {
      "type": "SEMICOLON",
      "lexeme": ";",
      "line": 1,
      "column": 31
    },
    {
      "type": "STEP",
      "lexeme": "STEP",
      "line": 2,
      "column": 1
    },
    {
      "type": "NUMBER",
      "lexeme": "1",
      "line": 2,
      "column": 6
    },
    {
      "type": "COLON",
      "lexeme": ":",
      "line": 2,
      "column": 7
    },
    {
      "type": "BOIL",
      "lexeme": "BOIL",
      "line": 2,
      "column": 9
    },
    {
      "type": "WORD",
      "lexeme": "water",
      "line": 2,
      "column": 14
    },
    {
      "type": "FOR",
      "lexeme": "FOR",
      "line": 2,
      "column": 20
    },
    {
      "type": "NUMBER",
      "lexeme": "20",
      "line": 2,
      "column": 24
    },
    {
      "type": "MINUTES",
      "lexeme": "MINUTES",
      "line": 2,
      "column": 27
    },
    {
      "type": "SEMICOLON",
      "lexeme": ";",
      "line": 2,
      "column": 34
    },
    {
      "type": "STEP",
      "lexeme": "STEP",
      "line": 3,
      "column": 1
    },
    {
      "type": "NUMBER",
      "lexeme": "2",
      "line": 3,
      "column": 6
    },
    {
      "type": "COLON",
      "lexeme": ":",
      "line": 3,
      "column": 7
    },
    {
      "type": "ADD",
      "lexeme": "ADD",
      "line": 3,
      "column": 9
    },
    {
      "type": "WORD",
      "lexeme": "salt",
      "line": 3,
      "column": 13
    },
    {
      "type": "SEMICOLON",
      "lexeme": ";",
      "line": 3,
      "column": 17
    },
    {
      "type": "EOF",
      "lexeme": "",
      "line": 3,
      "column": 18
    }
  ],
  "ast": {
    "type": "RECIPE",
    "ingredient": {
      "type": "INGREDIENT",
      "quantity": 500,
      "unit": "GRAMS",
      "name": "flour"
    },
    "steps": [
      {
        "type": "STEP",
        "number": 1,
        "action": {
          "type": "ACTION",
          "actionType": "BOIL",
          "target": "water",
          "time": {
            "type": "TIME",
            "duration": 20,
            "unit": "MINUTES"
          }
        }
      },
      {
        "type": "STEP",
        "number": 2,
        "action": {
          "type": "ACTION",
          "actionType": "ADD",
          "target": "salt",
          "time": null
        }
      }
    ]
  },
  "errors": []
}
```

## Manejo de Errores

### Error Léxico

Ocurre cuando el lexer encuentra un carácter no válido.

**Ejemplo:** Usar comas (no permitidas)
```json
{
  "type": "LEXICO",
  "message": "Caracter invalido: ','",
  "line": 1,
  "column": 26
}
```

### Error Sintáctico

Ocurre cuando el parser no puede construir un AST válido según la gramática.

**Ejemplo:** Palabras clave en minúsculas
```json
{
  "type": "SINTACTICO",
  "message": "Se esperaba INGREDIENT pero se encontro WORD ('ingredient')",
  "line": 1,
  "column": 1
}
```

## Componentes Principales

### Lexer (Análisis Léxico)

**Archivo:** [Lexer.java](src/main/java/com/recipeparser/lexer/Lexer.java)

El lexer realiza el análisis léxico del texto de entrada:
- Identifica números, palabras y símbolos
- Reconoce palabras clave reservadas
- Genera una lista de tokens
- Reporta errores léxicos (caracteres inválidos)

**Tokens Generados:**
- `INGREDIENT`, `STEP`, `GRAMS`, `OF`, `BOIL`, `ADD`, `FOR`, `MINUTES` (palabras clave)
- `NUMBER` (dígitos)
- `WORD` (identificadores)
- `COLON` (:), `SEMICOLON` (;)
- `ERROR` (caracteres no válidos)
- `EOF` (fin de archivo)

### Parser (Análisis Sintáctico)

**Archivo:** [Parser.java](src/main/java/com/recipeparser/parser/Parser.java)

El parser realiza el análisis sintáctico usando los tokens del lexer:
- Valida la estructura según la gramática definida
- Genera el Árbol de Sintaxis Abstracta (AST)
- Reporta errores sintácticos con posición exacta (línea y columna)

**Gramática:**
```
programa        → ingrediente paso+
ingrediente     → INGREDIENT : NUMBER GRAMS OF WORD ;
paso            → STEP NUMBER : accion ;
accion          → BOIL WORD tiempo | ADD WORD
tiempo          → FOR NUMBER MINUTES
```

### AST (Árbol de Sintaxis Abstracta)

**Archivos:** `src/main/java/com/recipeparser/model/ast/`

- **RecipeNode:** Nodo raíz (receta completa)
- **IngredientNode:** Nodo de ingrediente (cantidad, unidad, nombre)
- **StepNode:** Nodo de paso (número, acción)
- **ActionNode:** Nodo de acción (tipo, objetivo, tiempo)
- **TimeNode:** Nodo de tiempo (duración, unidad)

## Configuración

### Puerto del Servidor

Configurado en [application.yml](src/main/resources/application.yml):
```yaml
server:
  port: 9090
```

Para cambiar el puerto, edita este archivo antes de compilar.

## Ejemplos Adicionales

### Ejemplo 2: Receta de Pasta

```
INGREDIENT: 400 GRAMS OF pasta;
STEP 1: BOIL water FOR 10 MINUTES;
STEP 2: ADD pasta;
STEP 3: BOIL pasta FOR 8 MINUTES;
STEP 4: ADD salt;
```

### Ejemplo 3: Receta Simple

```
INGREDIENT: 100 GRAMS OF sugar;
STEP 1: ADD salt;
```

## Notas Importantes

1. **Palabras Clave:** Deben estar en MAYÚSCULAS (ej: `INGREDIENT`, `STEP`, no `ingredient`, `step`)
2. **Sintaxis Obligatoria:** Punto y coma (`;`) al final de cada sentencia
3. **Números:** Solo se aceptan números enteros positivos
4. **Palabras:** Identificadores sin espacios, solo letras
5. **Caracteres No Válidos:** Comas, puntos y otros caracteres causarán errores léxicos

## Solución de Problemas

| Problema | Causa | Solución |
|----------|-------|----------|
| `Port 9090 already in use` | Otro proceso en el puerto | Cambiar puerto en `application.yml` o matar el proceso |
| `Se esperaba INGREDIENT pero se encontro WORD` | Palabra clave en minúsculas | Usar mayúsculas: `INGREDIENT` no `ingredient` |
| `Caracter invalido: ','` | Caracteres no permitidos | No usar comas, usar únicamente caracteres permitidos |
| `Se esperaba WORD pero se encontro FOR` | Error sintáctico en estructura | Verificar formato: `BOIL <target> FOR <tiempo> MINUTES;` |

## Desarrollado Por

Recipe Parser CFG - Backend de compilador para lenguaje DSL de recetas

## Versión

1.0.0
