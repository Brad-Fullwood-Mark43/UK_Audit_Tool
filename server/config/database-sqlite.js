const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../data/audit.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('✓ SQLite database connected:', dbPath);

// Wrapper to match PostgreSQL interface
const query = (text, params = []) => {
  try {
    const stmt = db.prepare(text);

    // Handle SELECT queries (including CTEs that start with WITH)
    const trimmed = text.trim().toUpperCase();
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
      const rows = stmt.all(...params);
      return { rows, rowCount: rows.length };
    }

    // Handle INSERT/UPDATE/DELETE
    const info = stmt.run(...params);
    return { rowCount: info.changes };
  } catch (error) {
    console.error('Query error:', error.message);
    console.error('Query:', text);
    throw error;
  }
};

module.exports = {
  query,
  db
};
