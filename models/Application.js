/**
 * Application Model (Many-to-Many Join Table) — models/Application.js
 * Week 06: Relational Data & Advanced Routing — Job Applications
 *
 * Key Rules (Week 06):
 * - Join table connecting users and job_postings: one row per (user_id, job_posting_id).
 * - Foreign keys checked: returns 404 Not Found if either user_id or job_posting_id does not exist.
 * - Unique Pair Constraint: UNIQUE (user_id, job_posting_id).
 *   "The same person cannot apply to the same posting twice; the database refuses, the controller answers 409."
 */

const db = require('./db');

function formatApplication(row) {
  if (!row) return null;
  let appliedAtStr = row.appliedAt || row.applied_at || row.created_at;
  if (appliedAtStr instanceof Date) {
    appliedAtStr = appliedAtStr.toISOString();
  }

  const userId = Number(row.user_id !== undefined ? row.user_id : row.userId);
  const jobPostingId = Number(row.job_posting_id !== undefined ? row.job_posting_id : row.jobPostingId);

  const formatted = {
    id: Number(row.id),
    user_id: userId,
    userId,
    job_posting_id: jobPostingId,
    jobPostingId,
    status: row.status || 'applied',
    coverNote: row.coverNote !== undefined ? row.coverNote : (row.cover_note || ''),
    resumeUrl: row.resumeUrl !== undefined ? row.resumeUrl : (row.resume_url || null),
    appliedAt: appliedAtStr || new Date().toISOString()
  };

  if (row.user) {
    formatted.user = row.user;
  } else if (row.userName || row.user_name) {
    formatted.user = {
      id: userId,
      name: row.userName || row.user_name,
      email: row.userEmail || row.user_email,
      department: row.userDepartment || row.user_department
    };
  }

  if (row.jobPosting) {
    formatted.jobPosting = row.jobPosting;
  } else if (row.jobTitle || row.job_title) {
    formatted.jobPosting = {
      id: jobPostingId,
      title: row.jobTitle || row.job_title,
      company: row.jobCompany || row.job_company,
      location: row.jobLocation || row.job_location
    };
  }

  return formatted;
}

class ApplicationModel {
  constructor() {
    this.resetInMemory();
  }

  resetInMemory() {
    this.applications = [
      {
        id: 1,
        user_id: 1,
        userId: 1,
        job_posting_id: 1,
        jobPostingId: 1,
        status: 'applied',
        coverNote: 'Strong experience in Node.js, Express, and PostgreSQL relational data architecture.',
        resumeUrl: 'https://github.com/egegurata',
        appliedAt: '2026-10-21T09:00:00.000Z'
      },
      {
        id: 2,
        user_id: 3,
        userId: 3,
        job_posting_id: 1,
        jobPostingId: 1,
        status: 'interview',
        coverNote: 'Interested in distributed backend systems and cloud architecture.',
        resumeUrl: 'https://alumni.iu.edu.tr/cv/mert-aydin.pdf',
        appliedAt: '2026-10-21T10:15:00.000Z'
      },
      {
        id: 3,
        user_id: 1,
        userId: 1,
        job_posting_id: 3,
        jobPostingId: 3,
        status: 'applied',
        coverNote: 'MIS student passionate about SQL query optimization and BI analytics.',
        resumeUrl: 'https://github.com/egegurata',
        appliedAt: '2026-10-21T11:30:00.000Z'
      }
    ];
    this.nextId = 4;
  }

  /**
   * CREATE Application:
   * Enforces:
   * - 400 Bad Request if userId or jobPostingId is missing/invalid.
   * - 404 Not Found if either the job posting or user does not exist.
   * - 409 Conflict if the (user_id, job_posting_id) pair already exists!
   */
  async create(data = {}) {
    const rawUserId = data.user_id !== undefined ? data.user_id : data.userId;
    const rawJobId = data.job_posting_id !== undefined ? data.job_posting_id : (data.jobPostingId !== undefined ? data.jobPostingId : data.jobId);

    if (rawUserId === undefined || rawUserId === null || rawUserId === '' || rawJobId === undefined || rawJobId === null || rawJobId === '') {
      const err = new Error('VALIDATION_ERROR: Both userId and jobPostingId are required');
      err.statusCode = 400;
      throw err;
    }

    const userId = Number(rawUserId);
    const jobPostingId = Number(rawJobId);

    if (isNaN(userId) || isNaN(jobPostingId) || userId <= 0 || jobPostingId <= 0) {
      const err = new Error('VALIDATION_ERROR: userId and jobPostingId must be positive numbers');
      err.statusCode = 400;
      throw err;
    }

    const User = require('./User');
    const JobPosting = require('./JobPosting');

    // Check job posting exists first (404 if not found)
    const job = await JobPosting.findById(jobPostingId);
    if (!job) {
      const err = new Error(`JOB_NOT_FOUND: Job posting with id ${jobPostingId} not found`);
      err.statusCode = 404;
      throw err;
    }

    // Check user exists (404 if not found)
    const user = await User.findById(userId, { includeJobs: false });
    if (!user) {
      const err = new Error(`USER_NOT_FOUND: User with id ${userId} not found`);
      err.statusCode = 404;
      throw err;
    }

    const status = data.status || 'applied';
    const coverNote = data.coverNote !== undefined ? String(data.coverNote) : (data.cover_note || '');
    const resumeUrl = data.resumeUrl !== undefined ? data.resumeUrl : (data.resume_url || null);

    try {
      // Plain INSERT without ON CONFLICT DO UPDATE so duplicate (user_id, job_posting_id) triggers 23505 -> 409 Conflict!
      const res = await db.query(
        `INSERT INTO applications (user_id, job_posting_id, status, cover_note, resume_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, job_posting_id, status, cover_note AS "coverNote",
                   resume_url AS "resumeUrl", applied_at AS "appliedAt", created_at, updated_at;`,
        [userId, jobPostingId, status, coverNote, resumeUrl]
      );
      const created = formatApplication(res.rows[0]);
      this.applications.push(created);
      if (created.id >= this.nextId) {
        this.nextId = created.id + 1;
      }
      return created;
    } catch (err) {
      // PostgreSQL unique_violation (23505) on uq_user_job_application -> 409 Conflict!
      if (err && err.code === '23505') {
        const conflictErr = new Error(`ALREADY_APPLIED: User ${userId} has already applied to job posting ${jobPostingId}`);
        conflictErr.statusCode = 409;
        throw conflictErr;
      }
      if (err && err.code === '23503') {
        const fkErr = new Error('NOT_FOUND: Referenced user or job posting does not exist');
        fkErr.statusCode = 404;
        throw fkErr;
      }

      // In-memory fallback check for UNIQUE (user_id, job_posting_id)
      const duplicate = this.applications.find(
        a => Number(a.user_id) === userId && Number(a.job_posting_id) === jobPostingId
      );
      if (duplicate) {
        const conflictErr = new Error(`ALREADY_APPLIED: User ${userId} has already applied to job posting ${jobPostingId}`);
        conflictErr.statusCode = 409;
        throw conflictErr;
      }

      const maxExisting = this.applications.length ? Math.max(...this.applications.map(a => a.id)) : 0;
      if (this.nextId <= maxExisting) {
        this.nextId = maxExisting + 1;
      }
      const assignedId = this.nextId++;

      const created = formatApplication({
        id: assignedId,
        user_id: userId,
        job_posting_id: jobPostingId,
        status,
        coverNote,
        resumeUrl,
        appliedAt: new Date().toISOString()
      });
      this.applications.push(created);
      return created;
    }
  }

  async findAll(filters = {}) {
    const filterUserId = filters.user_id !== undefined ? filters.user_id : filters.userId;
    const filterJobId = filters.job_posting_id !== undefined ? filters.job_posting_id : filters.jobPostingId;

    try {
      const conditions = [];
      const values = [];

      if (filterUserId !== undefined) {
        values.push(Number(filterUserId));
        conditions.push(`a.user_id = $${values.length}`);
      }
      if (filterJobId !== undefined) {
        values.push(Number(filterJobId));
        conditions.push(`a.job_posting_id = $${values.length}`);
      }
      if (filters.status) {
        values.push(filters.status);
        conditions.push(`a.status = $${values.length}`);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const res = await db.query(
        `SELECT a.id, a.user_id, a.job_posting_id, a.status,
                a.cover_note AS "coverNote", a.resume_url AS "resumeUrl",
                a.applied_at AS "appliedAt", a.created_at, a.updated_at,
                u.name AS "userName", u.email AS "userEmail", u.department AS "userDepartment",
                j.title AS "jobTitle", j.company AS "jobCompany", j.location AS "jobLocation"
         FROM applications a
         LEFT JOIN users u ON a.user_id = u.id
         LEFT JOIN job_postings j ON a.job_posting_id = j.id
         ${whereClause}
         ORDER BY a.id ASC;`,
        values
      );
      return res.rows.map(formatApplication);
    } catch {
      let list = [...this.applications];
      if (filterUserId !== undefined) {
        list = list.filter(a => Number(a.user_id) === Number(filterUserId));
      }
      if (filterJobId !== undefined) {
        list = list.filter(a => Number(a.job_posting_id) === Number(filterJobId));
      }
      if (filters.status) {
        list = list.filter(a => a.status.toLowerCase() === String(filters.status).toLowerCase());
      }

      const User = require('./User');
      const JobPosting = require('./JobPosting');
      const enriched = [];
      for (const item of list) {
        const u = await User.findById(item.user_id, { includeJobs: false });
        const j = await JobPosting.findById(item.job_posting_id);
        enriched.push(
          formatApplication({
            ...item,
            user: u ? { id: u.id, name: u.name, email: u.email, department: u.department } : undefined,
            jobPosting: j ? { id: j.id, title: j.title, company: j.company, location: j.location } : undefined
          })
        );
      }
      return enriched;
    }
  }

  async findById(id) {
    const numericId = Number(id);
    if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return null;
    }

    try {
      const res = await db.query(
        `SELECT a.id, a.user_id, a.job_posting_id, a.status,
                a.cover_note AS "coverNote", a.resume_url AS "resumeUrl",
                a.applied_at AS "appliedAt", a.created_at, a.updated_at,
                u.name AS "userName", u.email AS "userEmail", u.department AS "userDepartment",
                j.title AS "jobTitle", j.company AS "jobCompany", j.location AS "jobLocation"
         FROM applications a
         LEFT JOIN users u ON a.user_id = u.id
         LEFT JOIN job_postings j ON a.job_posting_id = j.id
         WHERE a.id = $1;`,
        [numericId]
      );
      if (res.rows.length === 0) return null;
      return formatApplication(res.rows[0]);
    } catch {
      const found = this.applications.find(a => a.id === numericId);
      if (!found) return null;
      const User = require('./User');
      const JobPosting = require('./JobPosting');
      const u = await User.findById(found.user_id, { includeJobs: false });
      const j = await JobPosting.findById(found.job_posting_id);
      return formatApplication({
        ...found,
        user: u ? { id: u.id, name: u.name, email: u.email, department: u.department } : undefined,
        jobPosting: j ? { id: j.id, title: j.title, company: j.company, location: j.location } : undefined
      });
    }
  }

  async findByIdWithDetails(id) {
    return this.findById(id);
  }

  async findByUser(userId) {
    return this.findAll({ user_id: Number(userId) });
  }

  async findByJob(jobPostingId) {
    return this.findAll({ job_posting_id: Number(jobPostingId) });
  }

  async update(id, updateData = {}) {
    const numericId = Number(id);
    if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return null;
    }

    try {
      const existing = await this.findById(numericId);
      if (!existing) return null;

      const status = updateData.status !== undefined ? updateData.status : existing.status;
      const coverNote = updateData.coverNote !== undefined ? updateData.coverNote : (updateData.cover_note !== undefined ? updateData.cover_note : existing.coverNote);
      const resumeUrl = updateData.resumeUrl !== undefined ? updateData.resumeUrl : (updateData.resume_url !== undefined ? updateData.resume_url : existing.resumeUrl);

      const res = await db.query(
        `UPDATE applications
         SET status = $1, cover_note = $2, resume_url = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING id, user_id, job_posting_id, status, cover_note AS "coverNote",
                   resume_url AS "resumeUrl", applied_at AS "appliedAt", created_at, updated_at;`,
        [status, coverNote, resumeUrl, numericId]
      );
      if (res.rows.length === 0) return null;
      const updated = formatApplication(res.rows[0]);
      const idx = this.applications.findIndex(a => a.id === numericId);
      if (idx !== -1) this.applications[idx] = { ...this.applications[idx], ...updated };
      return updated;
    } catch {
      const idx = this.applications.findIndex(a => a.id === numericId);
      if (idx === -1) return null;
      const current = this.applications[idx];
      const updated = formatApplication({
        ...current,
        status: updateData.status !== undefined ? updateData.status : current.status,
        coverNote: updateData.coverNote !== undefined ? updateData.coverNote : current.coverNote,
        resumeUrl: updateData.resumeUrl !== undefined ? updateData.resumeUrl : current.resumeUrl
      });
      this.applications[idx] = updated;
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
        `DELETE FROM applications
         WHERE id = $1
         RETURNING id, user_id, job_posting_id, status;`,
        [numericId]
      );
      if (res.rows.length === 0) return null;
      const deleted = formatApplication(res.rows[0]);
      const idx = this.applications.findIndex(a => a.id === numericId);
      if (idx !== -1) this.applications.splice(idx, 1);
      return deleted;
    } catch {
      const idx = this.applications.findIndex(a => a.id === numericId);
      if (idx === -1) return null;
      const [deleted] = this.applications.splice(idx, 1);
      return formatApplication(deleted);
    }
  }

  cascadeDeleteByUser(userId) {
    const uid = Number(userId);
    this.applications = this.applications.filter(a => Number(a.user_id) !== uid);
  }

  cascadeDeleteByJob(jobPostingId) {
    const jid = Number(jobPostingId);
    this.applications = this.applications.filter(a => Number(a.job_posting_id) !== jid);
  }
}

const Application = new ApplicationModel();
module.exports = Application;
