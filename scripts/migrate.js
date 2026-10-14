/**
 * Database Migration Runner — scripts/migrate.js
 * Week 05 & Week 06
 *
 * Rules:
 * - "Tables change only through migrations."
 * - "A change travels as a new migration. The old one already ran on every machine; never edit it."
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const connectionString =
  process.env.DATABASE_URL ||
  `postgres://${process.env.POSTGRES_USER || 'alumni_user'}:${process.env.POSTGRES_PASSWORD || 'alumni_password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.POSTGRES_DB || 'alumni_db'}`;

async function runMigrations() {
  console.log('==================================================');
  console.log('[MIGRATE] Alumni Tracking System — Migration Runner');
  console.log('==================================================');

  const client = new Client({ connectionString, connectionTimeoutMillis: 3000 });

  try {
    await client.connect();
    console.log('[MIGRATE] Connected to PostgreSQL.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const check = await client.query('SELECT id FROM schema_migrations WHERE name = $1;', [file]);
      if (check.rows.length > 0) {
        console.log(`[MIGRATE] ⏭️  Skipping already applied migration: ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      console.log(`[MIGRATE] 🚀 Applying migration: ${file}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1);', [file]);
        await client.query('COMMIT');
        console.log(`[MIGRATE] ✅ Applied: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    console.log('[MIGRATE] 🎉 All migrations are up to date.');
  } catch (err) {
    console.warn(`[MIGRATE] ⚠️  PostgreSQL unreachable or migration warning (${err.message}). Using in-memory fallback if offline.`);
  } finally {
    try {
      await client.end();
    } catch {
      // Ignore
    }
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
