# 🐍 Django REST Framework Backend - CRM Application

Complete Django backend implementation for CRM (Customer Relationship Management) system.

## ✨ Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Members Management** - Full CRUD operations
- ✅ **Point Transactions** - Track earn, redeem, expire, adjustment
- ✅ **Vouchers Management** - Discount, cashback, freebie vouchers
- ✅ **Redeem Transactions** - Voucher redemption system
- ✅ **Admin Panel** - Built-in Django admin
- ✅ **API Documentation** - Swagger/OpenAPI auto-generated
- ✅ **PostgreSQL** - Production-ready database
- ✅ **Redis** - Caching & session storage
- ✅ **Seed Data** - Sample data for testing

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend-django
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
nano .env  # Edit database and Redis settings
```

### 3. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser (Admin)
```bash
python manage.py createsuperuser
```

### 5. Seed Sample Data (Optional)
```bash
python manage.py seed_data
```

This creates:
- Admin user: `admin` / `admin123`
- Staff user: `staff1` / `staff123`
- 5 sample members
- 5 sample vouchers
- Point transactions
- Redeem transactions

### 6. Run Development Server
```bash
python manage.py runserver 0.0.0.0:8000
```

Access:
- **API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/
- **API Docs (Swagger)**: http://localhost:8000/api/docs/
- **API Docs (ReDoc)**: http://localhost:8000/api/redoc/
- **Health Check**: http://localhost:8000/health

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register/          - Register new user
POST   /api/auth/login/             - Login (get JWT tokens)
POST   /api/auth/token/refresh/     - Refresh access token
GET    /api/auth/me/                - Get current user
PUT    /api/auth/profile/           - Update user profile
POST   /api/auth/change-password/   - Change password
```

### Members
```
GET    /api/members/                  - List all members
POST   /api/members/                  - Create new member
GET    /api/members/{id}/             - Get member detail
PUT    /api/members/{id}/             - Update member
DELETE /api/members/{id}/             - Delete member
GET    /api/members/statistics/       - Get member statistics
```

### Point Transactions
```
GET    /api/points/                   - List all point transactions
POST   /api/points/                   - Create point transaction
GET    /api/points/{id}/              - Get transaction detail
GET    /api/points/statistics/        - Get point statistics
GET    /api/points/member/{member_id}/ - Get member transactions
```

### Vouchers
```
GET    /api/vouchers/                 - List all vouchers
POST   /api/vouchers/                 - Create new voucher
GET    /api/vouchers/{id}/            - Get voucher detail
PUT    /api/vouchers/{id}/            - Update voucher
DELETE /api/vouchers/{id}/            - Delete voucher
GET    /api/vouchers/statistics/      - Get voucher statistics
```

### Redeem Transactions
```
GET    /api/redeem/                   - List all redeem transactions
POST   /api/redeem/                   - Create redeem transaction
GET    /api/redeem/{id}/              - Get redeem detail
PUT    /api/redeem/{id}/              - Update redeem status
POST   /api/redeem/{id}/mark-used/    - Mark redemption as used
POST   /api/redeem/{id}/cancel/       - Cancel redemption
GET    /api/redeem/statistics/        - Get redeem statistics
```

## 🔧 Technology Stack

- **Django 5.0.1** - Web framework
- **Django REST Framework 3.14** - API framework
- **PostgreSQL** (psycopg2-binary) - Database
- **Redis** (django-redis + hiredis) - Caching & sessions
- **Simple JWT** - JWT authentication
- **Argon2** - Password hashing
- **drf-spectacular** - API documentation
- **Gunicorn** - WSGI server (production)

## 📊 Database Schema

### Users (Authentication)
- Custom user model with roles (admin, staff, member)
- JWT token-based authentication

### Members
- ID (auto-generated: MEM-001, MEM-002...)
- Name, Email, Phone, Address
- Join Date, Total Points
- Tier Level (Bronze, Silver, Gold, Platinum)
- Status (Active, Inactive)

### Point Transactions
- Member (ForeignKey)
- Transaction Type (earn, redeem, expire, adjustment)
- Points (positive/negative)
- Description, Created By
- Auto-update member points

### Vouchers
- Code (unique), Name, Description
- Type (discount, cashback, freebie)
- Discount Value, Points Cost
- Stock, Start Date, End Date
- Status (Active, Inactive, Expired)

### Redeem Transactions
- Member, Voucher (ForeignKeys)
- Points Cost
- Status (Pending, Completed, Cancelled, Used)
- Redeem Date, Used Date
- Auto-deduct points and stock

## 🎨 Admin Panel Features

Access at: http://localhost:8000/admin/

- **User Management** - Create, edit, delete users
- **Member Management** - Full CRUD with filters
- **Point Transactions** - View, create (no delete)
- **Vouchers** - Full CRUD with date hierarchy
- **Redeem Transactions** - View, edit status (no delete)

Features:
- Search functionality
- Date range filters
- List display customization
- Readonly fields for data integrity
- Custom fieldsets

## 🔒 Security Features

- ✅ **Argon2 Password Hashing** - Most secure
- ✅ **JWT Authentication** - Stateless auth
- ✅ **CORS Protection** - Configurable origins
- ✅ **Rate Limiting** - Throttling (100/hour anon, 1000/hour user)
- ✅ **SQL Injection Protection** - Django ORM
- ✅ **XSS Protection** - Built-in security middleware
- ✅ **HTTPS Ready** - SSL/TLS configuration
- ✅ **Session Security** - Redis-backed sessions

## 🧪 Testing

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.members
python manage.py test apps.points

# Create test data
python manage.py seed_data
```

## 📝 Management Commands

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Seed database with sample data
python manage.py seed_data

# Collect static files
python manage.py collectstatic

# Run development server
python manage.py runserver

# Django shell
python manage.py shell
```

## 🐳 Docker Deployment

```bash
# Build image
docker build -t crm-django-backend .

# Run container
docker run -d -p 8000:8000 \
  -e DB_HOST=postgres \
  -e REDIS_HOST=redis \
  crm-django-backend
```

## 🚀 Production Deployment

### 1. Environment Variables
```bash
DEBUG=False
ALLOWED_HOSTS=your-domain.com
SECRET_KEY=generate-random-50-chars
DB_PASSWORD=strong-password
REDIS_PASSWORD=strong-password
```

### 2. Collect Static Files
```bash
python manage.py collectstatic --noinput
```

### 3. Run with Gunicorn
```bash
gunicorn crm_project.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 4 \
  --timeout 120
```

### 4. Use Nginx as Reverse Proxy
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /static/ {
        alias /path/to/staticfiles/;
    }
}
```

## 📚 API Documentation

Swagger UI: http://localhost:8000/api/docs/
- Interactive API documentation
- Test endpoints directly
- View request/response schemas
- Download OpenAPI spec

ReDoc: http://localhost:8000/api/redoc/
- Clean, responsive documentation
- Search functionality
- Code samples

## 🔄 Integrating with Frontend

### Update Frontend API URL
```javascript
// src/lib/api.ts
const API_BASE_URL = 'http://localhost:8000/api';
```

### Authentication
```javascript
// Login
const response = await fetch(`${API_BASE_URL}/auth/login/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

const data = await response.json();
const { access, refresh, user } = data.data;

// Use access token for authenticated requests
fetch(`${API_BASE_URL}/members/`, {
  headers: {
    'Authorization': `Bearer ${access}`,
    'Content-Type': 'application/json'
  }
});
```

## 🐛 Troubleshooting

### Port 8000 Already in Use
```bash
# Find and kill process
lsof -i :8000
kill -9 <PID>
```

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U crm_user -d crm_database
```

### Redis Connection Error
```bash
# Check Redis is running
redis-cli ping

# Start Redis
redis-server
```

### Migration Errors
```bash
# Reset migrations (⚠️ deletes data!)
python manage.py migrate --fake app_name zero
rm apps/*/migrations/0*.py
python manage.py makemigrations
python manage.py migrate
```

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📧 Support

- **GitHub**: https://github.com/dadinjaenudin/crm-svelte
- **Email**: admin@crm.com
- **Docs**: http://localhost:8000/api/docs/

---

**Built with ❤️ using Django & Django REST Framework**
