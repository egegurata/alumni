/**
 * Centralized PostgreSQL Database Connection Pool (models/db.js)
 * Week 05: Database & ORM — Persistent Memory
 *
 * Uses pg.Pool to connect to the PostgreSQL DBMS.
 * Configured with allowExitOnIdle: true so automated tests (node --test)
 * exit cleanly without hanging on open socket handles.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load .env if present
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const connectionString =
  process.env.DATABASE_URL ||
  `postgres://${process.env.POSTGRES_USER || 'alumni_user'}:${process.env.POSTGRES_PASSWORD || 'alumni_password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.POSTGRES_DB || 'alumni_db'}`;

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 1000,
  connectionTimeoutMillis: 1500,
  allowExitOnIdle: true
});

pool.on('error', () => {
  // Handled gracefully at query call-sites with fallback support
});

module.exports = {
  pool,
  connectionString,
  query: (text, params) => pool.query(text, params)
};
