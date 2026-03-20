const express = require('express');
const router = express.Router();
const auditService = require('../services/auditService');
const usageLogService = require('../services/usageLogService');
const reportHistoryService = require('../services/reportHistoryService');
const aiService = require('../services/aiService');

// ============================================================================
// USER ENDPOINTS
// ============================================================================

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await auditService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search users
router.get('/users/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Search term required' });
    }
    const users = await auditService.searchUsers(q);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user profile with stats
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const profile = await auditService.getUserProfile(
      userId,
      startDate || null,
      endDate || null
    );

    if (!profile) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user activity timeline
router.get('/users/:userId/timeline', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, limit = 200, offset = 0 } = req.query;

    const timeline = await auditService.getUserActivityTimeline(
      userId,
      startDate || null,
      endDate || null,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({ success: true, data: timeline, count: timeline.length });
  } catch (error) {
    console.error('Error fetching user timeline:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user reports accessed/modified
router.get('/users/:userId/reports', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const reports = await auditService.getUserReports(
      userId,
      startDate || null,
      endDate || null
    );

    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// REPORT ENDPOINTS
// ============================================================================

// Get all reports
router.get('/reports', async (req, res) => {
  try {
    const { reportType } = req.query;
    const reports = await auditService.getAllReports(reportType || null);
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search reports
router.get('/reports/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Search term required' });
    }
    const reports = await auditService.searchReports(q);
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error searching reports:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get complete report audit trail
router.get('/reports/:reportId/audit-trail', async (req, res) => {
  try {
    const { reportId } = req.params;
    const trail = await auditService.getReportAuditTrail(reportId);
    res.json({ success: true, data: trail });
  } catch (error) {
    console.error('Error fetching report audit trail:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ANALYTICS ENDPOINTS
// ============================================================================

// Get suspicious activity
router.get('/analytics/suspicious', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const suspicious = await auditService.getSuspiciousActivity(parseInt(limit));
    res.json({ success: true, data: suspicious });
  } catch (error) {
    console.error('Error fetching suspicious activity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get activity summary
router.get('/analytics/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await auditService.getActivitySummary(
      startDate || null,
      endDate || null
    );
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching activity summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// DATA INGESTION ENDPOINTS
// ============================================================================

// Ingest usage logs
router.post('/ingest/usage-logs', async (req, res) => {
  try {
    const result = await usageLogService.processUsageLogResponse(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error ingesting usage logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ingest report history
router.post('/ingest/report-history', async (req, res) => {
  try {
    const result = await reportHistoryService.processReportHistoryResponse(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error ingesting report history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// AI ASSISTANT ENDPOINTS
// ============================================================================

// Chat with AI assistant
router.post('/ai/chat', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, error: 'Question required' });
    }

    const result = await aiService.chat(question);
    res.json(result);
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
