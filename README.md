# UK Audit Tool - RMS Internal Affairs System

A comprehensive audit tool for tracking user activity and report modifications in Mark43 RMS. Built for Internal Affairs investigations and compliance monitoring.

## Features

- **Dual Data Source Integration**: Combines Usage Logs and Report History for complete audit trails
- **User Activity Timeline**: Track every action a user takes in the system
- **Report Audit Trail**: See who accessed and modified specific reports
- **Suspicious Activity Detection**: Automatically flags unusual patterns
- **Mark43 Branding**: Professional interface matching Mark43 design standards
- **Dark Mode**: Eye-friendly interface for extended use
- **Railway Deployment**: Ready for cloud deployment

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL with optimized indexes and views
- **Frontend**: Vanilla JavaScript (no build step required)
- **Deployment**: Railway-ready with auto-configuration

## Data Sources

### Usage Logs
Captures:
- Login/logout events
- Report views
- Dashboard navigation
- IP addresses
- Module interactions

### Report History
Captures:
- Field-level changes
- Entity creation/deletion
- Relationship changes
- Approval workflow changes
- Sealing actions

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm >= 9.0.0

### Local Development

1. **Clone and Install**
```bash
cd /Users/brad.fullwood/Developer/UK_Audit_Tool
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Initialize Database**
```bash
npm run db:init
```

4. **Seed Sample Data** (optional)
```bash
# Start the server first
npm start

# In another terminal:
npm run db:seed
```

5. **Start Development**
```bash
npm start
```

6. **Access the Application**
- API: http://localhost:3000/api
- Frontend: Open `client/index.html` in your browser
- Health Check: http://localhost:3000/health

## Railway Deployment

1. **Create Railway Project**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init
```

2. **Add PostgreSQL Database**
- In Railway dashboard, add PostgreSQL plugin
- Railway will automatically set `DATABASE_URL` environment variable

3. **Deploy**
```bash
railway up
```

4. **Initialize Database on Railway**
```bash
railway run npm run db:init
```

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/search?q=<term>` - Search users
- `GET /api/users/:userId` - Get user profile with stats
- `GET /api/users/:userId/timeline` - Get user activity timeline
- `GET /api/users/:userId/reports` - Get reports accessed/modified by user

### Reports
- `GET /api/reports/search?q=<term>` - Search reports
- `GET /api/reports/:reportId/audit-trail` - Get complete report audit trail

### Analytics
- `GET /api/analytics/summary` - Get activity summary
- `GET /api/analytics/suspicious` - Get suspicious activity patterns

### Data Ingestion
- `POST /api/ingest/usage-logs` - Ingest usage log data
- `POST /api/ingest/report-history` - Ingest report history data

## Database Schema

### Core Tables
- `users` - User profiles
- `usage_logs` - System-wide activity logs
- `report_history_events` - Report modification history
- `history_change_sets` - Field-level change details

### Views
- `vw_user_activity_timeline` - Combined activity from both sources
- `vw_report_audit_trail` - Complete report access and modification history
- `vw_suspicious_activity` - Automated suspicious pattern detection

## Ingesting RMS Data

To populate with real RMS data, make POST requests to the ingestion endpoints:

```javascript
// Usage Logs
const usageLogResponse = await fetch('YOUR_RMS_URL/api/usage-logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(usageLogData)
});

// Report History
const historyResponse = await fetch('YOUR_RMS_URL/api/report-history', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(reportHistoryData)
});
```

Or use the ingestion endpoints:
```bash
curl -X POST http://localhost:3000/api/ingest/usage-logs \
  -H "Content-Type: application/json" \
  -d @usage-logs.json

curl -X POST http://localhost:3000/api/ingest/report-history \
  -H "Content-Type: application/json" \
  -d @report-history.json
```

## Future Enhancements (Phase 2)

- **OpenAI Integration**: Natural language queries about user activity
  - "What did Officer Smith do on March 15th?"
  - "Who accessed report #12345 this week?"
  - "Show me all suspicious activity patterns"

- **Export Capabilities**: PDF and CSV export of audit trails
- **Email Alerts**: Automated alerts for suspicious patterns
- **Advanced Filtering**: Date ranges, custom queries, saved filters
- **Report Scheduling**: Automated daily/weekly audit reports

## License

Proprietary - Mark43 Internal Use Only

## Support

For questions or issues, contact: brad.fullwood@mark43.com
