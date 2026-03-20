const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const dbPath = path.join(dataDir, 'audit.db');

async function initDatabase() {
  try {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('✓ Created data directory\n');
    }

    // Remove existing database to start fresh
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('✓ Removed existing database\n');
    }

    console.log('Creating new SQLite database...');
    const db = new Database(dbPath);
    console.log('✓ Database created\n');

    console.log('Reading schema file...');
    const schemaPath = path.join(__dirname, '../schema-sqlite.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✓ Schema loaded\n');

    console.log('Executing schema...');
    db.exec(schema);
    console.log('✓ Schema executed successfully\n');

    console.log('Verifying tables...');
    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all();

    console.log('\nCreated tables:');
    tables.forEach(row => {
      console.log(`  - ${row.name}`);
    });

    console.log('\nVerifying views...');
    const views = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='view'
      ORDER BY name
    `).all();

    console.log('\nCreated views:');
    views.forEach(row => {
      console.log(`  - ${row.name}`);
    });

    db.close();
    console.log('\n✓ Database initialization complete!\n');
    console.log(`Database location: ${dbPath}\n`);

  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
