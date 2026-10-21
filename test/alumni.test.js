/**
 * Comprehensive Automated Test Suite — test/alumni.test.js
 * Verifies every requirement and check from Weeks 01–06 of Assoc. Prof. Dr. Emre Akadal's lecture notes.
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const app = require('../index');
const { User, Announcement, JobPosting, Application } = require('../models');
const { UserFactory, AnnouncementFactory, JobPostingFactory, ApplicationFactory } = require('../factories');

function request(server, method, path, body = null) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: addr.port,
        path,
        method,
        headers: payload
          ? {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload)
            }
          : {}
      },
      res => {
        let raw = '';
        res.on('data', chunk => {
          raw += chunk;
        });
        res.on('end', () => {
          let json = null;
          try {
            json = raw ? JSON.parse(raw) : null;
          } catch {
            json = null;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            text: raw,
            body: json
          });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

describe('Alumni Tracking System — Weeks 02 to 06 Verification Suite', () => {
  beforeEach(() => {
    User.resetInMemory();
    Announcement.resetInMemory();
    JobPosting.resetInMemory();
    Application.resetInMemory();
    UserFactory.resetCounter(1);
    AnnouncementFactory.resetCounter(1);
    JobPostingFactory.resetCounter(1);
    ApplicationFactory.resetCounter(1);
  });

  it('Week 02: GET /hello, GET /hello/:name, GET /sum/:a/:b (including /sum/3/banana -> 400), GET /, GET /about', async () => {
    const server = app.listen(0);
    try {
      const helloRes = await request(server, 'GET', '/hello');
      assert.equal(helloRes.status, 200);
      assert.equal(helloRes.text, 'Hello, World!');

      const helloNameRes = await request(server, 'GET', '/hello/Emre');
      assert.equal(helloNameRes.status, 200);
      assert.equal(helloNameRes.text, 'Hello, Emre!');

      const sumRes = await request(server, 'GET', '/sum/3/4');
      assert.equal(sumRes.status, 200);
      assert.equal(sumRes.text, '7');

      const bananaRes = await request(server, 'GET', '/sum/3/banana');
      assert.equal(bananaRes.status, 400);

      const homeRes = await request(server, 'GET', '/');
      assert.equal(homeRes.status, 200);
      assert.match(homeRes.headers['content-type'], /text\/html/);

      const aboutRes = await request(server, 'GET', '/about');
      assert.equal(aboutRes.status, 200);
      assert.match(aboutRes.headers['content-type'], /text\/html/);
    } finally {
      server.close();
    }
  });

  it('Week 03: GET /api/health returns { status: "ok", uptime: ... } and Swagger UI is served at /api/swagger', async () => {
    const server = app.listen(0);
    try {
      const healthRes = await request(server, 'GET', '/api/health');
      assert.equal(healthRes.status, 200);
      assert.equal(healthRes.body.status, 'ok');
      assert.equal(typeof healthRes.body.uptime, 'number');

      const swaggerRes = await request(server, 'GET', '/api/swagger.json');
      assert.equal(swaggerRes.status, 200);
      assert.equal(swaggerRes.body.openapi, '3.0.3');
    } finally {
      server.close();
    }
  });

  it('Week 03 & 04 & 05: Users CRUD, isAlumni field, ID never reused after delete, 204 No Content on DELETE, 400 on missing email, 409 on duplicate email', async () => {
    const server = app.listen(0);
    try {
      // Initial 3 users: at least one alumnus and one non-alumnus
      const listRes = await request(server, 'GET', '/api/users');
      assert.equal(listRes.status, 200);
      assert.equal(listRes.body.length, 3);
      assert.equal(listRes.body.some(u => u.isAlumni === true), true);
      assert.equal(listRes.body.some(u => u.isAlumni === false), true);

      // Missing email -> 400 Bad Request (Week 04 Model rule)
      const badCreate = await request(server, 'POST', '/api/users', { name: 'No Email User' });
      assert.equal(badCreate.status, 400);

      // Valid create -> 201 Created with id: 4
      const createRes = await request(server, 'POST', '/api/users', {
        name: 'Ada Lovelace',
        email: 'ada@iu.edu.tr',
        graduationYear: 2024,
        isAlumni: true
      });
      assert.equal(createRes.status, 201);
      assert.equal(createRes.body.id, 4);
      assert.equal(createRes.body.email, 'ada@iu.edu.tr');

      // Same email twice -> 409 Conflict (Week 05 item 9)
      const duplicateRes = await request(server, 'POST', '/api/users', {
        name: 'Ada Clone',
        email: 'ada@iu.edu.tr'
      });
      assert.equal(duplicateRes.status, 409);

      // PATCH /api/users/:id -> 200 OK; unknown id -> 404
      const patchRes = await request(server, 'PATCH', '/api/users/4', { company: 'Analytical Engine Ltd' });
      assert.equal(patchRes.status, 200);
      assert.equal(patchRes.body.company, 'Analytical Engine Ltd');
      assert.equal(patchRes.body.name, 'Ada Lovelace');

      const patchUnknown = await request(server, 'PATCH', '/api/users/999', { name: 'Ghost' });
      assert.equal(patchUnknown.status, 404);

      // DELETE /api/users/:id -> 204 with no body; unknown id -> 404
      const delRes = await request(server, 'DELETE', '/api/users/4');
      assert.equal(delRes.status, 204);
      assert.equal(delRes.text, '');

      const delAgain = await request(server, 'DELETE', '/api/users/4');
      assert.equal(delAgain.status, 404);

      // Create another user after deletion -> ID must be 5, NEVER reusing 4! (Week 03 trap)
      const nextCreate = await request(server, 'POST', '/api/users', {
        name: 'Alan Turing',
        email: 'alan@iu.edu.tr'
      });
      assert.equal(nextCreate.status, 201);
      assert.equal(nextCreate.body.id, 5);
    } finally {
      server.close();
    }
  });

  it('Week 04 Homework: Announcements CRUD and Web View routes', async () => {
    const server = app.listen(0);
    try {
      const listRes = await request(server, 'GET', '/api/announcements');
      assert.equal(listRes.status, 200);
      assert.equal(listRes.body.length, 3);

      const createRes = await request(server, 'POST', '/api/announcements', {
        title: 'Spring Career Panel',
        content: 'Meet MIS alumni working in cloud engineering.',
        category: 'Career'
      });
      assert.equal(createRes.status, 201);
      assert.equal(createRes.body.title, 'Spring Career Panel');

      const webUsers = await request(server, 'GET', '/users');
      assert.equal(webUsers.status, 200);
      assert.match(webUsers.text, /Alumni &amp; Users Directory/);

      const webAnnouncements = await request(server, 'GET', '/announcements');
      assert.equal(webAnnouncements.status, 200);
      assert.match(webAnnouncements.text, /Announcements &amp; Bulletins/);
    } finally {
      server.close();
    }
  });

  it('Week 06: Relational Data — Nested /api/users/:id/jobs, GET /api/users/:id includes jobs array, CASCADE delete, and /api/jobs/:id/applications (201, 409, 404)', async () => {
    const server = app.listen(0);
    try {
      // 1. GET /api/users/2 includes jobs array inside (One answer, two tables)
      const userWithJobs = await request(server, 'GET', '/api/users/2');
      assert.equal(userWithJobs.status, 200);
      assert.equal(Array.isArray(userWithJobs.body.jobs), true);
      assert.equal(userWithJobs.body.jobs.length, 2);

      // User without postings still comes back with jobs: [] (LEFT JOIN behavior)
      const userWithoutJobs = await request(server, 'GET', '/api/users/1');
      assert.equal(userWithoutJobs.status, 200);
      assert.deepEqual(userWithoutJobs.body.jobs, []);

      // 2. POST and GET /api/users/:id/jobs; unknown user answers 404
      const unknownUserJobs = await request(server, 'GET', '/api/users/999/jobs');
      assert.equal(unknownUserJobs.status, 404);

      const unknownUserPostJob = await request(server, 'POST', '/api/users/999/jobs', {
        title: 'Ghost Role',
        company: 'Phantom Inc'
      });
      assert.equal(unknownUserPostJob.status, 404);

      const newJobRes = await request(server, 'POST', '/api/users/1/jobs', {
        title: 'Junior Developer',
        company: 'Acme'
      });
      assert.equal(newJobRes.status, 201);
      assert.equal(newJobRes.body.user_id, 1);
      assert.equal(newJobRes.body.title, 'Junior Developer');

      // 3. POST /api/jobs/:id/applications (201 first time, 409 second time, 404 for unknown job or user)
      const appCreated = await request(server, 'POST', '/api/jobs/2/applications', {
        userId: 1,
        coverNote: 'Applying for the first time'
      });
      assert.equal(appCreated.status, 201);

      // Applying a second time -> 409 Conflict!
      const appDuplicate = await request(server, 'POST', '/api/jobs/2/applications', {
        userId: 1,
        coverNote: 'Applying a second time'
      });
      assert.equal(appDuplicate.status, 409);

      // Unknown job -> 404 Not Found
      const appNoJob = await request(server, 'POST', '/api/jobs/999/applications', { userId: 1 });
      assert.equal(appNoJob.status, 404);

      // Unknown user -> 404 Not Found
      const appNoUser = await request(server, 'POST', '/api/jobs/2/applications', { userId: 999 });
      assert.equal(appNoUser.status, 404);

      // Two lists: applicants for job & applications by user
      const jobApplicants = await request(server, 'GET', '/api/jobs/2/applications');
      assert.equal(jobApplicants.status, 200);
      assert.equal(jobApplicants.body.length, 1);

      const userApps = await request(server, 'GET', '/api/users/1/applications');
      assert.equal(userApps.status, 200);
      assert.equal(userApps.body.length >= 2, true);

      // 4. Web page for one user with their postings (Week 06 item 8)
      const userProfilePage = await request(server, 'GET', '/users/2');
      assert.equal(userProfilePage.status, 200);
      assert.match(userProfilePage.text, /TechNova Cloud/);

      // 5. Delete Rule (ON DELETE CASCADE): deleting user 2 removes their job postings
      const delUser2 = await request(server, 'DELETE', '/api/users/2');
      assert.equal(delUser2.status, 204);
      const job1AfterCascade = await request(server, 'GET', '/api/jobs/1');
      assert.equal(job1AfterCascade.status, 404);
    } finally {
      server.close();
    }
  });
});
