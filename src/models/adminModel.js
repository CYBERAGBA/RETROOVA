const sqlite3 = require('sqlite3').verbose();

class AdminModel {
    constructor(dbPath) { this.dbPath = dbPath; }
    getDb() { const db = new sqlite3.Database(this.dbPath); db.run('PRAGMA foreign_keys = ON'); return db; }
    all(sql, params = []) { return new Promise((resolve, reject) => { const db = this.getDb(); db.all(sql, params, (error, rows) => { db.close(); if (error) return reject(error); resolve(rows || []); }); }); }
    run(sql, params = []) { return new Promise((resolve, reject) => { const db = this.getDb(); db.run(sql, params, function (error) { db.close(); if (error) return reject(error); resolve({ changes: this.changes }); }); }); }
    async getOverview() {
        const rows = await this.all(`SELECT (SELECT COUNT(*) FROM users WHERE status != 'deleted') AS users, (SELECT COUNT(*) FROM items WHERE type = 'lost') AS lost, (SELECT COUNT(*) FROM items WHERE type = 'found') AS found, (SELECT COUNT(*) FROM matches) AS matches, (SELECT COUNT(*) FROM reports WHERE status = 'pending') AS pending_reports`);
        return rows[0];
    }
    getRecentItems() { return this.all('SELECT items.*, users.name AS owner_name FROM items JOIN users ON users.id = items.user_id ORDER BY items.created_at DESC LIMIT 20'); }
    getReports() { return this.all('SELECT reports.*, items.title AS item_title, users.name AS reporter_name FROM reports JOIN items ON items.id = reports.item_id JOIN users ON users.id = reports.reporter_id ORDER BY reports.created_at DESC LIMIT 50'); }
    getUsers() { return this.all('SELECT id, name, email, city, role, status, created_at FROM users ORDER BY created_at DESC LIMIT 100'); }
    updateUserStatus(id, status) { return this.run('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role != \'admin\'', [status, id]); }
    updateItemStatus(id, status) { return this.run('UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]); }
    updateReport(id, status, notes) { return this.run('UPDATE reports SET status = ?, admin_notes = ?, resolved_at = CASE WHEN ? IN (\'resolved\', \'dismissed\') THEN CURRENT_TIMESTAMP ELSE resolved_at END, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, notes || null, status, id]); }
}

module.exports = AdminModel;
