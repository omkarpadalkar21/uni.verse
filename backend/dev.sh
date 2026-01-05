#!/bin/bash

# UniVerse Development Helper Script
# This script simplifies the development workflow

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to build the JAR
build_jar() {
    print_info "Building JAR with Maven..."
    mvn clean package -DskipTests
    
    if [ $? -eq 0 ]; then
        print_success "JAR built successfully!"
        ls -lh target/*.jar
    else
        print_error "Maven build failed!"
        exit 1
    fi
}

# Function to start services
start_services() {
    print_info "Starting services with docker-compose.dev.yml..."
    docker compose -f docker-compose.dev.yml up -d
    
    if [ $? -eq 0 ]; then
        print_success "Services started!"
        print_info "View logs with: ./dev.sh logs"
    else
        print_error "Failed to start services!"
        exit 1
    fi
}

# Function to restart the app
restart_app() {
    print_info "Restarting universe-app..."
    docker compose -f docker-compose.dev.yml restart universe-app
    
    if [ $? -eq 0 ]; then
        print_success "App restarted!"
    else
        print_error "Failed to restart app!"
        exit 1
    fi
}

# Function to rebuild and restart
rebuild() {
    build_jar
    restart_app
    print_success "Rebuild complete! App is restarting..."
}

# Function to show logs
show_logs() {
    if [ -z "$1" ]; then
        docker compose -f docker-compose.dev.yml logs -f
    else
        docker compose -f docker-compose.dev.yml logs -f "$1"
    fi
}

# Function to stop services
stop_services() {
    print_info "Stopping services..."
    docker compose -f docker-compose.dev.yml down
    print_success "Services stopped!"
}

# Function to clean everything
clean_all() {
    print_warning "This will remove all containers, volumes, and the built JAR!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        docker compose -f docker-compose.dev.yml down -v
        mvn clean
        print_success "Cleanup complete!"
    else
        print_info "Cleanup cancelled."
    fi
}

# Function to show status
show_status() {
    print_info "Service Status:"
    docker compose -f docker-compose.dev.yml ps
}

# Function to show help
show_help() {
    echo -e "${BLUE}UniVerse Development Helper${NC}"
    echo ""
    echo -e "${GREEN}Usage:${NC}"
    echo "  ./dev.sh [command]"
    echo ""
    echo -e "${GREEN}Commands:${NC}"
    echo -e "  ${YELLOW}build${NC}       Build the JAR file with Maven"
    echo -e "  ${YELLOW}start${NC}       Start all services (postgres, redis, app)"
    echo -e "  ${YELLOW}stop${NC}        Stop all services"
    echo -e "  ${YELLOW}restart${NC}     Restart the app container only"
    echo -e "  ${YELLOW}rebuild${NC}     Build JAR + restart app (use after code changes)"
    echo -e "  ${YELLOW}logs${NC}        Show logs (add service name for specific logs)"
    echo -e "  ${YELLOW}status${NC}      Show status of all services"
    echo -e "  ${YELLOW}clean${NC}       Stop services and remove volumes"
    echo -e "  ${YELLOW}help${NC}        Show this help message"
    echo ""
    echo -e "${GREEN}Examples:${NC}"
    echo "  ./dev.sh rebuild              # After making code changes"
    echo "  ./dev.sh logs universe-app    # View app logs only"
    echo "  ./dev.sh logs postgres        # View postgres logs only"
    echo ""
    echo -e "${GREEN}Quick Start:${NC}"
    echo "  1. ./dev.sh build             # Build JAR"
    echo "  2. ./dev.sh start             # Start all services"
    echo "  3. Make code changes..."
    echo "  4. ./dev.sh rebuild           # Rebuild and restart"
    echo ""
    echo -e "${BLUE}Tip:${NC} Keep logs open in another terminal with: ./dev.sh logs"
}

# Main script logic
case "$1" in
    build)
        build_jar
        ;;
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_app
        ;;
    rebuild)
        rebuild
        ;;
    logs)
        show_logs "$2"
        ;;
    status)
        show_status
        ;;
    clean)
        clean_all
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
