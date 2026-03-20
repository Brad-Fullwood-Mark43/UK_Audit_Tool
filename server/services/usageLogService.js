const db = require('../config/database');

class UsageLogService {
  /**
   * Insert or update user profiles
   */
  async upsertUsers(userProfiles) {
    if (!userProfiles || userProfiles.length === 0) return;

    const query = `
      INSERT INTO users (
        user_id, department_id, first_name, last_name, email,
        badge_number, user_role_id, primary_user_group, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT (user_id)
      DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        email = EXCLUDED.email,
        badge_number = EXCLUDED.badge_number,
        updated_at = datetime('now')
    `;

    for (const profile of userProfiles) {
      const email = `${profile.firstName?.toLowerCase()}.${profile.lastName?.toLowerCase()}@example.com`;
      await db.query(query, [
        profile.userId,
        profile.departmentId,
        profile.firstName,
        profile.lastName,
        email,
        profile.badgeNumber,
        profile.userRoleId,
        profile.primaryUserGroup
      ]);
    }
  }

  /**
   * Insert usage log entries
   */
  async insertUsageLogs(items) {
    if (!items || items.length === 0) return { inserted: 0 };

    const query = `
      INSERT INTO usage_logs (
        id, user_id, department_id, agency_id, usage_log_date_utc,
        ip_address, source_module, source_application, primary_entity_type,
        primary_entity_id, primary_entity_department_id, primary_entity_title,
        completion, action
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO NOTHING
    `;

    let inserted = 0;
    for (const item of items) {
      const result = await db.query(query, [
        item.id,
        item.userId,
        item.departmentId,
        item.agencyId,
        item.usageLogDateUtc,
        item.ipAddress,
        item.sourceModule,
        item.sourceApplication,
        item.primaryEntityType,
        item.primaryEntityId,
        item.primaryEntityDepartmentId,
        item.primaryEntityTitle,
        item.completion,
        item.action
      ]);
      if (result.rowCount > 0) inserted++;
    }

    return { inserted };
  }

  /**
   * Process complete usage log response
   */
  async processUsageLogResponse(response) {
    try {
      // First, upsert users
      if (response.userProfiles) {
        await this.upsertUsers(response.userProfiles);
      }

      // Then insert usage logs
      const result = await this.insertUsageLogs(response.items);

      return {
        success: true,
        totalCount: response.totalCount,
        inserted: result.inserted,
        users: response.userProfiles?.length || 0
      };
    } catch (error) {
      console.error('Error processing usage log response:', error);
      throw error;
    }
  }

  /**
   * Get usage logs by user
   */
  async getByUser(userId, startDate, endDate, limit = 100, offset = 0) {
    const query = `
      SELECT
        ul.*,
        u.first_name || ' ' || u.last_name as user_name,
        u.badge_number
      FROM usage_logs ul
      LEFT JOIN users u ON ul.user_id = u.user_id
      WHERE ul.user_id = ?
        AND (? IS NULL OR ul.usage_log_date_utc >= ?)
        AND (? IS NULL OR ul.usage_log_date_utc <= ?)
      ORDER BY ul.usage_log_date_utc DESC
      LIMIT ? OFFSET ?
    `;

    const result = await db.query(query, [userId, startDate, startDate, endDate, endDate, limit, offset]);
    return result.rows;
  }

  /**
   * Get usage logs by report
   */
  async getByReport(reportId, limit = 100, offset = 0) {
    const query = `
      SELECT
        ul.*,
        u.first_name || ' ' || u.last_name as user_name,
        u.badge_number
      FROM usage_logs ul
      LEFT JOIN users u ON ul.user_id = u.user_id
      WHERE ul.primary_entity_type = 'REPORT'
        AND ul.primary_entity_id = ?
      ORDER BY ul.usage_log_date_utc DESC
      LIMIT ? OFFSET ?
    `;

    const result = await db.query(query, [reportId, limit, offset]);
    return result.rows;
  }

  /**
   * Get user activity statistics
   */
  async getUserStats(userId, startDate, endDate) {
    const query = `
      SELECT
        COUNT(*) as total_actions,
        COUNT(DISTINCT DATE(usage_log_date_utc)) as active_days,
        COUNT(DISTINCT ip_address) as unique_ips,
        SUM(CASE WHEN primary_entity_type = 'REPORT' THEN 1 ELSE 0 END) as report_views,
        SUM(CASE WHEN action = 'LOGGED_IN' THEN 1 ELSE 0 END) as login_count,
        MIN(usage_log_date_utc) as first_activity,
        MAX(usage_log_date_utc) as last_activity
      FROM usage_logs
      WHERE user_id = ?
        AND (? IS NULL OR usage_log_date_utc >= ?)
        AND (? IS NULL OR usage_log_date_utc <= ?)
    `;

    const result = await db.query(query, [userId, startDate, startDate, endDate, endDate]);
    return result.rows[0];
  }
}

module.exports = new UsageLogService();
