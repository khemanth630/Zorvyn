require('dotenv').config();
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, FinancialRecord } = require('../src/models');

let adminToken, analystToken, viewerToken;
let adminUser, analystUser, viewerUser;
let recordId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Create test users via API
  const adminRes = await request(app).post('/api/auth/register').send({
    name: 'Test Admin', email: 'admin@test.com', password: 'admin123', role: 'admin',
  });
  adminToken = adminRes.body.data.token;
  adminUser = adminRes.body.data.user;

  const analystRes = await request(app).post('/api/auth/register').send({
    name: 'Test Analyst', email: 'analyst@test.com', password: 'analyst123', role: 'analyst',
  });
  analystToken = analystRes.body.data.token;
  analystUser = analystRes.body.data.user;

  const viewerRes = await request(app).post('/api/auth/register').send({
    name: 'Test Viewer', email: 'viewer@test.com', password: 'viewer123', role: 'viewer',
  });
  viewerToken = viewerRes.body.data.token;
  viewerUser = viewerRes.body.data.user;
});

afterAll(async () => {
  await sequelize.close();
});

// ========================================
// AUTH TESTS
// ========================================
describe('Auth Endpoints', () => {
  test('POST /api/auth/register - should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'New User', email: 'newuser@test.com', password: 'pass123',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('newuser@test.com');
    expect(res.body.data.user.role).toBe('viewer'); // default role
    expect(res.body.data.user.password).toBeUndefined();
  });

  test('POST /api/auth/register - should fail with duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Dup User', email: 'admin@test.com', password: 'pass123',
    });
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/register - should fail with invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bad Email', email: 'not-an-email', password: 'pass123',
    });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/auth/register - should fail with missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'missing@test.com',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('POST /api/auth/login - should login successfully', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com', password: 'admin123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  test('POST /api/auth/login - should fail with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com', password: 'wrongpassword',
    });
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/me - should return current user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe('admin@test.com');
  });

  test('GET /api/auth/me - should fail without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});

// ========================================
// FINANCIAL RECORDS TESTS
// ========================================
describe('Financial Records Endpoints', () => {
  test('POST /api/records - admin can create a record', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        amount: 5000, type: 'income', category: 'Salary',
        date: '2024-03-15', description: 'Monthly salary',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.record.amount).toBe(5000);
    recordId = res.body.data.record.id;
  });

  test('POST /api/records - viewer cannot create a record', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        amount: 100, type: 'expense', category: 'Office',
        date: '2024-03-15',
      });
    expect(res.statusCode).toBe(403);
  });

  test('POST /api/records - analyst cannot create a record', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${analystToken}`)
      .send({
        amount: 100, type: 'expense', category: 'Office',
        date: '2024-03-15',
      });
    expect(res.statusCode).toBe(403);
  });

  test('POST /api/records - should fail with invalid data', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: -100, type: 'invalid' });
    expect(res.statusCode).toBe(400);
  });

  // Create more records for filtering/dashboard tests
  test('POST /api/records - create additional records', async () => {
    const records = [
      { amount: 1200, type: 'expense', category: 'Rent', date: '2024-03-01', description: 'Office rent' },
      { amount: 800, type: 'income', category: 'Freelance', date: '2024-03-20', description: 'Consulting' },
      { amount: 350, type: 'expense', category: 'Utilities', date: '2024-04-05', description: 'Bills' },
      { amount: 5000, type: 'income', category: 'Salary', date: '2024-04-15', description: 'April salary' },
    ];

    for (const rec of records) {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(rec);
      expect(res.statusCode).toBe(201);
    }
  });

  test('GET /api/records - all roles can view records', async () => {
    for (const token of [adminToken, analystToken, viewerToken]) {
      const res = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.records).toBeDefined();
      expect(res.body.data.pagination).toBeDefined();
    }
  });

  test('GET /api/records?type=income - filter by type', async () => {
    const res = await request(app)
      .get('/api/records?type=income')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    res.body.data.records.forEach((r) => expect(r.type).toBe('income'));
  });

  test('GET /api/records?category=Rent - filter by category', async () => {
    const res = await request(app)
      .get('/api/records?category=Rent')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.records.length).toBeGreaterThan(0);
  });

  test('GET /api/records?startDate=2024-04-01&endDate=2024-04-30 - filter by date range', async () => {
    const res = await request(app)
      .get('/api/records?startDate=2024-04-01&endDate=2024-04-30')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.records.length).toBe(2);
  });

  test('GET /api/records/:id - get single record', async () => {
    const res = await request(app)
      .get(`/api/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.record.id).toBe(recordId);
  });

  test('GET /api/records/:id - should return 404 for non-existent', async () => {
    const res = await request(app)
      .get('/api/records/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  test('PUT /api/records/:id - admin can update a record', async () => {
    const res = await request(app)
      .put(`/api/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 5500, description: 'Updated salary' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.record.amount).toBe(5500);
  });

  test('PUT /api/records/:id - viewer cannot update', async () => {
    const res = await request(app)
      .put(`/api/records/${recordId}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ amount: 9999 });
    expect(res.statusCode).toBe(403);
  });

  test('DELETE /api/records/:id - admin can soft delete', async () => {
    // Create a record to delete
    const createRes = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 99, type: 'expense', category: 'Test', date: '2024-01-01' });

    const deleteRes = await request(app)
      .delete(`/api/records/${createRes.body.data.record.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.statusCode).toBe(200);

    // Record should not appear in list (soft deleted)
    const listRes = await request(app)
      .get(`/api/records/${createRes.body.data.record.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(listRes.statusCode).toBe(404);
  });

  test('DELETE /api/records/:id - viewer cannot delete', async () => {
    const res = await request(app)
      .delete(`/api/records/${recordId}`)
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.statusCode).toBe(403);
  });
});

// ========================================
// DASHBOARD TESTS
// ========================================
describe('Dashboard Endpoints', () => {
  test('GET /api/dashboard/summary - analyst can access', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${analystToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.summary.totalIncome).toBeDefined();
    expect(res.body.data.summary.totalExpenses).toBeDefined();
    expect(res.body.data.summary.netBalance).toBeDefined();
    expect(res.body.data.summary.totalRecords).toBeDefined();
  });

  test('GET /api/dashboard/summary - viewer cannot access', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.statusCode).toBe(403);
  });

  test('GET /api/dashboard/category-summary - returns category breakdown', async () => {
    const res = await request(app)
      .get('/api/dashboard/category-summary')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.categories).toBeDefined();
    expect(Array.isArray(res.body.data.categories)).toBe(true);
  });

  test('GET /api/dashboard/trends - returns monthly trends', async () => {
    const res = await request(app)
      .get('/api/dashboard/trends')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.trends).toBeDefined();
  });

  test('GET /api/dashboard/recent - all roles can access', async () => {
    const res = await request(app)
      .get('/api/dashboard/recent')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.activities).toBeDefined();
  });
});

// ========================================
// USER MANAGEMENT TESTS
// ========================================
describe('User Management Endpoints', () => {
  test('GET /api/users - admin can list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.users).toBeDefined();
    expect(res.body.data.pagination).toBeDefined();
  });

  test('GET /api/users - viewer cannot list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.statusCode).toBe(403);
  });

  test('GET /api/users - analyst cannot list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${analystToken}`);
    expect(res.statusCode).toBe(403);
  });

  test('GET /api/users/:id - admin can get user details', async () => {
    const res = await request(app)
      .get(`/api/users/${viewerUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe('viewer@test.com');
  });

  test('PATCH /api/users/:id/role - admin can update role', async () => {
    const res = await request(app)
      .patch(`/api/users/${viewerUser.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'analyst' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.role).toBe('analyst');

    // Revert back
    await request(app)
      .patch(`/api/users/${viewerUser.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'viewer' });
  });

  test('PATCH /api/users/:id/status - admin can deactivate user', async () => {
    const res = await request(app)
      .patch(`/api/users/${viewerUser.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'inactive' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.status).toBe('inactive');

    // Reactivate
    await request(app)
      .patch(`/api/users/${viewerUser.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'active' });
  });

  test('PATCH /api/users/:id/role - should reject invalid role', async () => {
    const res = await request(app)
      .patch(`/api/users/${viewerUser.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'superadmin' });
    expect(res.statusCode).toBe(400);
  });

  test('DELETE /api/users/:id - admin cannot delete self', async () => {
    const res = await request(app)
      .delete(`/api/users/${adminUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(400);
  });
});

// ========================================
// EDGE CASES & ERROR HANDLING
// ========================================
describe('Error Handling', () => {
  test('Should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  test('Should return 401 for protected routes without token', async () => {
    const res = await request(app).get('/api/records');
    expect(res.statusCode).toBe(401);
  });

  test('Should return 401 for invalid token', async () => {
    const res = await request(app)
      .get('/api/records')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.statusCode).toBe(401);
  });

  test('Health check should work', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('running');
  });
});
