const { Pool } = require('pg');

// Create connection pool from DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Log connection events
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err.message);
});

/**
 * Execute a SQL query
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
const query = (text, params) => pool.query(text, params);

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection success
 */
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(`✅ Database connected at: ${res.rows[0].now}`);
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
};

module.exports = { pool, query, testConnection };
