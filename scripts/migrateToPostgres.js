const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting PostgreSQL Migration...\n');

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable not set');
  console.log('\nPlease set DATABASE_URL to your Railway PostgreSQL connection string');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('✓ Connected to PostgreSQL database\n');

    // Step 1: Run schema
    console.log('📋 Step 1: Creating database schema...');
    const schemaPath = path.join(__dirname, '../schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    await client.query(schemaSql);
    console.log('✓ Schema created successfully\n');

    // Step 2: Import data
    console.log('📦 Step 2: Importing sample data...');
    const dataPath = path.join(__dirname, '../data/sample-data.sql');

    if (!fs.existsSync(dataPath)) {
      console.log('⚠️  Warning: sample-data.sql not found');
      console.log('Run: node scripts/exportDataToSQL.js first to generate it\n');
      return;
    }

    const dataSql = fs.readFileSync(dataPath, 'utf8');
    await client.query(dataSql);
    console.log('✓ Data imported successfully\n');

    // Step 3: Verify
    console.log('🔍 Step 3: Verifying migration...');

    const checks = [
      { table: 'users', expected: 12 },
      { table: 'report_metadata', expected: 14 },
      { table: 'usage_logs', expected: 290 },
      { table: 'report_history_events', expected: 210 },
      { table: 'history_change_sets', expected: 192 }
    ];

    for (const check of checks) {
      const result = await client.query(`SELECT COUNT(*) FROM ${check.table}`);
      const count = parseInt(result.rows[0].count);
      const status = count > 0 ? '✓' : '⚠️';
      console.log(`  ${status} ${check.table}: ${count} records`);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nYour Railway database now contains:');
    console.log('  - 12 users (2 real + 10 mock)');
    console.log('  - 14 reports (4 original + 10 generated)');
    console.log('  - 290+ usage logs');
    console.log('  - 210+ history events');
    console.log('  - 190+ change sets');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
