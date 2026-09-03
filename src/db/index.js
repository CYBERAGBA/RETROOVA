require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();

const APP_ROOT = path.resolve(__dirname, '../..');
const DATABASE_URL = process.env.DATABASE_URL || '';
const DATABASE_PATH = path.resolve(APP_ROOT, process.env.DATABASE_PATH || './database/database.sqlite');
const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || path.join(APP_ROOT, 'uploads'));
const isPostgres = Boolean(DATABASE_URL);

const postgresPool = isPostgres
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10
    })
  : null;

if (postgresPool) {
  postgresPool.on('error', (error) => {
    console.error('Erreur inattendue du pool PostgreSQL:', error);
  });
}

class DatabaseAdapter {
  static get isPostgres() {
    return isPostgres;
  }

  static get pool() {
    return postgresPool;
  }

  static getDatabasePath() {
    return DATABASE_PATH;
  }

  static getUploadsDir() {
    return UPLOADS_DIR;
  }

  static normalizeQuery(sql, params = []) {
    if (!isPostgres) return { sql, params };

    let placeholderIndex = 0;
    const normalizedSql = sql.replace(/\?/g, () => {
      placeholderIndex += 1;
      return `$${placeholderIndex}`;
    });

    return { sql: normalizedSql, params };
  }

  static sqliteOpen() {
    const db = new sqlite3.Database(DATABASE_PATH);
    db.run('PRAGMA foreign_keys = ON');
    return db;
  }

  static sqliteRun(sql, params = []) {
    return new Promise((resolve, reject) => {
      const db = this.sqliteOpen();
      db.run(sql, params, function onRun(error) {
        db.close();
        if (error) return reject(error);
        resolve({ changes: this.changes, lastID: this.lastID });
      });
    });
  }

  static sqliteAll(sql, params = []) {
    return new Promise((resolve, reject) => {
      const db = this.sqliteOpen();
      db.all(sql, params, (error, rows) => {
        db.close();
        if (error) return reject(error);
        resolve(rows || []);
      });
    });
  }

  static sqliteGet(sql, params = []) {
    return new Promise((resolve, reject) => {
      const db = this.sqliteOpen();
      db.get(sql, params, (error, row) => {
        db.close();
        if (error) return reject(error);
        resolve(row || null);
      });
    });
  }

  static async run(sql, params = []) {
    if (!isPostgres) {
      return this.sqliteRun(sql, params);
    }

    const { sql: normalizedSql, params: normalizedParams } = this.normalizeQuery(sql, params);
    const result = await postgresPool.query(normalizedSql, normalizedParams);
    return {
      changes: Number(result.rowCount || 0),
      lastID: result.rows?.[0]?.id || null
    };
  }

  static async all(sql, params = []) {
    if (!isPostgres) {
      return this.sqliteAll(sql, params);
    }

    const { sql: normalizedSql, params: normalizedParams } = this.normalizeQuery(sql, params);
    const result = await postgresPool.query(normalizedSql, normalizedParams);
    return result.rows || [];
  }

  static async get(sql, params = []) {
    if (!isPostgres) {
      return this.sqliteGet(sql, params);
    }

    const { sql: normalizedSql, params: normalizedParams } = this.normalizeQuery(sql, params);
    const result = await postgresPool.query(normalizedSql, normalizedParams);
    return result.rows?.[0] || null;
  }

  static async close() {
    if (postgresPool) {
      await postgresPool.end();
    }
  }

  static ensureLocalDatabaseDir() {
    if (!isPostgres) {
      fs.mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });
    }
  }

  static async initializeDatabase() {
    if (isPostgres) {
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id SERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      const schemaPath = path.join(APP_ROOT, 'database/schema.sql');
      const migrationName = '001_initial_schema';
      const migrationCheck = await postgresPool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [migrationName]);

      if (migrationCheck.rows.length === 0) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await postgresPool.query(schema);
        await postgresPool.query('INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [migrationName]);
      }
      return;
    }

    const schemaPath = path.join(APP_ROOT, 'database/schema.sqlite.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    return new Promise((resolve, reject) => {
      const db = this.sqliteOpen();
      db.exec(schema, (error) => {
        db.close();
        if (error) return reject(error);
        resolve();
      });
    });
  }

  static async ensurePublicIds() {
    if (isPostgres) {
      const columns = await postgresPool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public'"
      );
      const hasPublicId = columns.rows.some((row) => row.column_name === 'public_id');

      if (!hasPublicId) {
        await postgresPool.query('ALTER TABLE users ADD COLUMN public_id TEXT');
        await postgresPool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_public_id ON users(public_id)');
      }

      await postgresPool.query("UPDATE users SET public_id = 'RTV-' || UPPER(SUBSTRING(REPLACE(id, '-', ''), 1, 8)) WHERE public_id IS NULL OR public_id = ''");
      return;
    }

    return new Promise((resolve, reject) => {
      const db = this.sqliteOpen();
      db.all('PRAGMA table_info(users)', (error, columns) => {
        if (error) {
          db.close();
          return reject(error);
        }

        const hasPublicId = columns.some((column) => column.name === 'public_id');

        const finish = () => {
          db.close((closeError) => {
            if (closeError) return reject(closeError);
            resolve();
          });
        };

        const populate = () => {
          db.run("UPDATE users SET public_id = 'RTV-' || UPPER(SUBSTR(REPLACE(id, '-', ''), 1, 8)) WHERE public_id IS NULL OR public_id = ''", (updateError) => {
            if (updateError) return reject(updateError);
            finish();
          });
        };

        if (hasPublicId) return populate();

        db.run('ALTER TABLE users ADD COLUMN public_id TEXT', (alterError) => {
          if (alterError) {
            db.close();
            return reject(alterError);
          }

          db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_public_id ON users(public_id)', (indexError) => {
            if (indexError) return reject(indexError);
            populate();
          });
        });
      });
    });
  }

  static async ensurePartnershipRequestsTable() {
    if (isPostgres) {
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS partnership_requests (
          id TEXT PRIMARY KEY,
          organization_name TEXT NOT NULL,
          contact_name TEXT NOT NULL,
          email TEXT NOT NULL,
          partnership_type TEXT NOT NULL,
          country TEXT,
          message TEXT NOT NULL,
          status TEXT DEFAULT 'new' CHECK(status IN ('new', 'in_progress', 'accepted', 'archived', 'rejected')),
          admin_notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      await postgresPool.query('CREATE INDEX IF NOT EXISTS idx_partnership_requests_status ON partnership_requests(status)');
      await postgresPool.query('CREATE INDEX IF NOT EXISTS idx_partnership_requests_created_at ON partnership_requests(created_at)');
      return;
    }

    return new Promise((resolve, reject) => {
      const db = this.sqliteOpen();
      db.exec(`
        CREATE TABLE IF NOT EXISTS partnership_requests (
          id TEXT PRIMARY KEY,
          organization_name TEXT NOT NULL,
          contact_name TEXT NOT NULL,
          email TEXT NOT NULL,
          partnership_type TEXT NOT NULL,
          country TEXT,
          message TEXT NOT NULL,
          status TEXT DEFAULT 'new' CHECK(status IN ('new', 'in_progress', 'accepted', 'archived', 'rejected')),
          admin_notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `, (error) => {
        db.close();
        if (error) return reject(error);
        resolve();
      });
    });
  }

  static async ensureReportsTable() {
    if (isPostgres) {
      for (const [oldName, newName] of [['id', 'report_id'], ['reporter_id', 'user_id'], ['description', 'comment'], ['attachment_filename', 'attachment']]) {
        await postgresPool.query(`ALTER TABLE reports RENAME COLUMN ${oldName} TO ${newName}`).catch((error) => {
          if (!/does not exist|already exists/i.test(error.message)) throw error;
        });
      }
      await postgresPool.query('ALTER TABLE reports ADD COLUMN IF NOT EXISTS public_reference TEXT');
      await postgresPool.query("UPDATE reports SET public_reference = 'RTV-' || UPPER(SUBSTRING(REPLACE(item_id, '-', ''), 1, 8)), comment = COALESCE(comment, 'Ancien signalement') WHERE public_reference IS NULL OR comment IS NULL");
      await postgresPool.query('ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check');
      await postgresPool.query("ALTER TABLE reports ADD CONSTRAINT reports_status_check CHECK (status IN ('pending', 'reviewing', 'resolved', 'rejected'))").catch(() => {});
      await postgresPool.query('CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id)');
      return;
    }

    const columns = await this.sqliteAll('PRAGMA table_info(reports)');
    const currentColumns = new Set(columns.map((column) => column.name));
    if (!currentColumns.has('report_id') || currentColumns.has('reporter_id')) {
      await this.sqliteRun('ALTER TABLE reports RENAME TO reports_legacy');
      await this.sqliteRun(`CREATE TABLE reports (
        report_id TEXT PRIMARY KEY, public_reference TEXT NOT NULL, user_id TEXT NOT NULL, item_id TEXT NOT NULL,
        reason TEXT NOT NULL, comment TEXT NOT NULL, attachment TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewing', 'resolved', 'rejected')),
        admin_notes TEXT, resolved_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      )`);
      await this.sqliteRun(`INSERT INTO reports (report_id, public_reference, user_id, item_id, reason, comment, attachment, status, admin_notes, resolved_at, created_at, updated_at)
        SELECT id, 'RTV-' || UPPER(SUBSTR(REPLACE(item_id, '-', ''), 1, 8)), reporter_id, item_id, reason,
          COALESCE(description, 'Ancien signalement'), attachment_filename,
          CASE status WHEN 'reviewed' THEN 'reviewing' WHEN 'dismissed' THEN 'rejected' ELSE status END,
          admin_notes, resolved_at, created_at, updated_at FROM reports_legacy`);
      await this.sqliteRun('DROP TABLE reports_legacy');
    }
    await this.sqliteRun('CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id)');
    await this.sqliteRun('CREATE INDEX IF NOT EXISTS idx_reports_item ON reports(item_id)');
    await this.sqliteRun('CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status)');
    await this.sqliteRun('CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at)');
  }

  static async ensureContactRequestsTable() {
    if (isPostgres) {
      await postgresPool.query(`CREATE TABLE IF NOT EXISTS contact_requests (
        id TEXT PRIMARY KEY, public_reference TEXT UNIQUE NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL,
        subject TEXT NOT NULL, item_reference TEXT, message TEXT NOT NULL, attachment TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewing', 'resolved', 'rejected')),
        created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
      )`);
      await postgresPool.query('CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status)');
      await postgresPool.query('CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at)');
      return;
    }

    await this.sqliteRun(`CREATE TABLE IF NOT EXISTS contact_requests (
      id TEXT PRIMARY KEY, public_reference TEXT UNIQUE NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL,
      subject TEXT NOT NULL, item_reference TEXT, message TEXT NOT NULL, attachment TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewing', 'resolved', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    await this.sqliteRun('CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status)');
    await this.sqliteRun('CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at)');
  }
}

module.exports = {
  DatabaseAdapter,
  DATABASE_URL,
  DATABASE_PATH,
  UPLOADS_DIR,
  isPostgres
};
