const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcryptjs = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const DATABASE_PATH = path.resolve(__dirname, '..', process.env.DATABASE_PATH || './database/database.sqlite');
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

// Lire le schéma
const schemaPath = path.join(__dirname, '../database/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Créer/ouvrir la base de données
const db = new sqlite3.Database(DATABASE_PATH, (err) => {
  if (err) {
    console.error('❌ Erreur connexion BDD:', err);
    process.exit(1);
  }
  console.log('✅ Connexion à SQLite établie');
});

// Exécuter le schéma
db.exec(schema, async (err) => {
  if (err) {
    console.error('❌ Erreur création schéma:', err);
    db.close();
    process.exit(1);
  }
  console.log('✅ Schéma créé avec succès');

  try {
    const adminId = uuidv4();
    const passwordHash = await bcryptjs.hash(ADMIN_PASSWORD, 10);
    db.get('SELECT id FROM users WHERE email = ?', [ADMIN_EMAIL], (findError, existingUser) => {
      if (findError) throw findError;

      const finish = (error, message) => {
        if (error) {
          console.error('❌ Erreur configuration admin:', error);
          return db.close(() => process.exit(1));
        }
        console.log(message);
        db.close();
        console.log('\n✅ Base de données initialisée avec succès');
        process.exit(0);
      };

      if (existingUser) {
        return db.run(
          `UPDATE users
           SET password_hash = ?, role = 'admin', status = 'active', email_verified = 1, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [passwordHash, existingUser.id],
          (updateError) => finish(updateError, '✅ Compte administrateur configuré avec succès')
        );
      }

      db.run(
        `INSERT INTO users (id, public_id, name, email, phone, password_hash, city, role, status, email_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'admin', 'active', 1)`,
        [adminId, `RTV-${adminId.replace(/-/g, '').slice(0, 8).toUpperCase()}`, 'Administrateur', ADMIN_EMAIL, null, passwordHash, 'Abidjan'],
        (insertError) => finish(insertError, '✅ Compte administrateur créé avec succès')
      );
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    db.close();
    process.exit(1);
  }
});
