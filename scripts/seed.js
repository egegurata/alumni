/**
 * Database Seeder — scripts/seed.js
 * Week 05 & Week 06
 *
 * Strict Requirements from Lecture Notes:
 * - Week 05: "Factories and a seed that empties the tables first, so it can run twice."
 * - Week 06: "a seed that empties the tables in the right order and resets the id counters."
 *
 * Right Order for Deletion (Child -> Parent):
 *   1. applications (many-to-many join table)
 *   2. job_postings (one-to-many child of users)
 *   3. announcements (independent table)
 *   4. users (parent table)
 * Plus RESTART IDENTITY to reset all SERIAL primary key sequences back to 1!
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const {
  UserFactory,
  AnnouncementFactory,
  JobPostingFactory,
  ApplicationFactory
} = require('../factories');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const connectionString =
  process.env.DATABASE_URL ||
  `postgres://${process.env.POSTGRES_USER || 'alumni_user'}:${process.env.POSTGRES_PASSWORD || 'alumni_password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.POSTGRES_DB || 'alumni_db'}`;

async function seedDatabase({
  userCount = 5,
  announcementCount = 4,
  jobCount = 4,
  applicationCount = 4
} = {}) {
  console.log('==================================================');
  console.log('[SEED] Alumni Tracking System — Database Seeder');
  console.log('==================================================');

  // Always reset Factory counters so running seed twice produces deterministic IDs & data
  UserFactory.resetCounter(1);
  AnnouncementFactory.resetCounter(1);
  JobPostingFactory.resetCounter(1);
  ApplicationFactory.resetCounter(1);

  const client = new Client({ connectionString, connectionTimeoutMillis: 3000 });

  try {
    await client.connect();
    console.log('[SEED] Connected to PostgreSQL.');

    // Step 1: Empty tables in the exact right child -> parent order and reset ID counters!
    console.log('[SEED] 🧹 Emptying tables in dependency order (applications -> job_postings -> announcements -> users) and resetting ID sequences...');
    await client.query(`
      TRUNCATE TABLE applications, job_postings, announcements, users
      RESTART IDENTITY CASCADE;
    `);

    // Step 2: Seed Users (at least one alumnus and one student/non-alumnus)
    console.log(`[SEED] 👤 Seeding ${userCount} users...`);
    const seededUsers = [];
    for (let i = 0; i < userCount; i++) {
      const u = await UserFactory.createInDb(client);
      seededUsers.push(u);
    }

    // Step 3: Seed Announcements
    console.log(`[SEED] 📢 Seeding ${announcementCount} announcements...`);
    const seededAnnouncements = [];
    for (let i = 0; i < announcementCount; i++) {
      const a = await AnnouncementFactory.createInDb(client);
      seededAnnouncements.push(a);
    }

    // Step 4: Seed Job Postings (linked to existing users via user_id FK)
    console.log(`[SEED] 💼 Seeding ${jobCount} job postings...`);
    const seededJobs = [];
    for (let i = 0; i < jobCount; i++) {
      const owner = seededUsers[(i + 1) % seededUsers.length] || seededUsers[0];
      const j = await JobPostingFactory.createInDb(client, { user_id: owner.id });
      seededJobs.push(j);
    }

    // Step 5: Seed Applications (unique (user_id, job_posting_id) pairs)
    console.log(`[SEED] 📝 Seeding ${applicationCount} applications...`);
    const pairs = [
      { uIdx: 0, jIdx: 0, status: 'applied' },
      { uIdx: 2, jIdx: 0, status: 'interview' },
      { uIdx: 0, jIdx: 2, status: 'applied' },
      { uIdx: 4, jIdx: 1, status: 'accepted' }
    ];
    const seededApplications = [];
    for (let i = 0; i < Math.min(applicationCount, pairs.length); i++) {
      const pair = pairs[i];
      const applicant = seededUsers[pair.uIdx % seededUsers.length];
      const job = seededJobs[pair.jIdx % seededJobs.length];
      const app = await ApplicationFactory.createInDb(client, {
        user_id: applicant.id,
        job_posting_id: job.id,
        status: pair.status
      });
      seededApplications.push(app);
    }

    console.log('[SEED] ✅ Database seeded successfully!');
    return {
      users: seededUsers,
      announcements: seededAnnouncements,
      jobs: seededJobs,
      applications: seededApplications
    };
  } catch (err) {
    console.warn(`[SEED] ⚠️  PostgreSQL offline (${err.message}). Resetting in-memory stores instead.`);
    const { User, Announcement, JobPosting, Application } = require('../models');
    User.resetInMemory();
    Announcement.resetInMemory();
    JobPosting.resetInMemory();
    Application.resetInMemory();
    return {
      users: User.users,
      announcements: Announcement.announcements,
      jobs: JobPosting.jobPostings,
      applications: Application.applications
    };
  } finally {
    try {
      await client.end();
    } catch {
      // Ignore
    }
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
