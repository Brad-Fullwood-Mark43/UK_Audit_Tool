const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/audit.db');
const db = new Database(dbPath);

console.log('Generating mock data based on existing patterns...\n');

// Create 10 additional users
const mockUsers = [
  { firstName: 'Sarah', lastName: 'Martinez', badge: '3D1', email: 'sarah.martinez@agency.gov', dept: 35013449721 },
  { firstName: 'Michael', lastName: 'Thompson', badge: '4I1', email: 'michael.thompson@agency.gov', dept: 35013449721 },
  { firstName: 'Jennifer', lastName: 'Anderson', badge: '5R1', email: 'jennifer.anderson@agency.gov', dept: 35013449721 },
  { firstName: 'David', lastName: 'Wilson', badge: '6P1', email: 'david.wilson@agency.gov', dept: 35013449721 },
  { firstName: 'Emily', lastName: 'Brown', badge: '7S1', email: 'emily.brown@agency.gov', dept: 35013449721 },
  { firstName: 'James', lastName: 'Davis', badge: '8I1', email: 'james.davis@agency.gov', dept: 35013449721 },
  { firstName: 'Linda', lastName: 'Garcia', badge: '9D1', email: 'linda.garcia@agency.gov', dept: 35013449721 },
  { firstName: 'Robert', lastName: 'Miller', badge: '10P1', email: 'robert.miller@agency.gov', dept: 35013449721 },
  { firstName: 'Patricia', lastName: 'Rodriguez', badge: '11S1', email: 'patricia.rodriguez@agency.gov', dept: 35013449721 },
  { firstName: 'Christopher', lastName: 'Lee', badge: '12I1', email: 'christopher.lee@agency.gov', dept: 35013449721 }
];

// Get existing usage log patterns
const existingUsageLogs = db.prepare('SELECT * FROM usage_logs').all();
const existingHistoryEvents = db.prepare('SELECT * FROM report_history_events').all();
const existingChangeSets = db.prepare('SELECT * FROM history_change_sets').all();

console.log(`Found ${existingUsageLogs.length} existing usage log entries`);
console.log(`Found ${existingHistoryEvents.length} existing history events`);
console.log(`Found ${existingChangeSets.length} existing change sets\n`);

let totalUsageLogs = 0;
let totalHistoryEvents = 0;
let totalChangeSets = 0;

// Insert mock users and generate their activities
mockUsers.forEach((user, index) => {
  const userId = 35013500000 + index; // Sequential user IDs

  // Insert user
  const insertUser = db.prepare(`
    INSERT INTO users (user_id, first_name, last_name, email, badge_number, department_id, primary_user_group, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);

  insertUser.run(userId, user.firstName, user.lastName, user.email, user.badge, user.dept, 'INVESTIGATOR');
  console.log(`Created user: ${user.firstName} ${user.lastName} (${user.badge}) - ID: ${userId}`);

  // Generate 5-15 random usage logs per user based on existing patterns
  const numUsageLogs = Math.floor(Math.random() * 11) + 5;
  for (let i = 0; i < numUsageLogs; i++) {
    const template = existingUsageLogs[Math.floor(Math.random() * existingUsageLogs.length)];

    // Randomize timestamp within last 90 days
    const daysAgo = Math.floor(Math.random() * 90);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(timestamp.getHours() - hoursAgo);
    timestamp.setMinutes(timestamp.getMinutes() - minutesAgo);

    const insertLog = db.prepare(`
      INSERT INTO usage_logs (
        user_id, usage_log_date_utc, action, primary_entity_type,
        primary_entity_id, primary_entity_title, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Vary IP addresses slightly
    const ipParts = template.ip_address.split('.');
    ipParts[3] = Math.floor(Math.random() * 255);
    const newIp = ipParts.join('.');

    insertLog.run(
      userId,
      timestamp.toISOString(),
      template.action,
      template.primary_entity_type,
      template.primary_entity_id,
      template.primary_entity_title,
      newIp
    );
    totalUsageLogs++;
  }

  // Generate 3-10 modification events per user based on existing patterns
  const numModifications = Math.floor(Math.random() * 8) + 3;
  for (let i = 0; i < numModifications; i++) {
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
      userId,
      timestamp.toISOString(),
      template.history_event_type,
      template.history_event_category,
      template.primary_type,
      template.primary_id,
      template.primary_name
    ).lastInsertRowid;

    totalHistoryEvents++;

    // Copy associated change sets
    const relatedChangeSets = existingChangeSets.filter(cs => cs.history_event_id === template.id);
    relatedChangeSets.forEach(cs => {
      const insertChangeSet = db.prepare(`
        INSERT INTO history_change_sets (
          history_event_id, field_name, old_value, new_value
        ) VALUES (?, ?, ?, ?)
      `);

      insertChangeSet.run(
        eventId,
        cs.field_name,
        cs.old_value,
        cs.new_value
      );
      totalChangeSets++;
    });
  }

  console.log(`  Generated ${numUsageLogs} usage logs and ${numModifications} modifications`);
});

console.log('\n✓ Mock data generation complete!');
console.log(`\nSummary:`);
console.log(`  - Created 10 new users`);
console.log(`  - Generated ${totalUsageLogs} usage log entries`);
console.log(`  - Generated ${totalHistoryEvents} history events`);
console.log(`  - Generated ${totalChangeSets} change sets`);

db.close();
