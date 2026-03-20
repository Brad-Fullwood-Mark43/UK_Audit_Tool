// Quick script to fix SQL for SQLite
const fs = require('fs');

const file = process.argv[2];
let content = fs.readFileSync(file, 'utf8');

// Remove PostgreSQL type casts
content = content.replace(/\$\d+::timestamp/g, '?');

// Replace $1, $2, etc with ?
// But we need to be careful with duplicate parameters
content = content.replace(/\$\d+/g, '?');

// Replace FILTER (WHERE ...) with CASE WHEN
content = content.replace(/COUNT\(\*\) FILTER \(WHERE ([^)]+)\)/g, 'SUM(CASE WHEN $1 THEN 1 ELSE 0 END)');
content = content.replace(/COUNT\(DISTINCT ([^)]+)\) FILTER \(WHERE ([^)]+)\)/g, 'COUNT(DISTINCT CASE WHEN $2 THEN $1 ELSE NULL END)');

// Replace ILIKE with LIKE (SQLite is case-insensitive by default)
content = content.replace(/ILIKE/g, 'LIKE');

// Replace NULLS LAST
content = content.replace(/ NULLS LAST/g, '');

fs.writeFileSync(file, content);
console.log('Fixed:', file);
