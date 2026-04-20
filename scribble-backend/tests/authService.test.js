require('dotenv').config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const { prismaMock } = require('./singleton');
const authService = require('../services/authService');
const bcrypt = require('bcryptjs');

describe('AuthService Unit Tests', () => {
  describe('signup', () => {
    it('should successfully create a new user', async () => {
      const userData = { username: 'testuser', password: 'password123' };
      
      // Mock findUnique to return null (user doesn't exist)
      prismaMock.user.findUnique.mockResolvedValue(null);
      
      // Mock create to return the user
      prismaMock.user.create.mockResolvedValue({
        id: 'uuid-123',
        username: userData.username,
        password: 'hashed-password'
      });

      const result = await authService.signup(userData);

      expect(result.user.username).toBe(userData.username);
      expect(result.token).toBeDefined();
      expect(prismaMock.user.create).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      const userData = { username: 'existinguser', password: 'password123' };
      
      prismaMock.user.findUnique.mockResolvedValue({ id: '1', username: 'existinguser' });

      await expect(authService.signup(userData)).rejects.toThrow('Username already taken');
    });
  });

  describe('login', () => {
    it('should successfully login with correct credentials', async () => {
      const username = 'testuser';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'uuid-123',
        username,
        password: hashedPassword
      });

      const result = await authService.login({ username, password });

      expect(result.user.username).toBe(username);
      expect(result.token).toBeDefined();
    });

    it('should throw error for invalid password', async () => {
      const username = 'testuser';
      const password = 'wrongpassword';
      const hashedPassword = await bcrypt.hash('password123', 10);

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'uuid-123',
        username,
        password: hashedPassword
      });

      await expect(authService.login({ username, password })).rejects.toThrow('Invalid credentials');
    });
  });
});
