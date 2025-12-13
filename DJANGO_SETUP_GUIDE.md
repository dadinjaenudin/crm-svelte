# 🐍 Django CRM Backend - Complete Setup Guide

## 📋 Overview

Backend CRM menggunakan **Django 5.0** + **Django REST Framework** + **PostgreSQL** + **Redis**.

### Tech Stack
- **Framework**: Django 5.0 + Django REST Framework 3.14
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Authentication**: JWT (Simple JWT)
- **API Docs**: drf-spectacular (OpenAPI 3.0)
- **Task Queue**: Celery (optional)
- **Server**: Gunicorn

---

## 🚀 Quick Start (3 Steps)

### Method 1: Using Docker Compose (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/dadinjaenudin/crm-svelte.git
cd crm-svelte

# 2. Configure environment
cp .env.django .env

# Edit .env and change passwords:
# - DJANGO_SECRET_KEY
# - POSTGRES_PASSWORD
# - REDIS_PASSWORD
# - JWT_SECRET_KEY

# 3. Start all services
docker compose -f docker-compose.django.yml up -d

# Access:
# - Django Backend: http://localhost:8000/api
# - Django Admin: http://localhost:8000/admin
# - API Docs: http://localhost:8000/api/docs
# - Frontend: http://localhost:5173
```

### Method 2: Manual Setup (Development)

```bash
# 1. Navigate to Django backend
cd backend-django

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp ../.env.django .env
# Edit .env file with your settings

# 5. Run migrations
python manage.py makemigrations
python manage.py migrate

# 6. Create superuser
python manage.py createsuperuser

# 7. Load initial data (optional)
python manage.py loaddata fixtures/initial_data.json

# 8. Run development server
python manage.py runserver 0.0.0.0:8000
```

---

## 📁 Project Structure

```
backend-django/
├── crm_backend/              # Main Django project
│   ├── __init__.py
│   ├── settings.py          # Django settings
│   ├── urls.py              # Main URL configuration
│   ├── wsgi.py              # WSGI config
│   └── asgi.py              # ASGI config
├── apps/                     # Django apps
│   ├── members/             # Members management
│   │   ├── models.py        # Member model
│   │   ├── serializers.py   # REST serializers
│   │   ├── views.py         # ViewSets
│   │   ├── urls.py          # URL routes
│   │   └── admin.py         # Django admin
│   ├── points/              # Points transactions
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── vouchers/            # Voucher management
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── redeem/              # Redemption transactions
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   └── authentication/      # User authentication
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       └── urls.py
├── utils/                    # Utility modules
│   ├── cache.py             # Redis caching helpers
│   ├── pagination.py        # Custom pagination
│   ├── permissions.py       # Custom permissions
│   └── exceptions.py        # Custom exceptions
├── config/                   # Configuration modules
│   ├── redis.py             # Redis configuration
│   └── celery.py            # Celery configuration
├── fixtures/                 # Initial data
│   └── initial_data.json
├── manage.py                 # Django management script
├── requirements.txt          # Python dependencies
├── Dockerfile                # Docker build file
└── .env                      # Environment variables
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register         - Register new user
POST   /api/auth/login            - Login (get JWT tokens)
POST   /api/auth/refresh          - Refresh access token
POST   /api/auth/logout           - Logout
GET    /api/auth/profile          - Get current user profile
POST   /api/auth/change-password  - Change password
```

### Members
```
GET    /api/members/              - List all members (with filters)
POST   /api/members/              - Create new member
GET    /api/members/{id}/         - Get member details
PUT    /api/members/{id}/         - Update member
DELETE /api/members/{id}/         - Delete member
GET    /api/members/stats/        - Get member statistics
```

### Point Transactions
```
GET    /api/points/               - List all point transactions
POST   /api/points/               - Create point transaction
GET    /api/points/stats/         - Get points statistics
```

### Vouchers
```
GET    /api/vouchers/             - List all vouchers
POST   /api/vouchers/             - Create voucher
GET    /api/vouchers/{id}/        - Get voucher details
PUT    /api/vouchers/{id}/        - Update voucher
DELETE /api/vouchers/{id}/        - Delete voucher
GET    /api/vouchers/stats/       - Get voucher statistics
```

### Redeem Transactions
```
GET    /api/redeem/               - List all redeem transactions
POST   /api/redeem/               - Create redeem transaction
PATCH  /api/redeem/{id}/status/   - Update redeem status
GET    /api/redeem/stats/         - Get redeem statistics
```

### System
```
GET    /api/health/               - Health check endpoint
GET    /api/docs/                 - OpenAPI documentation (Swagger UI)
GET    /api/redoc/                - ReDoc documentation
GET    /api/schema/               - OpenAPI schema (JSON)
```

---

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```bash
# Django Core
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis
REDIS_URL=redis://:password@host:6379/0

# JWT
JWT_SECRET_KEY=your-jwt-secret-here
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440
```

### Generate Secure Keys

```bash
# Django secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# JWT secret key
openssl rand -base64 64

# Database password
openssl rand -base64 32

# Redis password
openssl rand -base64 32
```

---

## 🗄️ Database Models

### Member Model
```python
- id (CharField, PK)
- name (CharField)
- email (EmailField, unique)
- phone (CharField)
- address (TextField)
- join_date (DateField)
- total_points (IntegerField)
- tier_level (CharField: Bronze, Silver, Gold, Platinum)
- status (CharField: Active, Inactive)
- created_at, updated_at
```

### PointTransaction Model
```python
- id (AutoField, PK)
- member (ForeignKey)
- type (CharField: earn, redeem, expire, adjustment)
- points (IntegerField)
- description (TextField)
- date (DateTimeField)
- created_at
```

### Voucher Model
```python
- id (AutoField, PK)
- code (CharField, unique)
- name (CharField)
- description (TextField)
- discount_type (CharField)
- discount_value (DecimalField)
- points_cost (IntegerField)
- stock (IntegerField)
- valid_from, valid_to (DateField)
- status (CharField: Active, Inactive)
- created_at, updated_at
```

### RedeemTransaction Model
```python
- id (AutoField, PK)
- member (ForeignKey)
- voucher (ForeignKey)
- points_used (IntegerField)
- status (CharField: Pending, Completed, Cancelled, Used)
- redeem_date (DateTimeField)
- used_date (DateTimeField, nullable)
- created_at, updated_at
```

---

## 🔐 Authentication & Permissions

### JWT Authentication

Django uses `djangorestframework-simplejwt` for JWT authentication.

**Login Flow:**
1. POST `/api/auth/login` with `{username, password}`
2. Receive `{access, refresh}` tokens
3. Include `Authorization: Bearer <access_token>` in headers
4. Refresh token when access expires: POST `/api/auth/refresh` with `{refresh}`

**Token Lifetimes:**
- Access Token: 60 minutes (default)
- Refresh Token: 24 hours (default)

### Permissions

- **IsAuthenticated**: All endpoints require authentication
- **IsAdminUser**: Admin-only operations (DELETE)
- **IsAdminOrStaff**: Admin or Staff (CREATE, UPDATE)
- **IsOwnerOrAdmin**: User can only access their own data

---

## 💾 Redis Caching

Redis is used for:
1. **Session Storage**: User sessions
2. **Query Caching**: Frequently accessed data
3. **Rate Limiting**: API rate limiting
4. **Celery Broker**: Task queue (optional)

### Cache Configuration

```python
# Cache member list for 5 minutes
@method_decorator(cache_page(60 * 5))
def list(self, request):
    ...

# Invalidate cache on create/update/delete
cache.delete('members_list')
```

---

## 📊 Database Migrations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migrations
python manage.py showmigrations

# Rollback migration
python manage.py migrate app_name migration_name
```

---

## 🧪 Testing

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.members

# Run with coverage
pytest --cov=apps --cov-report=html

# Run with verbose output
python manage.py test --verbosity=2
```

---

## 🚀 Deployment

### Using Docker Compose

```bash
# Production deployment
docker compose -f docker-compose.django.yml up -d

# With Celery workers
docker compose -f docker-compose.django.yml --profile celery up -d

# View logs
docker compose -f docker-compose.django.yml logs -f backend-django

# Stop services
docker compose -f docker-compose.django.yml down
```

### Manual Deployment

```bash
# 1. Collect static files
python manage.py collectstatic --noinput

# 2. Run migrations
python manage.py migrate

# 3. Start Gunicorn
gunicorn crm_backend.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 4 \
  --threads 2 \
  --timeout 120

# Or use systemd service (recommended for production)
```

---

## 🔍 Monitoring & Debugging

### Django Admin

Access Django admin at: `http://localhost:8000/admin`

```bash
# Create superuser
python manage.py createsuperuser
```

### API Documentation

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI Schema**: http://localhost:8000/api/schema

### Health Check

```bash
curl http://localhost:8000/api/health/
```

Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2024-12-13T00:00:00Z"
}
```

### Logs

```bash
# Django logs
tail -f logs/django.log

# Gunicorn access logs
tail -f logs/access.log

# Gunicorn error logs
tail -f logs/error.log

# Docker logs
docker compose logs -f backend-django
```

---

## 📈 Performance Optimization

### Database Optimization
1. **Indexes**: All foreign keys and frequently queried fields
2. **Select Related**: Use `select_related()` for ForeignKeys
3. **Prefetch Related**: Use `prefetch_related()` for Many-to-Many
4. **Database Connection Pooling**: Configured via `CONN_MAX_AGE`

### Redis Caching
1. **Query Caching**: Cache expensive queries
2. **Session Storage**: Store sessions in Redis
3. **Rate Limiting**: Prevent API abuse

### Gunicorn Configuration
```bash
# Production setup
gunicorn crm_backend.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers $(( 2 * $(nproc) + 1 )) \
  --threads 2 \
  --timeout 120 \
  --max-requests 1000 \
  --max-requests-jitter 50 \
  --access-logfile - \
  --error-logfile -
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```bash
# Check PostgreSQL is running
docker compose ps postgres

# Test connection
psql -h localhost -U crm_user -d crm_database

# Check DATABASE_URL in .env
```

#### 2. Redis Connection Error
```bash
# Check Redis is running
docker compose ps redis

# Test connection
redis-cli -h localhost -p 6379 -a your_password ping

# Check REDIS_URL in .env
```

#### 3. Migration Errors
```bash
# Reset migrations (CAUTION: deletes data!)
python manage.py migrate app_name zero
python manage.py migrate

# Or delete migration files and recreate
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
python manage.py makemigrations
python manage.py migrate
```

#### 4. Static Files Not Loading
```bash
# Collect static files
python manage.py collectstatic --noinput

# Check STATIC_ROOT in settings.py
# Check Nginx configuration
```

---

## 📚 Additional Resources

### Documentation
- Django: https://docs.djangoproject.com/
- DRF: https://www.django-rest-framework.org/
- Simple JWT: https://django-rest-framework-simplejwt.readthedocs.io/
- PostgreSQL: https://www.postgresql.org/docs/
- Redis: https://redis.io/documentation

### Tools
- Django Debug Toolbar: Development debugging
- drf-spectacular: API documentation
- Celery: Background tasks
- Sentry: Error monitoring

---

## ✅ Checklist: Production Deployment

- [ ] Set `DJANGO_DEBUG=False`
- [ ] Generate strong `DJANGO_SECRET_KEY`
- [ ] Generate strong `JWT_SECRET_KEY`
- [ ] Update `DJANGO_ALLOWED_HOSTS`
- [ ] Update `DJANGO_CORS_ALLOWED_ORIGINS`
- [ ] Change all default passwords
- [ ] Configure SSL/TLS (HTTPS)
- [ ] Set up database backups
- [ ] Configure logging
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Run `collectstatic`
- [ ] Apply all migrations
- [ ] Load initial data
- [ ] Test all API endpoints
- [ ] Set up rate limiting
- [ ] Configure firewall rules

---

## 🎉 Summary

✅ **Django 5.0** with Django REST Framework  
✅ **PostgreSQL** for data storage  
✅ **Redis** for caching and sessions  
✅ **JWT Authentication** with refresh tokens  
✅ **RESTful API** with full CRUD operations  
✅ **OpenAPI Documentation** (Swagger)  
✅ **Docker** support with docker-compose  
✅ **Production-ready** configuration  
✅ **Scalable** architecture (ready for 6000+ users)  

**Repository**: https://github.com/dadinjaenudin/crm-svelte

**Happy Coding! 🐍**
