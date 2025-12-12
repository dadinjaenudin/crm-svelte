#!/bin/bash

# =============================================================================
# CRM Application - Quick Setup Script
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   CRM Application - Setup Script      ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
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

check_docker() {
    print_step "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        echo ""
        echo "Please install Docker:"
        echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
        echo "  sudo sh get-docker.sh"
        exit 1
    fi
    print_success "Docker is installed: $(docker --version)"
}

check_docker_compose() {
    print_step "Checking Docker Compose installation..."
    if ! command -v docker compose &> /dev/null; then
        print_error "Docker Compose is not installed!"
        echo ""
        echo "Please install Docker Compose:"
        echo "  sudo apt-get install docker-compose-plugin"
        exit 1
    fi
    print_success "Docker Compose is installed: $(docker compose version)"
}

create_env_file() {
    print_step "Creating environment file..."
    if [ -f .env ]; then
        print_warning ".env file already exists, skipping..."
    else
        cp .env.docker .env
        print_success ".env file created from template"
        print_warning "⚠️  IMPORTANT: Edit .env and change default passwords!"
    fi
}

generate_passwords() {
    print_step "Generating secure passwords..."
    
    if command -v openssl &> /dev/null; then
        POSTGRES_PASS=$(openssl rand -base64 32)
        REDIS_PASS=$(openssl rand -base64 32)
        JWT_SECRET=$(openssl rand -base64 64)
        
        echo ""
        print_success "Generated passwords (save these securely!):"
        echo ""
        echo -e "${YELLOW}POSTGRES_PASSWORD=${POSTGRES_PASS}${NC}"
        echo -e "${YELLOW}REDIS_PASSWORD=${REDIS_PASS}${NC}"
        echo -e "${YELLOW}JWT_SECRET=${JWT_SECRET}${NC}"
        echo ""
        
        read -p "Would you like to update .env with these passwords? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${POSTGRES_PASS}/" .env
            sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=${REDIS_PASS}/" .env
            sed -i "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env
            print_success "Passwords updated in .env file"
        fi
    else
        print_warning "OpenSSL not found, skipping password generation"
    fi
}

build_images() {
    print_step "Building Docker images..."
    docker compose -f docker-compose.dev.yml build
    print_success "Docker images built successfully"
}

start_services() {
    print_step "Starting services..."
    docker compose -f docker-compose.dev.yml up -d
    print_success "Services started successfully"
}

wait_for_services() {
    print_step "Waiting for services to be ready..."
    
    echo -n "Waiting for backend"
    for i in {1..30}; do
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            echo ""
            print_success "Backend is ready"
            break
        fi
        echo -n "."
        sleep 2
    done
    
    echo -n "Waiting for frontend"
    for i in {1..30}; do
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            echo ""
            print_success "Frontend is ready"
            break
        fi
        echo -n "."
        sleep 2
    done
}

print_final_info() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   🎉 Setup Complete!                   ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Access your application:${NC}"
    echo -e "  Frontend: ${BLUE}http://localhost:5173${NC}"
    echo -e "  Backend:  ${BLUE}http://localhost:3001/api${NC}"
    echo -e "  Health:   ${BLUE}http://localhost:3001/health${NC}"
    echo ""
    echo -e "${YELLOW}Default login credentials:${NC}"
    echo -e "  Admin: ${BLUE}admin${NC} / ${BLUE}admin123${NC}"
    echo -e "  Staff: ${BLUE}staff1${NC} / ${BLUE}staff123${NC}"
    echo ""
    echo -e "${YELLOW}Useful commands:${NC}"
    echo -e "  ${BLUE}make dev${NC}         - Start development environment"
    echo -e "  ${BLUE}make logs${NC}        - View logs"
    echo -e "  ${BLUE}make status${NC}      - Check container status"
    echo -e "  ${BLUE}make dev-stop${NC}    - Stop services"
    echo -e "  ${BLUE}make help${NC}        - Show all available commands"
    echo ""
}

# Main execution
main() {
    print_header
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Setup environment
    create_env_file
    
    # Ask if user wants to generate passwords
    echo ""
    read -p "Would you like to generate secure passwords? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        generate_passwords
    fi
    
    # Build and start
    echo ""
    read -p "Would you like to build and start services now? [Y/n] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        build_images
        start_services
        wait_for_services
    fi
    
    print_final_info
}

# Run main function
main
