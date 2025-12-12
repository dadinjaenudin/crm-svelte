# 🔗 Backend Integration Guide

## Overview

Aplikasi CRM sekarang memiliki **Backend API** lengkap yang terintegrasi dengan frontend Svelte.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Svelte)                     │
│                   Port: 5173                             │
│  - Dashboard, Member, Points, Voucher, Redeem, Reports  │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ HTTP/REST API
                    │
┌───────────────────▼─────────────────────────────────────┐
│                Backend API (Node.js + Express)           │
│                   Port: 3001                             │
│  - RESTful Endpoints                                     │
│  - Business Logic                                        │
│  - Data Validation                                       │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ SQL Queries
                    │
┌───────────────────▼─────────────────────────────────────┐
│              Database (SQLite)                           │
│           File: crm_database.sqlite                      │
│  - Members, Vouchers, Point Transactions, Redeem Txns   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Backend Features

### ✅ Complete REST API
- **CRUD Operations**: Full Create, Read, Update, Delete for all entities
- **Search & Filter**: Query parameters for searching and filtering
- **Statistics**: Aggregated data endpoints for dashboards
- **Transaction Safety**: Database transactions for critical operations

### ✅ Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express 4.x
- **Database**: SQLite with better-sqlite3
- **Security**: Helmet, CORS
- **Validation**: Built-in validation

### ✅ Database Features
- **Tables**: Members, Vouchers, Point Transactions, Redeem Transactions
- **Relationships**: Foreign keys with CASCADE
- **Indexes**: Optimized queries
- **Constraints**: Data integrity checks
- **Auto-timestamps**: created_at, updated_at

---

## 📡 API Endpoints

### Base URL
```
Development: http://localhost:3001/api
Production:  https://3001-imiwsr37ew4twbhh8q98b-2b54fc91.sandbox.novita.ai/api
```

### Available Endpoints

#### Members API
```
GET    /api/members              # Get all members
GET    /api/members/stats        # Get statistics
GET    /api/members/:id          # Get single member
POST   /api/members              # Create member
PUT    /api/members/:id          # Update member
DELETE /api/members/:id          # Delete member
```

#### Points API
```
GET    /api/points               # Get all transactions
GET    /api/points/stats         # Get statistics
POST   /api/points               # Create transaction
```

#### Vouchers API
```
GET    /api/vouchers             # Get all vouchers
GET    /api/vouchers/stats       # Get statistics
GET    /api/vouchers/:id         # Get single voucher
POST   /api/vouchers             # Create voucher
PUT    /api/vouchers/:id         # Update voucher
DELETE /api/vouchers/:id         # Delete voucher
```

#### Redeem API
```
GET    /api/redeem               # Get all transactions
GET    /api/redeem/stats         # Get statistics
POST   /api/redeem               # Create transaction
PATCH  /api/redeem/:id/status    # Update status
```

#### Health Check
```
GET    /health                   # API health status
```

---

## 🔧 Setup & Configuration

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Initialize database (creates tables and sample data)
npm run init-db

# Start backend server
npm start

# Backend will run on http://localhost:3001
```

### 2. Frontend Configuration

Update `.env` file in project root:

```env
VITE_API_URL=http://localhost:3001/api
```

For production:
```env
VITE_API_URL=https://3001-imiwsr37ew4twbhh8q98b-2b54fc91.sandbox.novita.ai/api
```

### 3. Start Both Servers

Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
npm run dev
```

---

## 💻 Frontend Integration

### API Service Layer

Frontend menggunakan service layer (`src/lib/services/api.ts`) untuk berkomunikasi dengan backend:

```typescript
import api from '$lib/services/api';

// Get all members
const response = await api.getMembers();
const members = response.data;

// Create member
await api.createMember({
  id: 'M006',
  name: 'John Doe',
  email: 'john@email.com',
  // ... other fields
});

// Get statistics
const stats = await api.getMemberStats();
```

### Usage in Components

```svelte
<script>
  import api from '$lib/services/api';
  import { onMount } from 'svelte';
  
  let members = [];
  
  onMount(async () => {
    const response = await api.getMembers('Active');
    members = response.data;
  });
  
  async function createMember() {
    await api.createMember(formData);
    // Refresh data
    const response = await api.getMembers();
    members = response.data;
  }
</script>
```

---

## 📊 Database Schema

### Members Table
```sql
CREATE TABLE members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  join_date DATE NOT NULL,
  total_points INTEGER DEFAULT 0,
  tier_level TEXT CHECK(tier_level IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  status TEXT CHECK(status IN ('Active', 'Inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Vouchers Table
```sql
CREATE TABLE vouchers (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed')),
  discount_value REAL NOT NULL,
  min_purchase REAL DEFAULT 0,
  max_discount REAL,
  points_cost INTEGER NOT NULL,
  stock INTEGER NOT NULL,
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  status TEXT CHECK(status IN ('Active', 'Inactive', 'Expired')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Point Transactions Table
```sql
CREATE TABLE point_transactions (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  type TEXT CHECK(type IN ('earn', 'redeem', 'expire', 'adjustment')),
  points INTEGER NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  reference_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

### Redeem Transactions Table
```sql
CREATE TABLE redeem_transactions (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  voucher_id TEXT NOT NULL,
  points_used INTEGER NOT NULL,
  redeem_date DATE NOT NULL,
  status TEXT CHECK(status IN ('Pending', 'Completed', 'Cancelled', 'Used')),
  used_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE
);
```

---

## 🧪 Testing

### Test with curl

```bash
# Health check
curl http://localhost:3001/health

# Get all members
curl http://localhost:3001/api/members

# Get active members only
curl "http://localhost:3001/api/members?status=Active"

# Search members
curl "http://localhost:3001/api/members?search=Budi"

# Get statistics
curl http://localhost:3001/api/members/stats
curl http://localhost:3001/api/points/stats
curl http://localhost:3001/api/vouchers/stats
curl http://localhost:3001/api/redeem/stats

# Create member
curl -X POST http://localhost:3001/api/members \
  -H "Content-Type: application/json" \
  -d '{
    "id": "M006",
    "name": "Test User",
    "email": "test@email.com",
    "phone": "08123456789",
    "address": "Test Address",
    "joinDate": "2024-12-12",
    "tierLevel": "Bronze",
    "status": "Active"
  }'
```

### Test from Browser

Open browser console and run:

```javascript
// Fetch members
fetch('http://localhost:3001/api/members')
  .then(res => res.json())
  .then(data => console.log(data));

// Create member
fetch('http://localhost:3001/api/members', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'M007',
    name: 'Browser Test',
    email: 'browser@test.com',
    phone: '08199999999',
    address: 'Browser Street',
    joinDate: '2024-12-12',
    tierLevel: 'Bronze',
    status: 'Active'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 🔐 Security Features

### Implemented
- ✅ **Helmet**: Security headers
- ✅ **CORS**: Cross-origin resource sharing
- ✅ **Input Validation**: SQL injection prevention (prepared statements)
- ✅ **Error Handling**: Graceful error responses
- ✅ **Database Constraints**: Data integrity

### Future Enhancements
- 🔜 **JWT Authentication**: User login/logout
- 🔜 **Rate Limiting**: API request throttling
- 🔜 **API Keys**: Access control
- 🔜 **Password Hashing**: Secure authentication
- 🔜 **HTTPS**: Encrypted communication

---

## 📈 Performance

### Current Setup
- **Database**: SQLite (file-based, fast for < 100k records)
- **Connection**: Single connection (adequate for development)
- **Caching**: None (direct database queries)

### Production Recommendations
- **Database**: Migrate to PostgreSQL/MySQL for scalability
- **Connection Pool**: Implement connection pooling
- **Caching**: Add Redis for frequently accessed data
- **Load Balancing**: Multiple backend instances
- **CDN**: Static asset delivery

---

## 🚀 Deployment

### Current Environment
- Frontend: Port 5173 (Vite dev server)
- Backend: Port 3001 (Express server)
- Database: SQLite file (./backend/crm_database.sqlite)

### Production Deployment

#### Backend Options:
1. **Heroku** - Easy deployment with git push
2. **Railway** - Modern platform with SQLite support
3. **DigitalOcean App Platform** - Full-featured hosting
4. **AWS EC2** - Full control
5. **Vercel** - Serverless functions (requires adaptation)

#### Database Options:
1. **SQLite** (development/small scale)
2. **PostgreSQL** (recommended for production)
3. **MySQL** (alternative)
4. **MongoDB** (if migrating to NoSQL)

#### Frontend Options:
1. **Vercel** - Optimized for SvelteKit
2. **Netlify** - Easy deployment
3. **Cloudflare Pages** - Global CDN

---

## 📝 Migration Guide

### From In-Memory to API

**Before (In-Memory Store):**
```typescript
import { members } from '$lib/stores/data';

// Using store
$members.forEach(member => {
  console.log(member.name);
});
```

**After (API):**
```typescript
import api from '$lib/services/api';

// Using API
const response = await api.getMembers();
response.data.forEach(member => {
  console.log(member.name);
});
```

### Key Changes
1. **Async Operations**: All data operations are now asynchronous
2. **Error Handling**: Need to handle network errors
3. **Loading States**: Show loading indicators
4. **Data Refresh**: Manually refresh after mutations

---

## 🔄 Data Flow

### Create Member Flow
```
1. User fills form → Submit
2. Frontend validates input
3. Call api.createMember(data)
4. Backend receives POST /api/members
5. Backend validates data
6. Backend inserts to database
7. Backend returns new member
8. Frontend updates UI
```

### Redeem Voucher Flow
```
1. User selects member & voucher
2. Frontend validates (points, stock)
3. Call api.createRedeemTransaction()
4. Backend validates again
5. Backend starts transaction:
   - Insert redeem record
   - Deduct member points
   - Reduce voucher stock
   - Create point transaction
6. Backend commits transaction
7. Backend returns result
8. Frontend updates UI
```

---

## 📚 Additional Resources

- **API Documentation**: `backend/API_DOCUMENTATION.md`
- **Database Init Script**: `backend/src/config/initDb.js`
- **Backend Server**: `backend/src/server.js`
- **API Service**: `src/lib/services/api.ts`

---

## 🎉 Summary

✅ **Completed:**
- Full REST API backend
- SQLite database with schema
- CRUD operations for all entities
- Transaction safety
- Statistics endpoints
- Frontend API integration layer
- Comprehensive documentation

🚀 **Ready For:**
- Production deployment
- User authentication
- Advanced features (PDF export, email, etc.)
- Mobile app integration
- Third-party integrations

---

**Version:** 1.0.0  
**Last Updated:** December 12, 2024
