const { DatabaseAdapter } = require('../db');

class ItemModel {
    constructor() {
        this.db = DatabaseAdapter;
    }

    run(sql, params = []) {
        return this.db.run(sql, params);
    }

    all(sql, params = []) {
        return this.db.all(sql, params);
    }

    get(sql, params = []) {
        return this.db.get(sql, params);
    }

    create(item) {
        const fields = ['id', 'user_id', 'type', 'category', 'title', 'description', 'brand', 'model', 'color', 'city', 'district', 'location_description', 'event_date', 'photo_filename', 'photo_url', 'is_anonymous', 'status'];
        const values = fields.map((field) => field === 'is_anonymous' && this.db.isPostgres ? Boolean(item[field]) : item[field] ?? null);
        return this.run(`INSERT INTO items (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`, values);
    }

    findById(id) {
        const trueValue = this.db.isPostgres ? 'TRUE' : '1';
        return this.get(`SELECT items.*, CASE WHEN items.is_anonymous = ${trueValue} THEN 'Membre RETROOVA' ELSE users.name END AS owner_name, CASE WHEN items.is_anonymous = ${trueValue} THEN NULL ELSE users.public_id END AS owner_public_id FROM items JOIN users ON users.id = items.user_id WHERE items.id = ?`, [id]);
    }

    findBySlug(type, slug) {
        const normalizedSlug = String(slug || '').trim().toLowerCase();
        if (!normalizedSlug) return Promise.resolve(null);

        const trueValue = this.db.isPostgres ? 'TRUE' : '1';
        const sql = `SELECT items.*, CASE WHEN items.is_anonymous = ${trueValue} THEN 'Membre RETROOVA' ELSE users.name END AS owner_name, CASE WHEN items.is_anonymous = ${trueValue} THEN NULL ELSE users.public_id END AS owner_public_id FROM items JOIN users ON users.id = items.user_id WHERE items.type = ? AND LOWER(items.title) LIKE ? AND status NOT IN ('closed', 'expired') LIMIT 1`;
        return this.get(sql, [type, `%${normalizedSlug}%`]);
    }

    findByUser(userId, type = null) {
        const params = [userId];
        let sql = 'SELECT * FROM items WHERE user_id = ?';
        if (type) {
            sql += ' AND type = ?';
            params.push(type);
        }
        return this.all(`${sql} ORDER BY created_at DESC`, params);
    }

    search(filters = {}) {
        const params = [];
        const conditions = ["items.status NOT IN ('closed', 'expired')"];
        const addLike = (field, value) => {
            if (value) {
                conditions.push(`LOWER(${field}) LIKE ?`);
                params.push(`%${String(value).trim().toLowerCase()}%`);
            }
        };

        if (filters.type) {
            conditions.push('items.type = ?');
            params.push(filters.type);
        }
        if (filters.category) {
            conditions.push('items.category = ?');
            params.push(filters.category);
        }
        addLike('items.city', filters.city);
        addLike('items.district', filters.district);
        if (filters.startDate) {
            conditions.push(this.db.isPostgres ? 'items.event_date >= ?' : 'date(items.event_date) >= date(?)');
            params.push(filters.startDate);
        }
        if (filters.endDate) {
            conditions.push(this.db.isPostgres ? 'items.event_date <= ?' : 'date(items.event_date) <= date(?)');
            params.push(filters.endDate);
        }
        if (filters.keyword) {
            conditions.push(`(LOWER(items.title) LIKE ? OR LOWER(COALESCE(items.description, '')) LIKE ? OR LOWER(COALESCE(items.brand, '')) LIKE ? OR LOWER(COALESCE(items.model, '')) LIKE ?)`);
            const keyword = `%${String(filters.keyword).trim().toLowerCase()}%`;
            params.push(keyword, keyword, keyword, keyword);
        }

        const page = Math.max(1, Number.parseInt(filters.page, 10) || 1);
        const limit = Math.min(30, Math.max(6, Number.parseInt(filters.limit, 10) || 12));
        const orderBy = filters.sort === 'oldest' ? 'items.created_at ASC' : filters.sort === 'city' ? 'items.city ASC, items.created_at DESC' : 'items.created_at DESC';
        params.push(limit + 1, (page - 1) * limit);
        const trueValue = this.db.isPostgres ? 'TRUE' : '1';
        return this.all(`SELECT items.*, CASE WHEN items.is_anonymous = ${trueValue} THEN 'Membre RETROOVA' ELSE users.name END AS owner_name FROM items JOIN users ON users.id = items.user_id WHERE ${conditions.join(' AND ')} ORDER BY ${orderBy} LIMIT ? OFFSET ?`, params);
    }

    update(id, userId, item) {
        const fields = ['category', 'title', 'description', 'brand', 'model', 'color', 'city', 'district', 'location_description', 'event_date', 'photo_filename', 'photo_url', 'is_anonymous'];
        const values = fields.map((field) => field === 'is_anonymous' && this.db.isPostgres ? Boolean(item[field]) : item[field] ?? null);
        values.push(id, userId);
        return this.run(`UPDATE items SET ${fields.map((field) => `${field} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`, values);
    }

    findCandidates(item) {
        return this.all(`SELECT * FROM items WHERE type = ? AND status = 'active' AND category = ? AND id != ? ORDER BY created_at DESC LIMIT 100`, [item.type === 'lost' ? 'found' : 'lost', item.category, item.id]);
    }

    findMatch(lostItemId, foundItemId) {
        return this.get('SELECT id FROM matches WHERE lost_item_id = ? AND found_item_id = ?', [lostItemId, foundItemId]);
    }

    createMatch(match) {
        return this.run(`INSERT INTO matches (id, lost_item_id, found_item_id, score, score_breakdown) VALUES (?, ?, ?, ?, ?)`, [match.id, match.lostItemId, match.foundItemId, match.score, JSON.stringify(match.breakdown)]);
    }

    getMatchesForUser(userId) {
        return this.all(`SELECT matches.*, lost.title AS lost_title, found.title AS found_title, lost.city AS lost_city, found.city AS found_city, lost.user_id AS lost_owner_id, found.user_id AS found_owner_id FROM matches JOIN items lost ON lost.id = matches.lost_item_id JOIN items found ON found.id = matches.found_item_id WHERE lost.user_id = ? OR found.user_id = ? ORDER BY matches.score DESC, matches.created_at DESC`, [userId, userId]);
    }

    countByUser(userId, type) {
        return this.get('SELECT COUNT(*) AS count FROM items WHERE user_id = ? AND type = ?', [userId, type]);
    }

    getPublicStats() {
        return this.get(`SELECT (SELECT COUNT(*) FROM items WHERE status NOT IN ('closed', 'expired')) AS declared, (SELECT COUNT(*) FROM matches) AS matches, (SELECT COUNT(*) FROM items WHERE status = 'returned') AS returned, (SELECT COUNT(*) FROM users WHERE status = 'active') AS users`);
    }

    updateStatus(id, userId, status) {
        return this.run('UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', [status, id, userId]);
    }

    createReport(report) {
        return this.run('INSERT INTO reports (id, reporter_id, item_id, reason, description) VALUES (?, ?, ?, ?, ?)', [report.id, report.reporterId, report.itemId, report.reason, report.description || null]);
    }

    createOwnershipProof(proof) {
        return this.run('INSERT INTO ownership_proofs (id, user_id, item_id, proof_text) VALUES (?, ?, ?, ?)', [proof.id, proof.userId, proof.itemId, proof.text]);
    }

    getMatchById(id) {
        return this.get(`SELECT matches.*, lost.user_id AS lost_owner_id, found.user_id AS found_owner_id, lost.title AS lost_title, found.title AS found_title FROM matches JOIN items lost ON lost.id = matches.lost_item_id JOIN items found ON found.id = matches.found_item_id WHERE matches.id = ?`, [id]);
    }

    updateMatchStatus(id, status) {
        return this.run('UPDATE matches SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
    }

    updateStatusById(id, status) {
        return this.run('UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
    }
}

module.exports = ItemModel;
