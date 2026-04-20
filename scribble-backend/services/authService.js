const { prisma } = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

class AuthService {
  /**
   * Create a new user
   * @param {Object} userData - User details (username, password)
   * @returns {Promise<Object>} Created user and JWT
   */
  async signup(userData) {
    const { username, password } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      throw new Error('Username already taken');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      }
    });

    // Generate token
    const token = generateToken(user.id);

    return { user: { id: user.id, username: user.username }, token };
  }

  /**
   * Authenticate a user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} Authenticated user and JWT
   */
  async login(credentials) {
    const { username, password } = credentials;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken(user.id);

    return { user: { id: user.id, username: user.username }, token };
  }
}

module.exports = new AuthService();
