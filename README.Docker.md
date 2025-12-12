# 🐳 CRM Application - Docker Setup

Quick start guide untuk menjalankan CRM application menggunakan Docker Compose.

## 📋 Prerequisites

- **Docker** v24.0+
- **Docker Compose** v2.20+
- **4GB RAM** minimum
- **10GB disk space**

## 🚀 Quick Start (3 Steps)

### 1. Clone Repository
```bash
git clone https://github.com/dadinjaenudin/crm-svelte.git
cd crm-svelte
```

### 2. Run Setup Script (Recommended)
```bash
# Otomatis setup environment, build images, dan start services
./scripts/setup.sh
```

### 3. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Login**: `admin` / `admin123`

---

## 📦 What's Included

### Services
- ✅ **Frontend** - Svelte 5 (Port 5173)
- ✅ **Backend** - Node.js/Express (Port 3001)
- ✅ **PostgreSQL** - Database (Port 5432)
- ✅ **Redis** - Cache (Port 6379)
- ✅ **Nginx** - Reverse Proxy (Port 80/443) - Optional

### Features
- 🔄 **Hot Reload** - Development mode dengan live reload
- 💾 **Persistent Data** - Database data tersimpan di volumes
- 🔒 **Isolated Network** - Services berkomunikasi dalam private network
- 📊 **Health Checks** - Automatic health monitoring
- 🚀 **Production Ready** - Production configuration included

---

## 🎯 Usage Commands

### Using Makefile (Recommended)
```bash
# Development
make dev              # Start dev environment
make dev-logs         # View logs
make dev-stop         # Stop services
make dev-restart      # Restart services

# Production
make prod             # Start production
make prod-nginx       # Start with Nginx
make prod-stop        # Stop production

# Utilities
make status           # Show container status
make health           # Check service health
make logs             # View all logs
make shell-backend    # Open backend shell
make shell-db         # Open PostgreSQL shell

# Database
make db-backup        # Backup database
make db-restore       # Restore from backup
make db-reset         # Reset database

# Cleanup
make clean            # Stop and remove containers
make clean-all        # Stop and remove all (including data!)

# Help
make help             # Show all commands
```

### Using Docker Compose Directly
```bash
# Development
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml logs -f
docker compose -f docker-compose.dev.yml down

# Production
docker compose up -d
docker compose logs -f
docker compose down
```

---

## ⚙️ Configuration

### Environment Variables

1. **Copy template**:
   ```bash
   cp .env.docker .env
   ```

2. **Edit `.env`** and update these values:
   ```env
   # Database
   POSTGRES_PASSWORD=your-secure-password-here
   
   # Redis
   REDIS_PASSWORD=your-redis-password-here
   
   # JWT
   JWT_SECRET=your-jwt-secret-min-32-chars
   
   # URLs (for production)
   CORS_ORIGIN=https://your-domain.com
   VITE_API_URL=https://your-domain.com/api
   ```

3. **Generate secure passwords**:
   ```bash
   # PostgreSQL password
   openssl rand -base64 32
   
   # Redis password
   openssl rand -base64 32
   
   # JWT secret
   openssl rand -base64 64
   ```

---

## 🏗️ Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├──────► Frontend (Svelte) :5173
       │
       └──────► Backend (Express) :3001
                    │
                    ├──► PostgreSQL :5432
                    │
                    └──► Redis :6379
```

### Service Communication
- **External**: Browser ↔ Frontend/Backend (exposed ports)
- **Internal**: Backend ↔ Database/Redis (private network)

---

## 🔧 Development Workflow

### 1. Start Development Environment
```bash
make dev
# or
docker compose -f docker-compose.dev.yml up -d
```

### 2. View Logs (Real-time)
```bash
make dev-logs
# or
docker compose -f docker-compose.dev.yml logs -f
```

### 3. Make Code Changes
- Frontend files in `src/` - Auto reload ✅
- Backend files in `backend/src/` - Auto reload ✅

### 4. Test Changes
- Frontend: http://localhost:5173
- Backend: http://localhost:3001/api
- Health: http://localhost:3001/health

### 5. Stop Services
```bash
make dev-stop
# or
docker compose -f docker-compose.dev.yml down
```

---

## 🏭 Production Deployment

### 1. Configure Production Environment
```bash
# Copy and edit .env
cp .env.docker .env
nano .env

# Update these critical values:
# - POSTGRES_PASSWORD (strong password)
# - REDIS_PASSWORD (strong password)
# - JWT_SECRET (min 32 chars)
# - CORS_ORIGIN (your domain)
# - VITE_API_URL (your API URL)
```

### 2. Build Production Images
```bash
docker compose build
```

### 3. Start Production Services
```bash
# Without Nginx (direct access)
docker compose up -d

# With Nginx reverse proxy
docker compose --profile production up -d
```

### 4. Verify Deployment
```bash
# Check service status
make status

# Check health
make health

# View logs
make logs
```

### 5. Setup SSL/TLS (Production)
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Copy SSL certificates
cp fullchain.pem nginx/ssl/
cp privkey.pem nginx/ssl/

# Update nginx.conf to enable HTTPS
nano nginx/nginx.conf

# Restart Nginx
docker compose restart nginx
```

---

## 🗄️ Database Management

### Backup Database
```bash
# Create backup
make db-backup

# Backup file saved to: backups/backup_YYYYMMDD_HHMMSS.sql
```

### Restore Database
```bash
# Restore from backup file
make db-restore BACKUP_FILE=backups/backup_20241212_120000.sql
```

### Access Database
```bash
# PostgreSQL shell
make shell-db

# Or using docker compose
docker compose exec postgres psql -U crm_user -d crm_database
```

### Reset Database (WARNING: Deletes all data!)
```bash
make db-reset
```

---

## 📊 Monitoring & Logs

### View Logs
```bash
# All services
make logs

# Specific service
make logs-backend
make logs-frontend
make logs-db
make logs-redis

# Or using docker compose
docker compose logs -f backend
docker compose logs -f --tail=100
```

### Check Status
```bash
# Container status
make status

# Health checks
make health

# Resource usage
make stats
```

### Access Container Shell
```bash
# Backend container
make shell-backend

# Frontend container
make shell-frontend

# Database
make shell-db

# Redis
make shell-redis
```

---

## 🔒 Security Best Practices

### 1. Change Default Passwords
❌ **NEVER** use default passwords in production!

```bash
# Generate secure passwords
openssl rand -base64 32  # PostgreSQL
openssl rand -base64 32  # Redis
openssl rand -base64 64  # JWT Secret

# Update .env file with generated passwords
```

### 2. Use Strong JWT Secret
Minimum 32 characters, use random string:
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-random-string
```

### 3. Limit Network Exposure
For production, bind to localhost only:
```yaml
ports:
  - "127.0.0.1:5432:5432"  # PostgreSQL
  - "127.0.0.1:6379:6379"  # Redis
```

### 4. Enable HTTPS
Use SSL/TLS certificates (Let's Encrypt recommended):
```bash
# Install Certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/
```

### 5. Regular Updates
```bash
# Update Docker images
docker compose pull

# Rebuild and restart
docker compose up -d --build
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port
sudo lsof -i :5173
sudo lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in .env
FRONTEND_PORT=5174
BACKEND_PORT=3002
```

### Container Won't Start
```bash
# Check logs
docker compose logs <service-name>

# Check status
docker compose ps

# Restart service
docker compose restart <service-name>
```

### Database Connection Failed
```bash
# Check PostgreSQL logs
docker compose logs postgres

# Test connection
docker compose exec postgres pg_isready -U crm_user

# Restart database
docker compose restart postgres
```

### Frontend Can't Connect to Backend
```bash
# Check backend is running
curl http://localhost:3001/health

# Verify CORS settings in .env
CORS_ORIGIN=http://localhost:5173

# Restart backend
docker compose restart backend
```

### Out of Memory
```bash
# Check resource usage
docker stats

# Increase Docker memory limit (Docker Desktop)
# Settings > Resources > Memory > 4GB+

# Clean up
docker system prune -a
```

---

## 📚 Additional Resources

### Documentation
- 📖 [Docker Guide](./DOCKER_GUIDE.md) - Comprehensive documentation
- 🔧 [Performance Analysis](./PERFORMANCE_ANALYSIS_6000_USERS.md) - Scaling guide
- 📝 [Main README](./README.md) - Project overview

### Useful Links
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

---

## ✅ Quick Reference

### Start Application
```bash
./scripts/setup.sh      # First time setup
make dev                # Start development
make prod               # Start production
```

### Daily Development
```bash
make dev                # Start
make dev-logs           # View logs
make status             # Check status
make dev-stop           # Stop
```

### Maintenance
```bash
make db-backup          # Backup database
make health             # Check health
make logs               # View logs
make clean              # Clean up
```

### Help
```bash
make help               # Show all commands
```

---

## 🎉 Success!

Your CRM application is now running with Docker! 🚀

**Access your application:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001/api
- Login: `admin` / `admin123`

**Need help?**
- Run `make help` for all commands
- Check `DOCKER_GUIDE.md` for detailed documentation
- Open issue on GitHub: https://github.com/dadinjaenudin/crm-svelte/issues

**Happy coding! 💻**
