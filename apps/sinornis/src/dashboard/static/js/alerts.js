/**
 * Sinornis Alert System - Alert Management JavaScript
 * Handles alert filtering, sorting, actions, and real-time updates
 */

class AlertManager {
    constructor() {
        this.alerts = [];
        this.filteredAlerts = [];
        this.currentFilters = {
            severity: '',
            status: 'active',
            farm: '',
            sensor: '',
            timeRange: '24h'
        };
        this.currentSort = 'timestamp-desc';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.selectedAlerts = new Set();
    }

    /**
     * Initialize the alert management system
     */
    static init() {
        const manager = new AlertManager();
        manager.setupEventListeners();
        manager.loadAlerts();
        manager.startRealTimeUpdates();
        return manager;
    }

    /**
     * Set up event listeners for UI interactions
     */
    setupEventListeners() {
        // Filter controls
        document.getElementById('severity-filter').addEventListener('change', (e) => {
            this.currentFilters.severity = e.target.value;
            this.applyFilters();
        });

        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.currentFilters.status = e.target.value;
            this.applyFilters();
        });

        document.getElementById('farm-filter').addEventListener('change', (e) => {
            this.currentFilters.farm = e.target.value;
            this.applyFilters();
        });

        document.getElementById('sensor-filter').addEventListener('change', (e) => {
            this.currentFilters.sensor = e.target.value;
            this.applyFilters();
        });

        document.getElementById('time-filter').addEventListener('change', (e) => {
            this.currentFilters.timeRange = e.target.value;
            this.applyFilters();
        });

        // Sort control
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.applySorting();
        });

        // Action buttons
        document.getElementById('refresh-alerts').addEventListener('click', () => {
            this.refreshAlerts();
        });

        document.getElementById('bulk-acknowledge').addEventListener('click', () => {
            this.bulkAcknowledge();
        });

        document.getElementById('export-alerts').addEventListener('click', () => {
            this.exportAlerts();
        });

        // View toggle
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleView(e.target.dataset.view);
            });
        });

        // Modal controls
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('alert-detail-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // Alert item actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-alert-action')) {
                this.handleAlertAction(e);
            }
            
            if (e.target.matches('.alert-checkbox input[type="checkbox"]')) {
                this.toggleAlertSelection(e);
            }
        });

        // Pagination
        document.addEventListener('click', (e) => {
            if (e.target.matches('.pagination-btn:not([disabled])')) {
                this.handlePagination(e);
            }
        });
    }

    /**
     * Load alerts from the server
     */
    async loadAlerts() {
        try {
            // In a real implementation, this would fetch from the server
            // For now, we'll use mock data
            this.alerts = this.generateMockAlerts();
            this.applyFilters();
            this.updateOverviewCards();
            this.updateAlertCounts();
        } catch (error) {
            console.error('Error loading alerts:', error);
            this.showNotification('Error loading alerts', 'error');
        }
    }

    /**
     * Generate alert data based on official Sinornis 28 alerts checklist
     */
    generateMockAlerts() {
        const sinornisAlerts = [
            {
                id: 'ALERT_001',
                severity: 'critical',
                title: '🌡️ Bird Breathing Difficulty - Heat Stress',
                message: 'ציפור מתקשה לנשום בעת לחץ חם או שילוב אדי מים ושמש אדומה. Temperature >25°C in houses with 150+ birds.',
                farm: 'Alpha Farm',
                sensor: 'TEMP-A1-001',
                sensorType: 'temperature',
                currentValue: '28.5°C',
                timestamp: new Date(Date.now() - 2 * 60000),
                status: 'active',
                acknowledged: false,
                acknowledgedBy: null,
                category: 'environmental_stress',
                visualIndicator: 'bird struggling breathing'
            },
            {
                id: 'ALERT_002',
                severity: 'warning', 
                title: '💨 High CO2 Levels Detected',
                message: 'רמות CO2 גבוהות מעל הסף המותר - 5 דקות מעל 5000 PPM. Increase ventilation immediately.',
                farm: 'Beta Farm',
                sensor: 'AQ-B1-002',
                sensorType: 'air_quality',
                currentValue: '5200 PPM',
                timestamp: new Date(Date.now() - 8 * 60000),
                status: 'active',
                acknowledged: false,
                acknowledgedBy: null,
                category: 'air_quality',
                visualIndicator: 'bird with CO2 molecules around'
            },
            {
                id: 'ALERT_004',
                severity: 'critical',
                title: '☣️ Critical Multi-Gas Alert - Emergency',
                message: 'רמות מסוכנות של מספר גזים - NH3>20PPM, CO2>4000PPM, H2S>20PPM. Emergency ventilation required!',
                farm: 'Gamma Farm',
                sensor: 'AQ-G1-001',
                sensorType: 'air_quality',
                currentValue: 'Multi-gas danger',
                timestamp: new Date(Date.now() - 5 * 60000),
                status: 'active',
                acknowledged: false,
                acknowledgedBy: null,
                category: 'emergency',
                visualIndicator: 'bird with danger sign and molecules around'
            },
            {
                id: 'ALERT_007',
                severity: 'critical',
                title: '🚰 Cooling Pad System Failure',
                message: 'תקלה במערכת הפד קירור - מים לא זורמים למשך 3 שעות בחלקים A-C. Check water pumps immediately.',
                farm: 'Alpha Farm',
                sensor: 'WATER-A-003',
                sensorType: 'water_flow',
                currentValue: '0 L/min',
                timestamp: new Date(Date.now() - 12 * 60000),
                status: 'active',
                acknowledged: false,
                acknowledgedBy: null,
                category: 'cooling_system',
                visualIndicator: 'running water on cooling pad and timer'
            },
            {
                id: 'ALERT_010',
                severity: 'critical',
                title: '💀 High Ammonia (NH3) Levels',
                message: 'רמות אמוניה גבוהות - מעל 25 PPM למעל 6 שעות רצוף. Immediate ventilation and waste cleaning required.',
                farm: 'Beta Farm',
                sensor: 'NH3-B2-001',
                sensorType: 'air_quality',
                currentValue: '28 PPM',
                timestamp: new Date(Date.now() - 20 * 60000),
                status: 'active',
                acknowledged: false,
                acknowledgedBy: null,
                category: 'air_quality',
                visualIndicator: 'flying NH3 molecules flashing'
            },
            {
                id: 'ALERT_012',
                severity: 'critical',
                title: '🏜️ Extremely Low Humidity',
                message: 'לחות נמוכה ביותר - RH מתחת ל-45% למשך 5 שעות רצוף. Add moisture to environment immediately.',
                farm: 'Gamma Farm',
                sensor: 'HUM-G1-001',
                sensorType: 'humidity',
                currentValue: '38% RH',
                timestamp: new Date(Date.now() - 25 * 60000),
                status: 'active',
                acknowledged: false,
                acknowledgedBy: null,
                category: 'environmental',
                visualIndicator: 'desert'
            },
            {
                id: 'ALERT_014',
                severity: 'critical',
                title: '🐥 Cold Draft on Young Chicks',
                message: 'רוח קרה על אפרוחים צעירים - מהירות רוח מעל 0.3 m/s במשך 14 ימים רצופים. Protect young chicks immediately.',
                farm: 'Alpha Farm',
                sensor: 'WIND-A-CHICK',
                sensorType: 'airflow',
                currentValue: '0.45 m/s',
                timestamp: new Date(Date.now() - 30 * 60000),
                status: 'active',
                acknowledged: false,
                acknowledgedBy: null,
                category: 'chick_welfare',
                visualIndicator: 'wind on chilled chicks'
            },
            {
                id: 'ALERT_018',
                severity: 'critical',
                title: '🚨 Emergency Bird Distress Calls',
                message: 'קריאות מצוקה של ציפורים - רעש חירום. Immediate intervention required, check for predators or emergency.',
                farm: 'Beta Farm',
                sensor: 'AUDIO-B1-001',
                sensorType: 'audio',
                currentValue: 'Emergency distress',
                timestamp: new Date(Date.now() - 1 * 60000),
                status: 'active',
                acknowledged: false,
                acknowledgedBy: null,
                category: 'emergency',
                visualIndicator: 'loud voice out of bird'
            },
            {
                id: 'ALERT_021',
                severity: 'critical',
                title: '🔥 Heater System Failure',
                message: 'כשל במערכת החימום - מתחת ל-2 שעות מהזמן הנדרש. Check heater functionality, activate backup heating.',
                farm: 'Gamma Farm',
                sensor: 'HEAT-G1-001',
                sensorType: 'heating',
                currentValue: '1.2 hours',
                timestamp: new Date(Date.now() - 35 * 60000),
                status: 'active',
                acknowledged: false,
                acknowledgedBy: null,
                category: 'heating_system',
                visualIndicator: 'flashing heater'
            },
            {
                id: 'ALERT_025',
                severity: 'critical',
                title: '❄️ Short-term Cold Stress (10 days)',
                message: 'מתח קור לטווח קצר - 1.5 מעלות מתחת לנורמה למשך 10 ימים. Increase heating, check insulation.',
                farm: 'Alpha Farm',
                sensor: 'TEMP-A-AVG',
                sensorType: 'temperature',
                currentValue: '-1.8°C deviation',
                timestamp: new Date(Date.now() - 45 * 60000),
                status: 'active',
                acknowledged: false,
                acknowledgedBy: null,
                category: 'temperature',
                visualIndicator: 'falling snow'
            },
            {
                id: 'ALERT_013',
                severity: 'warning',
                title: '🦠 High Bacteria Growth Conditions',
                message: 'תנאים מתאימים לגידול חיידקים - AQI מעל 150 + RH מעל 70% למשך 10 שעות. Sanitize environment, reduce humidity.',
                farm: 'Beta Farm',
                sensor: 'ENV-B1-001',
                sensorType: 'environmental',
                currentValue: 'AQI: 165, RH: 74%',
                timestamp: new Date(Date.now() - 50 * 60000),
                status: 'active',
                acknowledged: true,
                acknowledgedBy: 'Farm Manager',
                category: 'health_risk',
                visualIndicator: 'happy bacteria flying'
            },
            {
                id: 'ALERT_017',
                severity: 'warning',
                title: '🔊 Bird Vocalization Alert',
                message: 'קולות ציפורים חריגים המעידים על מתח. Check environmental conditions, investigate stress causes.',
                farm: 'Gamma Farm',
                sensor: 'AUDIO-G1-001',
                sensorType: 'audio',
                currentValue: 'Abnormal patterns',
                timestamp: new Date(Date.now() - 55 * 60000),
                status: 'active',
                acknowledged: true,
                acknowledgedBy: 'Technician',
                category: 'behavior',
                visualIndicator: 'loud voice out of bird'
            }
        ];

        return sinornisAlerts;
    }

    /**
     * Apply current filters to the alerts list
     */
    applyFilters() {
        this.filteredAlerts = this.alerts.filter(alert => {
            // Severity filter
            if (this.currentFilters.severity && alert.severity !== this.currentFilters.severity) {
                return false;
            }

            // Status filter
            if (this.currentFilters.status === 'active' && (alert.status !== 'active' || alert.acknowledged)) {
                return false;
            }
            if (this.currentFilters.status === 'acknowledged' && !alert.acknowledged) {
                return false;
            }
            if (this.currentFilters.status === 'resolved' && alert.status !== 'resolved') {
                return false;
            }

            // Farm filter
            if (this.currentFilters.farm && !alert.farm.toLowerCase().includes(this.currentFilters.farm.toLowerCase())) {
                return false;
            }

            // Sensor type filter
            if (this.currentFilters.sensor && alert.sensorType !== this.currentFilters.sensor) {
                return false;
            }

            // Time range filter
            const now = new Date();
            const alertTime = new Date(alert.timestamp);
            const timeDiff = now - alertTime;
            
            switch (this.currentFilters.timeRange) {
                case '1h':
                    if (timeDiff > 60 * 60 * 1000) return false;
                    break;
                case '24h':
                    if (timeDiff > 24 * 60 * 60 * 1000) return false;
                    break;
                case '7d':
                    if (timeDiff > 7 * 24 * 60 * 60 * 1000) return false;
                    break;
                case '30d':
                    if (timeDiff > 30 * 24 * 60 * 60 * 1000) return false;
                    break;
            }

            return true;
        });

        this.applySorting();
    }

    /**
     * Apply sorting to filtered alerts
     */
    applySorting() {
        this.filteredAlerts.sort((a, b) => {
            switch (this.currentSort) {
                case 'timestamp-desc':
                    return new Date(b.timestamp) - new Date(a.timestamp);
                case 'timestamp-asc':
                    return new Date(a.timestamp) - new Date(b.timestamp);
                case 'severity-desc':
                    const severityOrder = { critical: 3, warning: 2, info: 1 };
                    return severityOrder[b.severity] - severityOrder[a.severity];
                case 'location':
                    return a.farm.localeCompare(b.farm);
                default:
                    return 0;
            }
        });

        this.renderAlerts();
        this.updatePagination();
    }

    /**
     * Render the alerts list
     */
    renderAlerts() {
        const container = document.getElementById('alerts-container');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageAlerts = this.filteredAlerts.slice(startIndex, endIndex);

        container.innerHTML = pageAlerts.map(alert => this.renderAlertItem(alert)).join('');
    }

    /**
     * Render a single alert item
     */
    renderAlertItem(alert) {
        const timeAgo = this.getTimeAgo(alert.timestamp);
        const acknowledgedClass = alert.acknowledged ? ' acknowledged' : '';
        const acknowledgedBadge = alert.acknowledged 
            ? `<div class="alert-status-badge acknowledged">Acknowledged</div>` 
            : '';

        return `
            <div class="alert-item ${alert.severity}${acknowledgedClass}" data-alert-id="${alert.id}">
                <div class="alert-checkbox">
                    <input type="checkbox" id="alert-check-${alert.id}" ${this.selectedAlerts.has(alert.id) ? 'checked' : ''}>
                </div>
                <div class="alert-severity">
                    <span class="severity-indicator ${alert.severity}"></span>
                    <span class="severity-text">${alert.severity.toUpperCase()}</span>
                </div>
                <div class="alert-content">
                    <div class="alert-header">
                        <div class="alert-title">${alert.title}</div>
                        <div class="alert-timestamp">${timeAgo}</div>
                        ${acknowledgedBadge}
                    </div>
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-metadata">
                        <span class="meta-item">
                            <span class="meta-label">Farm:</span>
                            <span class="meta-value">${alert.farm}</span>
                        </span>
                        <span class="meta-item">
                            <span class="meta-label">Sensor:</span>
                            <span class="meta-value">${alert.sensor}</span>
                        </span>
                        <span class="meta-item">
                            <span class="meta-label">Current Value:</span>
                            <span class="meta-value">${alert.currentValue}</span>
                        </span>
                        ${alert.acknowledgedBy ? `
                        <span class="meta-item">
                            <span class="meta-label">Acknowledged by:</span>
                            <span class="meta-value">${alert.acknowledgedBy}</span>
                        </span>` : ''}
                    </div>
                </div>
                <div class="alert-actions">
                    ${!alert.acknowledged ? `
                    <button class="btn-alert-action btn-acknowledge" data-action="acknowledge" data-alert-id="${alert.id}">
                        <span class="btn-icon">✓</span>
                        Acknowledge
                    </button>` : ''}
                    <button class="btn-alert-action btn-details" data-action="details" data-alert-id="${alert.id}">
                        <span class="btn-icon">👁️</span>
                        Details
                    </button>
                    <button class="btn-alert-action btn-resolve" data-action="resolve" data-alert-id="${alert.id}">
                        <span class="btn-icon">✅</span>
                        Resolve
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Handle alert actions (acknowledge, resolve, details)
     */
    async handleAlertAction(event) {
        const action = event.target.dataset.action || event.target.closest('button').dataset.action;
        const alertId = event.target.dataset.alertId || event.target.closest('button').dataset.alertId;
        const alert = this.alerts.find(a => a.id === alertId);

        if (!alert) return;

        switch (action) {
            case 'acknowledge':
                await this.acknowledgeAlert(alertId);
                break;
            case 'resolve':
                await this.resolveAlert(alertId);
                break;
            case 'details':
                this.showAlertDetails(alert);
                break;
        }
    }

    /**
     * Acknowledge an alert
     */
    async acknowledgeAlert(alertId) {
        try {
            const alert = this.alerts.find(a => a.id === alertId);
            if (alert) {
                alert.acknowledged = true;
                alert.acknowledgedBy = 'Current User'; // In real app, get from auth
                this.applyFilters();
                this.updateOverviewCards();
                this.showNotification('Alert acknowledged successfully', 'success');
            }
        } catch (error) {
            console.error('Error acknowledging alert:', error);
            this.showNotification('Error acknowledging alert', 'error');
        }
    }

    /**
     * Resolve an alert
     */
    async resolveAlert(alertId) {
        try {
            const alert = this.alerts.find(a => a.id === alertId);
            if (alert) {
                alert.status = 'resolved';
                this.applyFilters();
                this.updateOverviewCards();
                this.showNotification('Alert resolved successfully', 'success');
            }
        } catch (error) {
            console.error('Error resolving alert:', error);
            this.showNotification('Error resolving alert', 'error');
        }
    }

    /**
     * Show alert details in modal
     */
    showAlertDetails(alert) {
        const modal = document.getElementById('alert-detail-modal');
        const content = document.getElementById('modal-content');
        
        content.innerHTML = `
            <div class="alert-detail">
                <div class="detail-header">
                    <h3>${alert.title}</h3>
                    <span class="severity-badge ${alert.severity}">${alert.severity.toUpperCase()}</span>
                </div>
                <div class="detail-content">
                    <p><strong>Message:</strong> ${alert.message}</p>
                    <p><strong>Farm:</strong> ${alert.farm}</p>
                    <p><strong>Sensor:</strong> ${alert.sensor}</p>
                    <p><strong>Current Value:</strong> ${alert.currentValue}</p>
                    <p><strong>Timestamp:</strong> ${alert.timestamp.toLocaleString()}</p>
                    <p><strong>Status:</strong> ${alert.status}</p>
                    ${alert.acknowledged ? `<p><strong>Acknowledged by:</strong> ${alert.acknowledgedBy}</p>` : ''}
                </div>
                <div class="detail-actions">
                    ${!alert.acknowledged ? `<button class="btn-action" onclick="AlertManager.instance.acknowledgeAlert('${alert.id}'); AlertManager.instance.closeModal();">Acknowledge</button>` : ''}
                    <button class="btn-action" onclick="AlertManager.instance.resolveAlert('${alert.id}'); AlertManager.instance.closeModal();">Resolve</button>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    }

    /**
     * Close the modal
     */
    closeModal() {
        document.getElementById('alert-detail-modal').classList.remove('active');
    }

    /**
     * Toggle alert selection
     */
    toggleAlertSelection(event) {
        const alertId = event.target.id.replace('alert-check-', '');
        
        if (event.target.checked) {
            this.selectedAlerts.add(alertId);
        } else {
            this.selectedAlerts.delete(alertId);
        }
    }

    /**
     * Bulk acknowledge selected alerts
     */
    async bulkAcknowledge() {
        if (this.selectedAlerts.size === 0) {
            this.showNotification('No alerts selected', 'warning');
            return;
        }

        try {
            for (const alertId of this.selectedAlerts) {
                await this.acknowledgeAlert(alertId);
            }
            this.selectedAlerts.clear();
            this.showNotification(`${this.selectedAlerts.size} alerts acknowledged`, 'success');
        } catch (error) {
            console.error('Error bulk acknowledging alerts:', error);
            this.showNotification('Error acknowledging alerts', 'error');
        }
    }

    /**
     * Export alerts to CSV
     */
    exportAlerts() {
        const csvContent = this.generateCSV();
        this.downloadCSV(csvContent, 'alerts.csv');
        this.showNotification('Alerts exported successfully', 'success');
    }

    /**
     * Generate CSV content from filtered alerts
     */
    generateCSV() {
        const headers = ['ID', 'Severity', 'Title', 'Message', 'Farm', 'Sensor', 'Value', 'Timestamp', 'Status', 'Acknowledged'];
        const rows = this.filteredAlerts.map(alert => [
            alert.id,
            alert.severity,
            alert.title,
            alert.message.replace(/,/g, ';'),
            alert.farm,
            alert.sensor,
            alert.currentValue,
            alert.timestamp.toISOString(),
            alert.status,
            alert.acknowledged ? 'Yes' : 'No'
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    /**
     * Download CSV file
     */
    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Toggle between list and card views
     */
    toggleView(view) {
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        const container = document.getElementById('alerts-container');
        container.className = `alerts-container ${view}-view`;
    }

    /**
     * Handle pagination
     */
    handlePagination(event) {
        const btn = event.target;
        const action = btn.textContent.trim();
        
        if (action === 'Previous' && this.currentPage > 1) {
            this.currentPage--;
        } else if (action === 'Next' && this.currentPage < this.getTotalPages()) {
            this.currentPage++;
        } else if (!isNaN(action)) {
            this.currentPage = parseInt(action);
        }
        
        this.renderAlerts();
        this.updatePagination();
    }

    /**
     * Update pagination controls
     */
    updatePagination() {
        const totalPages = this.getTotalPages();
        const info = document.querySelector('.pagination-info');
        const controls = document.querySelector('.pagination-controls');
        
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.filteredAlerts.length);
        
        info.textContent = `Showing ${startItem}-${endItem} of ${this.filteredAlerts.length} alerts`;
        
        controls.innerHTML = `
            <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button>
            ${Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + Math.max(1, this.currentPage - 2);
                return `<button class="pagination-btn ${page === this.currentPage ? 'active' : ''}">${page}</button>`;
            }).join('')}
            <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''}>Next</button>
        `;
    }

    /**
     * Get total number of pages
     */
    getTotalPages() {
        return Math.ceil(this.filteredAlerts.length / this.itemsPerPage);
    }

    /**
     * Update overview cards
     */
    updateOverviewCards() {
        const critical = this.alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;
        const warning = this.alerts.filter(a => a.severity === 'warning' && a.status === 'active').length;
        const info = this.alerts.filter(a => a.severity === 'info' && a.status === 'active').length;
        const resolved = this.alerts.filter(a => a.status === 'resolved').length;
        
        document.getElementById('overview-critical').textContent = critical;
        document.getElementById('overview-warning').textContent = warning;
        document.getElementById('overview-info').textContent = info;
        document.getElementById('overview-resolved').textContent = resolved;
    }

    /**
     * Update alert counts in header
     */
    updateAlertCounts() {
        const critical = this.alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;
        const warning = this.alerts.filter(a => a.severity === 'warning' && a.status === 'active').length;
        const info = this.alerts.filter(a => a.severity === 'info' && a.status === 'active').length;
        
        document.getElementById('critical-alerts').textContent = critical;
        document.getElementById('warning-alerts').textContent = warning;
        document.getElementById('info-alerts').textContent = info;
    }

    /**
     * Refresh alerts from server
     */
    async refreshAlerts() {
        const refreshBtn = document.getElementById('refresh-alerts');
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<span class="btn-icon">⏳</span> Refreshing...';
        
        try {
            await this.loadAlerts();
            this.showNotification('Alerts refreshed successfully', 'success');
        } catch (error) {
            console.error('Error refreshing alerts:', error);
            this.showNotification('Error refreshing alerts', 'error');
        } finally {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '<span class="btn-icon">🔄</span> Refresh';
        }
    }

    /**
     * Start real-time updates
     */
    startRealTimeUpdates() {
        // In a real implementation, this would establish WebSocket connection
        // For demo, we'll just refresh every 30 seconds
        setInterval(() => {
            this.loadAlerts();
        }, 30000);
    }

    /**
     * Get human-readable time ago string
     */
    getTimeAgo(timestamp) {
        const now = new Date();
        const alertTime = new Date(timestamp);
        const diffMs = now - alertTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Simple notification - in a real app, you'd use a proper notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        switch (type) {
            case 'success':
                notification.style.background = '#28a745';
                break;
            case 'error':
                notification.style.background = '#dc3545';
                break;
            case 'warning':
                notification.style.background = '#ffc107';
                notification.style.color = '#333';
                break;
            default:
                notification.style.background = '#17a2b8';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Store instance for global access
AlertManager.instance = null;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AlertManager.instance = AlertManager.init();
});