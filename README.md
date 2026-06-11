# Automatas-ape10-recipe-grammar-parser

Un parser de gramática para analizar recetas de cocina usando autómatas finitos y análisis léxico/sintáctico.

## 📖 Descripción del Proyecto

Automatas-ape10-recipe-grammar-parser es una aplicación full-stack que implementa un analizador léxico y sintáctico (lexer y parser) para procesar texto de recetas de cocina. El proyecto utiliza:

- **Backend**: Spring Boot (Java 21) para la API REST y lógica de compilación
- **Frontend**: React con TypeScript, Vite y Tailwind CSS para la interfaz de usuario
- **Parser**: Análisis léxico y sintáctico personalizado para validar y procesar recetas

### 🎯 Funcionalidades Principales

- Análisis léxico de texto de recetas
- Análisis sintáctico y generación de AST (Abstract Syntax Tree)
- Detección y reportes de errores de compilación
- Interfaz web interactiva para pruebas
- API REST para integración

## 🏗️ Estructura del Proyecto

```
├── backend/              # Aplicación Spring Boot
│   ├── src/             # Código fuente Java
│   │   ├── controller/  # Endpoints REST
│   │   ├── lexer/       # Análisis léxico
│   │   ├── parser/      # Análisis sintáctico
│   │   ├── model/       # Modelos de datos y AST
│   │   └── dto/         # Data Transfer Objects
│   └── pom.xml          # Dependencias Maven
│
└── frontend/             # Aplicación React/TypeScript
    ├── src/             # Código fuente TypeScript/React
    ├── public/          # Assets estáticos
    └── package.json     # Dependencias npm
```

## 🚀 Inicio Rápido

Para ejecutar el proyecto completo (Frontend + Backend), consulta [SCRIPTS.md](SCRIPTS.md) para obtener instrucciones detalladas.

**Resumen rápido:**

```bash
# Iniciar ambos servicios
./run.sh
```

Esto ejecutará automáticamente:
1. Backend en `http://localhost:8080`
2. Frontend en `http://localhost:5173`

## 📚 Documentación Adicional

- [SCRIPTS.md](SCRIPTS.md) - Guía completa de scripts de ejecución y gestión del proyecto
- [backend/BACKEND.md](backend/BACKEND.md) - Documentación del backend
- [frontend/README.md](frontend/README.md) - Documentación del frontend

## ⚙️ Requisitos

- Java 21+
- Maven
- Node.js (v18+)
- npm
- bash/sh
