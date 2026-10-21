/**
 * Alumni Tracking System — Application Entry Point (index.js)
 * Built by Ege Gürkan Atalay (Department of MIS, Istanbul University)
 * Weeks 01–06
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Load .env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON and URL-encoded form payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public/
app.use(express.static(path.join(__dirname, 'public')));

// Configure MVC View Engine for HTML templates
const UserView = require('./views/UserView');
const AnnouncementView = require('./views/AnnouncementView');
const JobPostingView = require('./views/JobPostingView');
const ApplicationView = require('./views/ApplicationView');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', (filePath, options, callback) => {
  try {
    if (filePath.endsWith('users.html')) {
      return callback(null, UserView.renderUsers(options.users || [], options));
    }
    if (filePath.endsWith('userDetail.html')) {
      return callback(null, UserView.renderUserDetail(options.user || {}, options));
    }
    if (filePath.endsWith('userEdit.html')) {
      return callback(null, UserView.renderUserEdit(options.user || {}));
    }
    if (filePath.endsWith('announcements.html')) {
      return callback(null, AnnouncementView.renderAnnouncements(options.announcements || [], options));
    }
    if (filePath.endsWith('announcementDetail.html')) {
      return callback(null, AnnouncementView.renderAnnouncementDetail(options.announcement || {}));
    }
    if (filePath.endsWith('announcementEdit.html')) {
      return callback(null, AnnouncementView.renderAnnouncementEdit(options.announcement || {}));
    }
    if (filePath.endsWith('jobs.html')) {
      return callback(null, JobPostingView.renderJobs(options.jobs || [], options));
    }
    if (filePath.endsWith('jobDetail.html')) {
      return callback(null, JobPostingView.renderJobDetail(options.job || {}, options));
    }
    if (filePath.endsWith('jobEdit.html')) {
      return callback(null, JobPostingView.renderJobEdit(options.job || {}));
    }
    if (filePath.endsWith('applications.html')) {
      return callback(null, ApplicationView.renderApplications(options.applications || [], options));
    }
    if (filePath.endsWith('applicationDetail.html')) {
      return callback(null, ApplicationView.renderApplicationDetail(options.application || {}, options));
    }
    return fs.readFile(filePath, 'utf-8', callback);
  } catch (err) {
    return callback(err);
  }
});

// =============================================================================
// Week 03 Homework: Interactive Swagger UI at /api/swagger
// =============================================================================
app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api/swagger.json', (req, res) => res.status(200).json(swaggerDocument));

// =============================================================================
// Week 03 Task 1: GET /api/health answers JSON { "status": "ok", "uptime": ... }
// =============================================================================
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime()
  });
});

// =============================================================================
// Week 02 Tasks: Routing — The Doors of the System
// =============================================================================

// Task 5: GET / -> temporary one-page home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Task 6: GET /about -> static sub-page
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// Task 2: GET /hello answers Hello, World!
app.get('/hello', (req, res) => {
  res.status(200).send('Hello, World!');
});

// Task 3: GET /hello/{name}: /hello/Emre answers Hello, Emre!
app.get('/hello/:name', (req, res) => {
  const { name } = req.params;
  res.status(200).send(`Hello, ${name}!`);
});

// Task 4: GET /sum/{a}/{b}: /sum/3/4 answers 7.
// "A path segment is text. /sum/3/4 answering 34 means you added two strings.
// Turn it into a number first, and decide what /sum/3/banana should answer." -> 400 Bad Request
app.get('/sum/:a/:b', (req, res) => {
  const numA = Number(req.params.a);
  const numB = Number(req.params.b);

  if (req.params.a.trim() === '' || req.params.b.trim() === '' || isNaN(numA) || isNaN(numB)) {
    return res.status(400).json({
      error: 'Both path segments must be valid numbers (e.g. /sum/3/4).'
    });
  }

  const sum = numA + numB;
  return res.status(200).send(String(sum));
});

// =============================================================================
// Week 04–06 MVC Routes (API & Web View Controllers)
// =============================================================================
const apiUserRoutes = require('./routes/apiUser');
const userRoutes = require('./routes/user');
const apiAnnouncementRoutes = require('./routes/apiAnnouncement');
const announcementRoutes = require('./routes/announcement');
const apiJobPostingRoutes = require('./routes/apiJobPosting');
const jobPostingRoutes = require('./routes/jobPosting');
const apiApplicationRoutes = require('./routes/apiApplication');
const applicationRoutes = require('./routes/application');

// Users (API & Web)
app.use('/api/users', apiUserRoutes);
app.use('/users', userRoutes);

// Announcements (API & Web)
app.use('/api/announcements', apiAnnouncementRoutes);
app.use('/announcements', announcementRoutes);

// Job Postings (API & Web)
app.use('/api/jobs', apiJobPostingRoutes);
app.use('/jobs', jobPostingRoutes);

// Applications (API & Web)
app.use('/api/applications', apiApplicationRoutes);
app.use('/applications', applicationRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Alumni Tracking System running on http://localhost:${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api/swagger`);
  });
}

module.exports = app;
