const request = require('supertest');
const { app, server } = require('../server');
const { prisma } = require('../config/db');

describe('Auth API Integration Tests', () => {
  let testUser = {
    username: 'api_test_user_' + Date.now(),
    password: 'password123'
  };

  afterAll(async () => {
    // Clean up test user
    await prisma.user.deleteMany({
      where: { username: testUser.username }
    });
    // Disconnect Prisma
    await prisma.$disconnect();
    // Close server to prevent open handles
    server.close();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe(testUser.username);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail if username already exists', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Username already taken');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send(testUser);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });
});
