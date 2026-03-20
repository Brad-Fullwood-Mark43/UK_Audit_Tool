const db = require('../config/database');

class AuditService {
  /**
   * Get combined user activity timeline
   */
  async getUserActivityTimeline(userId, startDate, endDate, limit = 200, offset = 0) {
    const query = `
      SELECT *
      FROM vw_user_activity_timeline
      WHERE user_id = ?
        AND (CAST(? AS TIMESTAMP) IS NULL OR timestamp >= CAST(? AS TIMESTAMP))
        AND (CAST(? AS TIMESTAMP) IS NULL OR timestamp <= CAST(? AS TIMESTAMP))
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `;

    const result = await db.query(query, [userId, startDate, startDate, endDate, endDate, limit, offset]);
    return result.rows;
  }

  /**
   * Get complete user profile with activity summary
   */
  async getUserProfile(userId, startDate, endDate) {
    // Get user details
    const userQuery = `
      SELECT * FROM users WHERE user_id = ?
    `;
    const userResult = await db.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return null;
    }

    const user = userResult.rows[0];

    // Get activity stats from both sources
    const statsQuery = `
      SELECT
        -- Usage log stats
        SUM(CASE WHEN source = 'USAGE_LOG' THEN 1 ELSE 0 END) as total_actions,
        COUNT(DISTINCT ip_address) as unique_ips,
        SUM(CASE WHEN source = 'USAGE_LOG' AND entity_type = 'REPORT' THEN 1 ELSE 0 END) as reports_viewed,

        -- History stats
        SUM(CASE WHEN source = 'HISTORY_EVENT' THEN 1 ELSE 0 END) as total_modifications,
        COUNT(DISTINCT CASE WHEN source = 'HISTORY_EVENT' AND entity_type = 'REPORT' THEN entity_id ELSE NULL END) as reports_modified,

        -- Overall
        COUNT(DISTINCT DATE(timestamp)) as active_days,
        MIN(timestamp) as first_activity,
        MAX(timestamp) as last_activity
      FROM vw_user_activity_timeline
      WHERE user_id = ?
        AND (CAST(? AS TIMESTAMP) IS NULL OR timestamp >= CAST(? AS TIMESTAMP))
        AND (CAST(? AS TIMESTAMP) IS NULL OR timestamp <= CAST(? AS TIMESTAMP))
    `;

    const statsResult = await db.query(statsQuery, [userId, startDate, startDate, endDate, endDate]);

    return {
      ...user,
      stats: statsResult.rows[0]
    };
  }

  /**
   * Get all users with activity counts
   */
  async getAllUsers() {
    const query = `
      SELECT
        u.*,
        COUNT(DISTINCT ul.id) as usage_log_count,
        COUNT(DISTINCT rhe.id) as modification_count,
        MAX(CASE WHEN ul.usage_log_date_utc > rhe.timestamp_utc THEN ul.usage_log_date_utc ELSE rhe.timestamp_utc END) as last_activity
      FROM users u
      LEFT JOIN usage_logs ul ON u.user_id = ul.user_id
      LEFT JOIN report_history_events rhe ON u.user_id = rhe.changed_by
      WHERE u.is_active = true
      GROUP BY u.user_id
      ORDER BY last_activity DESC
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Search users by name, email, or badge
   */
  async searchUsers(searchTerm) {
    const query = `
      SELECT
        u.*,
        COUNT(DISTINCT ul.id) as usage_log_count,
        COUNT(DISTINCT rhe.id) as modification_count
      FROM users u
      LEFT JOIN usage_logs ul ON u.user_id = ul.user_id
      LEFT JOIN report_history_events rhe ON u.user_id = rhe.changed_by
      WHERE u.is_active = true
        AND (
          u.first_name LIKE ?
          OR u.last_name LIKE ?
          OR u.email LIKE ?
          OR u.badge_number LIKE ?
          OR (u.first_name || ' ' || u.last_name) LIKE ?
        )
      GROUP BY u.user_id
      ORDER BY u.last_name, u.first_name
      LIMIT 50
    `;

    const searchPattern = `%${searchTerm}%`;
    const result = await db.query(query, [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]);
    return result.rows;
  }

  /**
   * Get complete report audit trail
   */
  async getReportAuditTrail(reportId) {
    const query = `
      SELECT * FROM vw_report_audit_trail
      WHERE report_id = ?
      ORDER BY timestamp DESC
    `;

    const result = await db.query(query, [reportId]);
    return result.rows;
  }

  /**
   * Get reports accessed/modified by user
   */
  async getUserReports(userId, startDate, endDate) {
    const query = `
      SELECT
        COALESCE(ul.primary_entity_id, rhe.primary_id) as report_id,
        COALESCE(ul.primary_entity_title, rhe.primary_name) as report_title,
        COUNT(DISTINCT ul.id) as view_count,
        COUNT(DISTINCT rhe.id) as modification_count,
        MAX(ul.usage_log_date_utc) as last_viewed,
        MAX(rhe.timestamp_utc) as last_modified,
        array_agg(DISTINCT ul.ip_address) FILTER (WHERE ul.ip_address IS NOT NULL) as ip_addresses
      FROM users u
      LEFT JOIN usage_logs ul ON u.user_id = ul.user_id
        AND ul.primary_entity_type = 'REPORT'
        AND ul.primary_entity_id > 0
        AND (CAST(? AS TIMESTAMP) IS NULL OR ul.usage_log_date_utc >= CAST(? AS TIMESTAMP))
        AND (CAST(? AS TIMESTAMP) IS NULL OR ul.usage_log_date_utc <= CAST(? AS TIMESTAMP))
      LEFT JOIN report_history_events rhe ON u.user_id = rhe.changed_by
        AND rhe.primary_type = 'REPORT'
        AND (CAST(? AS TIMESTAMP) IS NULL OR rhe.timestamp_utc >= CAST(? AS TIMESTAMP))
        AND (CAST(? AS TIMESTAMP) IS NULL OR rhe.timestamp_utc <= CAST(? AS TIMESTAMP))
      WHERE u.user_id = ?
        AND (ul.primary_entity_id IS NOT NULL OR rhe.primary_id IS NOT NULL)
      GROUP BY report_id, report_title
      ORDER BY MAX(CASE WHEN ul.usage_log_date_utc > rhe.timestamp_utc THEN ul.usage_log_date_utc ELSE rhe.timestamp_utc END) DESC
    `;

    const result = await db.query(query, [startDate, startDate, endDate, endDate, startDate, startDate, endDate, endDate, userId]);
    return result.rows;
  }

  /**
   * Get suspicious activity patterns
   */
  async getSuspiciousActivity(limit = 50) {
    const query = `
      SELECT * FROM vw_suspicious_activity
      ORDER BY action_count DESC
      LIMIT ?
    `;

    const result = await db.query(query, [limit]);
    return result.rows;
  }

  /**
   * Get all reports with activity counts
   */
  async getAllReports(reportType = null) {
    const query = `
      WITH distinct_reports AS (
        SELECT DISTINCT primary_entity_id as report_id FROM usage_logs WHERE primary_entity_type = 'REPORT' AND primary_entity_id > 0
        UNION
        SELECT DISTINCT primary_id as report_id FROM report_history_events WHERE primary_type = 'REPORT'
      )
      SELECT
        dr.report_id,
        COALESCE(
          (SELECT primary_name FROM report_history_events
           WHERE primary_id = dr.report_id
             AND primary_type = 'REPORT'
             AND primary_name IS NOT NULL
             AND primary_name != ''
             AND primary_name != 'Report'
           ORDER BY timestamp_utc DESC LIMIT 1),
          (SELECT primary_entity_title FROM usage_logs WHERE primary_entity_id = dr.report_id AND primary_entity_type = 'REPORT' LIMIT 1),
          'Report #' || dr.report_id
        ) as report_title,
        (SELECT report_type FROM report_metadata WHERE report_id = dr.report_id) as report_type,
        (SELECT COUNT(DISTINCT id) FROM usage_logs WHERE primary_entity_id = dr.report_id AND primary_entity_type = 'REPORT') as view_count,
        (SELECT COUNT(DISTINCT id) FROM report_history_events WHERE primary_id = dr.report_id AND primary_type = 'REPORT') as modification_count,
        (SELECT MAX(timestamp_utc) FROM (
          SELECT usage_log_date_utc as timestamp_utc FROM usage_logs WHERE primary_entity_id = dr.report_id AND primary_entity_type = 'REPORT'
          UNION ALL
          SELECT timestamp_utc FROM report_history_events WHERE primary_id = dr.report_id AND primary_type = 'REPORT'
        )) as last_activity
      FROM distinct_reports dr
      WHERE (CAST(? AS VARCHAR) IS NULL OR (SELECT report_type FROM report_metadata WHERE report_id = dr.report_id) = CAST(? AS VARCHAR))
      ORDER BY last_activity DESC
    `;

    const result = await db.query(query, [reportType, reportType]);
    return result.rows;
  }

  /**
   * Search reports by report number or title
   */
  async searchReports(searchTerm) {
    const query = `
      SELECT DISTINCT
        COALESCE(ul.primary_entity_id, rhe.primary_id) as report_id,
        COALESCE(ul.primary_entity_title, rhe.primary_name) as report_title,
        COUNT(DISTINCT ul.id) as view_count,
        COUNT(DISTINCT rhe.id) as modification_count,
        MAX(CASE WHEN ul.usage_log_date_utc > rhe.timestamp_utc THEN ul.usage_log_date_utc ELSE rhe.timestamp_utc END) as last_activity
      FROM (
        SELECT DISTINCT primary_entity_id, primary_entity_title FROM usage_logs WHERE primary_entity_type = 'REPORT' AND primary_entity_id > 0 AND primary_entity_title LIKE ?
        UNION
        SELECT DISTINCT primary_id, primary_name FROM report_history_events WHERE primary_type = 'REPORT' AND primary_name LIKE ?
      ) reports
      LEFT JOIN usage_logs ul ON reports.primary_entity_id = ul.primary_entity_id AND ul.primary_entity_type = 'REPORT'
      LEFT JOIN report_history_events rhe ON reports.primary_entity_id = rhe.primary_id AND rhe.primary_type = 'REPORT'
      GROUP BY report_id, report_title
      ORDER BY last_activity DESC
      LIMIT 50
    `;

    const result = await db.query(query, [`%${searchTerm}%`, `%${searchTerm}%`]);
    return result.rows;
  }

  /**
   * Get activity summary for date range
   */
  async getActivitySummary(startDate, endDate) {
    const query = `
      SELECT
        COUNT(DISTINCT user_id) as active_users,
        SUM(CASE WHEN source = 'USAGE_LOG' THEN 1 ELSE 0 END) as total_actions,
        SUM(CASE WHEN source = 'HISTORY_EVENT' THEN 1 ELSE 0 END) as total_modifications,
        COUNT(DISTINCT CASE WHEN entity_type = 'REPORT' THEN entity_id ELSE NULL END) as reports_affected,
        SUM(CASE WHEN activity_type = 'LOGGED_IN' THEN 1 ELSE 0 END) as login_count,
        COUNT(DISTINCT ip_address) as unique_ips
      FROM vw_user_activity_timeline
      WHERE (CAST(? AS TIMESTAMP) IS NULL OR timestamp >= CAST(? AS TIMESTAMP))
        AND (CAST(? AS TIMESTAMP) IS NULL OR timestamp <= CAST(? AS TIMESTAMP))
    `;

    const result = await db.query(query, [startDate, startDate, endDate, endDate]);
    return result.rows[0];
  }
}

module.exports = new AuditService();
