const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const auditRoutes = require('./routes/auditRoutes');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust Railway's proxy for rate limiting and IP detection
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for now (tighten in production)
}));

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // In production, allow same-origin requests (Railway serves frontend and backend from same domain)
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }

    // In development, check allowed origins
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', async (req, res) => {
  try {
    await db.query("SELECT datetime('now')");
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Debug endpoint to check environment
app.get('/api/check-env', (req, res) => {
  res.json({
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    databaseType: process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite'
  });
});

// Database migration endpoint (for Railway one-time setup)
app.get('/api/migrate-database', async (req, res) => {
  try {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      return res.status(400).json({
        success: false,
        error: 'DATABASE_URL not set. Please add PostgreSQL database to Railway project.',
        hasDatabase: false
      });
    }
    console.log('🚀 Starting database migration...');

    const { Pool } = require('pg');
    const fs = require('fs');

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();

    // Step 0: Clean slate (drop existing tables)
    console.log('🧹 Cleaning existing tables...');
    await client.query(`
      DROP TABLE IF EXISTS history_change_sets CASCADE;
      DROP TABLE IF EXISTS report_history_events CASCADE;
      DROP TABLE IF EXISTS usage_logs CASCADE;
      DROP TABLE IF EXISTS report_metadata CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP VIEW IF EXISTS vw_user_activity_timeline CASCADE;
      DROP VIEW IF EXISTS vw_report_audit_trail CASCADE;
      DROP VIEW IF EXISTS vw_suspicious_activity CASCADE;
      DROP FUNCTION IF EXISTS get_user_activity CASCADE;
      DROP FUNCTION IF EXISTS get_report_audit_trail CASCADE;
    `);

    // Step 1: Schema
    console.log('📋 Creating schema...');
    const schemaPath = path.join(__dirname, '../schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);

    // Step 2: Data
    console.log('📦 Importing data...');
    const dataPath = path.join(__dirname, '../data/sample-data.sql');
    const dataSql = fs.readFileSync(dataPath, 'utf8');
    await client.query(dataSql);

    // Step 3: Verify
    console.log('🔍 Verifying...');
    const counts = {};
    const tables = ['users', 'report_metadata', 'usage_logs', 'report_history_events', 'history_change_sets'];

    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
      counts[table] = parseInt(result.rows[0].count);
    }

    client.release();
    await pool.end();

    console.log('✅ Migration completed!');

    res.json({
      success: true,
      message: 'Database migration completed successfully',
      counts,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// API routes
app.use('/api', auditRoutes);

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n===========================================');
  console.log('  UK AUDIT TOOL - Internal Affairs System');
  console.log('===========================================');
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Server: http://localhost:${PORT}`);
  console.log(`  API: http://localhost:${PORT}/api`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log('===========================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    db.pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});

module.exports = app;
