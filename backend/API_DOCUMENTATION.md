# 🚀 CRM Backend API Documentation

## Base URL
```
http://localhost:3001/api
```

## Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "data": { ... },
  "message": "Success/Error message"
}
```

---

## 👥 Member Endpoints

### Get All Members
```
GET /api/members
```

**Query Parameters:**
- `status` (optional): Filter by status (`Active`, `Inactive`, `All`)
- `search` (optional): Search by name, email, or phone

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "M001",
      "name": "Budi Santoso",
      "email": "budi@email.com",
      "phone": "081234567890",
      "address": "Jl. Sudirman No. 123, Jakarta",
      "join_date": "2024-01-15",
      "total_points": 1500,
      "tier_level": "Gold",
      "status": "Active",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Get Member by ID
```
GET /api/members/:id
```

### Create Member
```
POST /api/members
```

**Request Body:**
```json
{
  "id": "M006",
  "name": "John Doe",
  "email": "john@email.com",
  "phone": "081234567895",
  "address": "Jl. Example No. 1, Jakarta",
  "joinDate": "2024-12-12",
  "tierLevel": "Bronze",
  "status": "Active"
}
```

### Update Member
```
PUT /api/members/:id
```

**Request Body:** Same as Create Member (without id)

### Delete Member
```
DELETE /api/members/:id
```

### Get Member Statistics
```
GET /api/members/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMembers": 5,
    "activeMembers": 4,
    "totalPoints": 5800,
    "avgPoints": 1160,
    "tierDistribution": {
      "Bronze": 1,
      "Silver": 2,
      "Gold": 1,
      "Platinum": 1
    }
  }
}
```

---

## ⭐ Point Transaction Endpoints

### Get All Point Transactions
```
GET /api/points
```

**Query Parameters:**
- `type` (optional): Filter by type (`earn`, `redeem`, `expire`, `adjustment`, `All`)
- `search` (optional): Search by member name or description

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "PT001",
      "member_id": "M001",
      "member_name": "Budi Santoso",
      "type": "earn",
      "points": 500,
      "description": "Pembelian produk senilai Rp 5.000.000",
      "date": "2024-12-01",
      "reference_id": null,
      "created_at": "2024-12-01T10:00:00Z"
    }
  ]
}
```

### Create Point Transaction
```
POST /api/points
```

**Request Body:**
```json
{
  "id": "PT006",
  "memberId": "M001",
  "type": "earn",
  "points": 300,
  "description": "Pembelian produk",
  "date": "2024-12-12"
}
```

**Note:** Points will be automatically negated for `redeem` and `expire` types.

### Get Point Statistics
```
GET /api/points/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEarned": 2300,
    "totalRedeemed": 200,
    "netPoints": 2100,
    "transactionCount": 5
  }
}
```

---

## 🎫 Voucher Endpoints

### Get All Vouchers
```
GET /api/vouchers
```

**Query Parameters:**
- `status` (optional): Filter by status (`Active`, `Inactive`, `Expired`, `All`)
- `search` (optional): Search by name or code

### Get Voucher by ID
```
GET /api/vouchers/:id
```

### Create Voucher
```
POST /api/vouchers
```

**Request Body:**
```json
{
  "id": "V005",
  "code": "NEWYEAR2025",
  "name": "New Year Discount",
  "description": "Special discount for new year",
  "discountType": "percentage",
  "discountValue": 25,
  "minPurchase": 500000,
  "maxDiscount": 150000,
  "pointsCost": 250,
  "stock": 50,
  "validFrom": "2025-01-01",
  "validTo": "2025-01-31",
  "status": "Active"
}
```

### Update Voucher
```
PUT /api/vouchers/:id
```

### Delete Voucher
```
DELETE /api/vouchers/:id
```

### Get Voucher Statistics
```
GET /api/vouchers/stats
```

---

## 🎁 Redeem Transaction Endpoints

### Get All Redeem Transactions
```
GET /api/redeem
```

**Query Parameters:**
- `status` (optional): Filter by status (`Pending`, `Completed`, `Cancelled`, `Used`, `All`)
- `search` (optional): Search by member or voucher name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "R001",
      "member_id": "M001",
      "member_name": "Budi Santoso",
      "voucher_id": "V001",
      "voucher_name": "Diskon 20%",
      "voucher_code": "DISKON20",
      "points_used": 200,
      "redeem_date": "2024-12-05",
      "status": "Used",
      "used_date": "2024-12-06",
      "created_at": "2024-12-05T10:00:00Z",
      "updated_at": "2024-12-06T15:00:00Z"
    }
  ]
}
```

### Create Redeem Transaction
```
POST /api/redeem
```

**Request Body:**
```json
{
  "id": "R004",
  "memberId": "M001",
  "voucherId": "V001",
  "pointsUsed": 200,
  "redeemDate": "2024-12-12",
  "status": "Completed"
}
```

**Validations:**
- Member must exist and have sufficient points
- Voucher must exist and have stock available
- Automatically deducts points from member
- Automatically reduces voucher stock
- Creates corresponding point transaction

### Update Redeem Status
```
PATCH /api/redeem/:id/status
```

**Request Body:**
```json
{
  "status": "Used",
  "usedDate": "2024-12-12"
}
```

**Valid Status Transitions:**
- `Pending` → `Completed` or `Cancelled`
- `Completed` → `Used` or `Cancelled`

### Get Redeem Statistics
```
GET /api/redeem/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRedeems": 3,
    "pendingCount": 0,
    "completedCount": 2,
    "usedCount": 1,
    "cancelledCount": 0,
    "totalPointsUsed": 650
  }
}
```

---

## ❤️ Health Check

### Get API Health
```
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "CRM API is running",
  "timestamp": "2024-12-12T10:00:00.000Z"
}
```

---

## 🔐 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Insufficient points"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Member not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message (development only)"
}
```

---

## 📝 Notes

### Database
- **Type:** SQLite
- **Location:** `backend/crm_database.sqlite`
- **Initialization:** `npm run init-db`

### Transactions
- Point transactions automatically update member points
- Redeem transactions automatically:
  - Deduct member points
  - Reduce voucher stock
  - Create corresponding point transaction

### Data Validation
- Email must be unique
- Voucher code must be unique
- Points cannot be negative after transaction
- Voucher stock cannot go below 0

---

## 🚀 Quick Start

```bash
# Install dependencies
cd backend
npm install

# Initialize database
npm run init-db

# Start server
npm start

# Server will run on http://localhost:3001
```

---

## 🧪 Testing with curl

```bash
# Health check
curl http://localhost:3001/health

# Get all members
curl http://localhost:3001/api/members

# Get member by ID
curl http://localhost:3001/api/members/M001

# Create member
curl -X POST http://localhost:3001/api/members \
  -H "Content-Type: application/json" \
  -d '{"id":"M006","name":"Test User","email":"test@email.com","phone":"08123456789","address":"Test Address","joinDate":"2024-12-12","tierLevel":"Bronze","status":"Active"}'

# Get statistics
curl http://localhost:3001/api/members/stats
curl http://localhost:3001/api/points/stats
curl http://localhost:3001/api/vouchers/stats
curl http://localhost:3001/api/redeem/stats
```

---

## 📊 Database Schema

See `backend/src/config/initDb.js` for complete schema definition.

**Tables:**
- `members` - Customer data
- `vouchers` - Voucher/promotion data
- `point_transactions` - Point history
- `redeem_transactions` - Redemption history
- `users` - Authentication (future use)

---

**API Version:** 1.0.0  
**Last Updated:** December 12, 2024
