const { DatabaseAdapter } = require('../db');

class UserModel {
  constructor() {
    this.db = DatabaseAdapter;
  }

  ensurePublicIds() {
    return this.db.ensurePublicIds();
  }

  /**
   * Créer un nouvel utilisateur
   */
  create(userData) {
    const { id, name, email, phone, passwordHash, city } = userData;
    const publicId = `RTV-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    return this.db.run(
      `INSERT INTO users (id, public_id, name, email, phone, password_hash, city, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, publicId, name, email, phone || null, passwordHash, city || null, 'user', 'active']
    ).then(() => ({ id, public_id: publicId, name, email, city }));
  }

  /**
   * Trouver un utilisateur par email
   */
  findByEmail(email) {
    return this.db.get('SELECT * FROM users WHERE email = ? AND status != ?', [email, 'deleted']);
  }

  /**
   * Trouver un utilisateur par ID
   */
  findById(id) {
    return this.db.get('SELECT * FROM users WHERE id = ? AND status != ?', [id, 'deleted']);
  }

  findByPublicId(publicId) {
    return this.db.get('SELECT * FROM users WHERE UPPER(public_id) = UPPER(?) AND status != ?', [publicId.trim(), 'deleted']);
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  updateProfile(id, updateData) {
    const { name, phone, city } = updateData;
    return this.db.run(
      `UPDATE users SET name = ?, phone = ?, city = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [name, phone || null, city || null, id]
    );
  }

  /**
   * Vérifier l'email utilisateur
   */
  verifyEmail(id) {
    const trueValue = this.db.isPostgres ? 'TRUE' : '1';
    return this.db.run(`UPDATE users SET email_verified = ${trueValue} WHERE id = ?`, [id]);
  }

  /**
   * Vérifier le téléphone utilisateur
   */
  verifyPhone(id) {
    const trueValue = this.db.isPostgres ? 'TRUE' : '1';
    return this.db.run(`UPDATE users SET phone_verified = ${trueValue} WHERE id = ?`, [id]);
  }

  /**
   * Suspendre un utilisateur (admin)
   */
  suspend(id, reason = null) {
    return this.db.run('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['suspended', id]);
  }

  /**
   * Activer un utilisateur suspendu
   */
  reactivate(id) {
    return this.db.run('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['active', id]);
  }

  /**
   * Supprimer un utilisateur (soft delete)
   */
  delete(id) {
    return this.db.run('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['deleted', id]);
  }

  /**
   * Obtenir statistiques utilisateur
   */
  getStats(id) {
    return this.db.get(
      `SELECT email_verified, phone_verified,
        (SELECT COUNT(*) FROM items WHERE items.user_id = users.id AND items.type = 'found') AS items_found_count,
        (SELECT COUNT(*) FROM items WHERE items.user_id = users.id AND items.status = 'returned') AS items_returned_count
       FROM users WHERE id = ?`,
      [id]
    );
  }

  getReputation(id) {
    return this.db.get(`SELECT
        email_verified,
        phone_verified,
        (SELECT COUNT(*) FROM items WHERE user_id = ? AND type = 'found') AS found_count,
        (SELECT COUNT(*) FROM matches m JOIN items l ON l.id = m.lost_item_id JOIN items f ON f.id = m.found_item_id WHERE m.status = 'completed' AND (l.user_id = ? OR f.user_id = ?)) AS returned_count,
        (SELECT COUNT(*) FROM reports r JOIN items i ON i.id = r.item_id WHERE i.user_id = ? AND r.status = 'resolved') AS confirmed_reports
        FROM users WHERE id = ?`, [id, id, id, id, id]).then((row) => {
        const score = (row?.email_verified ? 10 : 0) + (row?.phone_verified ? 10 : 0) + Math.min(30, (row?.found_count || 0) * 5) + Math.min(50, (row?.returned_count || 0) * 20) - (row?.confirmed_reports || 0) * 20;
        const level = score < 0 ? 'Compte sous surveillance' : score >= 60 ? 'Membre très fiable' : score >= 30 ? 'Membre fiable' : score >= 10 ? 'Membre actif' : 'Nouveau membre';
        return { score: Math.max(0, score), level, tone: score < 0 ? 'danger' : score >= 30 ? 'success' : 'standard' };
      });
  }

  /**
   * Compter tous les utilisateurs (admin)
   */
  countAll() {
    return this.db.get('SELECT COUNT(*) as count FROM users WHERE status != ?', ['deleted']).then((row) => Number(row?.count || 0));
  }

  /**
   * Obtenir tous les utilisateurs (admin)
   */
  getAll(limit = 50, offset = 0) {
    return this.db.all(
      `SELECT id, name, email, city, role, status, created_at
       FROM users WHERE status != ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      ['deleted', limit, offset]
    );
  }
}

module.exports = UserModel;
