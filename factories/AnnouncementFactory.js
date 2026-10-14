/**
 * AnnouncementFactory — factories/AnnouncementFactory.js
 * Week 05: Factory & Seed Pattern
 */

const SAMPLE_ANNOUNCEMENTS = [
  {
    title: 'Annual MIS Alumni Homecoming Summit 2026',
    content: 'Join fellow Istanbul University MIS graduates on campus for keynote talks, networking panels, and mentorship roundtables.',
    category: 'Event',
    author: 'MIS Alumni Office',
    date: '2026-11-15'
  },
  {
    title: 'Fall 2026 Tech Career & Internship Fair',
    content: 'Leading software and consulting firms are recruiting MIS students and recent graduates. Submit your profile via the Job Board.',
    category: 'Career',
    author: 'Career Coordination Center',
    date: '2026-10-28'
  },
  {
    title: 'Graduate Research Grant Applications Open',
    content: 'Applications for the 2026-2027 digital transformation and AI systems research grants are now open for alumni and senior students.',
    category: 'Academic',
    author: 'Department of MIS',
    date: '2026-10-20'
  },
  {
    title: 'Alumni Mentorship Program Kickoff',
    content: 'Senior alumni are invited to mentor 3rd and 4th year MIS students in backend engineering, product management, and data science.',
    category: 'General',
    author: 'Alumni Board',
    date: '2026-11-02'
  }
];

let counter = 1;

class AnnouncementFactory {
  static resetCounter(start = 1) {
    counter = start;
  }

  static create(overrides = {}) {
    const idx = (counter - 1) % SAMPLE_ANNOUNCEMENTS.length;
    const base = SAMPLE_ANNOUNCEMENTS[idx];
    counter++;

    return {
      title: overrides.title || base.title,
      content: overrides.content !== undefined ? overrides.content : base.content,
      category: overrides.category || base.category,
      author: overrides.author || base.author,
      date: overrides.date || base.date
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
      `INSERT INTO announcements (title, content, category, author, publication_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, content, category, author, publication_date AS date, created_at, updated_at;`,
      [data.title, data.content, data.category, data.author, data.date]
    );
    return res.rows[0];
  }
}

module.exports = AnnouncementFactory;
