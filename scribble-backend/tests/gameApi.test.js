const request = require('supertest');
const { app, server } = require('../server');
const { prisma } = require('../config/db');

jest.setTimeout(30000);

describe('Game API Integration Tests', () => {
  let hostToken, playerToken;
  let hostId, playerId;
  let testUsers;

  beforeAll(async () => {
    // Shared cleanup
    await prisma.round.deleteMany({});
    await prisma.gameParticipant.deleteMany({});
    await prisma.gameRoom.deleteMany({});
  });

  beforeEach(async () => {
    const suffix = Math.random().toString(36).substring(7);
    testUsers = [
      { username: 'h_' + suffix, password: 'password123' },
      { username: 'p_' + suffix, password: 'password123' }
    ];

    const res1 = await request(app).post('/api/auth/signup').send(testUsers[0]);
    const res2 = await request(app).post('/api/auth/signup').send(testUsers[1]);
    
    hostToken = res1.body.data.token;
    hostId = res1.body.data.user.id;
    playerToken = res2.body.data.token;
    playerId = res2.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });

  const createRoom = async (token) => {
    const res = await request(app)
      .post('/api/rooms/create')
      .set('Authorization', `Bearer ${token}`)
      .send({ maxPlayers: 4, totalRounds: 3 });
    return res.body.data;
  };

  const addParticipant = async (roomId, userId) => {
    return await prisma.gameParticipant.create({
      data: { roomId, userId }
    });
  };

  describe('POST /api/games/room/:roomId/start', () => {
    it('should successfully start the game (Fresh Room)', async () => {
      const room = await createRoom(hostToken);
      await addParticipant(room.id, playerId);

      const res = await request(app)
        .post(`/api/games/room/${room.id}/start`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updatedRoom = await prisma.gameRoom.findUnique({ where: { id: room.id } });
      expect(updatedRoom.status).toBe('ACTIVE');
    });

    it('should fail if user is NOT the host of the room', async () => {
      const room = await createRoom(hostToken);
      await addParticipant(room.id, playerId); // Now room has 2 players (host + player)

      // Use playerToken who is NOT the host
      const res = await request(app)
        .post(`/api/games/room/${room.id}/start`)
        .set('Authorization', `Bearer ${playerToken}`)
        .send({});

      expect(res.status).toBe(400); 
      expect(res.body.error).toBe('Only the host can start the game'); 
    });

    it('should prevent race condition (Double Start)', async () => {
      const room = await createRoom(hostToken);
      await addParticipant(room.id, playerId);

      // Hit /start twice in parallel
      const [res1, res2] = await Promise.all([
        request(app).post(`/api/games/room/${room.id}/start`).set('Authorization', `Bearer ${hostToken}`).send({}),
        request(app).post(`/api/games/room/${room.id}/start`).set('Authorization', `Bearer ${hostToken}`).send({})
      ]);

      // One should succeed (200), one should fail (400)
      const statuses = [res1.status, res2.status];
      expect(statuses).toContain(200);
      expect(statuses).toContain(400);
    });

    it('should fail with invalid roomId format', async () => {
      const res = await request(app)
        .post('/api/games/room/invalid-uuid/start')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({});

      expect(res.status).toBe(400); // Or 404 depending on error handling
    });

    it('should fail if room does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .post(`/api/games/room/${fakeId}/start`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Room not found');
    });
  });
});
