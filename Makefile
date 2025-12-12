# =============================================================================
# Makefile - CRM Application Docker Commands
# =============================================================================

.PHONY: help dev prod build start stop restart logs clean test backup

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)╔════════════════════════════════════════╗$(NC)"
	@echo "$(GREEN)║   CRM Application - Docker Commands   ║$(NC)"
	@echo "$(GREEN)╚════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

# =============================================================================
# DEVELOPMENT COMMANDS
# =============================================================================

dev: ## Start development environment (hot reload)
	@echo "$(GREEN)Starting development environment...$(NC)"
	docker compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✅ Development environment started!$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:5173$(NC)"
	@echo "$(YELLOW)Backend:  http://localhost:3001/api$(NC)"

dev-logs: ## View development logs (follow mode)
	docker compose -f docker-compose.dev.yml logs -f

dev-stop: ## Stop development environment
	@echo "$(YELLOW)Stopping development environment...$(NC)"
	docker compose -f docker-compose.dev.yml down
	@echo "$(GREEN)✅ Development environment stopped$(NC)"

dev-restart: ## Restart development environment
	@echo "$(YELLOW)Restarting development environment...$(NC)"
	docker compose -f docker-compose.dev.yml restart
	@echo "$(GREEN)✅ Development environment restarted$(NC)"

dev-clean: ## Stop dev environment and remove volumes
	@echo "$(RED)⚠️  This will delete all development data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose -f docker-compose.dev.yml down -v; \
		echo "$(GREEN)✅ Development environment cleaned$(NC)"; \
	fi

# =============================================================================
# PRODUCTION COMMANDS
# =============================================================================

prod: ## Start production environment
	@echo "$(GREEN)Starting production environment...$(NC)"
	docker compose up -d
	@echo "$(GREEN)✅ Production environment started!$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:5173$(NC)"
	@echo "$(YELLOW)Backend:  http://localhost:3001/api$(NC)"
	@echo "$(YELLOW)Health:   http://localhost:3001/health$(NC)"

prod-nginx: ## Start production with Nginx reverse proxy
	@echo "$(GREEN)Starting production with Nginx...$(NC)"
	docker compose --profile production up -d
	@echo "$(GREEN)✅ Production environment started!$(NC)"
	@echo "$(YELLOW)HTTP:  http://localhost:80$(NC)"
	@echo "$(YELLOW)HTTPS: https://localhost:443$(NC)"

prod-logs: ## View production logs (follow mode)
	docker compose logs -f

prod-stop: ## Stop production environment
	@echo "$(YELLOW)Stopping production environment...$(NC)"
	docker compose down
	@echo "$(GREEN)✅ Production environment stopped$(NC)"

prod-restart: ## Restart production environment
	@echo "$(YELLOW)Restarting production environment...$(NC)"
	docker compose restart
	@echo "$(GREEN)✅ Production environment restarted$(NC)"

# =============================================================================
# BUILD COMMANDS
# =============================================================================

build: ## Build all Docker images
	@echo "$(GREEN)Building Docker images...$(NC)"
	docker compose build
	@echo "$(GREEN)✅ Build complete!$(NC)"

build-dev: ## Build development images
	@echo "$(GREEN)Building development images...$(NC)"
	docker compose -f docker-compose.dev.yml build
	@echo "$(GREEN)✅ Build complete!$(NC)"

build-nocache: ## Build images without cache
	@echo "$(GREEN)Building images (no cache)...$(NC)"
	docker compose build --no-cache
	@echo "$(GREEN)✅ Build complete!$(NC)"

rebuild: ## Rebuild and restart
	@echo "$(GREEN)Rebuilding and restarting...$(NC)"
	docker compose up -d --build
	@echo "$(GREEN)✅ Rebuild and restart complete!$(NC)"

# =============================================================================
# UTILITY COMMANDS
# =============================================================================

logs: ## View logs for all services
	docker compose logs -f --tail=100

logs-backend: ## View backend logs only
	docker compose logs -f backend

logs-frontend: ## View frontend logs only
	docker compose logs -f frontend

logs-db: ## View database logs only
	docker compose logs -f postgres

logs-redis: ## View Redis logs only
	docker compose logs -f redis

status: ## Show status of all containers
	@echo "$(GREEN)Container Status:$(NC)"
	@docker compose ps

ps: status ## Alias for status

health: ## Check health of all services
	@echo "$(GREEN)Health Checks:$(NC)"
	@echo ""
	@echo "$(YELLOW)Backend Health:$(NC)"
	@curl -s http://localhost:3001/health | jq . || echo "$(RED)Backend not responding$(NC)"
	@echo ""
	@echo "$(YELLOW)Database Health:$(NC)"
	@docker compose exec -T postgres pg_isready -U crm_user || echo "$(RED)Database not ready$(NC)"
	@echo ""
	@echo "$(YELLOW)Redis Health:$(NC)"
	@docker compose exec -T redis redis-cli ping || echo "$(RED)Redis not responding$(NC)"

shell-backend: ## Open shell in backend container
	docker compose exec backend sh

shell-frontend: ## Open shell in frontend container
	docker compose exec frontend sh

shell-db: ## Open PostgreSQL shell
	docker compose exec postgres psql -U crm_user -d crm_database

shell-redis: ## Open Redis CLI
	docker compose exec redis redis-cli

# =============================================================================
# DATABASE COMMANDS
# =============================================================================

db-backup: ## Backup database to file
	@echo "$(GREEN)Backing up database...$(NC)"
	@mkdir -p backups
	@docker compose exec -T postgres pg_dump -U crm_user crm_database > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Database backed up to backups/ directory$(NC)"

db-restore: ## Restore database from backup (set BACKUP_FILE=path/to/backup.sql)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "$(RED)Error: Please set BACKUP_FILE=path/to/backup.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Restoring database from $(BACKUP_FILE)...$(NC)"
	@docker compose exec -T postgres psql -U crm_user -d crm_database < $(BACKUP_FILE)
	@echo "$(GREEN)✅ Database restored$(NC)"

db-reset: ## Reset database (WARNING: deletes all data)
	@echo "$(RED)⚠️  This will delete all database data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		docker compose up -d; \
		echo "$(GREEN)✅ Database reset complete$(NC)"; \
	fi

db-migrate: ## Run database migrations
	@echo "$(GREEN)Running database migrations...$(NC)"
	docker compose exec backend npm run migrate
	@echo "$(GREEN)✅ Migrations complete$(NC)"

# =============================================================================
# MONITORING COMMANDS
# =============================================================================

stats: ## Show container resource usage
	docker stats

top: ## Show running processes in containers
	docker compose top

# =============================================================================
# CLEANUP COMMANDS
# =============================================================================

clean: ## Stop and remove containers (keeps volumes)
	@echo "$(YELLOW)Cleaning up containers...$(NC)"
	docker compose down
	@echo "$(GREEN)✅ Cleanup complete$(NC)"

clean-all: ## Stop and remove containers + volumes (deletes data!)
	@echo "$(RED)⚠️  This will delete all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		echo "$(GREEN)✅ Full cleanup complete$(NC)"; \
	fi

clean-images: ## Remove all project Docker images
	@echo "$(YELLOW)Removing Docker images...$(NC)"
	docker compose down --rmi all
	@echo "$(GREEN)✅ Images removed$(NC)"

prune: ## Remove all unused Docker resources
	@echo "$(YELLOW)Pruning Docker system...$(NC)"
	docker system prune -a --volumes -f
	@echo "$(GREEN)✅ System pruned$(NC)"

# =============================================================================
# TESTING COMMANDS
# =============================================================================

test: ## Run tests in containers
	@echo "$(GREEN)Running tests...$(NC)"
	docker compose exec backend npm test
	@echo "$(GREEN)✅ Tests complete$(NC)"

test-api: ## Test API endpoints
	@echo "$(GREEN)Testing API endpoints...$(NC)"
	@./test_api.sh

# =============================================================================
# QUICK START COMMANDS
# =============================================================================

up: dev ## Alias for 'make dev'

down: dev-stop ## Alias for 'make dev-stop'

restart: dev-restart ## Alias for 'make dev-restart'

# =============================================================================
# INFORMATION COMMANDS
# =============================================================================

info: ## Show project information
	@echo "$(GREEN)╔════════════════════════════════════════╗$(NC)"
	@echo "$(GREEN)║   CRM Application - Project Info      ║$(NC)"
	@echo "$(GREEN)╚════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Project Name:$(NC) CRM Svelte Application"
	@echo "$(YELLOW)Repository:$(NC) https://github.com/dadinjaenudin/crm-svelte"
	@echo "$(YELLOW)Docker Compose Version:$(NC) $$(docker compose version)"
	@echo "$(YELLOW)Docker Version:$(NC) $$(docker --version)"
	@echo ""
	@echo "$(YELLOW)Services:$(NC)"
	@echo "  - Frontend (Svelte): http://localhost:5173"
	@echo "  - Backend (Node.js): http://localhost:3001"
	@echo "  - PostgreSQL: localhost:5432"
	@echo "  - Redis: localhost:6379"
	@echo ""
	@echo "$(YELLOW)Default Login:$(NC)"
	@echo "  - Admin: admin / admin123"
	@echo "  - Staff: staff1 / staff123"
	@echo ""

check-env: ## Check if .env file exists
	@if [ ! -f .env ]; then \
		echo "$(RED)⚠️  .env file not found!$(NC)"; \
		echo "$(YELLOW)Creating .env from .env.docker...$(NC)"; \
		cp .env.docker .env; \
		echo "$(GREEN)✅ .env file created$(NC)"; \
		echo "$(YELLOW)⚠️  Please edit .env and update passwords!$(NC)"; \
	else \
		echo "$(GREEN)✅ .env file exists$(NC)"; \
	fi

init: check-env ## Initialize project (create .env, build images)
	@echo "$(GREEN)Initializing CRM Application...$(NC)"
	@make build-dev
	@echo "$(GREEN)✅ Initialization complete!$(NC)"
	@echo "$(YELLOW)Run 'make dev' to start development environment$(NC)"

# =============================================================================
# DEFAULT TARGET
# =============================================================================

.DEFAULT_GOAL := help
