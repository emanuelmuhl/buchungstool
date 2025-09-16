#!/bin/bash

# Rustico Buchungstool Deployment Script
# Für Raspberry Pi Docker Deployment

set -e

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktionen
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Prüfe ob Docker installiert ist
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker ist nicht installiert!"
        log_info "Installieren Sie Docker mit: curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose ist nicht installiert!"
        log_info "Installieren Sie Docker Compose mit: sudo apt install docker-compose-plugin -y"
        exit 1
    fi
    
    log_success "Docker und Docker Compose sind installiert"
}

# Prüfe .env Datei
check_env() {
    if [ ! -f .env ]; then
        log_warning ".env Datei nicht gefunden. Erstelle Standard-Konfiguration..."
        cat > .env << EOF
# Datenbank
DB_USERNAME=rustico_user
DB_PASSWORD=rustico_password_$(date +%s)
DB_DATABASE=rustico_buchungstool

# JWT Secret
JWT_SECRET=rustico-jwt-secret-$(date +%s)

# Domain (optional)
DOMAIN=localhost
EOF
        log_success ".env Datei erstellt"
    else
        log_success ".env Datei gefunden"
    fi
}

# Backup erstellen
create_backup() {
    if [ -d "backups" ]; then
        log_info "Erstelle Backup..."
        BACKUP_FILE="backups/backup_$(date +%Y%m%d_%H%M%S).tar.gz"
        mkdir -p backups
        tar -czf "$BACKUP_FILE" uploads/ database/ .env 2>/dev/null || true
        log_success "Backup erstellt: $BACKUP_FILE"
    fi
}

# Container stoppen
stop_containers() {
    log_info "Stoppe Container..."
    docker-compose down 2>/dev/null || true
    log_success "Container gestoppt"
}

# Container bauen
build_containers() {
    log_info "Baue Container..."
    docker-compose build --no-cache
    log_success "Container gebaut"
}

# Container starten
start_containers() {
    log_info "Starte Container..."
    docker-compose up -d
    log_success "Container gestartet"
}

# Health Check
health_check() {
    log_info "Führe Health Check durch..."
    
    # Warte auf Container
    sleep 10
    
    # Prüfe PostgreSQL
    if docker-compose exec -T postgres pg_isready -U rustico_user >/dev/null 2>&1; then
        log_success "PostgreSQL ist bereit"
    else
        log_error "PostgreSQL ist nicht bereit"
        return 1
    fi
    
    # Prüfe Backend
    if curl -f http://localhost:3101/health >/dev/null 2>&1; then
        log_success "Backend ist bereit"
    else
        log_error "Backend ist nicht bereit"
        return 1
    fi
    
    # Prüfe Frontend
    if curl -f http://localhost >/dev/null 2>&1; then
        log_success "Frontend ist bereit"
    else
        log_error "Frontend ist nicht bereit"
        return 1
    fi
    
    log_success "Alle Services sind bereit!"
}

# Status anzeigen
show_status() {
    log_info "Container Status:"
    docker-compose ps
    
    log_info "System Ressourcen:"
    docker stats --no-stream
    
    log_info "Zugriff:"
    echo -e "  Frontend: ${GREEN}http://$(hostname -I | awk '{print $1}')${NC}"
    echo -e "  Backend:  ${GREEN}http://$(hostname -I | awk '{print $1}'):3101${NC}"
    echo -e "  Anmeldedaten: ${YELLOW}admin / admin123${NC}"
}

# Logs anzeigen
show_logs() {
    log_info "Container Logs:"
    docker-compose logs --tail=50
}

# Cleanup
cleanup() {
    log_info "Bereinige alte Images..."
    docker image prune -f
    log_success "Cleanup abgeschlossen"
}

# Hauptfunktion
main() {
    echo "🏔️ Rustico Buchungstool Deployment"
    echo "=================================="
    
    # Prüfungen
    check_docker
    check_env
    
    # Backup
    create_backup
    
    # Deployment
    stop_containers
    build_containers
    start_containers
    
    # Health Check
    if health_check; then
        log_success "Deployment erfolgreich!"
        show_status
    else
        log_error "Deployment fehlgeschlagen!"
        show_logs
        exit 1
    fi
    
    # Cleanup
    cleanup
    
    echo ""
    log_success "Rustico Buchungstool ist bereit!"
}

# Script ausführen
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "stop")
        stop_containers
        ;;
    "start")
        start_containers
        ;;
    "restart")
        stop_containers
        start_containers
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "backup")
        create_backup
        ;;
    "update")
        log_info "Update gestartet..."
        git pull
        main
        ;;
    *)
        echo "Verwendung: $0 {deploy|stop|start|restart|logs|status|backup|update}"
        echo ""
        echo "  deploy  - Vollständiges Deployment (Standard)"
        echo "  stop    - Container stoppen"
        echo "  start   - Container starten"
        echo "  restart - Container neu starten"
        echo "  logs    - Logs anzeigen"
        echo "  status  - Status anzeigen"
        echo "  backup  - Backup erstellen"
        echo "  update  - Code aktualisieren und neu deployen"
        exit 1
        ;;
esac 