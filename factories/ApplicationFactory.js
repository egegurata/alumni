/**
 * ApplicationFactory — factories/ApplicationFactory.js
 * Week 06: Relational Data Factory (Many-to-Many Join Table: Users <-> Job Postings)
 */

const SAMPLE_APPLICATIONS = [
  {
    status: 'applied',
    coverNote: 'Strong experience in Node.js, Express, and PostgreSQL relational data architecture.',
    resumeUrl: 'https://github.com/egegurata'
  },
  {
    status: 'interview',
    coverNote: 'Interested in distributed backend systems and cloud architecture.',
    resumeUrl: 'https://alumni.iu.edu.tr/cv/mert-aydin.pdf'
  },
  {
    status: 'applied',
    coverNote: 'MIS student passionate about SQL query optimization and BI analytics.',
    resumeUrl: 'https://github.com/egegurata'
  },
  {
    status: 'accepted',
    coverNote: 'Proven background in enterprise security and API governance.',
    resumeUrl: 'https://alumni.iu.edu.tr/cv/zeynep-arslan.pdf'
  }
];

let counter = 1;

class ApplicationFactory {
  static resetCounter(start = 1) {
    counter = start;
  }

  static create(overrides = {}) {
    const idx = (counter - 1) % SAMPLE_APPLICATIONS.length;
    const base = SAMPLE_APPLICATIONS[idx];
    counter++;

    const userId = Number(overrides.user_id !== undefined ? overrides.user_id : (overrides.userId || 1));
    const jobPostingId = Number(overrides.job_posting_id !== undefined ? overrides.job_posting_id : (overrides.jobPostingId || 1));

    return {
      user_id: userId,
      userId,
      job_posting_id: jobPostingId,
      jobPostingId,
      status: overrides.status || base.status,
      coverNote: overrides.coverNote !== undefined ? overrides.coverNote : base.coverNote,
      resumeUrl: overrides.resumeUrl !== undefined ? overrides.resumeUrl : base.resumeUrl
    };
  }

  static createMany(count = 3, overrides = {}) {
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push(this.create({
        ...overrides,
        user_id: overrides.user_id || i + 1,
        job_posting_id: overrides.job_posting_id || 1
      }));
    }
    return list;
  }

  static async createInDb(client, overrides = {}) {
    const data = this.create(overrides);
    const res = await client.query(
      `INSERT INTO applications (user_id, job_posting_id, status, cover_note, resume_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, job_posting_id, status, cover_note AS "coverNote",
                 resume_url AS "resumeUrl", applied_at AS "appliedAt", created_at, updated_at;`,
      [data.user_id, data.job_posting_id, data.status, data.coverNote, data.resumeUrl]
    );
    return res.rows[0];
  }
}

module.exports = ApplicationFactory;
