/**
 * User (Alumni & Student) Model — models/User.js
 * Weeks 03, 04, 05, 06
 *
 * Responsibilities (MVC — "Three jobs, three places"):
 * - Holds the data and its validation rules ("A rule is written once, in the model").
 * - Enforces:
 *   1. Email is required and must be a valid string -> throws 400 VALIDATION_ERROR.
 *   2. Email must be unique -> throws 409 CONFLICT_ERROR if duplicate email is used.
 *   3. Monotonically increasing nextId counter (never length + 1, so deleted IDs are never reused).
 *   4. Relational LEFT JOIN / include for User's job postings (GET /api/users/:id returns user with jobs: []).
 *   5. ON DELETE CASCADE: deleting a user removes their job postings and applications.
 */

const db = require('./db');

function formatUserRow(row) {
  if (!row) return null;
  const graduationYear = row.graduationYear !== undefined
    ? Number(row.graduationYear)
    : (row.graduation_year !== undefined ? Number(row.graduation_year) : 2028);

  const isAlumni = row.isAlumni !== undefined
    ? Boolean(row.isAlumni)
    : (row.is_alumni !== undefined ? Boolean(row.is_alumni) : graduationYear <= new Date().getFullYear());

  const formatted = {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    department: row.department || 'Management Information Systems',
    graduationYear,
    isAlumni,
    company: row.company !== undefined ? row.company : null,
    jobTitle: row.jobTitle !== undefined ? row.jobTitle : (row.job_title !== undefined ? row.job_title : null)
  };

  if (row.created_at) formatted.created_at = row.created_at;
  if (row.updated_at) formatted.updated_at = row.updated_at;
  if (Array.isArray(row.jobs)) formatted.jobs = row.jobs;
  if (Array.isArray(row.jobPostings)) formatted.jobPostings = row.jobPostings;
  if (Array.isArray(row.applications)) formatted.applications = row.applications;

  return formatted;
}

class UserModel {
  constructor() {
    this.resetInMemory();
  }

  /**
   * Resets the in-memory store and monotonically increasing ID counter.
   * Week 03 requirement: "Three users created, at least one alumnus and one who is not."
   * "Ids are never reused: keep a counter that only goes up (length + 1 hands out a taken id after a delete)."
   */
  resetInMemory() {
    this.users = [
      {
        id: 1,
        name: 'Ege Gürkan Atalay',
        email: 'egegurkanatalay@ogr.iu.edu.tr',
        department: 'Management Information Systems',
        graduationYear: 2028,
        isAlumni: false,
        company: 'Istanbul University MIS Lab',
        jobTitle: 'Backend Developer Fellow'
      },
      {
        id: 2,
        name: 'Elif Kaya',
        email: 'elif.kaya@alumni.iu.edu.tr',
        department: 'Management Information Systems',
        graduationYear: 2024,
        isAlumni: true,
        company: 'TechNova Cloud',
        jobTitle: 'Senior Systems Analyst'
      },
      {
        id: 3,
        name: 'Mert Aydın',
        email: 'mert.aydin@alumni.iu.edu.tr',
        department: 'Management Information Systems',
        graduationYear: 2022,
        isAlumni: true,
        company: 'FinEdge Solutions',
        jobTitle: 'Lead Data Engineer'
      }
    ];
    this.nextId = 4;
  }

  /**
   * Week 04 Rule: "A rule is written once, in the model.
   * 'A user must always have an email': the model refuses, the controller turns the refusal into 400."
   */
  validate(userData = {}, isPartial = false) {
    if (!userData || typeof userData !== 'object') {
      const err = new Error('VALIDATION_ERROR: Request body must be a valid JSON object');
      err.statusCode = 400;
      throw err;
    }

    if (!isPartial || userData.email !== undefined) {
      if (
        userData.email === undefined ||
        userData.email === null ||
        typeof userData.email !== 'string' ||
        userData.email.trim() === '' ||
        !userData.email.includes('@')
      ) {
        const err = new Error('VALIDATION_ERROR: A user must always have a valid email');
        err.statusCode = 400;
        throw err;
      }
    }

    if (!isPartial || userData.name !== undefined) {
      if (
        userData.name !== undefined &&
        (typeof userData.name !== 'string' || userData.name.trim() === '')
      ) {
        const err = new Error('VALIDATION_ERROR: Name cannot be empty');
        err.statusCode = 400;
        throw err;
      }
    }

    if (userData.graduationYear !== undefined && userData.graduationYear !== null && userData.graduationYear !== '') {
      const year = Number(userData.graduationYear);
      if (isNaN(year) || year < 1950 || year > 2100) {
        const err = new Error('VALIDATION_ERROR: graduationYear must be a valid year between 1950 and 2100');
        err.statusCode = 400;
        throw err;
      }
    }

    return true;
  }

  /**
   * 1. ALL (findAll): Returns all users
   */
  async findAll() {
    try {
      const res = await db.query(
        `SELECT id, name, email, department, graduation_year AS "graduationYear",
                is_alumni AS "isAlumni", company, job_title AS "jobTitle",
                created_at, updated_at
         FROM users
         ORDER BY id ASC;`
      );
      return res.rows.map(formatUserRow);
    } catch {
      return this.users.map(u => formatUserRow({ ...u }));
    }
  }

  async all() {
    return this.findAll();
  }

  /**
   * 2. ONE BY ID (findById): Finds a user by ID.
   * Week 06 requirement: "Include (join). GET /api/users/1 answers the user with a jobs array inside —
   * one answer, two tables. The ORM writes a LEFT JOIN (or a second query), so a user without postings
   * still comes back, with 'jobs': []."
   */
  async findById(id, options = { includeJobs: true }) {
    const numericId = Number(id);
    if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return null;
    }

    const shouldIncludeJobs = options && options.includeJobs !== false;

    try {
      if (shouldIncludeJobs) {
        // Single SQL query using LEFT JOIN across users and job_postings (Week 06 Plate C)
        const res = await db.query(
          `SELECT u.id, u.name, u.email, u.department,
                  u.graduation_year AS "graduationYear", u.is_alumni AS "isAlumni",
                  u.company, u.job_title AS "jobTitle", u.created_at, u.updated_at,
                  COALESCE(
                    json_agg(
                      json_build_object(
                        'id', j.id,
                        'user_id', j.user_id,
                        'userId', j.user_id,
                        'title', j.title,
                        'company', j.company,
                        'location', j.location,
                        'jobType', j.job_type,
                        'status', j.status,
                        'salary', j.salary,
                        'contactEmail', j.contact_email
                      ) ORDER BY j.id ASC
                    ) FILTER (WHERE j.id IS NOT NULL),
                    '[]'::json
                  ) AS jobs
           FROM users u
           LEFT JOIN job_postings j ON j.user_id = u.id
           WHERE u.id = $1
           GROUP BY u.id;`,
          [numericId]
        );
        if (res.rows.length === 0) return null;
        const user = formatUserRow(res.rows[0]);
        user.jobPostings = user.jobs;
        return user;
      }

      const res = await db.query(
        `SELECT id, name, email, department, graduation_year AS "graduationYear",
                is_alumni AS "isAlumni", company, job_title AS "jobTitle",
                created_at, updated_at
         FROM users
         WHERE id = $1;`,
        [numericId]
      );
      if (res.rows.length === 0) return null;
      return formatUserRow(res.rows[0]);
    } catch {
      const found = this.users.find(u => u.id === numericId);
      if (!found) return null;
      const formatted = formatUserRow({ ...found });
      if (shouldIncludeJobs) {
        const JobPosting = require('./JobPosting');
        const jobs = await JobPosting.findByUserId(numericId);
        formatted.jobs = jobs;
        formatted.jobPostings = jobs;
      }
      return formatted;
    }
  }

  /**
   * 3. CREATE: Creates a new user.
   * Enforces email requirement (400) and unique email constraint (409 Conflict).
   */
  async create(userData = {}) {
    this.validate(userData, false);

    const name = (userData.name && String(userData.name).trim()) || 'New Alumni Member';
    const email = String(userData.email).trim().toLowerCase();
    const department = (userData.department && String(userData.department).trim()) || 'Management Information Systems';
    const graduationYear = userData.graduationYear !== undefined && userData.graduationYear !== ''
      ? Number(userData.graduationYear)
      : 2026;
    const isAlumni = userData.isAlumni !== undefined
      ? Boolean(userData.isAlumni === true || userData.isAlumni === 'true')
      : graduationYear <= new Date().getFullYear();
    const company = userData.company ? String(userData.company).trim() : null;
    const jobTitle = userData.jobTitle ? String(userData.jobTitle).trim() : null;

    try {
      const res = await db.query(
        `INSERT INTO users (name, email, department, graduation_year, is_alumni, company, job_title)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, email, department, graduation_year AS "graduationYear",
                   is_alumni AS "isAlumni", company, job_title AS "jobTitle",
                   created_at, updated_at;`,
        [name, email, department, graduationYear, isAlumni, company, jobTitle]
      );
      const created = formatUserRow(res.rows[0]);
      // Mirror in memory
      const existingIdx = this.users.findIndex(u => u.id === created.id);
      if (existingIdx !== -1) {
        this.users[existingIdx] = created;
      } else {
        this.users.push(created);
      }
      if (created.id >= this.nextId) {
        this.nextId = created.id + 1;
      }
      return created;
    } catch (err) {
      // PostgreSQL unique_violation error code is 23505 (Week 05: "and the same email twice answers 409")
      if (err && err.code === '23505') {
        const conflictErr = new Error(`CONFLICT_ERROR: A user with email '${email}' already exists`);
        conflictErr.statusCode = 409;
        throw conflictErr;
      }

      // In-memory fallback when PostgreSQL is offline
      const duplicate = this.users.find(u => u.email.toLowerCase() === email);
      if (duplicate) {
        const conflictErr = new Error(`CONFLICT_ERROR: A user with email '${email}' already exists`);
        conflictErr.statusCode = 409;
        throw conflictErr;
      }

      // Monotonically increasing counter (never length + 1!)
      const maxExisting = this.users.length ? Math.max(...this.users.map(u => u.id)) : 0;
      if (this.nextId <= maxExisting) {
        this.nextId = maxExisting + 1;
      }
      const assignedId = this.nextId++;

      const newUser = formatUserRow({
        id: assignedId,
        name,
        email,
        department,
        graduationYear,
        isAlumni,
        company,
        jobTitle
      });
      this.users.push(newUser);
      return newUser;
    }
  }

  /**
   * 4. UPDATE (Full PUT or Partial PATCH):
   * - PUT replaces the whole resource (requires email validation).
   * - PATCH changes only the fields sent.
   */
  async update(id, updateData = {}, isPartial = true) {
    const numericId = Number(id);
    if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return null;
    }

    this.validate(updateData, isPartial);

    try {
      const existing = await this.findById(numericId, { includeJobs: false });
      if (!existing) return null;

      const name = updateData.name !== undefined
        ? String(updateData.name).trim()
        : (isPartial ? existing.name : 'New Alumni Member');
      const email = updateData.email !== undefined
        ? String(updateData.email).trim().toLowerCase()
        : existing.email;
      const department = updateData.department !== undefined
        ? String(updateData.department).trim()
        : (isPartial ? existing.department : 'Management Information Systems');
      const graduationYear = updateData.graduationYear !== undefined && updateData.graduationYear !== ''
        ? Number(updateData.graduationYear)
        : (isPartial ? existing.graduationYear : 2026);
      const isAlumni = updateData.isAlumni !== undefined
        ? Boolean(updateData.isAlumni === true || updateData.isAlumni === 'true')
        : (isPartial ? existing.isAlumni : graduationYear <= new Date().getFullYear());
      const company = updateData.company !== undefined
        ? updateData.company
        : (isPartial ? existing.company : null);
      const jobTitle = updateData.jobTitle !== undefined
        ? updateData.jobTitle
        : (isPartial ? existing.jobTitle : null);

      const res = await db.query(
        `UPDATE users
         SET name = $1, email = $2, department = $3, graduation_year = $4,
             is_alumni = $5, company = $6, job_title = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8
         RETURNING id, name, email, department, graduation_year AS "graduationYear",
                   is_alumni AS "isAlumni", company, job_title AS "jobTitle",
                   created_at, updated_at;`,
        [name, email, department, graduationYear, isAlumni, company, jobTitle, numericId]
      );

      if (res.rows.length === 0) return null;
      const updated = formatUserRow(res.rows[0]);

      const memIdx = this.users.findIndex(u => u.id === numericId);
      if (memIdx !== -1) {
        this.users[memIdx] = { ...this.users[memIdx], ...updated };
      }

      return updated;
    } catch (err) {
      if (err && err.code === '23505') {
        const conflictErr = new Error('CONFLICT_ERROR: Email is already in use by another user');
        conflictErr.statusCode = 409;
        throw conflictErr;
      }

      // In-memory fallback
      const idx = this.users.findIndex(u => u.id === numericId);
      if (idx === -1) return null;

      if (updateData.email !== undefined) {
        const normalizedEmail = String(updateData.email).trim().toLowerCase();
        const duplicate = this.users.find(u => u.id !== numericId && u.email.toLowerCase() === normalizedEmail);
        if (duplicate) {
          const conflictErr = new Error(`CONFLICT_ERROR: A user with email '${normalizedEmail}' already exists`);
          conflictErr.statusCode = 409;
          throw conflictErr;
        }
      }

      const current = this.users[idx];
      const updated = formatUserRow({
        id: numericId,
        name: updateData.name !== undefined ? String(updateData.name).trim() : (isPartial ? current.name : 'New Alumni Member'),
        email: updateData.email !== undefined ? String(updateData.email).trim().toLowerCase() : current.email,
        department: updateData.department !== undefined ? String(updateData.department).trim() : (isPartial ? current.department : 'Management Information Systems'),
        graduationYear: updateData.graduationYear !== undefined && updateData.graduationYear !== '' ? Number(updateData.graduationYear) : (isPartial ? current.graduationYear : 2026),
        isAlumni: updateData.isAlumni !== undefined ? Boolean(updateData.isAlumni === true || updateData.isAlumni === 'true') : (isPartial ? current.isAlumni : true),
        company: updateData.company !== undefined ? updateData.company : (isPartial ? current.company : null),
        jobTitle: updateData.jobTitle !== undefined ? updateData.jobTitle : (isPartial ? current.jobTitle : null)
      });

      this.users[idx] = updated;
      return updated;
    }
  }

  async patch(id, partialData = {}) {
    return this.update(id, partialData, true);
  }

  /**
   * 5. DELETE: Deletes a user by ID.
   * Week 06 Delete Rule Decision (ddd.md): ON DELETE CASCADE
   * Deleting a user cascades to their job_postings and applications.
   */
  async delete(id) {
    const numericId = Number(id);
    if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return null;
    }

    try {
      const res = await db.query(
        `DELETE FROM users
         WHERE id = $1
         RETURNING id, name, email, department, graduation_year AS "graduationYear", is_alumni AS "isAlumni";`,
        [numericId]
      );
      if (res.rows.length === 0) return null;
      const deleted = formatUserRow(res.rows[0]);

      const idx = this.users.findIndex(u => u.id === numericId);
      if (idx !== -1) {
        this.users.splice(idx, 1);
      }

      // Also cascade in-memory stores
      try {
        const JobPosting = require('./JobPosting');
        const Application = require('./Application');
        JobPosting.cascadeDeleteByUser(numericId);
        Application.cascadeDeleteByUser(numericId);
      } catch {
        // Ignore if not loaded
      }

      return deleted;
    } catch {
      const idx = this.users.findIndex(u => u.id === numericId);
      if (idx === -1) return null;
      const [deleted] = this.users.splice(idx, 1);

      try {
        const JobPosting = require('./JobPosting');
        const Application = require('./Application');
        JobPosting.cascadeDeleteByUser(numericId);
        Application.cascadeDeleteByUser(numericId);
      } catch {
        // Ignore
      }

      return formatUserRow(deleted);
    }
  }

  /**
   * Relationship helpers for Week 06
   */
  async getJobPostings(userId) {
    const JobPosting = require('./JobPosting');
    return JobPosting.findByUserId(userId);
  }

  async findByIdWithJobPostings(id) {
    return this.findById(id, { includeJobs: true });
  }

  async getApplications(userId) {
    const Application = require('./Application');
    return Application.findByUser(userId);
  }

  async findByIdWithApplications(id) {
    const user = await this.findById(id, { includeJobs: true });
    if (!user) return null;
    const applications = await this.getApplications(id);
    return {
      ...user,
      applications
    };
  }
}

const User = new UserModel();
module.exports = User;
