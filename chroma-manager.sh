#!/bin/bash

# ChromaDB Management Script for AST Coaching System
# Manages ChromaDB v2.x container lifecycle

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="chromadb"
IMAGE_NAME="chromadb/chroma:latest"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[ChromaDB]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check container status
check_container_status() {
    if docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}" | grep -q "${CONTAINER_NAME}"; then
        return 0  # Container is running
    else
        return 1  # Container is not running
    fi
}

# Function to wait for ChromaDB to be ready
wait_for_chroma() {
    print_status "Waiting for ChromaDB to be ready..."
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:8000/api/v1/heartbeat >/dev/null 2>&1; then
            print_success "ChromaDB is ready!"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - waiting for ChromaDB..."
        sleep 2
        ((attempt++))
    done
    
    print_error "ChromaDB failed to start within timeout period"
    return 1
}

# Function to start ChromaDB
start_chroma() {
    print_status "Starting ChromaDB container..."
    
    if check_container_status; then
        print_warning "ChromaDB container is already running"
        return 0
    fi
    
    # Remove existing container if it exists but is stopped
    if docker ps -a --filter "name=${CONTAINER_NAME}" --format "{{.Names}}" | grep -q "${CONTAINER_NAME}"; then
        print_status "Removing existing stopped container..."
        docker rm -f "${CONTAINER_NAME}" 2>/dev/null || true
    fi
    
    # Start with docker-compose if file exists, otherwise use docker run
    if [ -f "${DOCKER_COMPOSE_FILE}" ]; then
        print_status "Starting with docker-compose..."
        docker-compose up -d chroma-coaching
    else
        print_status "Starting with docker run..."
        docker run -d \
            --name "${CONTAINER_NAME}" \
            -p 8000:8000 \
            -e CHROMA_HOST=0.0.0.0 \
            -e CHROMA_PORT=8000 \
            -e CHROMA_LOG_LEVEL=INFO \
            -e ALLOW_RESET=TRUE \
            -e ANONYMIZED_TELEMETRY=FALSE \
            -v chroma_data:/chroma/chroma \
            --restart unless-stopped \
            "${IMAGE_NAME}"
    fi
    
    # Wait for container to be ready
    if wait_for_chroma; then
        print_success "ChromaDB started successfully!"
        show_status
    else
        print_error "Failed to start ChromaDB"
        docker logs "${CONTAINER_NAME}" --tail 20
        exit 1
    fi
}

# Function to stop ChromaDB
stop_chroma() {
    print_status "Stopping ChromaDB container..."
    
    if ! check_container_status; then
        print_warning "ChromaDB container is not running"
        return 0
    fi
    
    if [ -f "${DOCKER_COMPOSE_FILE}" ]; then
        docker-compose stop chroma-coaching
    else
        docker stop "${CONTAINER_NAME}"
    fi
    
    print_success "ChromaDB stopped successfully!"
}

# Function to restart ChromaDB
restart_chroma() {
    print_status "Restarting ChromaDB container..."
    stop_chroma
    sleep 2
    start_chroma
}

# Function to show container status
show_status() {
    print_status "ChromaDB Container Status:"
    
    if check_container_status; then
        echo "🟢 Container: Running"
        echo "🌐 API Endpoint: http://localhost:8000"
        echo "📊 Health Check: http://localhost:8000/api/v1/heartbeat"
        
        # Test API connectivity
        if curl -f http://localhost:8000/api/v1/heartbeat >/dev/null 2>&1; then
            echo "✅ API: Responding"
            
            # Get version info
            VERSION=$(curl -s http://localhost:8000/api/v1/version 2>/dev/null | jq -r '.version' 2>/dev/null || echo "unknown")
            echo "📋 Version: $VERSION"
        else
            echo "❌ API: Not responding"
        fi
    else
        echo "🔴 Container: Not running"
    fi
}

# Function to show logs
show_logs() {
    print_status "ChromaDB Container Logs:"
    docker logs "${CONTAINER_NAME}" --tail 50 -f
}

# Function to initialize ChromaDB collections
init_collections() {
    print_status "Initializing ChromaDB collections..."
    
    if ! check_container_status; then
        print_error "ChromaDB container is not running. Start it first."
        exit 1
    fi
    
    # Use the Node.js test script to initialize collections
    if [ -f "test-vector-db.ts" ]; then
        npx tsx test-vector-db.ts
    else
        print_warning "test-vector-db.ts not found. You'll need to initialize collections manually."
    fi
}

# Function to reset ChromaDB (delete all data)
reset_chroma() {
    print_warning "This will DELETE ALL ChromaDB data. Are you sure? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_status "Resetting ChromaDB..."
        
        # Stop container
        stop_chroma
        
        # Remove volume
        docker volume rm chroma_data 2>/dev/null || true
        
        # Start container
        start_chroma
        
        print_success "ChromaDB reset completed!"
    else
        print_status "Reset cancelled."
    fi
}

# Function to update ChromaDB image
update_chroma() {
    print_status "Updating ChromaDB image..."
    
    # Pull latest image
    docker pull "${IMAGE_NAME}"
    
    # Restart with new image
    restart_chroma
    
    print_success "ChromaDB updated successfully!"
}

# Main script logic
case "${1:-status}" in
    start)
        check_docker
        start_chroma
        ;;
    stop)
        check_docker
        stop_chroma
        ;;
    restart)
        check_docker
        restart_chroma
        ;;
    status)
        check_docker
        show_status
        ;;
    logs)
        check_docker
        show_logs
        ;;
    init)
        check_docker
        init_collections
        ;;
    reset)
        check_docker
        reset_chroma
        ;;
    update)
        check_docker
        update_chroma
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|init|reset|update}"
        echo ""
        echo "Commands:"
        echo "  start    - Start ChromaDB container"
        echo "  stop     - Stop ChromaDB container" 
        echo "  restart  - Restart ChromaDB container"
        echo "  status   - Show container status and health"
        echo "  logs     - Show container logs (follow mode)"
        echo "  init     - Initialize ChromaDB collections"
        echo "  reset    - Reset ChromaDB (DELETE ALL DATA)"
        echo "  update   - Update ChromaDB to latest image"
        exit 1
        ;;
esac
