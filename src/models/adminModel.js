const { randomUUID } = require('crypto');
const { DatabaseAdapter } = require('../db');

class AdminModel {
    constructor() { this.db = DatabaseAdapter; }
    all(sql, params = []) { return this.db.all(sql, params); }
    run(sql, params = []) { return this.db.run(sql, params); }
    get(sql, params = []) { return this.db.get(sql, params); }
    async ensurePartnershipTable() { await this.db.ensurePartnershipRequestsTable(); }
    async getOverview() {
        const rows = await this.all(`SELECT (SELECT COUNT(*) FROM users WHERE status != 'deleted') AS users, (SELECT COUNT(*) FROM items WHERE type = 'lost') AS lost, (SELECT COUNT(*) FROM items WHERE type = 'found') AS found, (SELECT COUNT(*) FROM matches) AS matches, (SELECT COUNT(*) FROM reports WHERE status = 'pending') AS pending_reports`);
        return rows[0];
    }
    getRecentItems() { return this.all('SELECT items.*, users.name AS owner_name FROM items JOIN users ON users.id = items.user_id ORDER BY items.created_at DESC LIMIT 20'); }
    getReports() { return this.all('SELECT reports.*, items.title AS item_title, users.name AS reporter_name FROM reports JOIN items ON items.id = reports.item_id JOIN users ON users.id = reports.reporter_id ORDER BY reports.created_at DESC LIMIT 50'); }
    getUsers() { return this.all('SELECT id, name, email, city, role, status, created_at FROM users ORDER BY created_at DESC LIMIT 100'); }
    async getPartnershipRequests() { await this.ensurePartnershipTable(); return this.all('SELECT * FROM partnership_requests ORDER BY created_at DESC'); }
    async getPartnershipRequestById(id) { await this.ensurePartnershipTable(); return this.get('SELECT * FROM partnership_requests WHERE id = ?', [id]); }
    async createPartnershipRequest(data) { await this.ensurePartnershipTable(); const id = data.id || randomUUID(); await this.run('INSERT INTO partnership_requests (id, organization_name, contact_name, email, partnership_type, country, message, status, admin_notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [id, data.organization_name, data.contact_name, data.email, data.partnership_type, data.country || null, data.message, data.status || 'new', data.admin_notes || null]); return this.getPartnershipRequestById(id); }
    async updatePartnershipRequest(id, status, notes) { await this.ensurePartnershipTable(); await this.run('UPDATE partnership_requests SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, notes || null, id]); return this.getPartnershipRequestById(id); }
    async deletePartnershipRequest(id) { await this.ensurePartnershipTable(); return this.run('DELETE FROM partnership_requests WHERE id = ?', [id]); }
    updateUserStatus(id, status) { return this.run('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role != \'admin\'', [status, id]); }
    updateItemStatus(id, status) { return this.run('UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]); }
    updateReport(id, status, notes) { return this.run('UPDATE reports SET status = ?, admin_notes = ?, resolved_at = CASE WHEN ? IN (\'resolved\', \'dismissed\') THEN CURRENT_TIMESTAMP ELSE resolved_at END, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, notes || null, status, id]); }
}

module.exports = AdminModel;
