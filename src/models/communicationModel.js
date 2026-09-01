const { DatabaseAdapter } = require('../db');

class CommunicationModel {
    constructor() { this.db = DatabaseAdapter; }
    run(sql, params = []) { return this.db.run(sql, params); }
    all(sql, params = []) { return this.db.all(sql, params); }
    get(sql, params = []) { return this.db.get(sql, params); }
    async getConversations(userId) {
        const falseValue = this.db.isPostgres ? 'FALSE' : '0';
        return this.all(`SELECT messages.*, sender.name AS sender_name, sender.public_id AS sender_public_id, receiver.name AS receiver_name, receiver.public_id AS receiver_public_id, items.title AS item_title FROM messages JOIN users sender ON sender.id = messages.sender_id JOIN users receiver ON receiver.id = messages.receiver_id LEFT JOIN items ON items.id = messages.item_id WHERE (sender_id = ? AND sender_deleted = ${falseValue}) OR (receiver_id = ? AND receiver_deleted = ${falseValue}) ORDER BY messages.created_at DESC`, [userId, userId]);
    }
    async sendMessage(message) {
        const result = await this.run('INSERT INTO messages (id, sender_id, receiver_id, item_id, subject, message) VALUES (?, ?, ?, ?, ?, ?)', [message.id, message.senderId, message.receiverId, message.itemId || null, message.subject || null, message.message]);
        await this.createNotification({ id: message.notificationId, userId: message.receiverId, type: 'message', title: 'Nouveau message', message: `${message.subject || 'Un membre'} vous a écrit. Identifiant public de l'expéditeur : ${message.senderPublicId || 'non disponible'}.` });
        return result;
    }
    getNotifications(userId) { return this.all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId]); }
    async countUnread(userId) { const falseValue = this.db.isPostgres ? 'FALSE' : '0'; const row = await this.get(`SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = ${falseValue}`, [userId]); return Number(row?.count || 0); }
    async countMessages(userId) { const falseValue = this.db.isPostgres ? 'FALSE' : '0'; const row = await this.get(`SELECT COUNT(*) AS count FROM messages WHERE receiver_id = ? AND is_read = ${falseValue}`, [userId]); return Number(row?.count || 0); }
    createNotification(notification) { return this.run('INSERT INTO notifications (id, user_id, type, title, message, related_item_id) VALUES (?, ?, ?, ?, ?, ?)', [notification.id, notification.userId, notification.type, notification.title, notification.message, notification.itemId || null]); }
    markNotificationsRead(userId) { const trueValue = this.db.isPostgres ? 'TRUE' : '1'; return this.run(`UPDATE notifications SET is_read = ${trueValue}, read_at = CURRENT_TIMESTAMP WHERE user_id = ?`, [userId]); }
    markMessageRead(id, userId) { const trueValue = this.db.isPostgres ? 'TRUE' : '1'; return this.run(`UPDATE messages SET is_read = ${trueValue}, read_at = CURRENT_TIMESTAMP WHERE id = ? AND receiver_id = ?`, [id, userId]); }
    isBlocked(blockerId, blockedId) { return this.get('SELECT id FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?', [blockerId, blockedId]).then((row) => Boolean(row)); }
    blockUser(blockerId, blockedId) { const sql = this.db.isPostgres ? 'INSERT INTO blocked_users (id, blocker_id, blocked_id) VALUES (?, ?, ?) ON CONFLICT (blocker_id, blocked_id) DO NOTHING' : 'INSERT OR IGNORE INTO blocked_users (id, blocker_id, blocked_id) VALUES (?, ?, ?)'; return this.run(sql, [require('uuid').v4(), blockerId, blockedId]); }
    unblockUser(blockerId, blockedId) { return this.run('DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?', [blockerId, blockedId]); }
}

module.exports = CommunicationModel;
