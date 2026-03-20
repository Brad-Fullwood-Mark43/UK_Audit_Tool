const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../data/audit.db');
const db = new Database(dbPath);

console.log('Exporting data from SQLite to PostgreSQL-compatible SQL...\n');

let sqlOutput = `-- UK Audit Tool Sample Data Export
-- Generated: ${new Date().toISOString()}
-- This file contains INSERT statements compatible with PostgreSQL

`;

// Export users
console.log('Exporting users...');
const users = db.prepare('SELECT * FROM users').all();
sqlOutput += `\n-- Users (${users.length} records)\n`;
users.forEach(user => {
  const values = [
    user.user_id,
    `'${user.first_name.replace(/'/g, "''")}'`,
    `'${user.last_name.replace(/'/g, "''")}'`,
    `'${user.email.replace(/'/g, "''")}'`,
    `'${user.badge_number.replace(/'/g, "''")}'`,
    user.department_id,
    `'${user.primary_user_group.replace(/'/g, "''")}'`,
    user.is_active ? 'true' : 'false'
  ].join(', ');

  sqlOutput += `INSERT INTO users (user_id, first_name, last_name, email, badge_number, department_id, primary_user_group, is_active) VALUES (${values});\n`;
});

// Export report_metadata
console.log('Exporting report metadata...');
const reports = db.prepare('SELECT * FROM report_metadata').all();
sqlOutput += `\n-- Report Metadata (${reports.length} records)\n`;
reports.forEach(report => {
  const values = [
    report.report_id,
    `'${report.report_type.replace(/'/g, "''")}'`
  ].join(', ');

  sqlOutput += `INSERT INTO report_metadata (report_id, report_type) VALUES (${values});\n`;
});

// Export usage_logs
console.log('Exporting usage logs...');
const usageLogs = db.prepare('SELECT * FROM usage_logs').all();
sqlOutput += `\n-- Usage Logs (${usageLogs.length} records)\n`;
usageLogs.forEach(log => {
  const values = [
    log.user_id,
    `'${log.usage_log_date_utc}'`,
    `'${log.action.replace(/'/g, "''")}'`,
    `'${log.primary_entity_type.replace(/'/g, "''")}'`,
    log.primary_entity_id,
    log.primary_entity_title ? `'${log.primary_entity_title.replace(/'/g, "''")}'` : 'NULL',
    log.ip_address ? `'${log.ip_address}'` : 'NULL'
  ].join(', ');

  sqlOutput += `INSERT INTO usage_logs (user_id, usage_log_date_utc, action, primary_entity_type, primary_entity_id, primary_entity_title, ip_address) VALUES (${values});\n`;
});

// Export report_history_events
console.log('Exporting report history events...');
const historyEvents = db.prepare('SELECT * FROM report_history_events').all();
sqlOutput += `\n-- Report History Events (${historyEvents.length} records)\n`;
historyEvents.forEach(event => {
  const values = [
    event.changed_by,
    `'${event.timestamp_utc}'`,
    `'${event.history_event_type.replace(/'/g, "''")}'`,
    event.history_event_category ? `'${event.history_event_category.replace(/'/g, "''")}'` : 'NULL',
    `'${event.primary_type.replace(/'/g, "''")}'`,
    event.primary_id,
    event.primary_name ? `'${event.primary_name.replace(/'/g, "''")}'` : 'NULL'
  ].join(', ');

  sqlOutput += `INSERT INTO report_history_events (id, changed_by, timestamp_utc, history_event_type, history_event_category, primary_type, primary_id, primary_name) VALUES (${event.id}, ${values});\n`;
});

// Export history_change_sets
console.log('Exporting history change sets...');
const changeSets = db.prepare('SELECT * FROM history_change_sets').all();
sqlOutput += `\n-- History Change Sets (${changeSets.length} records)\n`;
changeSets.forEach(cs => {
  const values = [
    cs.history_event_id,
    `'${cs.field_name.replace(/'/g, "''")}'`,
    cs.old_value ? `'${String(cs.old_value).replace(/'/g, "''")}'` : 'NULL',
    cs.new_value ? `'${String(cs.new_value).replace(/'/g, "''")}'` : 'NULL'
  ].join(', ');

  sqlOutput += `INSERT INTO history_change_sets (history_event_id, field_name, old_value, new_value) VALUES (${values});\n`;
});

// Write to file
const outputPath = path.join(__dirname, '../data/sample-data.sql');
fs.writeFileSync(outputPath, sqlOutput);

console.log(`\n✓ Export complete!`);
console.log(`\nData exported to: ${outputPath}`);
console.log(`\nSummary:`);
console.log(`  - ${users.length} users`);
console.log(`  - ${reports.length} reports`);
console.log(`  - ${usageLogs.length} usage log entries`);
console.log(`  - ${historyEvents.length} history events`);
console.log(`  - ${changeSets.length} change sets`);
console.log(`\nTo import into Railway PostgreSQL:`);
console.log(`  1. railway login`);
console.log(`  2. railway link (select your project)`);
console.log(`  3. cat data/sample-data.sql | railway run psql`);
console.log(`\nOr copy the SQL and paste into Railway's PostgreSQL console.`);

db.close();
