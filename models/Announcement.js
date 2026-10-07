/**
 * Announcement Model — models/Announcement.js
 * Week 04 Homework & Week 05 Database Persistence
 *
 * Manages institutional notices, alumni homecoming events, and career announcements.
 */

const db = require('./db');

function formatAnnouncement(row) {
  if (!row) return null;
  let dateStr = row.date || row.publication_date;
  if (dateStr instanceof Date) {
    dateStr = dateStr.toISOString().split('T')[0];
  } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  }

  return {
    id: Number(row.id),
    title: row.title,
    content: row.content !== undefined ? row.content : '',
    category: row.category || 'General',
    author: row.author || 'Alumni Office',
    date: dateStr || new Date().toISOString().split('T')[0],
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

class AnnouncementModel {
  constructor() {
    this.resetInMemory();
  }

  resetInMemory() {
    this.announcements = [
      {
        id: 1,
        title: 'Annual MIS Alumni Homecoming Summit 2026',
        content: 'Join fellow Istanbul University MIS graduates on campus for keynote talks, networking panels, and mentorship roundtables.',
        category: 'Event',
        author: 'MIS Alumni Office',
        date: '2026-11-15'
      },
      {
        id: 2,
        title: 'Fall 2026 Tech Career & Internship Fair',
        content: 'Leading software and consulting firms are recruiting MIS students and recent graduates. Submit your profile via the Job Board.',
        category: 'Career',
        author: 'Career Coordination Center',
        date: '2026-10-28'
      },
      {
        id: 3,
        title: 'Graduate Research Grant Applications Open',
        content: 'Applications for the 2026-2027 digital transformation and AI systems research grants are now open for alumni and senior students.',
        category: 'Academic',
        author: 'Department of MIS',
        date: '2026-10-20'
      }
    ];
    this.nextId = 4;
  }

  validate(data = {}, isPartial = false) {
    if (!data || typeof data !== 'object') {
      const err = new Error('VALIDATION_ERROR: Request body must be a valid object');
      err.statusCode = 400;
      throw err;
    }

    if (!isPartial || data.title !== undefined) {
      if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 2) {
        const err = new Error('VALIDATION_ERROR: Announcement title is required (min 2 characters)');
        err.statusCode = 400;
        throw err;
      }
    }

    return true;
  }

  async findAll() {
    try {
      const res = await db.query(
        `SELECT id, title, content, category, author, publication_date AS date, created_at, updated_at
         FROM announcements
         ORDER BY id ASC;`
      );
      return res.rows.map(formatAnnouncement);
    } catch {
      return this.announcements.map(a => formatAnnouncement({ ...a }));
    }
  }

  async all() {
    return this.findAll();
  }

  async findById(id) {
    const numericId = Number(id);
    if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return null;
    }

    try {
      const res = await db.query(
        `SELECT id, title, content, category, author, publication_date AS date, created_at, updated_at
         FROM announcements
         WHERE id = $1;`,
        [numericId]
      );
      if (res.rows.length === 0) return null;
      return formatAnnouncement(res.rows[0]);
    } catch {
      const found = this.announcements.find(a => a.id === numericId);
      return found ? formatAnnouncement({ ...found }) : null;
    }
  }

  async create(data = {}) {
    this.validate(data, false);

    const validCategories = ['General', 'Event', 'Career', 'Academic'];
    const title = String(data.title).trim();
    const content = data.content !== undefined ? String(data.content).trim() : '';
    const category = validCategories.includes(data.category) ? data.category : 'General';
    const author = (data.author && String(data.author).trim()) || 'Alumni Office';
    const date = data.date || new Date().toISOString().split('T')[0];

    try {
      const res = await db.query(
        `INSERT INTO announcements (title, content, category, author, publication_date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, title, content, category, author, publication_date AS date, created_at, updated_at;`,
        [title, content, category, author, date]
      );
      const created = formatAnnouncement(res.rows[0]);
      this.announcements.push(created);
      if (created.id >= this.nextId) {
        this.nextId = created.id + 1;
      }
      return created;
    } catch {
      const maxExisting = this.announcements.length ? Math.max(...this.announcements.map(a => a.id)) : 0;
      if (this.nextId <= maxExisting) {
        this.nextId = maxExisting + 1;
      }
      const assignedId = this.nextId++;

      const created = formatAnnouncement({
        id: assignedId,
        title,
        content,
        category,
        author,
        date
      });
      this.announcements.push(created);
      return created;
    }
  }

  async update(id, updateData = {}, isPartial = true) {
    const numericId = Number(id);
    if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return null;
    }

    this.validate(updateData, isPartial);

    const validCategories = ['General', 'Event', 'Career', 'Academic'];

    try {
      const existing = await this.findById(numericId);
      if (!existing) return null;

      const title = updateData.title !== undefined ? String(updateData.title).trim() : existing.title;
      const content = updateData.content !== undefined ? String(updateData.content).trim() : existing.content;
      const category = updateData.category !== undefined && validCategories.includes(updateData.category)
        ? updateData.category
        : existing.category;
      const author = updateData.author !== undefined ? String(updateData.author).trim() : existing.author;
      const date = updateData.date !== undefined ? updateData.date : existing.date;

      const res = await db.query(
        `UPDATE announcements
         SET title = $1, content = $2, category = $3, author = $4, publication_date = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING id, title, content, category, author, publication_date AS date, created_at, updated_at;`,
        [title, content, category, author, date, numericId]
      );
      if (res.rows.length === 0) return null;
      const updated = formatAnnouncement(res.rows[0]);

      const idx = this.announcements.findIndex(a => a.id === numericId);
      if (idx !== -1) {
        this.announcements[idx] = updated;
      }
      return updated;
    } catch {
      const idx = this.announcements.findIndex(a => a.id === numericId);
      if (idx === -1) return null;
      const current = this.announcements[idx];

      const updated = formatAnnouncement({
        id: numericId,
        title: updateData.title !== undefined ? String(updateData.title).trim() : current.title,
        content: updateData.content !== undefined ? String(updateData.content).trim() : current.content,
        category: updateData.category !== undefined && validCategories.includes(updateData.category) ? updateData.category : current.category,
        author: updateData.author !== undefined ? String(updateData.author).trim() : current.author,
        date: updateData.date !== undefined ? updateData.date : current.date
      });
      this.announcements[idx] = updated;
      return updated;
    }
  }

  async delete(id) {
    const numericId = Number(id);
    if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return null;
    }

    try {
      const res = await db.query(
        `DELETE FROM announcements
         WHERE id = $1
         RETURNING id, title, content, category, author, publication_date AS date;`,
        [numericId]
      );
      if (res.rows.length === 0) return null;
      const deleted = formatAnnouncement(res.rows[0]);
      const idx = this.announcements.findIndex(a => a.id === numericId);
      if (idx !== -1) this.announcements.splice(idx, 1);
      return deleted;
    } catch {
      const idx = this.announcements.findIndex(a => a.id === numericId);
      if (idx === -1) return null;
      const [deleted] = this.announcements.splice(idx, 1);
      return formatAnnouncement(deleted);
    }
  }
}

const Announcement = new AnnouncementModel();
module.exports = Announcement;
