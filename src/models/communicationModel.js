const { DatabaseAdapter } = require('../db');

class CommunicationModel {
    constructor() { this.db = DatabaseAdapter; }
    getDb() { return this.db.sqliteOpen ? this.db.sqliteOpen() : null; }
    run(sql, params = []) { return this.db.run(sql, params); }
    all(sql, params = []) { return this.db.all(sql, params); }
    async getConversations(userId) {
        return this.all(`SELECT messages.*, sender.name AS sender_name, sender.public_id AS sender_public_id, receiver.name AS receiver_name, receiver.public_id AS receiver_public_id, items.title AS item_title FROM messages JOIN users sender ON sender.id = messages.sender_id JOIN users receiver ON receiver.id = messages.receiver_id LEFT JOIN items ON items.id = messages.item_id WHERE (sender_id = ? AND sender_deleted = 0) OR (receiver_id = ? AND receiver_deleted = 0) ORDER BY messages.created_at DESC`, [userId, userId]);
    }
    async sendMessage(message) {
        const result = await this.run('INSERT INTO messages (id, sender_id, receiver_id, item_id, subject, message) VALUES (?, ?, ?, ?, ?, ?)', [message.id, message.senderId, message.receiverId, message.itemId || null, message.subject || null, message.message]);
        await this.createNotification({ id: message.notificationId, userId: message.receiverId, type: 'message', title: 'Nouveau message', message: `${message.subject || 'Un membre'} vous a écrit. Identifiant public de l'expéditeur : ${message.senderPublicId || 'non disponible'}.` });
        return result;
    }
    getNotifications(userId) { return this.all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId]); }
    countUnread(userId) { return new Promise((resolve, reject) => { const db = this.getDb(); db.get('SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0', [userId], (error, row) => { db.close(); if (error) return reject(error); resolve(row?.count || 0); }); }); }
    countMessages(userId) { return new Promise((resolve, reject) => { const db = this.getDb(); db.get('SELECT COUNT(*) AS count FROM messages WHERE receiver_id = ? AND is_read = 0', [userId], (error, row) => { db.close(); if (error) return reject(error); resolve(row?.count || 0); }); }); }
    createNotification(notification) { return this.run('INSERT INTO notifications (id, user_id, type, title, message, related_item_id) VALUES (?, ?, ?, ?, ?, ?)', [notification.id, notification.userId, notification.type, notification.title, notification.message, notification.itemId || null]); }
    markNotificationsRead(userId) { return this.run('UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE user_id = ?', [userId]); }
    markMessageRead(id, userId) { return this.run('UPDATE messages SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ? AND receiver_id = ?', [id, userId]); }
    isBlocked(blockerId, blockedId) { return new Promise((resolve, reject) => { const db = this.getDb(); db.get('SELECT id FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?', [blockerId, blockedId], (error, row) => { db.close(); if (error) reject(error); else resolve(Boolean(row)); }); }); }
    blockUser(blockerId, blockedId) { return this.run('INSERT OR IGNORE INTO blocked_users (id, blocker_id, blocked_id) VALUES (?, ?, ?)', [require('uuid').v4(), blockerId, blockedId]); }
    unblockUser(blockerId, blockedId) { return this.run('DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?', [blockerId, blockedId]); }
}

module.exports = CommunicationModel;
