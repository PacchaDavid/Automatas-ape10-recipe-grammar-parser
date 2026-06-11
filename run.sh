#!/bin/bash

# Script para ejecutar y gestionar el proyecto APE10-TA
# Uso: ./run.sh [start|stop|status|shutdown] [--clean] [--no-clean]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Archivo para guardar PIDs
PID_FILE="/tmp/ape10-ta-pids.txt"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Funciones de utilidad
print_header() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Limpiar PIDs antiguos
cleanup_pids() {
    if [ -f "$PID_FILE" ]; then
        rm "$PID_FILE"
    fi
}

# Guardar PID
save_pid() {
    echo "$1:$2" >> "$PID_FILE"
}

# Obtener PID
get_pid() {
    if [ -f "$PID_FILE" ]; then
        grep "^$1:" "$PID_FILE" | cut -d':' -f2
    fi
}

# Iniciar Backend
start_backend() {
    print_info "Iniciando Backend (Spring Boot)..."
    
    cd "$BACKEND_DIR"
    
    # Compilar y ejecutar
    mvn clean install -q && \
    mvn spring-boot:run > "$PROJECT_DIR/backend.log" 2>&1 &
    
    local BACKEND_PID=$!
    save_pid "backend" "$BACKEND_PID"
    
    print_success "Backend iniciado (PID: $BACKEND_PID)"
    
    # Esperar a que el backend esté listo
    print_info "Esperando a que el Backend esté listo..."
    sleep 10
}

# Iniciar Frontend
start_frontend() {
    print_info "Iniciando Frontend (Vite + React)..."
    
    cd "$FRONTEND_DIR"
    
    # Instalar dependencias si no existen
    if [ ! -d "node_modules" ]; then
        print_info "Instalando dependencias del Frontend..."
        npm install -q
    fi
    
    # Ejecutar dev server
    npm run dev > "$PROJECT_DIR/frontend.log" 2>&1 &
    
    local FRONTEND_PID=$!
    save_pid "frontend" "$FRONTEND_PID"
    
    print_success "Frontend iniciado (PID: $FRONTEND_PID)"
}

# Detener procesos
stop_all() {
    print_info "Deteniendo servicios..."
    
    if [ ! -f "$PID_FILE" ]; then
        print_error "No se encontraron procesos activos"
        return 1
    fi
    
    while IFS=':' read -r service pid; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null || true
            print_success "Detenido $service (PID: $pid)"
        fi
    done < "$PID_FILE"
    
    cleanup_pids
    print_success "Todos los servicios han sido detenidos"
}

# Mostrar estado
show_status() {
    echo ""
    print_header "Estado del Proyecto"
    
    if [ ! -f "$PID_FILE" ]; then
        print_error "No hay procesos en ejecución"
        echo ""
        return 1
    fi
    
    local all_running=true
    
    while IFS=':' read -r service pid; do
        if kill -0 "$pid" 2>/dev/null; then
            print_success "$service (PID: $pid) - EN EJECUCIÓN"
        else
            print_error "$service (PID: $pid) - NO EN EJECUCIÓN"
            all_running=false
        fi
    done < "$PID_FILE"
    
    echo ""
    
    if [ "$all_running" = true ]; then
        echo -e "${GREEN}Acceso a la aplicación:${NC}"
        echo -e "  Frontend: ${BLUE}http://localhost:5173${NC}"
        echo -e "  Backend:  ${BLUE}http://localhost:8080${NC}"
        echo ""
    fi
}

# Limpiar logs y artefactos residuales
cleanup_artifacts() {
    print_info "Limpiando logs..."

    if [ -f "$PROJECT_DIR/backend.log" ]; then
        rm "$PROJECT_DIR/backend.log"
        print_success "Eliminado: backend.log"
    fi

    if [ -f "$PROJECT_DIR/frontend.log" ]; then
        rm "$PROJECT_DIR/frontend.log"
        print_success "Eliminado: frontend.log"
    fi

    print_info "Limpiando procesos residuales..."
    pkill -f "spring-boot:run" 2>/dev/null || true
    pkill -f "mvn spring-boot:run" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
}

# Limpiar dependencias del proyecto
cleanup_dependencies() {
    print_info "Limpiando dependencias..."

    if [ -d "$PROJECT_DIR/frontend/node_modules" ]; then
        rm -rf "$PROJECT_DIR/frontend/node_modules"
        print_success "Limpiado: frontend/node_modules"
    fi

    if [ -d "$PROJECT_DIR/backend/target" ]; then
        rm -rf "$PROJECT_DIR/backend/target"
        print_success "Limpiado: backend/target"
    fi
}

# Confirmar limpieza opcional
confirm_cleanup() {
    local answer
    read -r -p "¿Deseas limpiar las dependencias? (y/n): " answer

    case "$answer" in
        [Yy]|[Yy][Ee][Ss])
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Handler para Ctrl+C
trap_handler() {
    echo ""
    print_info "Interceptado Ctrl+C..."
    stop_all
    exit 0
}

# Configurar trap
trap trap_handler SIGINT SIGTERM

# Main
main() {
    local command="start"
    local clean_mode="prompt"

    while [ $# -gt 0 ]; do
        case "$1" in
            start|stop|status|shutdown)
                command="$1"
                ;;
            --clean|-c|--yes|-y)
                clean_mode="yes"
                ;;
            --no-clean)
                clean_mode="no"
                ;;
            -h|--help)
                echo "Uso: $0 [start|stop|status|shutdown] [--clean] [--no-clean]"
                echo ""
                echo "Comandos:"
                echo "  start      - Inicia Backend y Frontend (por defecto)"
                echo "  stop       - Detiene todos los servicios"
                echo "  status     - Muestra el estado de los servicios"
                echo "  shutdown   - Detiene todo y limpia logs y procesos residuales"
                echo ""
                echo "Opciones para shutdown:"
                echo "  --clean    - Elimina node_modules y backend/target sin preguntar"
                echo "  --no-clean - Omite la limpieza de dependencias"
                exit 0
                ;;
            *)
                print_error "Argumento desconocido: $1"
                echo "Usa --help para ver las opciones disponibles"
                exit 1
                ;;
        esac

        shift
    done
    
    case "$command" in
        start)
            cleanup_pids
            print_header "Iniciando Proyecto APE10-TA"
            echo ""
            
            start_backend
            echo ""
            start_frontend
            echo ""
            
            show_status
            
            print_info "Presiona Ctrl+C para detener todos los servicios"
            
            # Mantener el script activo
            while true; do
                sleep 1
            done
            ;;
        
        stop)
            stop_all
            ;;

        shutdown)
            stop_all || true
            cleanup_artifacts

            if [ "$clean_mode" = "yes" ]; then
                cleanup_dependencies
            elif [ "$clean_mode" = "prompt" ]; then
                if confirm_cleanup; then
                    cleanup_dependencies
                fi
            fi

            print_header "¡Shutdown completado!"
            echo ""
            ;;
        
        status)
            show_status
            ;;
        
        *)
            echo "Uso: $0 [start|stop|status|shutdown] [--clean] [--no-clean]"
            echo ""
            echo "Comandos:"
            echo "  start   - Inicia Backend y Frontend (por defecto)"
            echo "  stop    - Detiene todos los servicios"
            echo "  status  - Muestra el estado de los servicios"
            echo "  shutdown - Detiene todo y limpia logs y procesos residuales"
            echo ""
            exit 1
            ;;
    esac
}

main "$@"
