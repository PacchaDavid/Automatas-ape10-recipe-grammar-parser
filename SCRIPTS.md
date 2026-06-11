# Scripts de Ejecución - APE10-TA

Este directorio contiene scripts para gestionar fácilmente la ejecución del proyecto completo (Frontend + Backend).

## 📋 Contenido

- **run.sh** - Script principal para iniciar, detener, monitorear y apagar servicios
- **shutdown.sh** - Wrapper de compatibilidad que delega en `run.sh shutdown`

## 🚀 Inicio Rápido

### Iniciar el proyecto (Frontend + Backend)

```bash
./run.sh
```

o simplemente:

```bash
./run.sh start
```

Esto ejecutará automáticamente:
1. Compilación del Backend (Spring Boot)
2. Ejecución del Backend en `http://localhost:8080`
3. Instalación de dependencias del Frontend (si es necesario)
4. Ejecución del Frontend en `http://localhost:5173`

### Detener todos los servicios

**Opción 1:** Presiona `Ctrl+C` durante la ejecución del script

**Opción 2:** En otra terminal ejecuta:

```bash
./run.sh stop
```

### Ver estado de los servicios

```bash
./run.sh status
```

## 🛑 Shutdown Completo

Para detener todos los procesos, limpiar logs y opcionalmente eliminar dependencias:

```bash
./run.sh shutdown
```

El script te preguntará si deseas limpiar:
- `node_modules` (Frontend)
- `target` (Backend)

Si quieres hacerlo sin confirmación:

```bash
./run.sh shutdown --clean
```

El wrapper `./shutdown.sh` sigue funcionando y ejecuta lo mismo.

## 📊 Acceso a la Aplicación

Una vez iniciado el proyecto, accede a:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080

## 📝 Logs

Los logs se guardan en:
- Backend: `backend.log`
- Frontend: `frontend.log`

## ⚙️ Requisitos

- Java 21+
- Maven
- Node.js (v18+)
- npm

## 🔧 Funcionalidades

### run.sh

| Comando | Descripción |
|---------|-------------|
| `./run.sh` o `./run.sh start` | Inicia Backend y Frontend |
| `./run.sh stop` | Detiene todos los servicios |
| `./run.sh status` | Muestra el estado actual |
| `./run.sh shutdown` | Detiene todo, limpia logs y pregunta por dependencias |
| `./run.sh shutdown --clean` | Detiene todo y limpia también `node_modules` y `target` |

### shutdown.sh

- Wrapper de compatibilidad para `run.sh shutdown`

## 💡 Tips

### Si el Backend no inicia
Verifica los logs:
```bash
tail -f backend.log
```

### Si el Frontend no funciona
Verifica que no haya otro proceso usando el puerto 5173:
```bash
lsof -i :5173
```

### Limpieza manual
Si necesitas hacer limpieza manual sin questions:
```bash
./run.sh shutdown --clean
```

## 📌 Notas

- Los scripts preservan los PIDs de los procesos para mejor control
- El Backend se espera 10 segundos después de iniciarse antes de lanzar el Frontend
- Se muestran URLs de acceso directamente en la terminal
- Los procesos se pueden detener en cualquier momento con `Ctrl+C`
