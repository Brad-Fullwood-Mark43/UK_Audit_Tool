-- RMS Internal Affairs Audit Tool Database Schema (SQLite)
-- Supports both Usage Logs and Report History tracking

-- ============================================================================
-- CORE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    department_id INTEGER,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    badge_number TEXT,
    user_role_id INTEGER,
    primary_user_group TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_badge ON users(badge_number);
CREATE INDEX IF NOT EXISTS idx_users_dept ON users(department_id);

-- ============================================================================
-- USAGE LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS usage_logs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    department_id INTEGER,
    agency_id INTEGER,
    usage_log_date_utc TEXT NOT NULL,
    ip_address TEXT,
    source_module TEXT,
    source_application TEXT,
    primary_entity_type TEXT,
    primary_entity_id INTEGER,
    primary_entity_department_id INTEGER,
    primary_entity_title TEXT,
    completion TEXT,
    action TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_date ON usage_logs(usage_log_date_utc DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_usage_logs_entity_type ON usage_logs(primary_entity_type);
CREATE INDEX IF NOT EXISTS idx_usage_logs_entity_id ON usage_logs(primary_entity_id);

-- ============================================================================
-- REPORT HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_history_events (
    id INTEGER PRIMARY KEY,
    timestamp_utc TEXT NOT NULL,
    changed_by INTEGER REFERENCES users(user_id),
    history_event_type TEXT,
    history_event_category TEXT,
    primary_id INTEGER,
    primary_type TEXT,
    primary_name TEXT,
    secondary_id INTEGER,
    secondary_type TEXT,
    secondary_name TEXT,
    link_type_name TEXT,
    directional_prefix TEXT,
    approval_status TEXT,
    client_approval_status TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_history_timestamp ON report_history_events(timestamp_utc DESC);
CREATE INDEX IF NOT EXISTS idx_history_changed_by ON report_history_events(changed_by);
CREATE INDEX IF NOT EXISTS idx_history_primary ON report_history_events(primary_id, primary_type);
CREATE INDEX IF NOT EXISTS idx_history_event_type ON report_history_events(history_event_type);

-- ============================================================================
-- CHANGE SETS
-- ============================================================================

CREATE TABLE IF NOT EXISTS history_change_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    history_event_id INTEGER REFERENCES report_history_events(id) ON DELETE CASCADE,
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    history_value_type TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_changesets_event ON history_change_sets(history_event_id);
CREATE INDEX IF NOT EXISTS idx_changesets_field ON history_change_sets(field_name);

-- ============================================================================
-- VIEWS
-- ============================================================================

CREATE VIEW IF NOT EXISTS vw_user_activity_timeline AS
SELECT
    'USAGE_LOG' as source,
    ul.id,
    ul.user_id,
    u.first_name || ' ' || u.last_name as user_name,
    u.badge_number,
    ul.usage_log_date_utc as timestamp,
    ul.action as activity_type,
    ul.primary_entity_type as entity_type,
    ul.primary_entity_id as entity_id,
    ul.primary_entity_title as entity_title,
    ul.ip_address,
    ul.completion as status,
    NULL as change_details
FROM usage_logs ul
LEFT JOIN users u ON ul.user_id = u.user_id

UNION ALL

SELECT
    'HISTORY_EVENT' as source,
    rhe.id,
    rhe.changed_by as user_id,
    u.first_name || ' ' || u.last_name as user_name,
    u.badge_number,
    rhe.timestamp_utc as timestamp,
    rhe.history_event_type as activity_type,
    rhe.primary_type as entity_type,
    rhe.primary_id as entity_id,
    rhe.primary_name as entity_title,
    NULL as ip_address,
    'SUCCEEDED' as status,
    (
        SELECT json_group_array(
            json_object(
                'field', field_name,
                'old', old_value,
                'new', new_value,
                'type', history_value_type
            )
        )
        FROM history_change_sets
        WHERE history_event_id = rhe.id
    ) as change_details
FROM report_history_events rhe
LEFT JOIN users u ON rhe.changed_by = u.user_id
ORDER BY timestamp DESC;

CREATE VIEW IF NOT EXISTS vw_report_audit_trail AS
SELECT
    r.primary_entity_id as report_id,
    r.primary_entity_title as report_title,
    r.user_id,
    u.first_name || ' ' || u.last_name as user_name,
    u.badge_number,
    r.usage_log_date_utc as timestamp,
    r.action,
    r.ip_address,
    'ACCESS' as audit_type,
    NULL as change_details
FROM usage_logs r
LEFT JOIN users u ON r.user_id = u.user_id
WHERE r.primary_entity_type = 'REPORT' AND r.primary_entity_id > 0

UNION ALL

SELECT
    h.primary_id as report_id,
    h.primary_name as report_title,
    h.changed_by as user_id,
    u.first_name || ' ' || u.last_name as user_name,
    u.badge_number,
    h.timestamp_utc as timestamp,
    h.history_event_type as action,
    NULL as ip_address,
    'MODIFICATION' as audit_type,
    (
        SELECT json_group_array(
            json_object(
                'fieldName', field_name,
                'oldValue', old_value,
                'newValue', new_value
            )
        )
        FROM history_change_sets hcs
        WHERE hcs.history_event_id = h.id
    ) as change_details
FROM report_history_events h
LEFT JOIN users u ON h.changed_by = u.user_id
WHERE h.primary_type = 'REPORT'
ORDER BY timestamp DESC;
