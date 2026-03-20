const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/audit.db');
const db = new Database(dbPath);

console.log('Generating additional report data based on existing patterns...\n');

// Get existing reports and their metadata
const existingReports = db.prepare('SELECT DISTINCT report_id FROM report_metadata').all();
const existingHistoryEvents = db.prepare('SELECT * FROM report_history_events LIMIT 50').all();
const existingChangeSets = db.prepare('SELECT * FROM history_change_sets LIMIT 50').all();
const existingUsageLogs = db.prepare("SELECT * FROM usage_logs WHERE primary_entity_type = 'REPORT' LIMIT 50").all();
const allUsers = db.prepare('SELECT user_id, first_name, last_name, badge_number FROM users').all();

console.log(`Found ${existingReports.length} existing reports`);
console.log(`Found ${allUsers.length} total users`);
console.log(`Creating 10 additional reports...\n`);

const reportTypes = ['Offense Report', 'Property Evidence Summary'];
const reportTitles = [
  'Event # 240009',
  'Event # 240010',
  'Incident # 240011',
  'Case # 240012',
  'Report # 240013',
  'Event # 240014',
  'Incident # 240015',
  'Case # 240016',
  'Event # 240017',
  'Report # 240018'
];

let totalUsageLogs = 0;
let totalHistoryEvents = 0;
let totalChangeSets = 0;

// Create 10 new reports
for (let i = 0; i < 10; i++) {
  const reportId = 54713700000 + i; // Sequential report IDs
  const reportType = reportTypes[Math.floor(Math.random() * reportTypes.length)];
  const reportTitle = reportTitles[i];

  // Insert report metadata
  const insertMetadata = db.prepare(`
    INSERT INTO report_metadata (report_id, report_type)
    VALUES (?, ?)
  `);
  insertMetadata.run(reportId, reportType);

  console.log(`Created ${reportType}: ${reportTitle} - ID: ${reportId}`);

  // Generate 10-30 random usage logs (views) for this report
  const numViews = Math.floor(Math.random() * 21) + 10;
  for (let j = 0; j < numViews; j++) {
    const user = allUsers[Math.floor(Math.random() * allUsers.length)];
    const template = existingUsageLogs[Math.floor(Math.random() * existingUsageLogs.length)];

    // Randomize timestamp within last 90 days
    const daysAgo = Math.floor(Math.random() * 90);
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(timestamp.getHours() - hoursAgo);

    // Vary IP addresses
    const ipParts = template.ip_address.split('.');
    ipParts[3] = Math.floor(Math.random() * 255);
    const newIp = ipParts.join('.');

    const insertLog = db.prepare(`
      INSERT INTO usage_logs (
        user_id, usage_log_date_utc, action, primary_entity_type,
        primary_entity_id, primary_entity_title, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertLog.run(
      user.user_id,
      timestamp.toISOString(),
      template.action,
      'REPORT',
      reportId,
      reportTitle,
      newIp
    );
    totalUsageLogs++;
  }

  // Generate 5-15 modification events for this report
  const numModifications = Math.floor(Math.random() * 11) + 5;
  for (let j = 0; j < numModifications; j++) {
    const user = allUsers[Math.floor(Math.random() * allUsers.length)];
    const template = existingHistoryEvents[Math.floor(Math.random() * existingHistoryEvents.length)];

    // Randomize timestamp within last 60 days
    const daysAgo = Math.floor(Math.random() * 60);
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(timestamp.getHours() - hoursAgo);

    const insertEvent = db.prepare(`
      INSERT INTO report_history_events (
        changed_by, timestamp_utc, history_event_type, history_event_category,
        primary_type, primary_id, primary_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const eventId = insertEvent.run(
      user.user_id,
      timestamp.toISOString(),
      template.history_event_type,
      template.history_event_category,
      'REPORT',
      reportId,
      reportTitle
    ).lastInsertRowid;

    totalHistoryEvents++;

    // Copy 0-3 random change sets from existing patterns
    const numChanges = Math.floor(Math.random() * 4);
    for (let k = 0; k < numChanges; k++) {
      const csTemplate = existingChangeSets[Math.floor(Math.random() * existingChangeSets.length)];

      const insertChangeSet = db.prepare(`
        INSERT INTO history_change_sets (
          history_event_id, field_name, old_value, new_value
        ) VALUES (?, ?, ?, ?)
      `);

      insertChangeSet.run(
        eventId,
        csTemplate.field_name,
        csTemplate.old_value,
        csTemplate.new_value
      );
      totalChangeSets++;
    }
  }

  console.log(`  Generated ${numViews} views and ${numModifications} modifications`);
}

console.log('\n✓ Report data generation complete!');
console.log(`\nSummary:`);
console.log(`  - Created 10 new reports`);
console.log(`  - Generated ${totalUsageLogs} usage log entries (views)`);
console.log(`  - Generated ${totalHistoryEvents} modification events`);
console.log(`  - Generated ${totalChangeSets} change sets`);
console.log(`\nTotal reports in database: ${existingReports.length + 10}`);

db.close();
