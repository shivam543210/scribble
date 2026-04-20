require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const { PrismaClient } = require('../generated/prisma');

const globalForPrisma = globalThis;

// Connection pooling URL from DATABASE_URL
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: adapter,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Tests the database connection.
 * Used in server.js to ensure the database is accessible on startup.
 */
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to PostgreSQL via Prisma');
  } catch (error) {
    console.error('Failed to connect to PostgreSQL:', error.message);
    // In production, we might want to exit the process
    // process.exit(1);
  }
}

module.exports = { prisma, testConnection };
