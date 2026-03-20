// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

// State
let currentTab = 'users';
let users = [];
let selectedUser = null;

// ============================================================================
// DARK MODE
// ============================================================================

function toggleDarkMode() {
    const body = document.body;
    const icon = document.getElementById('dark-mode-icon');
    const text = document.getElementById('dark-mode-text');
    const logo = document.getElementById('logo');

    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        icon.textContent = '☀️';
        text.textContent = 'Light Mode';
        logo.src = 'assets/mark43-logo-dark-mode.svg';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        icon.textContent = '🌙';
        text.textContent = 'Dark Mode';
        logo.src = 'assets/mark43-logo.svg';
        localStorage.setItem('darkMode', 'disabled');
    }
}

function initDarkMode() {
    const darkMode = localStorage.getItem('darkMode');
    const logo = document.getElementById('logo');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        document.getElementById('dark-mode-icon').textContent = '☀️';
        document.getElementById('dark-mode-text').textContent = 'Light Mode';
        logo.src = 'assets/mark43-logo-dark-mode.svg';
    }
}

// ============================================================================
// TAB MANAGEMENT
// ============================================================================

function switchTab(tabName) {
    currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Show/hide tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(`tab-${tabName}`).style.display = 'block';

    // Load data for tab
    if (tabName === 'users') {
        loadAllUsers();
    } else if (tabName === 'reports') {
        loadAllReports();
    } else if (tabName === 'suspicious') {
        loadSuspiciousActivity();
    }
}

// ============================================================================
// API CALLS
// ============================================================================

async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function postAPI(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================================================
// STATS
// ============================================================================

async function loadStats() {
    try {
        const result = await fetchAPI('/analytics/summary');
        const stats = result.data;

        document.getElementById('stat-users').textContent = stats.active_users || 0;
        document.getElementById('stat-actions').textContent = formatNumber(stats.total_actions || 0);
        document.getElementById('stat-modifications').textContent = formatNumber(stats.total_modifications || 0);
        document.getElementById('stat-reports').textContent = formatNumber(stats.reports_affected || 0);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ============================================================================
// USER SEARCH
// ============================================================================

async function loadAllUsers() {
    const resultsDiv = document.getElementById('user-results');
    resultsDiv.innerHTML = '<div class="loading">Loading users...</div>';

    try {
        const result = await fetchAPI('/users');
        users = result.data;
        renderUsers(users);
    } catch (error) {
        resultsDiv.innerHTML = '<div class="no-results"><div class="no-results-icon">⚠️</div><h3>Error loading users</h3><p>' + error.message + '</p></div>';
    }
}

async function searchUsers() {
    const searchTerm = document.getElementById('user-search').value.trim();
    const resultsDiv = document.getElementById('user-results');

    if (!searchTerm) {
        loadAllUsers();
        return;
    }

    resultsDiv.innerHTML = '<div class="loading">Searching...</div>';

    try {
        const result = await fetchAPI(`/users/search?q=${encodeURIComponent(searchTerm)}`);
        renderUsers(result.data);
    } catch (error) {
        resultsDiv.innerHTML = '<div class="no-results"><div class="no-results-icon">⚠️</div><h3>Error searching users</h3><p>' + error.message + '</p></div>';
    }
}

function renderUsers(usersList) {
    const resultsDiv = document.getElementById('user-results');
    document.getElementById('user-count').textContent = `${usersList.length} user${usersList.length !== 1 ? 's' : ''}`;

    if (usersList.length === 0) {
        resultsDiv.innerHTML = '<div class="no-results"><div class="no-results-icon">🔍</div><h3>No users found</h3><p>Try a different search term</p></div>';
        return;
    }

    resultsDiv.innerHTML = usersList.map(user => `
        <div class="user-card" onclick="viewUserTimeline(${user.user_id})">
            <div class="user-card-header">
                <div class="user-info">
                    <h3>${user.first_name} ${user.last_name}</h3>
                    <div class="user-meta">
                        Badge: ${user.badge_number || 'N/A'} | Email: ${user.email || 'N/A'}
                        ${user.last_activity ? `<br>Last Activity: ${formatDateTime(user.last_activity)}` : ''}
                    </div>
                </div>
            </div>
            <div class="user-stats">
                <div class="user-stat">
                    <div class="user-stat-value">${formatNumber(user.usage_log_count || 0)}</div>
                    <div class="user-stat-label">Actions</div>
                </div>
                <div class="user-stat">
                    <div class="user-stat-value">${formatNumber(user.modification_count || 0)}</div>
                    <div class="user-stat-label">Modifications</div>
                </div>
                <div class="user-stat">
                    <div class="user-stat-value">${parseInt(user.usage_log_count || 0) + parseInt(user.modification_count || 0)}</div>
                    <div class="user-stat-label">Total Events</div>
                </div>
            </div>
        </div>
    `).join('');
}

async function viewUserTimeline(userId) {
    const resultsDiv = document.getElementById('user-results');
    resultsDiv.innerHTML = '<div class="loading">Loading user activity...</div>';

    try {
        // Get user profile
        const profileResult = await fetchAPI(`/users/${userId}`);
        const profile = profileResult.data;

        // Get timeline
        const timelineResult = await fetchAPI(`/users/${userId}/timeline?limit=100`);
        const timeline = timelineResult.data;

        // Get reports - skip for now if it fails
        let reports = [];
        try {
            const reportsResult = await fetchAPI(`/users/${userId}/reports`);
            reports = reportsResult.data;
        } catch (e) {
            console.log('Reports not available:', e);
        }

        renderUserTimeline(profile, timeline, reports);
    } catch (error) {
        resultsDiv.innerHTML = '<div class="no-results"><div class="no-results-icon">⚠️</div><h3>Error loading user activity</h3><p>' + error.message + '</p></div>';
    }
}

function renderUserTimeline(profile, timeline, reports) {
    const resultsDiv = document.getElementById('user-results');

    const stats = profile.stats || {};

    resultsDiv.innerHTML = `
        <button class="btn btn-primary" onclick="loadAllUsers()" style="margin-bottom: 20px;">← Back to Users</button>

        <div style="background: var(--bg-tertiary); padding: 24px; border-radius: 8px; margin-bottom: 24px;">
            <h2 style="margin-bottom: 16px; color: var(--text-secondary);">${profile.first_name} ${profile.last_name}</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 16px;">
                <div><strong>Badge:</strong> ${profile.badge_number || 'N/A'}</div>
                <div><strong>Email:</strong> ${profile.email || 'N/A'}</div>
                <div><strong>Department ID:</strong> ${profile.department_id}</div>
                <div><strong>User Group:</strong> ${profile.primary_user_group || 'N/A'}</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color);">
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: 700; color: var(--mark43-blue);">${formatNumber(stats.total_actions || 0)}</div>
                    <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">Total Actions</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: 700; color: var(--mark43-blue);">${formatNumber(stats.total_modifications || 0)}</div>
                    <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">Modifications</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: 700; color: var(--mark43-blue);">${formatNumber(stats.reports_viewed || 0)}</div>
                    <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">Reports Viewed</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: 700; color: var(--mark43-blue);">${formatNumber(stats.reports_modified || 0)}</div>
                    <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">Reports Modified</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: 700; color: var(--mark43-blue);">${stats.unique_ips || 0}</div>
                    <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">Unique IPs</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: 700; color: var(--mark43-blue);">${stats.active_days || 0}</div>
                    <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">Active Days</div>
                </div>
            </div>
        </div>

        <h3 style="margin-bottom: 16px; color: var(--text-secondary);">Reports Accessed/Modified</h3>
        <div style="margin-bottom: 24px;">
            ${reports.length > 0 ? reports.map(report => `
                <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 6px; margin-bottom: 12px;">
                    <div style="font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">${report.report_title || `Report #${report.report_id}`}</div>
                    <div style="display: flex; gap: 16px; font-size: 13px; color: var(--text-muted);">
                        <span><span class="badge badge-success">${report.view_count || 0} views</span></span>
                        <span><span class="badge badge-warning">${report.modification_count || 0} modifications</span></span>
                        ${report.last_viewed ? `<span>Last viewed: ${formatDateTime(report.last_viewed)}</span>` : ''}
                        ${report.last_modified ? `<span>Last modified: ${formatDateTime(report.last_modified)}</span>` : ''}
                    </div>
                </div>
            `).join('') : '<p style="color: var(--text-muted);">No reports accessed or modified</p>'}
        </div>

        <h3 style="margin-bottom: 16px; color: var(--text-secondary);">Activity Timeline (Last 100 Events)</h3>
        ${timeline.length > 0 ? timeline.map(event => `
            <div class="timeline-item ${event.source === 'USAGE_LOG' ? 'access' : 'modification'}">
                <div class="timeline-header">
                    <div class="timeline-action">
                        ${event.activity_type.replace(/_/g, ' ')}
                        ${event.source === 'USAGE_LOG' ? '<span class="badge badge-success">Access</span>' : '<span class="badge badge-warning">Modification</span>'}
                    </div>
                    <div class="timeline-time">${formatDateTime(event.timestamp)}</div>
                </div>
                <div class="timeline-details">
                    ${event.entity_title || `${event.entity_type} #${event.entity_id}`}
                    ${event.ip_address ? `<br><small>IP: ${event.ip_address}</small>` : ''}
                    ${event.change_details ? `<br><small>Changes: ${formatChangeDetails(event.change_details)}</small>` : ''}
                </div>
            </div>
        `).join('') : '<p style="color: var(--text-muted);">No activity found</p>'}
    `;
}

// ============================================================================
// REPORT SEARCH
// ============================================================================

async function loadAllReports() {
    const resultsDiv = document.getElementById('report-results');
    const reportType = document.getElementById('report-type-filter').value;
    resultsDiv.innerHTML = '<div class="loading">Loading reports...</div>';

    try {
        const url = reportType ? `/reports?reportType=${encodeURIComponent(reportType)}` : '/reports';
        const result = await fetchAPI(url);
        renderReports(result.data);
    } catch (error) {
        resultsDiv.innerHTML = '<div class="no-results"><div class="no-results-icon">⚠️</div><h3>Error loading reports</h3><p>' + error.message + '</p></div>';
    }
}

async function searchReports() {
    const searchTerm = document.getElementById('report-search').value.trim();
    const resultsDiv = document.getElementById('report-results');

    if (!searchTerm) {
        loadAllReports();
        return;
    }

    resultsDiv.innerHTML = '<div class="loading">Searching...</div>';

    try {
        const result = await fetchAPI(`/reports/search?q=${encodeURIComponent(searchTerm)}`);
        renderReports(result.data);
    } catch (error) {
        resultsDiv.innerHTML = '<div class="no-results"><div class="no-results-icon">⚠️</div><h3>Error searching reports</h3><p>' + error.message + '</p></div>';
    }
}

function renderReports(reportsList) {
    const resultsDiv = document.getElementById('report-results');
    document.getElementById('report-count').textContent = `${reportsList.length} report${reportsList.length !== 1 ? 's' : ''}`;

    if (reportsList.length === 0) {
        resultsDiv.innerHTML = '<div class="no-results"><div class="no-results-icon">🔍</div><h3>No reports found</h3><p>Try a different search term</p></div>';
        return;
    }

    resultsDiv.innerHTML = reportsList.map(report => `
        <div class="user-card" onclick="viewReportAudit(${report.report_id})">
            <div style="margin-bottom: 12px;">
                <h3 style="margin-bottom: 4px;">${report.report_title || `Report #${report.report_id}`}</h3>
                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">
                    ${report.report_type ? `<span class="badge" style="background: #4299e1; margin-right: 8px;">${report.report_type}</span>` : ''}
                    Last Activity: ${formatDateTime(report.last_activity)}
                </div>
            </div>
            <div style="display: flex; gap: 16px;">
                <span class="badge badge-success">${report.view_count || 0} views</span>
                <span class="badge badge-warning">${report.modification_count || 0} modifications</span>
            </div>
        </div>
    `).join('');
}

async function viewReportAudit(reportId) {
    const resultsDiv = document.getElementById('report-results');
    resultsDiv.innerHTML = '<div class="loading">Loading report audit trail...</div>';

    try {
        const result = await fetchAPI(`/reports/${reportId}/audit-trail`);
        renderReportAudit(reportId, result.data);
    } catch (error) {
        resultsDiv.innerHTML = '<div class="no-results"><div class="no-results-icon">⚠️</div><h3>Error loading report audit</h3><p>' + error.message + '</p></div>';
    }
}

function renderReportAudit(reportId, auditTrail, filters = { showAccess: true, showModification: true }) {
    const resultsDiv = document.getElementById('report-results');

    // Filter the audit trail based on selected filters
    const filteredTrail = auditTrail.filter(event => {
        if (event.audit_type === 'ACCESS') return filters.showAccess;
        if (event.audit_type === 'MODIFICATION') return filters.showModification;
        return true;
    });

    resultsDiv.innerHTML = `
        <button class="btn btn-primary" onclick="loadAllReports()" style="margin-bottom: 20px;">← Back to Reports</button>

        <h2 style="margin-bottom: 16px; color: var(--text-secondary);">Audit Trail for Report #${reportId}</h2>

        <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <div style="font-weight: 600; margin-bottom: 12px; color: var(--text-secondary);">Filter Activity Type:</div>
            <div style="display: flex; gap: 16px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="filter-access" ${filters.showAccess ? 'checked' : ''}
                           onchange="filterReportAudit(${reportId}, ${JSON.stringify(auditTrail).replace(/"/g, '&quot;')})"
                           style="width: 18px; height: 18px; cursor: pointer;">
                    <span class="badge badge-success">ACCESS</span>
                    <span style="color: var(--text-muted);">(${auditTrail.filter(e => e.audit_type === 'ACCESS').length})</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="filter-modification" ${filters.showModification ? 'checked' : ''}
                           onchange="filterReportAudit(${reportId}, ${JSON.stringify(auditTrail).replace(/"/g, '&quot;')})"
                           style="width: 18px; height: 18px; cursor: pointer;">
                    <span class="badge badge-warning">MODIFICATION</span>
                    <span style="color: var(--text-muted);">(${auditTrail.filter(e => e.audit_type === 'MODIFICATION').length})</span>
                </label>
            </div>
        </div>

        <div style="margin-bottom: 12px; color: var(--text-muted);">
            Showing ${filteredTrail.length} of ${auditTrail.length} event${auditTrail.length !== 1 ? 's' : ''}
        </div>

        ${filteredTrail.length > 0 ? filteredTrail.map(event => `
            <div class="timeline-item ${event.audit_type === 'ACCESS' ? 'access' : 'modification'}">
                <div class="timeline-header">
                    <div class="timeline-action">
                        ${event.action.replace(/_/g, ' ')}
                        <span class="badge ${event.audit_type === 'ACCESS' ? 'badge-success' : 'badge-warning'}">${event.audit_type}</span>
                    </div>
                    <div class="timeline-time">${formatDateTime(event.timestamp)}</div>
                </div>
                <div class="timeline-details">
                    User: ${event.user_name || 'Unknown'} (Badge: ${event.badge_number || 'N/A'})
                    ${event.ip_address ? `<br>IP Address: ${event.ip_address}` : ''}
                    ${event.change_details ? `<br>Changes: ${formatChangeDetails(event.change_details)}` : ''}
                </div>
            </div>
        `).join('') : '<div class="no-results"><div class="no-results-icon">🔍</div><h3>No events match the selected filters</h3><p>Try adjusting your filter settings</p></div>'}
    `;
}

function filterReportAudit(reportId, auditTrail) {
    const showAccess = document.getElementById('filter-access').checked;
    const showModification = document.getElementById('filter-modification').checked;
    renderReportAudit(reportId, auditTrail, { showAccess, showModification });
}

// ============================================================================
// AI ASSISTANT
// ============================================================================

async function sendChatMessage() {
    const input = document.getElementById('ai-chat-input');
    const question = input.value.trim();

    if (!question) return;

    const chatMessages = document.getElementById('chat-messages');

    // Add user message to chat
    chatMessages.innerHTML += `
        <div class="chat-message user">
            <strong>You:</strong> ${escapeHtml(question)}
        </div>
    `;

    // Clear input
    input.value = '';

    // Show loading indicator
    chatMessages.innerHTML += `
        <div class="chat-message assistant" id="ai-loading">
            <strong>AI Assistant:</strong> <em>Thinking...</em>
        </div>
    `;

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const data = await postAPI('/ai/chat', { question });

        // Remove loading indicator
        const loadingElement = document.getElementById('ai-loading');
        if (loadingElement) {
            loadingElement.remove();
        }

        if (data.success) {
            chatMessages.innerHTML += `
                <div class="chat-message assistant">
                    <strong>AI Assistant:</strong> ${escapeHtml(data.response)}
                </div>
            `;
        } else {
            chatMessages.innerHTML += `
                <div class="chat-message error" style="background: #f56565; color: white;">
                    <strong>Error:</strong> ${escapeHtml(data.error || 'Unknown error occurred')}
                </div>
            `;
        }

        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        const loadingElement = document.getElementById('ai-loading');
        if (loadingElement) {
            loadingElement.remove();
        }

        chatMessages.innerHTML += `
            <div class="chat-message error" style="background: #f56565; color: white;">
                <strong>Error:</strong> ${escapeHtml(error.message || 'Failed to communicate with AI')}
            </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// ============================================================================
// UTILITIES
// ============================================================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB');
}

function formatChangeDetails(details) {
    if (!details) return '';
    try {
        const changes = typeof details === 'string' ? JSON.parse(details) : details;
        return changes.map(c => `${c.field || c.fieldName}: ${c.old || c.oldValue} → ${c.new || c.newValue}`).join(', ');
    } catch (e) {
        return details.toString();
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    loadStats();
    loadAllUsers();

    // Enable Enter key for search
    document.getElementById('user-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchUsers();
    });

    document.getElementById('report-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchReports();
    });
});
