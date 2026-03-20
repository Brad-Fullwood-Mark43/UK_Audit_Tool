require('dotenv').config();

// Use SQLite for local development, PostgreSQL for production
const USE_SQLITE = !process.env.DATABASE_URL && process.env.NODE_ENV !== 'production';

if (USE_SQLITE) {
  console.log('Using SQLite database for local development');
  module.exports = require('./database-sqlite');
} else {
  console.log('Using PostgreSQL database');
  const { Pool } = require('pg');

  const connectionConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'uk_audit_tool',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
      };

  const pool = new Pool(connectionConfig);

  pool.on('connect', () => {
    console.log('✓ Database connected successfully');
  });

  pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    process.exit(-1);
  });

  module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
  };
}
