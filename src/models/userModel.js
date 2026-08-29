const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class UserModel {
  constructor(dbPath) {
    this.dbPath = dbPath;
  }

  getDb() {
    const db = new sqlite3.Database(this.dbPath);
    db.run('PRAGMA foreign_keys = ON');
    return db;
  }

  ensurePublicIds() {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      db.all('PRAGMA table_info(users)', (error, columns) => {
        if (error) { db.close(); return reject(error); }
        const hasPublicId = columns.some((column) => column.name === 'public_id');
        const finish = () => db.close((closeError) => closeError ? reject(closeError) : resolve());
        const populate = () => db.run("UPDATE users SET public_id = 'RTV-' || UPPER(SUBSTR(REPLACE(id, '-', ''), 1, 8)) WHERE public_id IS NULL OR public_id = ''", (updateError) => updateError ? reject(updateError) : finish());
        if (hasPublicId) return populate();
        db.run('ALTER TABLE users ADD COLUMN public_id TEXT', (alterError) => {
          if (alterError) { db.close(); return reject(alterError); }
          db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_public_id ON users(public_id)', (indexError) => indexError ? reject(indexError) : populate());
        });
      });
    });
  }

  /**
   * Créer un nouvel utilisateur
   */
  create(userData) {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      const { id, name, email, phone, passwordHash, city } = userData;
      const publicId = `RTV-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

      db.run(
        `INSERT INTO users (id, public_id, name, email, phone, password_hash, city, role, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, publicId, name, email, phone || null, passwordHash, city || null, 'user', 'active'],
        function (err) {
          if (err) {
            db.close();
            reject(err);
          } else {
            db.close();
            resolve({ id, public_id: publicId, name, email, city });
          }
        }
      );
    });
  }

  /**
   * Trouver un utilisateur par email
   */
  findByEmail(email) {
    return new Promise((resolve, reject) => {
      const db = this.getDb();

      db.get(
        'SELECT * FROM users WHERE email = ? AND status != ?',
        [email, 'deleted'],
        (err, row) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  /**
   * Trouver un utilisateur par ID
   */
  findById(id) {
    return new Promise((resolve, reject) => {
      const db = this.getDb();

      db.get(
        'SELECT * FROM users WHERE id = ? AND status != ?',
        [id, 'deleted'],
        (err, row) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  findByPublicId(publicId) {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      db.get('SELECT * FROM users WHERE UPPER(public_id) = UPPER(?) AND status != ?', [publicId.trim(), 'deleted'], (err, row) => { db.close(); if (err) reject(err); else resolve(row || null); });
    });
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  updateProfile(id, updateData) {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      const { name, phone, city } = updateData;

      db.run(
        `UPDATE users 
         SET name = ?, phone = ?, city = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, phone || null, city || null, id],
        function (err) {
          if (err) {
            db.close();
            reject(err);
          } else {
            db.close();
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  /**
   * Vérifier l'email utilisateur
   */
  verifyEmail(id) {
    return new Promise((resolve, reject) => {
      const db = this.getDb();

      db.run(
        'UPDATE users SET email_verified = 1 WHERE id = ?',
        [id],
        function (err) {
          if (err) {
            db.close();
            reject(err);
          } else {
            db.close();
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  /**
   * Vérifier le téléphone utilisateur
   */
  verifyPhone(id) {
    return new Promise((resolve, reject) => {
      const db = this.getDb();

      db.run(
        'UPDATE users SET phone_verified = 1 WHERE id = ?',
        [id],
        function (err) {
          if (err) {
            db.close();
            reject(err);
          } else {
            db.close();
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  /**
   * Suspendre un utilisateur (admin)
   */
  suspend(id, reason = null) {
    return new Promise((resolve, reject) => {
      const db = this.getDb();

      db.run(
        'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['suspended', id],
        function (err) {
          if (err) {
            db.close();
            reject(err);
          } else {
            db.close();
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  /**
   * Activer un utilisateur suspendu
   */
  reactivate(id) {
    return new Promise((resolve, reject) => {
      const db = this.getDb();

      db.run(
        'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['active', id],
        function (err) {
          if (err) {
            db.close();
            reject(err);
          } else {
            db.close();
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  /**
   * Supprimer un utilisateur (soft delete)
   */
  delete(id) {
    return new Promise((resolve, reject) => {
      const db = this.getDb();

      db.run(
        'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['deleted', id],
        function (err) {
          if (err) {
            db.close();
            reject(err);
          } else {
            db.close();
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  /**
   * Obtenir statistiques utilisateur
   */
  getStats(id) {
    return new Promise((resolve, reject) => {
      const db = this.getDb();

      db.get(
        `SELECT 
           email_verified,
           phone_verified,
           (SELECT COUNT(*) FROM items WHERE items.user_id = users.id AND items.type = 'found') AS items_found_count,
           (SELECT COUNT(*) FROM items WHERE items.user_id = users.id AND items.status = 'returned') AS items_returned_count
         FROM users WHERE id = ?`,
        [id],
        (err, row) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  getReputation(id) {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      db.get(`SELECT
        email_verified,
        phone_verified,
        (SELECT COUNT(*) FROM items WHERE user_id = ? AND type = 'found') AS found_count,
        (SELECT COUNT(*) FROM matches m JOIN items l ON l.id = m.lost_item_id JOIN items f ON f.id = m.found_item_id WHERE m.status = 'completed' AND (l.user_id = ? OR f.user_id = ?)) AS returned_count,
        (SELECT COUNT(*) FROM reports r JOIN items i ON i.id = r.item_id WHERE i.user_id = ? AND r.status = 'resolved') AS confirmed_reports
        FROM users WHERE id = ?`, [id, id, id, id, id], (err, row) => {
        db.close();
        if (err) return reject(err);
        const score = (row?.email_verified ? 10 : 0) + (row?.phone_verified ? 10 : 0) + Math.min(30, (row?.found_count || 0) * 5) + Math.min(50, (row?.returned_count || 0) * 20) - (row?.confirmed_reports || 0) * 20;
        const level = score < 0 ? 'Compte sous surveillance' : score >= 60 ? 'Membre très fiable' : score >= 30 ? 'Membre fiable' : score >= 10 ? 'Membre actif' : 'Nouveau membre';
        resolve({ score: Math.max(0, score), level, tone: score < 0 ? 'danger' : score >= 30 ? 'success' : 'standard' });
      });
    });
  }

  /**
   * Compter tous les utilisateurs (admin)
   */
  countAll() {
    return new Promise((resolve, reject) => {
      const db = this.getDb();

      db.get(
        'SELECT COUNT(*) as count FROM users WHERE status != ?',
        ['deleted'],
        (err, row) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(row?.count || 0);
          }
        }
      );
    });
  }

  /**
   * Obtenir tous les utilisateurs (admin)
   */
  getAll(limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
      const db = this.getDb();

      db.all(
        `SELECT id, name, email, city, role, status, created_at 
         FROM users 
         WHERE status != ? 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        ['deleted', limit, offset],
        (err, rows) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }
}

module.exports = UserModel;
