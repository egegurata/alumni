/**
 * JobPosting Model — models/JobPosting.js
 * Week 06: Relational Data & Advanced Routing — Job Postings
 *
 * One-to-Many Relationship:
 * - One user has many job_postings, each job_posting belongs to one user (FK: user_id -> users.id).
 * - Nested Route: POST & GET /api/users/:id/jobs ("the jobs of this user", unknown user answers 404).
 * - Delete Rule: ON DELETE CASCADE (when a user is deleted, their job postings are deleted with them).
 */

const db = require('./db');

function formatJobPosting(row) {
  if (!row) return null;
  let deadlineStr = row.applicationDeadline || row.application_deadline;
  if (deadlineStr instanceof Date) {
    deadlineStr = deadlineStr.toISOString().split('T')[0];
  } else if (typeof deadlineStr === 'string' && deadlineStr.includes('T')) {
    deadlineStr = deadlineStr.split('T')[0];
  }

  const userIdVal = row.user_id !== undefined
    ? Number(row.user_id)
    : (row.userId !== undefined ? Number(row.userId) : (row.postedBy !== undefined ? Number(row.postedBy) : 1));

  const formatted = {
    id: Number(row.id),
    user_id: userIdVal,
    userId: userIdVal,
    postedBy: userIdVal,
    title: row.title,
    company: row.company,
    location: row.location || 'Istanbul (Hybrid)',
    jobType: row.jobType || row.job_type || 'Full-time',
    description: row.description !== undefined ? row.description : '',
    requirements: row.requirements !== undefined ? row.requirements : '',
    salary: row.salary !== undefined ? row.salary : null,
    contactEmail: row.contactEmail || row.contact_email || 'careers@alumni.edu',
    status: row.status || 'Active',
    applicationDeadline: deadlineStr || null
  };

  if (row.created_at) formatted.created_at = row.created_at;
  if (row.updated_at) formatted.updated_at = row.updated_at;

  if (row.user) {
    formatted.user = row.user;
  } else if (row.userName || row.user_name) {
    formatted.user = {
      id: userIdVal,
      name: row.userName || row.user_name,
      department: row.userDepartment || row.user_department,
      email: row.userEmail || row.user_email
    };
  }

  return formatted;
}

class JobPostingModel {
  constructor() {
    this.resetInMemory();
  }

  resetInMemory() {
    this.jobPostings = [
      {
        id: 1,
        user_id: 2,
        userId: 2,
        postedBy: 2,
        title: 'Junior Backend Developer (Node.js & PostgreSQL)',
        company: 'TechNova Cloud',
        location: 'Istanbul (Hybrid)',
        jobType: 'Full-time',
        description: 'Build and maintain RESTful microservices and relational database schemas.',
        requirements: 'Node.js, Express, SQL, Docker Compose, Git.',
        salary: '$45,000 - $60,000',
        contactEmail: 'careers@technova.io',
        status: 'Active',
        applicationDeadline: '2026-12-31'
      },
      {
        id: 2,
        user_id: 2,
        userId: 2,
        postedBy: 2,
        title: 'Cloud Systems & DevOps Intern',
        company: 'TechNova Cloud',
        location: 'Remote',
        jobType: 'Internship',
        description: 'Assist engineering teams with Docker containerization and CI/CD pipelines.',
        requirements: 'Linux basics, Docker, Git, MIS or CS student.',
        salary: '$1,200 / month',
        contactEmail: 'internships@technova.io',
        status: 'Active',
        applicationDeadline: '2026-11-30'
      },
      {
        id: 3,
        user_id: 3,
        userId: 3,
        postedBy: 3,
        title: 'Business Intelligence & Data Analyst',
        company: 'FinEdge Solutions',
        location: 'Istanbul (On-site)',
        jobType: 'Full-time',
        description: 'Design executive analytics dashboards and optimize PostgreSQL reporting queries.',
        requirements: 'Strong SQL, data modeling, Python/BI tools.',
        salary: '$50,000 - $68,000',
        contactEmail: 'talent@finedge.com',
        status: 'Active',
        applicationDeadline: '2026-12-15'
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
      if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
        const err = new Error('VALIDATION_ERROR: Job posting title is required');
        err.statusCode = 400;
        throw err;
      }
    }

    if (!isPartial || data.company !== undefined) {
      if (!data.company || typeof data.company !== 'string' || data.company.trim() === '') {
        const err = new Error('VALIDATION_ERROR: Company name is required');
        err.statusCode = 400;
        throw err;
      }
    }

    return true;
  }

  async create(data = {}) {
    this.validate(data, false);

    const rawUserId = data.user_id !== undefined
      ? data.user_id
      : (data.userId !== undefined ? data.userId : (data.postedBy !== undefined ? data.postedBy : 1));
    const userId = Number(rawUserId);

    // Foreign key check: ensure user exists (Week 06: "you cannot post a job for a user who does not exist -> 404")
    const User = require('./User');
    const owner = await User.findById(userId, { includeJobs: false });
    if (!owner) {
      const err = new Error(`USER_NOT_FOUND: User with id ${userId} does not exist`);
      err.statusCode = 404;
      throw err;
    }

    const title = String(data.title).trim();
    const company = String(data.company).trim();
    const location = data.location ? String(data.location).trim() : 'Istanbul (Hybrid)';
    const validTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
    const jobType = validTypes.includes(data.jobType || data.job_type)
      ? (data.jobType || data.job_type)
      : 'Full-time';
    const description = data.description !== undefined ? String(data.description).trim() : '';
    const requirements = data.requirements !== undefined ? String(data.requirements).trim() : '';
    const salary = data.salary !== undefined ? data.salary : null;
    const contactEmail = data.contactEmail || data.contact_email || owner.email || 'careers@alumni.edu';
    const validStatuses = ['Active', 'Closed', 'Draft'];
    const status = validStatuses.includes(data.status) ? data.status : 'Active';
    const applicationDeadline = data.applicationDeadline || data.application_deadline || null;

    try {
      const res = await db.query(
        `INSERT INTO job_postings (
           user_id, title, company, location, job_type, description,
           requirements, salary, contact_email, status, application_deadline
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id, user_id, title, company, location, job_type AS "jobType",
                   description, requirements, salary, contact_email AS "contactEmail",
                   status, application_deadline AS "applicationDeadline",
                   created_at, updated_at;`,
        [userId, title, company, location, jobType, description, requirements, salary, contactEmail, status, applicationDeadline]
      );
      const created = formatJobPosting(res.rows[0]);
      this.jobPostings.push(created);
      if (created.id >= this.nextId) {
        this.nextId = created.id + 1;
      }
      return created;
    } catch (err) {
      if (err && err.code === '23503') {
        const fkErr = new Error(`USER_NOT_FOUND: User with id ${userId} does not exist`);
        fkErr.statusCode = 404;
        throw fkErr;
      }

      const maxExisting = this.jobPostings.length ? Math.max(...this.jobPostings.map(j => j.id)) : 0;
      if (this.nextId <= maxExisting) {
        this.nextId = maxExisting + 1;
      }
      const assignedId = this.nextId++;

      const created = formatJobPosting({
        id: assignedId,
        user_id: userId,
        title,
        company,
        location,
        jobType,
        description,
        requirements,
        salary,
        contactEmail,
        status,
        applicationDeadline
      });
      this.jobPostings.push(created);
      return created;
    }
  }

  async findAll(filters = {}) {
    const targetUserId = filters.user_id || filters.userId || filters.postedBy;
    try {
      const conditions = [];
      const values = [];

      if (targetUserId !== undefined) {
        values.push(Number(targetUserId));
        conditions.push(`user_id = $${values.length}`);
      }
      if (filters.status) {
        values.push(filters.status);
        conditions.push(`status = $${values.length}`);
      }
      if (filters.jobType) {
        values.push(filters.jobType);
        conditions.push(`job_type = $${values.length}`);
      }
      if (filters.company) {
        values.push(`%${filters.company}%`);
        conditions.push(`company ILIKE $${values.length}`);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const res = await db.query(
        `SELECT id, user_id, title, company, location, job_type AS "jobType",
                description, requirements, salary, contact_email AS "contactEmail",
                status, application_deadline AS "applicationDeadline",
                created_at, updated_at
         FROM job_postings
         ${whereClause}
         ORDER BY id ASC;`,
        values
      );
      return res.rows.map(formatJobPosting);
    } catch {
      let list = [...this.jobPostings];
      if (targetUserId !== undefined) {
        list = list.filter(j => Number(j.user_id) === Number(targetUserId));
      }
      if (filters.status) {
        list = list.filter(j => j.status.toLowerCase() === String(filters.status).toLowerCase());
      }
      if (filters.jobType) {
        list = list.filter(j => j.jobType.toLowerCase() === String(filters.jobType).toLowerCase());
      }
      if (filters.company) {
        list = list.filter(j => j.company.toLowerCase().includes(String(filters.company).toLowerCase()));
      }
      return list.map(formatJobPosting);
    }
  }

  async findById(id) {
    const numericId = Number(id);
    if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return null;
    }

    try {
      const res = await db.query(
        `SELECT id, user_id, title, company, location, job_type AS "jobType",
                description, requirements, salary, contact_email AS "contactEmail",
                status, application_deadline AS "applicationDeadline",
                created_at, updated_at
         FROM job_postings
         WHERE id = $1;`,
        [numericId]
      );
      if (res.rows.length === 0) return null;
      return formatJobPosting(res.rows[0]);
    } catch {
      const found = this.jobPostings.find(j => j.id === numericId);
      return found ? formatJobPosting({ ...found }) : null;
    }
  }

  async findByIdWithUser(id) {
    const numericId = Number(id);
    if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return null;
    }

    try {
      const res = await db.query(
        `SELECT j.id, j.user_id, j.title, j.company, j.location, j.job_type AS "jobType",
                j.description, j.requirements, j.salary, j.contact_email AS "contactEmail",
                j.status, j.application_deadline AS "applicationDeadline",
                j.created_at, j.updated_at,
                u.name AS "userName", u.department AS "userDepartment", u.email AS "userEmail"
         FROM job_postings j
         LEFT JOIN users u ON j.user_id = u.id
         WHERE j.id = $1;`,
        [numericId]
      );
      if (res.rows.length === 0) return null;
      return formatJobPosting(res.rows[0]);
    } catch {
      const job = await this.findById(numericId);
      if (!job) return null;
      const User = require('./User');
      const owner = await User.findById(job.user_id, { includeJobs: false });
      return formatJobPosting({
        ...job,
        user: owner ? { id: owner.id, name: owner.name, department: owner.department, email: owner.email } : null
      });
    }
  }

  async findByUserId(userId) {
    const numericId = Number(userId);
    if (isNaN(numericId)) return [];
    return this.findAll({ user_id: numericId });
  }

  async findByPostedBy(userId) {
    return this.findByUserId(userId);
  }

  async update(id, updateData = {}, isPartial = true) {
    const numericId = Number(id);
    if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return null;
    }

    this.validate(updateData, isPartial);

    try {
      const existing = await this.findById(numericId);
      if (!existing) return null;

      const title = updateData.title !== undefined ? String(updateData.title).trim() : existing.title;
      const company = updateData.company !== undefined ? String(updateData.company).trim() : existing.company;
      const location = updateData.location !== undefined ? String(updateData.location).trim() : existing.location;
      const jobType = updateData.jobType || updateData.job_type || existing.jobType;
      const description = updateData.description !== undefined ? String(updateData.description).trim() : existing.description;
      const requirements = updateData.requirements !== undefined ? String(updateData.requirements).trim() : existing.requirements;
      const salary = updateData.salary !== undefined ? updateData.salary : existing.salary;
      const contactEmail = updateData.contactEmail || updateData.contact_email || existing.contactEmail;
      const status = updateData.status !== undefined ? updateData.status : existing.status;
      const applicationDeadline = updateData.applicationDeadline !== undefined ? updateData.applicationDeadline : existing.applicationDeadline;

      const res = await db.query(
        `UPDATE job_postings
         SET title = $1, company = $2, location = $3, job_type = $4,
             description = $5, requirements = $6, salary = $7, contact_email = $8,
             status = $9, application_deadline = $10, updated_at = CURRENT_TIMESTAMP
         WHERE id = $11
         RETURNING id, user_id, title, company, location, job_type AS "jobType",
                   description, requirements, salary, contact_email AS "contactEmail",
                   status, application_deadline AS "applicationDeadline",
                   created_at, updated_at;`,
        [title, company, location, jobType, description, requirements, salary, contactEmail, status, applicationDeadline, numericId]
      );
      if (res.rows.length === 0) return null;
      const updated = formatJobPosting(res.rows[0]);
      const idx = this.jobPostings.findIndex(j => j.id === numericId);
      if (idx !== -1) this.jobPostings[idx] = updated;
      return updated;
    } catch {
      const idx = this.jobPostings.findIndex(j => j.id === numericId);
      if (idx === -1) return null;
      const current = this.jobPostings[idx];
      const updated = formatJobPosting({
        ...current,
        ...updateData,
        id: numericId,
        user_id: current.user_id
      });
      this.jobPostings[idx] = updated;
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
        `DELETE FROM job_postings
         WHERE id = $1
         RETURNING id, user_id, title, company, location, job_type AS "jobType", status;`,
        [numericId]
      );
      if (res.rows.length === 0) return null;
      const deleted = formatJobPosting(res.rows[0]);
      const idx = this.jobPostings.findIndex(j => j.id === numericId);
      if (idx !== -1) this.jobPostings.splice(idx, 1);

      try {
        const Application = require('./Application');
        Application.cascadeDeleteByJob(numericId);
      } catch {
        // Ignore
      }
      return deleted;
    } catch {
      const idx = this.jobPostings.findIndex(j => j.id === numericId);
      if (idx === -1) return null;
      const [deleted] = this.jobPostings.splice(idx, 1);
      try {
        const Application = require('./Application');
        Application.cascadeDeleteByJob(numericId);
      } catch {
        // Ignore
      }
      return formatJobPosting(deleted);
    }
  }

  cascadeDeleteByUser(userId) {
    const numericUserId = Number(userId);
    const removedJobIds = this.jobPostings
      .filter(j => Number(j.user_id) === numericUserId)
      .map(j => j.id);
    this.jobPostings = this.jobPostings.filter(j => Number(j.user_id) !== numericUserId);

    try {
      const Application = require('./Application');
      removedJobIds.forEach(jid => Application.cascadeDeleteByJob(jid));
    } catch {
      // Ignore
    }
  }
}

const JobPosting = new JobPostingModel();
module.exports = JobPosting;
