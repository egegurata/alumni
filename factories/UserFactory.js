/**
 * UserFactory — factories/UserFactory.js
 * Week 05: Factory & Seed Pattern
 * Generates realistic alumni and student records for development and testing.
 */

const SAMPLE_USERS = [
  {
    name: 'Ege Gürkan Atalay',
    email: 'egegurkanatalay@ogr.iu.edu.tr',
    department: 'Management Information Systems',
    graduationYear: 2028,
    isAlumni: false,
    company: 'Istanbul University MIS Lab',
    jobTitle: 'Backend Developer Fellow'
  },
  {
    name: 'Elif Kaya',
    email: 'elif.kaya@alumni.iu.edu.tr',
    department: 'Management Information Systems',
    graduationYear: 2024,
    isAlumni: true,
    company: 'TechNova Cloud',
    jobTitle: 'Senior Systems Analyst'
  },
  {
    name: 'Mert Aydın',
    email: 'mert.aydin@alumni.iu.edu.tr',
    department: 'Management Information Systems',
    graduationYear: 2022,
    isAlumni: true,
    company: 'FinEdge Solutions',
    jobTitle: 'Lead Data Engineer'
  },
  {
    name: 'Zeynep Arslan',
    email: 'zeynep.arslan@alumni.iu.edu.tr',
    department: 'Computer Engineering',
    graduationYear: 2021,
    isAlumni: true,
    company: 'Orion Cybersecurity',
    jobTitle: 'Security Architect'
  },
  {
    name: 'Can Öztürk',
    email: 'can.ozturk@ogr.iu.edu.tr',
    department: 'Management Information Systems',
    graduationYear: 2027,
    isAlumni: false,
    company: 'Bosphorus Digital',
    jobTitle: 'Product Management Intern'
  }
];

let counter = 1;

class UserFactory {
  static resetCounter(start = 1) {
    counter = start;
  }

  static create(overrides = {}) {
    const idx = (counter - 1) % SAMPLE_USERS.length;
    const base = SAMPLE_USERS[idx];
    const currentCount = counter++;

    const email = overrides.email || (currentCount <= SAMPLE_USERS.length
      ? base.email
      : `user${currentCount}.${base.email}`);

    const graduationYear = overrides.graduationYear !== undefined
      ? Number(overrides.graduationYear)
      : base.graduationYear;

    const isAlumni = overrides.isAlumni !== undefined
      ? Boolean(overrides.isAlumni)
      : base.isAlumni;

    return {
      name: overrides.name || base.name,
      email,
      department: overrides.department || base.department,
      graduationYear,
      isAlumni,
      company: overrides.company !== undefined ? overrides.company : base.company,
      jobTitle: overrides.jobTitle !== undefined ? overrides.jobTitle : base.jobTitle
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
      `INSERT INTO users (name, email, department, graduation_year, is_alumni, company, job_title)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, department, graduation_year AS "graduationYear",
                 is_alumni AS "isAlumni", company, job_title AS "jobTitle", created_at, updated_at;`,
      [data.name, data.email, data.department, data.graduationYear, data.isAlumni, data.company, data.jobTitle]
    );
    return res.rows[0];
  }
}

module.exports = UserFactory;
