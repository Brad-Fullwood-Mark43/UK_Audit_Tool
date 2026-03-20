-- RMS Internal Affairs Audit Tool Database Schema
-- Supports both Usage Logs and Report History tracking

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table (denormalized from userProfiles in usage logs)
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT PRIMARY KEY,
    department_id BIGINT,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    badge_number VARCHAR(50),
    user_role_id BIGINT,
    primary_user_group VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_badge ON users(badge_number);
CREATE INDEX idx_users_dept ON users(department_id);

-- Report metadata (report type information)
CREATE TABLE IF NOT EXISTS report_metadata (
    report_id BIGINT PRIMARY KEY,
    report_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_report_metadata_type ON report_metadata(report_type);

-- ============================================================================
-- USAGE LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS usage_logs (
    id BIGINT PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id),
    department_id BIGINT,
    agency_id BIGINT,
    usage_log_date_utc TIMESTAMP NOT NULL,
    ip_address INET,
    source_module VARCHAR(100),
    source_application VARCHAR(50),
    primary_entity_type VARCHAR(100),
    primary_entity_id BIGINT,
    primary_entity_department_id BIGINT,
    primary_entity_title TEXT,
    completion VARCHAR(50),
    action VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_date ON usage_logs(usage_log_date_utc DESC);
CREATE INDEX idx_usage_logs_action ON usage_logs(action);
CREATE INDEX idx_usage_logs_entity_type ON usage_logs(primary_entity_type);
CREATE INDEX idx_usage_logs_entity_id ON usage_logs(primary_entity_id);
CREATE INDEX idx_usage_logs_ip ON usage_logs(ip_address);
CREATE INDEX idx_usage_logs_composite ON usage_logs(user_id, usage_log_date_utc DESC);

-- For report-specific queries
CREATE INDEX idx_usage_logs_report_access ON usage_logs(primary_entity_id, primary_entity_type)
    WHERE primary_entity_type = 'REPORT';

-- ============================================================================
-- REPORT HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_history_events (
    id BIGINT PRIMARY KEY,
    timestamp_utc TIMESTAMP NOT NULL,
    changed_by BIGINT REFERENCES users(user_id),
    history_event_type VARCHAR(100),
    history_event_category VARCHAR(50),
    primary_id BIGINT,
    primary_type VARCHAR(100),
    primary_name TEXT,
    secondary_id BIGINT,
    secondary_type VARCHAR(100),
    secondary_name TEXT,
    link_type_name VARCHAR(255),
    directional_prefix TEXT,
    approval_status VARCHAR(50),
    client_approval_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for history queries
CREATE INDEX idx_history_timestamp ON report_history_events(timestamp_utc DESC);
CREATE INDEX idx_history_changed_by ON report_history_events(changed_by);
CREATE INDEX idx_history_primary ON report_history_events(primary_id, primary_type);
CREATE INDEX idx_history_event_type ON report_history_events(history_event_type);
CREATE INDEX idx_history_category ON report_history_events(history_event_category);
CREATE INDEX idx_history_composite ON report_history_events(changed_by, timestamp_utc DESC);

-- For report-specific history
CREATE INDEX idx_history_report ON report_history_events(primary_id)
    WHERE primary_type = 'REPORT';

-- ============================================================================
-- CHANGE SETS (field-level changes from report history)
-- ============================================================================

CREATE TABLE IF NOT EXISTS history_change_sets (
    id SERIAL PRIMARY KEY,
    history_event_id BIGINT REFERENCES report_history_events(id) ON DELETE CASCADE,
    field_name VARCHAR(255),
    old_value TEXT,
    new_value TEXT,
    history_value_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_changesets_event ON history_change_sets(history_event_id);
CREATE INDEX idx_changesets_field ON history_change_sets(field_name);

-- ============================================================================
-- AUDIT VIEWS (for common IA queries)
-- ============================================================================

-- View: All user activity combined (usage logs + history)
CREATE OR REPLACE VIEW vw_user_activity_timeline AS
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
        SELECT json_agg(
            json_build_object(
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

-- View: Report-specific audit trail
CREATE OR REPLACE VIEW vw_report_audit_trail AS
SELECT
    r.primary_entity_id as report_id,
    r.primary_entity_title as report_title,
    r.user_id,
    u.first_name || ' ' || u.last_name as user_name,
    u.badge_number,
    r.usage_log_date_utc as timestamp,
    r.action,
    r.ip_address,
    'ACCESS' as audit_type
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
    'MODIFICATION' as audit_type
FROM report_history_events h
LEFT JOIN users u ON h.changed_by = u.user_id
WHERE h.primary_type = 'REPORT'
ORDER BY timestamp DESC;

-- View: Suspicious activity patterns
CREATE OR REPLACE VIEW vw_suspicious_activity AS
SELECT
    user_id,
    DATE(usage_log_date_utc) as activity_date,
    COUNT(*) as action_count,
    COUNT(DISTINCT ip_address) as unique_ips,
    COUNT(DISTINCT primary_entity_id) FILTER (WHERE primary_entity_type = 'REPORT') as reports_accessed,
    array_agg(DISTINCT ip_address) as ip_addresses
FROM usage_logs
GROUP BY user_id, DATE(usage_log_date_utc)
HAVING COUNT(*) > 50 OR COUNT(DISTINCT ip_address) > 3
ORDER BY action_count DESC;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get complete user activity for a date range
CREATE OR REPLACE FUNCTION get_user_activity(
    p_user_id BIGINT,
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
)
RETURNS TABLE (
    "timestamp" TIMESTAMP,
    activity_type VARCHAR,
    entity_type VARCHAR,
    entity_id BIGINT,
    entity_title TEXT,
    ip_address INET,
    change_summary TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.timestamp,
        v.activity_type,
        v.entity_type,
        v.entity_id,
        v.entity_title,
        v.ip_address,
        CASE
            WHEN v.change_details IS NOT NULL
            THEN v.change_details::TEXT
            ELSE NULL
        END as change_summary
    FROM vw_user_activity_timeline v
    WHERE v.user_id = p_user_id
        AND v.timestamp BETWEEN p_start_date AND p_end_date
    ORDER BY v.timestamp DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get complete report audit trail
CREATE OR REPLACE FUNCTION get_report_audit_trail(
    p_report_id BIGINT
)
RETURNS TABLE (
    "timestamp" TIMESTAMP,
    user_name TEXT,
    badge_number VARCHAR,
    action VARCHAR,
    audit_type VARCHAR,
    ip_address INET,
    change_details JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rat.timestamp,
        rat.user_name,
        rat.badge_number,
        rat.action,
        rat.audit_type,
        rat.ip_address,
        CASE
            WHEN rat.audit_type = 'MODIFICATION'
            THEN (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'field', field_name,
                        'old', old_value,
                        'new', new_value
                    )
                )
                FROM history_change_sets hcs
                JOIN report_history_events rhe ON hcs.history_event_id = rhe.id
                WHERE rhe.primary_id = p_report_id
                    AND rhe.timestamp_utc = rat.timestamp
            )
            ELSE NULL
        END as change_details
    FROM vw_report_audit_trail rat
    WHERE rat.report_id = p_report_id
    ORDER BY rat.timestamp DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'User profiles extracted from RMS usage logs and history events';
COMMENT ON TABLE report_metadata IS 'Report type classification and metadata';
COMMENT ON TABLE usage_logs IS 'System-wide user activity logs (views, logins, navigation)';
COMMENT ON TABLE report_history_events IS 'Report and entity modification history';
COMMENT ON TABLE history_change_sets IS 'Field-level changes associated with history events';
COMMENT ON VIEW vw_user_activity_timeline IS 'Combined timeline of all user activity from both sources';
COMMENT ON VIEW vw_report_audit_trail IS 'Complete audit trail for specific reports (access + modifications)';
COMMENT ON VIEW vw_suspicious_activity IS 'Potential suspicious activity patterns (high volume, multiple IPs)';
