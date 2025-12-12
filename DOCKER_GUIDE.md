# 🐳 Docker Compose Setup Guide - CRM Application

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Configuration](#configuration)
- [Commands Reference](#commands-reference)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)

---

## 📦 Prerequisites

### Required Software
- **Docker**: v24.0 or higher
- **Docker Compose**: v2.20 or higher

### System Requirements
- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 10GB free space

### Installation
```bash
# Install Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose (if not included)
sudo apt-get install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/dadinjaenudin/crm-svelte.git
cd crm-svelte
```

### 2. Configure Environment
```bash
# Copy example environment file
cp .env.docker .env

# Edit .env file (IMPORTANT: Change passwords!)
nano .env
```

### 3. Start All Services
```bash
# Development mode (with hot reload)
docker compose -f docker-compose.dev.yml up -d

# Production mode
docker compose up -d

# With Nginx reverse proxy (production)
docker compose --profile production up -d
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health
- **Nginx (production)**: http://localhost:80

### 5. Default Login
- **Admin**: `admin` / `admin123`
- **Staff**: `staff1` / `staff123`

---

## 💻 Development Setup

### Start Development Environment
```bash
# Start with hot reload
docker compose -f docker-compose.dev.yml up

# Run in background
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f frontend
```

### Development Features
✅ **Hot Reload**: Automatic restart on code changes
✅ **Volume Mounting**: Live code sync without rebuild
✅ **Debug Mode**: Full error messages and stack traces
✅ **PostgreSQL**: Persistent database with sample data
✅ **Redis**: Caching layer for performance

### Development Ports
| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 3001 | http://localhost:3001/api |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |

### Stop Development Environment
```bash
# Stop services (keeps data)
docker compose -f docker-compose.dev.yml stop

# Stop and remove containers (keeps data)
docker compose -f docker-compose.dev.yml down

# Stop and remove everything (including data)
docker compose -f docker-compose.dev.yml down -v
```

---

## 🏭 Production Setup

### 1. Configure Production Environment
```bash
# Copy and edit production config
cp .env.docker .env

# CRITICAL: Update these values!
nano .env
```

**Important Settings**:
```env
# Strong passwords (minimum 32 characters)
POSTGRES_PASSWORD=your-super-secure-password-min-32-chars
REDIS_PASSWORD=your-redis-secure-password-min-32-chars
JWT_SECRET=your-jwt-secret-key-MUST-BE-AT-LEAST-32-CHARACTERS

# Production URLs
CORS_ORIGIN=https://your-domain.com
VITE_API_URL=https://your-domain.com/api
PUBLIC_API_URL=https://your-domain.com/api
```

### 2. Build Production Images
```bash
# Build all services
docker compose build

# Build specific service
docker compose build backend
docker compose build frontend
```

### 3. Start Production Services
```bash
# Start without Nginx
docker compose up -d

# Start with Nginx reverse proxy
docker compose --profile production up -d
```

### 4. Setup SSL/TLS (Recommended)
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Copy your SSL certificates
cp /path/to/fullchain.pem nginx/ssl/
cp /path/to/privkey.pem nginx/ssl/

# Update nginx/nginx.conf (uncomment HTTPS block)
nano nginx/nginx.conf
```

### 5. Verify Production Deployment
```bash
# Check service health
curl http://localhost:3001/health

# Check all container status
docker compose ps

# View production logs
docker compose logs -f --tail=100
```

---

## ⚙️ Configuration

### Environment Variables

#### PostgreSQL Configuration
```env
POSTGRES_USER=crm_user           # Database username
POSTGRES_PASSWORD=secure_pass    # Database password (CHANGE THIS!)
POSTGRES_DB=crm_database         # Database name
POSTGRES_PORT=5432               # PostgreSQL port
```

#### Redis Configuration
```env
REDIS_PASSWORD=secure_pass       # Redis password (CHANGE THIS!)
REDIS_PORT=6379                  # Redis port
```

#### Backend Configuration
```env
NODE_ENV=production              # Environment (development/production)
BACKEND_PORT=3001                # Backend API port
CORS_ORIGIN=http://localhost:5173 # Allowed CORS origins
JWT_SECRET=min-32-chars-secret   # JWT signing key (CHANGE THIS!)
JWT_EXPIRES_IN=7d                # Token expiration (e.g., 7d, 24h)
```

#### Frontend Configuration
```env
FRONTEND_PORT=5173               # Frontend port
VITE_API_URL=http://localhost:3001/api   # API URL for client
PUBLIC_API_URL=http://localhost:3001/api # API URL for SSR
```

#### Nginx Configuration
```env
HTTP_PORT=80                     # HTTP port
HTTPS_PORT=443                   # HTTPS port
```

### Database Configuration

#### Connection String
```javascript
// Backend will use these environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};
```

#### Initialize Database
```bash
# Database is auto-initialized on first run
# To re-initialize:
docker compose down -v
docker compose up -d
```

---

## 📝 Commands Reference

### Container Management
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose stop

# Restart all services
docker compose restart

# Remove all containers
docker compose down

# Remove containers and volumes (DANGER: deletes data!)
docker compose down -v
```

### Service-Specific Commands
```bash
# Restart specific service
docker compose restart backend
docker compose restart frontend

# View logs for specific service
docker compose logs -f backend
docker compose logs -f postgres

# Execute command in container
docker compose exec backend sh
docker compose exec postgres psql -U crm_user -d crm_database
```

### Database Operations
```bash
# Access PostgreSQL shell
docker compose exec postgres psql -U crm_user -d crm_database

# Backup database
docker compose exec postgres pg_dump -U crm_user crm_database > backup.sql

# Restore database
docker compose exec -T postgres psql -U crm_user -d crm_database < backup.sql

# View database tables
docker compose exec postgres psql -U crm_user -d crm_database -c "\dt"
```

### Redis Operations
```bash
# Access Redis CLI
docker compose exec redis redis-cli -a redis_password

# View all keys
docker compose exec redis redis-cli -a redis_password KEYS '*'

# Clear Redis cache
docker compose exec redis redis-cli -a redis_password FLUSHALL
```

### Health Checks
```bash
# Check all service status
docker compose ps

# Backend health check
curl http://localhost:3001/health

# Database health check
docker compose exec postgres pg_isready -U crm_user

# Redis health check
docker compose exec redis redis-cli ping
```

### Logs and Monitoring
```bash
# View all logs (real-time)
docker compose logs -f

# View last 100 lines
docker compose logs --tail=100

# View logs for specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# View resource usage
docker stats
```

### Build and Update
```bash
# Rebuild all services
docker compose build

# Rebuild and restart
docker compose up -d --build

# Pull latest images
docker compose pull

# Update specific service
docker compose up -d --build backend
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Error: "port is already allocated"

# Find process using port
sudo lsof -i :5173
sudo lsof -i :3001
sudo lsof -i :5432

# Kill process or change port in .env
kill -9 <PID>
```

#### 2. Database Connection Failed
```bash
# Check PostgreSQL container
docker compose ps postgres

# View PostgreSQL logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres

# Test connection
docker compose exec postgres psql -U crm_user -d crm_database -c "SELECT 1"
```

#### 3. Frontend Cannot Connect to Backend
```bash
# Check backend is running
curl http://localhost:3001/health

# Verify CORS settings in .env
CORS_ORIGIN=http://localhost:5173

# Restart backend
docker compose restart backend

# Check frontend logs
docker compose logs -f frontend
```

#### 4. Redis Connection Issues
```bash
# Check Redis status
docker compose ps redis

# Test Redis connection
docker compose exec redis redis-cli -a redis_password ping

# Restart Redis
docker compose restart redis
```

#### 5. Permission Denied Errors
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Fix volume permissions
docker compose down
sudo rm -rf postgres_data redis_data
docker compose up -d
```

#### 6. Out of Memory
```bash
# Check container memory usage
docker stats

# Increase Docker memory limit (Docker Desktop)
# Settings > Resources > Memory > Increase to 4GB+

# Clear unused Docker resources
docker system prune -a --volumes
```

#### 7. Build Failures
```bash
# Clear Docker cache
docker builder prune -a

# Rebuild from scratch
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Debug Mode

#### Enable Verbose Logging
```bash
# Add to .env
NODE_ENV=development
DEBUG=*

# Restart services
docker compose restart
```

#### View Container Internals
```bash
# Access backend container shell
docker compose exec backend sh

# Check environment variables
docker compose exec backend env

# View file system
docker compose exec backend ls -la /app

# Check running processes
docker compose exec backend ps aux
```

---

## 🏗️ Architecture

### Docker Compose Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼───────┐      ┌───────▼────────┐
        │  NGINX (80)   │      │  FRONTEND      │
        │  Reverse      │      │  (5173)        │
        │  Proxy        │      │  Svelte        │
        └───────┬───────┘      └───────┬────────┘
                │                      │
                └──────────┬───────────┘
                           │
                  ┌────────▼─────────┐
                  │  BACKEND (3001)  │
                  │  Node.js/Express │
                  └────┬─────────┬───┘
                       │         │
              ┌────────┴──┐   ┌─┴──────────┐
              │           │   │            │
        ┌─────▼─────┐ ┌──▼───▼───┐   ┌────▼─────┐
        │ POSTGRES  │ │  REDIS   │   │  VOLUMES │
        │  (5432)   │ │  (6379)  │   │  (Data)  │
        └───────────┘ └──────────┘   └──────────┘
```

### Service Dependencies
1. **PostgreSQL** - Database (starts first)
2. **Redis** - Cache (starts with PostgreSQL)
3. **Backend** - API (depends on PostgreSQL + Redis)
4. **Frontend** - UI (depends on Backend)
5. **Nginx** - Reverse Proxy (depends on Frontend + Backend)

### Network Configuration
- **Internal Network**: `crm-network` (bridge)
- **Service Discovery**: Containers communicate by service name
- **Port Mapping**: Host ports mapped to container ports

### Volume Mounts

#### Production Volumes (Persistent)
- `postgres_data` → Database files
- `redis_data` → Cache data
- `backend_uploads` → Uploaded files
- `nginx_logs` → Access/error logs

#### Development Volumes (Live Sync)
- `./backend/src` → Backend code (hot reload)
- `./src` → Frontend code (hot reload)
- `./static` → Static assets

---

## 📊 Performance Configuration

### For 6000 Concurrent Users

#### 1. Scale Backend Horizontally
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 5  # Run 5 backend instances
```

#### 2. Configure PostgreSQL Connection Pool
```javascript
// backend/src/config/database.js
const pool = {
  max: 100,        // Maximum connections
  min: 10,         // Minimum connections
  idle: 10000      // Idle timeout
};
```

#### 3. Enable Nginx Load Balancing
```nginx
# nginx/nginx.conf
upstream backend_api {
    least_conn;
    server backend-1:3001;
    server backend-2:3001;
    server backend-3:3001;
    server backend-4:3001;
    server backend-5:3001;
}
```

#### 4. Redis Configuration
```bash
# Increase Redis memory
docker run -d --name redis \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --maxmemory 2gb --maxmemory-policy allkeys-lru
```

---

## 🔒 Security Best Practices

### 1. Change Default Passwords
```env
# Use strong passwords (min 32 characters)
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
```

### 2. Enable SSL/TLS
```bash
# Generate self-signed certificate (development)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem

# For production, use Let's Encrypt
# Update nginx.conf to enable HTTPS
```

### 3. Limit Network Exposure
```yaml
# docker-compose.yml
services:
  postgres:
    ports:
      - "127.0.0.1:5432:5432"  # Only localhost
```

### 4. Use Docker Secrets (Production)
```yaml
# docker-compose.yml
secrets:
  db_password:
    file: ./secrets/db_password.txt
services:
  postgres:
    secrets:
      - db_password
```

---

## 📚 Additional Resources

### Documentation
- **Docker Compose**: https://docs.docker.com/compose/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Redis**: https://redis.io/documentation
- **Nginx**: https://nginx.org/en/docs/

### Monitoring Tools
- **Portainer**: Docker management UI
  ```bash
  docker run -d -p 9000:9000 --name portainer \
    --restart=always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    portainer/portainer-ce
  ```

- **Prometheus + Grafana**: Metrics monitoring
- **ELK Stack**: Centralized logging

---

## ✅ Quick Reference Checklist

### Before Deployment
- [ ] Update `.env` with production values
- [ ] Change all default passwords
- [ ] Configure SSL certificates
- [ ] Set proper CORS origins
- [ ] Update JWT secret key
- [ ] Configure backup strategy
- [ ] Set up monitoring

### After Deployment
- [ ] Test frontend access
- [ ] Test backend API endpoints
- [ ] Verify database connectivity
- [ ] Check Redis cache
- [ ] Monitor resource usage
- [ ] Review logs for errors
- [ ] Test authentication flows
- [ ] Verify all CRUD operations

---

## 🆘 Support

### Get Help
- **GitHub Issues**: https://github.com/dadinjaenudin/crm-svelte/issues
- **Docker Logs**: `docker compose logs -f`
- **Health Check**: http://localhost:3001/health

### Useful Commands Summary
```bash
# Start
docker compose up -d

# Logs
docker compose logs -f

# Status
docker compose ps

# Restart
docker compose restart

# Stop
docker compose down

# Clean up
docker system prune -a
```

---

**🎉 Selamat! Docker setup Anda siap digunakan!**

Untuk pertanyaan lebih lanjut, silakan buka issue di GitHub repository.
