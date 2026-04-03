# Finance Data Processing and Access Control Backend

A **RESTful API** backend for a finance dashboard system with role-based access control, financial records management, and analytics. Built with **Node.js**, **Express**, **SQLite** (via Sequelize ORM), and **JWT** authentication.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [API Documentation](#api-documentation)
- [Access Control Matrix](#access-control-matrix)
- [Testing](#testing)
- [Assumptions & Tradeoffs](#assumptions--tradeoffs)

---

## Architecture

```
src/
├── config/          # Database configuration
├── models/          # Sequelize models (User, FinancialRecord)
├── middleware/       # Auth (JWT), RBAC, validation, error handling
├── routes/          # Express route definitions
├── controllers/     # Request handling (thin layer)
├── services/        # Business logic (fat layer)
├── utils/           # ApiError helper class
├── seeders/         # Database seed script
└── app.js           # Express app assembly
server.js            # Entry point
```

**Design principles:**
- **Layered architecture**: Routes → Controllers → Services → Models
- **Separation of concerns**: Controllers handle HTTP, services handle business logic
- **Centralized error handling**: All errors flow through a global error handler
- **Soft delete**: Financial records are soft-deleted (flagged, not removed)

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | SQLite (via Sequelize ORM) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Security | Helmet, CORS, express-rate-limit |
| Testing | Jest + Supertest |

---

## Setup & Installation

### Prerequisites
- **Node.js** v16+
- **npm** v8+

### Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd finance-backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env if needed (defaults work for development)

# 4. Seed the database with demo data
npm run seed

# 5. Start the development server
npm run dev
```

The server starts at **http://localhost:3000**.

### Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@finance.com | admin123 |
| Analyst | analyst@finance.com | analyst123 |
| Viewer | viewer@finance.com | viewer123 |

---

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All protected routes require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

---

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Server status |

---

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and get JWT token |
| GET | `/api/auth/me` | Yes | Get current user profile |

#### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "pass123"}'
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "viewer",
      "status": "active"
    },
    "token": "jwt_token_here"
  }
}
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@finance.com", "password": "admin123"}'
```

---

### User Management (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users (paginated) |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id/role` | Update user role |
| PATCH | `/api/users/:id/status` | Activate/deactivate user |
| DELETE | `/api/users/:id` | Delete a user |

#### Update Role
```bash
curl -X PATCH http://localhost:3000/api/users/<user-id>/role \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "analyst"}'
```

#### Deactivate User
```bash
curl -X PATCH http://localhost:3000/api/users/<user-id>/status \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'
```

---

### Financial Records

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/records` | Admin | Create a record |
| GET | `/api/records` | All | List records (filtered, paginated) |
| GET | `/api/records/:id` | All | Get a single record |
| PUT | `/api/records/:id` | Admin | Update a record |
| DELETE | `/api/records/:id` | Admin | Soft delete a record |

#### Query Parameters for Listing
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by `income` or `expense` |
| `category` | string | Filter by category (partial match) |
| `startDate` | string | Start date (YYYY-MM-DD) |
| `endDate` | string | End date (YYYY-MM-DD) |
| `search` | string | Search in description |
| `sortBy` | string | Sort field (`date`, `amount`, `category`) |
| `sortOrder` | string | `ASC` or `DESC` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

#### Create Record
```bash
curl -X POST http://localhost:3000/api/records \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000, "type": "income", "category": "Salary", "date": "2024-03-15", "description": "Monthly salary"}'
```

#### Filter Records
```bash
curl "http://localhost:3000/api/records?type=income&startDate=2024-01-01&endDate=2024-06-30&sortBy=amount&sortOrder=DESC" \
  -H "Authorization: Bearer <token>"
```

---

### Dashboard Analytics

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard/summary` | Analyst, Admin | Income/expense/balance totals |
| GET | `/api/dashboard/category-summary` | Analyst, Admin | Category-wise breakdown |
| GET | `/api/dashboard/trends?months=12` | Analyst, Admin | Monthly trends |
| GET | `/api/dashboard/recent?limit=10` | All | Recent activities |

#### Summary Response
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": 28450.00,
      "totalExpenses": 8055.00,
      "netBalance": 20395.00,
      "totalRecords": 25
    }
  }
}
```

#### Category Summary Response
```json
{
  "success": true,
  "data": {
    "categories": [
      { "category": "Salary", "income": 20200, "expense": 0, "net": 20200 },
      { "category": "Rent", "income": 0, "expense": 4800, "net": -4800 }
    ]
  }
}
```

---

## Access Control Matrix

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| Register / Login | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| View records | ✅ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| View summary/trends | ❌ | ✅ | ✅ |
| Create/update/delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

Access control is enforced via **middleware** (`auth.js` for authentication, `rbac.js` for role authorization) applied at the route level.

---

## Testing

```bash
# Run all tests
npm test
```

**Test coverage includes:**
- ✅ Auth flow (register, login, token validation, duplicate detection)
- ✅ RBAC enforcement (viewer blocked from writes, analyst from user management)
- ✅ Financial records CRUD with filtering
- ✅ Soft delete functionality
- ✅ Dashboard aggregation correctness
- ✅ User management (role updates, status changes, self-deletion guard)
- ✅ Validation errors (missing fields, invalid formats)
- ✅ Error responses (401, 403, 404, 409)

Tests use an **in-memory SQLite** database so they run fast and don't affect development data.

---

## Assumptions & Tradeoffs

1. **SQLite**: Chosen for zero-configuration setup. The app uses Sequelize ORM, so switching to PostgreSQL/MySQL only requires changing the config.

2. **Role during registration**: Users can specify a role during registration for demo purposes. In production, new users would default to `viewer` and admins would promote them.

3. **Soft delete**: Financial records use soft deletion (`is_deleted` flag) to preserve data integrity and audit trails. Deleted records are excluded from all queries by default via Sequelize's `defaultScope`.

4. **Password hashing**: Uses `bcryptjs` with 12 salt rounds via Sequelize model hooks — passwords are never stored in plain text.

5. **Rate limiting**: Applied globally at 100 requests per 15 minutes. In production, this would be configured per-route with different limits.

6. **No pagination cursor**: Uses offset-based pagination for simplicity. Cursor-based pagination would be more efficient for very large datasets.

---

## Error Response Format

All errors follow a consistent structure:

```json
{
  "success": false,
  "message": "Description of what went wrong",
  "errors": [
    { "field": "email", "message": "Must be a valid email address" }
  ]
}
```

**HTTP status codes used:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient role)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
