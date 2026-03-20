const db = require('../config/database');

class ReportHistoryService {
  /**
   * Insert report history events with their change sets
   */
  async insertHistoryEvents(historyEvents) {
    if (!historyEvents || historyEvents.length === 0) return { inserted: 0 };

    const eventQuery = `
      INSERT INTO report_history_events (
        id, timestamp_utc, changed_by, history_event_type, history_event_category,
        primary_id, primary_type, primary_name, secondary_id, secondary_type,
        secondary_name, link_type_name, directional_prefix, approval_status,
        client_approval_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO NOTHING
    `;

    const changeSetQuery = `
      INSERT INTO history_change_sets (
        history_event_id, field_name, old_value, new_value, history_value_type
      )
      VALUES (?, ?, ?, ?, ?)
    `;

    let inserted = 0;

    for (const event of historyEvents) {
      // Skip events with id = 0 (they appear to be duplicates)
      if (event.id === 0) continue;

      try {
        // Insert the history event
        const eventResult = await db.query(eventQuery, [
          event.id,
          event.timestampUtc,
          event.changedBy,
          event.historyEventType,
          event.historyEventCategory,
          event.primaryId,
          event.primaryType,
          event.primaryName,
          event.secondaryId,
          event.secondaryType,
          event.secondaryName,
          event.linkTypeName,
          event.directionalPrefix,
          event.approvalStatus,
          event.clientApprovalStatus
        ]);

        if (eventResult.rowCount > 0) {
          inserted++;

          // Insert change sets if they exist
          if (event.changeSet && event.changeSet.length > 0) {
            for (const change of event.changeSet) {
              await db.query(changeSetQuery, [
                event.id,
                change.fieldName,
                change.oldValue?.toString(),
                change.newValue?.toString(),
                change.historyValueType
              ]);
            }
          }
        }
      } catch (error) {
        console.error(`Error inserting history event ${event.id}:`, error.message);
        // Continue with other events
      }
    }

    return { inserted };
  }

  /**
   * Process complete report history response
   */
  async processReportHistoryResponse(response) {
    try {
      const result = await this.insertHistoryEvents(response.historyEvents);

      return {
        success: true,
        totalEvents: response.historyEvents?.length || 0,
        inserted: result.inserted
      };
    } catch (error) {
      console.error('Error processing report history response:', error);
      throw error;
    }
  }

  /**
   * Get history events by report
   */
  async getByReport(reportId, limit = 100, offset = 0) {
    const query = `
      SELECT
        rhe.*,
        u.first_name || ' ' || u.last_name as user_name,
        u.badge_number,
        (
          SELECT json_agg(
            json_build_object(
              'fieldName', field_name,
              'oldValue', old_value,
              'newValue', new_value,
              'historyValueType', history_value_type
            )
          )
          FROM history_change_sets
          WHERE history_event_id = rhe.id
        ) as change_details
      FROM report_history_events rhe
      LEFT JOIN users u ON rhe.changed_by = u.user_id
      WHERE rhe.primary_type = 'REPORT'
        AND rhe.primary_id = ?
      ORDER BY rhe.timestamp_utc DESC
      LIMIT ? OFFSET ?
    `;

    const result = await db.query(query, [reportId, limit, offset]);
    return result.rows;
  }

  /**
   * Get history events by user
   */
  async getByUser(userId, startDate, endDate, limit = 100, offset = 0) {
    const query = `
      SELECT
        rhe.*,
        u.first_name || ' ' || u.last_name as user_name,
        u.badge_number,
        (
          SELECT json_agg(
            json_build_object(
              'fieldName', field_name,
              'oldValue', old_value,
              'newValue', new_value,
              'historyValueType', history_value_type
            )
          )
          FROM history_change_sets
          WHERE history_event_id = rhe.id
        ) as change_details
      FROM report_history_events rhe
      LEFT JOIN users u ON rhe.changed_by = u.user_id
      WHERE rhe.changed_by = ?
        AND (? IS NULL OR rhe.timestamp_utc >= ?)
        AND (? IS NULL OR rhe.timestamp_utc <= ?)
      ORDER BY rhe.timestamp_utc DESC
      LIMIT ? OFFSET ?
    `;

    const result = await db.query(query, [userId, startDate, endDate, limit, offset]);
    return result.rows;
  }

  /**
   * Get complete audit trail for a report (combines access and modifications)
   */
  async getReportAuditTrail(reportId) {
    const query = `
      SELECT * FROM get_report_audit_trail(?)
    `;

    const result = await db.query(query, [reportId]);
    return result.rows;
  }

  /**
   * Get user modification statistics
   */
  async getUserModificationStats(userId, startDate, endDate) {
    const query = `
      SELECT
        COUNT(*) as total_modifications,
        COUNT(DISTINCT CASE WHEN primary_type = 'REPORT' THEN primary_id ELSE NULL END) as reports_modified,
        SUM(CASE WHEN history_event_type = 'FIELDS_CHANGED' THEN 1 ELSE 0 END) as field_changes,
        SUM(CASE WHEN history_event_type = 'ENTITY_CREATION' THEN 1 ELSE 0 END) as entities_created,
        SUM(CASE WHEN history_event_type = 'ENTITY_DELETE' THEN 1 ELSE 0 END) as entities_deleted,
        SUM(CASE WHEN history_event_type = 'REPORT_STATUS' THEN 1 ELSE 0 END) as status_changes,
        MIN(timestamp_utc) as first_modification,
        MAX(timestamp_utc) as last_modification
      FROM report_history_events
      WHERE changed_by = ?
        AND (? IS NULL OR timestamp_utc >= ?)
        AND (? IS NULL OR timestamp_utc <= ?)
    `;

    const result = await db.query(query, [userId, startDate, endDate]);
    return result.rows[0];
  }
}

module.exports = new ReportHistoryService();
