const request = require('supertest');
const { app, server } = require('../server');
const { prisma } = require('../config/db');

describe('Room API Integration Tests', () => {
  let authToken;
  let userId;
  let testUser = {
    username: 'room_test_user_' + Date.now(),
    password: 'password123'
  };

  beforeAll(async () => {
    // Create a user and get token
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send(testUser);
    
    authToken = signupRes.body.data.token;
    userId = signupRes.body.data.user.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.gameParticipant.deleteMany({});
    await prisma.gameRoom.deleteMany({});
    await prisma.user.deleteMany({
      where: { username: testUser.username }
    });
    
    await prisma.$disconnect();
    server.close();
  });

  describe('POST /api/rooms/create', () => {
    it('should create a room and return it with participants', async () => {
      const roomData = {
        maxPlayers: 8,
        totalRounds: 5
      };

      const res = await request(app)
        .post('/api/rooms/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(roomData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBeDefined();
      expect(res.body.data.maxPlayers).toBe(8);
      expect(res.body.data.participants).toHaveLength(1);
      expect(res.body.data.participants[0].userId).toBe(userId);
    });

    it('should fail without auth token', async () => {
      const res = await request(app)
        .post('/api/rooms/create')
        .send({});

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
