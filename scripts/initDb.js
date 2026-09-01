const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcryptjs = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const { DatabaseAdapter, DATABASE_URL, DATABASE_PATH, isPostgres } = require('../src/db');
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('ADMIN_EMAIL et ADMIN_PASSWORD doivent être configurés dans l’environnement.');
  process.exit(1);
}

console.log(`
╔════════════════════════════════════════╗
║   Initialisation Base de Données RETROVA║
╚════════════════════════════════════════╝
`);

async function configurePostgresAdmin() {
  const { pool } = DatabaseAdapter;
  await DatabaseAdapter.initializeDatabase();

  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]);
  const passwordHash = await bcryptjs.hash(ADMIN_PASSWORD, 10);
  const adminId = uuidv4();

  if (existingUser.rows.length > 0) {
    await pool.query(
      `UPDATE users
       SET password_hash = $1, role = 'admin', status = 'active', email_verified = TRUE, updated_at = NOW()
       WHERE id = $2`,
      [passwordHash, existingUser.rows[0].id]
    );
    console.log('✅ Compte administrateur configuré avec succès');
    return;
  }

  await pool.query(
    `INSERT INTO users (id, public_id, name, email, phone, password_hash, city, role, status, email_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'admin', 'active', TRUE)`,
    [adminId, `RTV-${adminId.replace(/-/g, '').slice(0, 8).toUpperCase()}`, 'Administrateur', ADMIN_EMAIL, null, passwordHash, 'Abidjan']
  );
  console.log('✅ Compte administrateur créé avec succès');
}

async function configureSqliteAdmin() {
  const schemaPath = path.join(__dirname, '../database/schema.sqlite.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const db = new sqlite3.Database(DATABASE_PATH, (err) => {
    if (err) {
      console.error('❌ Erreur connexion BDD:', err);
      process.exit(1);
    }
    console.log('✅ Connexion à SQLite établie');
  });

  await new Promise((resolve, reject) => {
    db.exec(schema, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });

  const adminId = uuidv4();
  const passwordHash = await bcryptjs.hash(ADMIN_PASSWORD, 10);
  const existingUser = await new Promise((resolve, reject) => {
    db.get('SELECT id FROM users WHERE email = ?', [ADMIN_EMAIL], (error, row) => error ? reject(error) : resolve(row || null));
  });

  if (existingUser) {
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE users
         SET password_hash = ?, role = 'admin', status = 'active', email_verified = 1, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [passwordHash, existingUser.id],
        (error) => error ? reject(error) : resolve()
      );
    });
    console.log('✅ Compte administrateur configuré avec succès');
    db.close();
    return;
  }

  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (id, public_id, name, email, phone, password_hash, city, role, status, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'admin', 'active', 1)`,
      [adminId, `RTV-${adminId.replace(/-/g, '').slice(0, 8).toUpperCase()}`, 'Administrateur', ADMIN_EMAIL, null, passwordHash, 'Abidjan'],
      (error) => error ? reject(error) : resolve()
    );
  });

  console.log('✅ Compte administrateur créé avec succès');
  db.close();
}

(async () => {
  try {
    if (isPostgres) {
      console.log('✅ Connexion à PostgreSQL établie');
      await configurePostgresAdmin();
    } else {
      await configureSqliteAdmin();
    }

    console.log('\n✅ Base de données initialisée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur initialisation base:', error);
    process.exit(1);
  }
})();
