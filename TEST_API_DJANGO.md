# Django Backend API Testing Guide

## Quick Test Commands

### 1. Start Docker Compose
```bash
cd /home/user/webapp
docker-compose -f docker-compose.django.yml up -d --build
```

### 2. Wait for Services (about 30-60 seconds)
```bash
# Check service health
docker-compose -f docker-compose.django.yml ps

# View logs
docker-compose -f docker-compose.django.yml logs -f
```

### 3. Test Health Endpoint
```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "CRM Django API is running",
  "version": "1.0.0",
  "status": "healthy"
}
```

### 4. Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "full_name": "Admin User",
      "role": "admin"
    }
  },
  "message": "Login successful"
}
```

### 5. Test Get Members (with token)
```bash
# Replace YOUR_ACCESS_TOKEN with actual token from login
TOKEN="YOUR_ACCESS_TOKEN"

curl http://localhost:8000/api/members/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": 1,
      "member_code": "M001",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "08123456789",
      "total_points": 1500,
      "status": "active"
    }
  ],
  "count": 1
}
```

### 6. Test Create Member
```bash
TOKEN="YOUR_ACCESS_TOKEN"

curl -X POST http://localhost:8000/api/members/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "member_code": "M999",
    "name": "Test User",
    "email": "test@example.com",
    "phone": "08999999999",
    "address": "Test Address",
    "birth_date": "1990-01-01",
    "join_date": "2024-12-13",
    "status": "active"
  }'
```

### 7. Test Get Vouchers
```bash
TOKEN="YOUR_ACCESS_TOKEN"

curl http://localhost:8000/api/vouchers/ \
  -H "Authorization: Bearer $TOKEN"
```

### 8. Test Get Points Statistics
```bash
TOKEN="YOUR_ACCESS_TOKEN"

curl http://localhost:8000/api/points/statistics/ \
  -H "Authorization: Bearer $TOKEN"
```

### 9. Test Frontend
```bash
# Open browser and navigate to:
http://localhost:5173

# Login with:
# Username: admin
# Password: admin123
```

### 10. Test API Documentation
```bash
# Open browser and navigate to:
http://localhost:8000/api/docs     # Swagger UI
http://localhost:8000/api/redoc    # ReDoc
```

### 11. Test Django Admin
```bash
# Open browser and navigate to:
http://localhost:8000/admin

# Login with:
# Username: admin
# Password: admin123
```

---

## Complete Test Script

Save this as `test_api.sh`:

```bash
#!/bin/bash

echo "🧪 Testing Django Backend API..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:8000"
API_URL="${BASE_URL}/api"

# Test 1: Health Check
echo "Test 1: Health Check"
response=$(curl -s "${BASE_URL}/health")
if echo "$response" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "$response"
fi
echo ""

# Test 2: Login
echo "Test 2: Login"
login_response=$(curl -s -X POST "${API_URL}/auth/login/" \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "admin123"}')

if echo "$login_response" | grep -q "access"; then
    echo -e "${GREEN}✅ Login passed${NC}"
    TOKEN=$(echo "$login_response" | grep -o '"access":"[^"]*' | cut -d'"' -f4)
    echo "Token obtained: ${TOKEN:0:50}..."
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "$login_response"
    exit 1
fi
echo ""

# Test 3: Get Members
echo "Test 3: Get Members"
members_response=$(curl -s "${API_URL}/members/" \
    -H "Authorization: Bearer $TOKEN")

if echo "$members_response" | grep -q "results"; then
    echo -e "${GREEN}✅ Get members passed${NC}"
else
    echo -e "${RED}❌ Get members failed${NC}"
    echo "$members_response"
fi
echo ""

# Test 4: Get Vouchers
echo "Test 4: Get Vouchers"
vouchers_response=$(curl -s "${API_URL}/vouchers/" \
    -H "Authorization: Bearer $TOKEN")

if echo "$vouchers_response" | grep -q "results"; then
    echo -e "${GREEN}✅ Get vouchers passed${NC}"
else
    echo -e "${RED}❌ Get vouchers failed${NC}"
    echo "$vouchers_response"
fi
echo ""

# Test 5: Get Points Statistics
echo "Test 5: Get Points Statistics"
stats_response=$(curl -s "${API_URL}/points/statistics/" \
    -H "Authorization: Bearer $TOKEN")

if echo "$stats_response" | grep -q "success"; then
    echo -e "${GREEN}✅ Get statistics passed${NC}"
else
    echo -e "${RED}❌ Get statistics failed${NC}"
    echo "$stats_response"
fi
echo ""

# Test 6: Token Refresh
echo "Test 6: Token Refresh"
refresh_token=$(echo "$login_response" | grep -o '"refresh":"[^"]*' | cut -d'"' -f4)
refresh_response=$(curl -s -X POST "${API_URL}/auth/token/refresh/" \
    -H "Content-Type: application/json" \
    -d "{\"refresh\": \"$refresh_token\"}")

if echo "$refresh_response" | grep -q "access"; then
    echo -e "${GREEN}✅ Token refresh passed${NC}"
else
    echo -e "${RED}❌ Token refresh failed${NC}"
    echo "$refresh_response"
fi
echo ""

# Summary
echo "========================================="
echo "🎉 All tests completed!"
echo "========================================="
echo ""
echo "Frontend:     http://localhost:5173"
echo "Backend API:  http://localhost:8000/api"
echo "Admin Panel:  http://localhost:8000/admin"
echo "API Docs:     http://localhost:8000/api/docs"
echo ""
echo "Login credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
```

**Make executable and run:**
```bash
chmod +x test_api.sh
./test_api.sh
```

---

## Expected Behavior Checklist

### Services
- [ ] PostgreSQL container running (port 5432)
- [ ] Redis container running (port 6379)
- [ ] Django backend container running (port 8000)
- [ ] Svelte frontend container running (port 5173)

### Health Checks
- [ ] Health endpoint returns 200 OK
- [ ] PostgreSQL accepts connections
- [ ] Redis responds to PING
- [ ] Backend API is accessible

### Authentication
- [ ] Login returns JWT tokens
- [ ] Token refresh works
- [ ] Protected endpoints require token
- [ ] Invalid token returns 401

### API Endpoints
- [ ] GET /api/members/ returns members list
- [ ] POST /api/members/ creates new member
- [ ] GET /api/vouchers/ returns vouchers
- [ ] GET /api/points/statistics/ returns stats
- [ ] All CRUD operations work

### Frontend
- [ ] Login page loads
- [ ] Can login with admin credentials
- [ ] Dashboard displays data
- [ ] All pages accessible
- [ ] API calls work from frontend

### Admin Panel
- [ ] Admin login works
- [ ] Can view/edit models
- [ ] All apps registered
- [ ] Admin actions work

### Documentation
- [ ] Swagger UI loads at /api/docs
- [ ] ReDoc loads at /api/redoc
- [ ] All endpoints documented
- [ ] Can test endpoints from docs

---

## Troubleshooting

### Issue: Services won't start
```bash
docker-compose -f docker-compose.django.yml logs
docker-compose -f docker-compose.django.yml down -v
docker-compose -f docker-compose.django.yml up --build
```

### Issue: Database not ready
```bash
# Wait for migrations
docker-compose -f docker-compose.django.yml logs backend | grep "Running migrations"

# Manually run migrations
docker-compose -f docker-compose.django.yml exec backend python manage.py migrate
```

### Issue: No superuser
```bash
docker-compose -f docker-compose.django.yml exec backend python manage.py createsuperuser
```

### Issue: Frontend can't connect to backend
```bash
# Check CORS settings
docker-compose -f docker-compose.django.yml exec backend python manage.py shell
>>> from django.conf import settings
>>> print(settings.CORS_ALLOWED_ORIGINS)

# Update .env if needed
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://frontend:5173
```

### Issue: 401 Unauthorized
```bash
# Token might be expired, login again
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

---

## Performance Testing

### Load Test with Apache Bench
```bash
# Install apache2-utils
sudo apt-get install apache2-utils

# Test health endpoint (1000 requests, 10 concurrent)
ab -n 1000 -c 10 http://localhost:8000/health

# Test API endpoint (with auth)
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/members/
```

### Expected Results
```
Requests per second:    200-500 req/s
Time per request:       2-5ms (mean)
Failed requests:        0
```

---

## Security Testing

### Test CORS
```bash
curl -H "Origin: http://example.com" \
  --verbose \
  http://localhost:8000/api/members/
```

### Test Authentication
```bash
# Without token (should fail)
curl http://localhost:8000/api/members/

# With invalid token (should fail)
curl -H "Authorization: Bearer invalid-token" \
  http://localhost:8000/api/members/

# With valid token (should succeed)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/members/
```

---

## Monitoring

### Check Container Stats
```bash
docker stats crm-django-backend crm-postgres-django crm-redis-django crm-svelte-frontend
```

### Check Logs
```bash
# Real-time logs
docker-compose -f docker-compose.django.yml logs -f

# Filter by service
docker-compose -f docker-compose.django.yml logs -f backend

# Filter by keyword
docker-compose -f docker-compose.django.yml logs | grep ERROR
```

---

**Testing Status:** Ready for testing  
**GitHub:** https://github.com/dadinjaenudin/crm-svelte
