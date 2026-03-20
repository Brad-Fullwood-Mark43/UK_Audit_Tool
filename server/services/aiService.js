const Anthropic = require('@anthropic-ai/sdk');
const auditService = require('./auditService');

class AIService {
  constructor() {
    // Initialize Anthropic client (will use ANTHROPIC_API_KEY from environment)
    this.anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    }) : null;
  }

  /**
   * Query the audit database and generate a natural language response
   */
  async chat(userQuestion) {
    if (!this.anthropic) {
      return {
        success: false,
        error: 'Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable.'
      };
    }

    try {
      // Get context data from the database
      const context = await this.getDatabaseContext();

      // Create the system prompt
      const systemPrompt = `You are an AI assistant for an Internal Affairs audit tool for law enforcement RMS (Records Management System).

You have access to the following audit data:
${JSON.stringify(context, null, 2)}

Your job is to help investigators analyze user activity and report modifications. Answer questions about:
- What users have been doing
- Who accessed or modified specific reports
- Timeline of activities
- Patterns in user behavior

Be concise, professional, and focus on factual information from the data. If you don't have enough information to answer a question, say so.`;

      // Call Anthropic API
      const message = await this.anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          { role: "user", content: userQuestion }
        ]
      });

      return {
        success: true,
        response: message.content[0].text
      };

    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gather relevant context from the database
   */
  async getDatabaseContext() {
    try {
      // Get summary statistics
      const summary = await auditService.getActivitySummary(null, null);

      // Get all users with activity
      const users = await auditService.getAllUsers();

      // Get all reports
      const reports = await auditService.getAllReports();

      // Get detailed activity for each user (reports they accessed/modified)
      const userActivities = await Promise.all(
        users.slice(0, 10).map(async (u) => {
          const userReports = await auditService.getUserReports(u.user_id, null, null);
          return {
            name: `${u.first_name} ${u.last_name}`,
            badge: u.badge_number,
            user_id: u.user_id,
            usage_log_count: u.usage_log_count,
            modification_count: u.modification_count,
            reports_accessed: userReports.map(r => ({
              report_id: r.report_id,
              report_title: r.report_title,
              view_count: r.view_count,
              modification_count: r.modification_count,
              last_viewed: r.last_viewed,
              last_modified: r.last_modified
            }))
          };
        })
      );

      // Get ALL detailed activity with change information for ALL reports
      const allActivity = [];
      for (const report of reports) {
        const trail = await auditService.getReportAuditTrail(report.report_id);
        allActivity.push({
          report_id: report.report_id,
          report_title: report.report_title,
          report_type: report.report_type,
          events: trail.map(e => ({
            timestamp: e.timestamp,
            action: e.action,
            user_name: e.user_name,
            badge_number: e.badge_number,
            audit_type: e.audit_type,
            change_details: e.change_details
          }))
        });
      }

      return {
        summary,
        users: userActivities,
        reports: reports.map(r => ({
          id: r.report_id,
          title: r.report_title,
          type: r.report_type,
          view_count: r.view_count,
          modification_count: r.modification_count,
          last_activity: r.last_activity
        })),
        complete_audit_trail: allActivity
      };
    } catch (error) {
      console.error('Error gathering database context:', error);
      return {};
    }
  }
}

module.exports = new AIService();
