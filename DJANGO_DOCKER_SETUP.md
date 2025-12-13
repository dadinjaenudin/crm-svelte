# CRM Application - Django Backend + Svelte Frontend Setup

## 🚀 Quick Start (Docker Compose)

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/dadinjaenudin/crm-svelte.git
cd crm-svelte
```

### 2. Environment Configuration
```bash
# Copy Django environment file
cp .env.django .env

# Update credentials (IMPORTANT for production!)
nano .env
```

**Key Configuration:**
```env
# Django Settings
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=localhost,your-domain.com

# Database
POSTGRES_PASSWORD=your-secure-password-here

# Redis
REDIS_PASSWORD=your-redis-password-here

# JWT
JWT_SECRET_KEY=your-jwt-secret-key-here

# Frontend
VITE_API_URL=http://localhost:8000/api
```

### 3. Start All Services
```bash
# Build and start all containers
docker-compose -f docker-compose.django.yml up --build

# Or run in background
docker-compose -f docker-compose.django.yml up -d --build
```

### 4. Access Application

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | - |
| **Backend API** | http://localhost:8000/api | - |
| **Admin Panel** | http://localhost:8000/admin | admin / admin123 |
| **API Docs (Swagger)** | http://localhost:8000/api/docs | - |
| **API Docs (ReDoc)** | http://localhost:8000/api/redoc | - |
| **PostgreSQL** | localhost:5432 | crm_user / crm_password_2024 |
| **Redis** | localhost:6379 | redis_password_2024 |

## 📦 Services Overview

### Architecture Diagram
```
┌─────────────────┐         ┌──────────────────┐
│                 │         │                  │
│  Svelte Frontend│◄────────┤  Django Backend  │
│  (Port 5173)    │  HTTP   │  (Port 8000)     │
│                 │         │                  │
└─────────────────┘         └────────┬─────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌───────────┐    ┌──────────┐    ┌──────────┐
            │PostgreSQL │    │  Redis   │    │ Static   │
            │(Database) │    │ (Cache)  │    │  Files   │
            └───────────┘    └──────────┘    └──────────┘
```

### Container Details

#### 1. **crm-postgres-django** (PostgreSQL 15)
- **Purpose:** Primary database
- **Port:** 5432
- **User:** crm_user
- **Database:** crm_database
- **Data Persistence:** Docker volume `crm-postgres-data`

#### 2. **crm-redis-django** (Redis 7)
- **Purpose:** Caching & session storage
- **Port:** 6379
- **Max Memory:** 256MB
- **Policy:** allkeys-lru
- **Data Persistence:** Docker volume `crm-redis-data`

#### 3. **crm-django-backend** (Django 5.0)
- **Purpose:** REST API backend
- **Port:** 8000
- **Framework:** Django REST Framework 3.14
- **Features:**
  - JWT Authentication
  - Auto-generated API docs
  - Django Admin interface
  - Hot reload (development)
  - Gunicorn (production)

#### 4. **crm-svelte-frontend** (Svelte + Vite)
- **Purpose:** Web interface
- **Port:** 5173
- **Features:**
  - Hot Module Replacement (HMR)
  - TypeScript support
  - Responsive design
  - Real-time API integration

## 🛠️ Common Operations

### View Logs
```bash
# All services
docker-compose -f docker-compose.django.yml logs -f

# Specific service
docker-compose -f docker-compose.django.yml logs -f backend
docker-compose -f docker-compose.django.yml logs -f frontend
docker-compose -f docker-compose.django.yml logs -f postgres
docker-compose -f docker-compose.django.yml logs -f redis
```

### Execute Commands

#### Django Management Commands
```bash
# Create migrations
docker-compose -f docker-compose.django.yml exec backend python manage.py makemigrations

# Run migrations
docker-compose -f docker-compose.django.yml exec backend python manage.py migrate

# Create superuser
docker-compose -f docker-compose.django.yml exec backend python manage.py createsuperuser

# Load fixtures
docker-compose -f docker-compose.django.yml exec backend python manage.py loaddata apps/*/fixtures/*.json

# Django shell
docker-compose -f docker-compose.django.yml exec backend python manage.py shell

# Collect static files
docker-compose -f docker-compose.django.yml exec backend python manage.py collectstatic --noinput
```

#### Database Operations
```bash
# Access PostgreSQL
docker-compose -f docker-compose.django.yml exec postgres psql -U crm_user -d crm_database

# Backup database
docker-compose -f docker-compose.django.yml exec postgres pg_dump -U crm_user crm_database > backup.sql

# Restore database
docker-compose -f docker-compose.django.yml exec -T postgres psql -U crm_user crm_database < backup.sql

# Check database size
docker-compose -f docker-compose.django.yml exec postgres psql -U crm_user -d crm_database -c "\l+"
```

#### Redis Operations
```bash
# Access Redis CLI
docker-compose -f docker-compose.django.yml exec redis redis-cli -a redis_password_2024

# Clear cache
docker-compose -f docker-compose.django.yml exec redis redis-cli -a redis_password_2024 FLUSHALL

# Monitor Redis
docker-compose -f docker-compose.django.yml exec redis redis-cli -a redis_password_2024 MONITOR

# Check cache stats
docker-compose -f docker-compose.django.yml exec redis redis-cli -a redis_password_2024 INFO stats
```

### Stop and Remove
```bash
# Stop all services
docker-compose -f docker-compose.django.yml stop

# Stop and remove containers
docker-compose -f docker-compose.django.yml down

# Remove containers and volumes (⚠️ DATA LOSS!)
docker-compose -f docker-compose.django.yml down -v
```

### Restart Services
```bash
# Restart all
docker-compose -f docker-compose.django.yml restart

# Restart specific service
docker-compose -f docker-compose.django.yml restart backend
docker-compose -f docker-compose.django.yml restart frontend
```

## 🔧 Development Workflow

### 1. Code Changes
- **Backend:** Changes in `backend-django/` trigger auto-reload
- **Frontend:** Changes in `src/` trigger HMR

### 2. Database Schema Changes
```bash
# 1. Modify models in apps/*/models.py
# 2. Create migrations
docker-compose -f docker-compose.django.yml exec backend python manage.py makemigrations

# 3. Apply migrations
docker-compose -f docker-compose.django.yml exec backend python manage.py migrate

# 4. (Optional) Create fixtures
docker-compose -f docker-compose.django.yml exec backend python manage.py dumpdata app_name --indent 2 > apps/app_name/fixtures/initial_data.json
```

### 3. Add New Dependencies

#### Backend (Python)
```bash
# 1. Add package to backend-django/requirements.txt
echo "package-name==1.0.0" >> backend-django/requirements.txt

# 2. Rebuild backend container
docker-compose -f docker-compose.django.yml up -d --build backend
```

#### Frontend (Node.js)
```bash
# 1. Add package
docker-compose -f docker-compose.django.yml exec frontend npm install package-name

# 2. Or rebuild
docker-compose -f docker-compose.django.yml up -d --build frontend
```

## 📊 Monitoring & Health Checks

### Check Service Health
```bash
# All services
docker-compose -f docker-compose.django.yml ps

# Health endpoint
curl http://localhost:8000/health
```

### Container Resource Usage
```bash
docker stats crm-django-backend crm-svelte-frontend crm-postgres-django crm-redis-django
```

### Logs Analysis
```bash
# Last 100 lines
docker-compose -f docker-compose.django.yml logs --tail=100

# Filter by level (ERROR)
docker-compose -f docker-compose.django.yml logs | grep ERROR

# Watch logs in real-time
docker-compose -f docker-compose.django.yml logs -f --tail=50
```

## 🔒 Security Best Practices

### 1. Change Default Credentials
```bash
# Generate secure keys
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
openssl rand -base64 64
openssl rand -base64 32
```

### 2. Environment Variables
- **Never commit** `.env` to version control
- Use `.env.example` for documentation
- Use secrets management in production (AWS Secrets Manager, HashiCorp Vault)

### 3. Database Security
- Use strong passwords
- Restrict network access
- Enable SSL/TLS for connections
- Regular backups

### 4. Application Security
- Set `DJANGO_DEBUG=False` in production
- Configure `DJANGO_ALLOWED_HOSTS` properly
- Use HTTPS in production
- Enable CORS only for trusted origins
- Implement rate limiting

## 🚀 Production Deployment

### Production Docker Compose
```yaml
# Use production Dockerfiles
services:
  backend:
    build:
      dockerfile: Dockerfile  # Production Dockerfile
    environment:
      - DJANGO_DEBUG=False
    command: gunicorn --bind 0.0.0.0:8000 crm_project.wsgi:application
    
  frontend:
    build:
      dockerfile: Dockerfile.frontend  # Production Dockerfile
```

### Production Checklist
- [ ] Change all default passwords
- [ ] Set `DJANGO_DEBUG=False`
- [ ] Configure SSL/TLS
- [ ] Setup CDN for static files
- [ ] Enable database backups
- [ ] Setup monitoring (Sentry, Datadog)
- [ ] Configure log aggregation
- [ ] Enable rate limiting
- [ ] Setup firewall rules
- [ ] Enable Redis persistence
- [ ] Configure database replication
- [ ] Setup load balancer
- [ ] Enable automatic backups

## 🧪 Testing

### Run Tests
```bash
# Django backend tests
docker-compose -f docker-compose.django.yml exec backend python manage.py test

# With coverage
docker-compose -f docker-compose.django.yml exec backend coverage run --source='.' manage.py test
docker-compose -f docker-compose.django.yml exec backend coverage report
```

### API Testing
```bash
# Test auth endpoint
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Test with token
TOKEN="your-jwt-token"
curl http://localhost:8000/api/members/ \
  -H "Authorization: Bearer $TOKEN"
```

## 📚 Additional Resources

- **Frontend API Migration:** `FRONTEND_API_MIGRATION.md`
- **Django Backend Setup:** `backend-django/README.md`
- **Performance Analysis:** `PERFORMANCE_ANALYSIS_6000_USERS.md`
- **Docker Guide:** `DOCKER_GUIDE.md`
- **GitHub Repository:** https://github.com/dadinjaenudin/crm-svelte

## 🆘 Troubleshooting

### Issue: Containers won't start
```bash
# Check logs
docker-compose -f docker-compose.django.yml logs

# Rebuild from scratch
docker-compose -f docker-compose.django.yml down -v
docker-compose -f docker-compose.django.yml up --build
```

### Issue: Database connection errors
```bash
# Check PostgreSQL health
docker-compose -f docker-compose.django.yml exec postgres pg_isready -U crm_user

# Restart PostgreSQL
docker-compose -f docker-compose.django.yml restart postgres
```

### Issue: Frontend can't connect to backend
- Check `VITE_API_URL` in `.env`
- Verify CORS settings in `backend-django/crm_project/settings.py`
- Check network connectivity: `docker-compose -f docker-compose.django.yml exec frontend ping backend`

### Issue: Port already in use
```bash
# Find process using port
lsof -i :8000
lsof -i :5173

# Kill process or change port in .env
```

## 📈 Performance Metrics

| Metric | Development | Production |
|--------|-------------|------------|
| **Backend Startup** | ~10s | ~5s |
| **Frontend Startup** | ~5s | ~3s |
| **API Response Time** | <100ms | <50ms |
| **Database Queries** | ~20ms | ~10ms |
| **Cache Hit Rate** | 80%+ | 90%+ |
| **Concurrent Users** | 100+ | 6000+ |

---

**Setup Status:** ✅ **COMPLETE**  
**Version:** 1.0.0  
**Last Updated:** 2024-12-13  
**Maintainer:** GitHub Actions
