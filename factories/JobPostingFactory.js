/**
 * JobPostingFactory — factories/JobPostingFactory.js
 * Week 06: Relational Data Factory (One-to-Many: User -> Job Postings)
 */

const SAMPLE_JOBS = [
  {
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
  },
  {
    title: 'Cybersecurity Operations Specialist',
    company: 'Orion Cybersecurity',
    location: 'Ankara (Hybrid)',
    jobType: 'Contract',
    description: 'Audit web application APIs, perform vulnerability assessments, and harden cloud infrastructure.',
    requirements: 'OWASP Top 10, network security, REST API testing.',
    salary: '$60,000 - $75,000',
    contactEmail: 'security-jobs@orionsec.com',
    status: 'Active',
    applicationDeadline: '2026-12-20'
  }
];

let counter = 1;

class JobPostingFactory {
  static resetCounter(start = 1) {
    counter = start;
  }

  static create(overrides = {}) {
    const idx = (counter - 1) % SAMPLE_JOBS.length;
    const base = SAMPLE_JOBS[idx];
    counter++;

    const userId = Number(
      overrides.user_id !== undefined
        ? overrides.user_id
        : (overrides.userId !== undefined ? overrides.userId : (overrides.postedBy !== undefined ? overrides.postedBy : 2))
    );

    return {
      user_id: userId,
      userId,
      postedBy: userId,
      title: overrides.title || base.title,
      company: overrides.company || base.company,
      location: overrides.location || base.location,
      jobType: overrides.jobType || base.jobType,
      description: overrides.description !== undefined ? overrides.description : base.description,
      requirements: overrides.requirements !== undefined ? overrides.requirements : base.requirements,
      salary: overrides.salary !== undefined ? overrides.salary : base.salary,
      contactEmail: overrides.contactEmail || base.contactEmail,
      status: overrides.status || base.status,
      applicationDeadline: overrides.applicationDeadline || base.applicationDeadline
    };
  }

  static createMany(count = 3, overrides = {}) {
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push(this.create(overrides));
    }
    return list;
  }

  static async createInDb(client, overrides = {}) {
    const data = this.create(overrides);
    const res = await client.query(
      `INSERT INTO job_postings (
         user_id, title, company, location, job_type, description,
         requirements, salary, contact_email, status, application_deadline
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, user_id, title, company, location, job_type AS "jobType",
                 description, requirements, salary, contact_email AS "contactEmail",
                 status, application_deadline AS "applicationDeadline", created_at, updated_at;`,
      [
        data.user_id,
        data.title,
        data.company,
        data.location,
        data.jobType,
        data.description,
        data.requirements,
        data.salary,
        data.contactEmail,
        data.status,
        data.applicationDeadline
      ]
    );
    return res.rows[0];
  }
}

module.exports = JobPostingFactory;
