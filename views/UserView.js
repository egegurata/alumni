/**
 * UserView — views/UserView.js
 * Week 04 (MVC View Layer) & Week 06 ("A page for one user, with their postings")
 */

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function layout(title, bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} · Alumni Tracking System</title>
  <style>
    :root {
      --bg: #0f172a;
      --surface: #1e293b;
      --card: #334155;
      --primary: #10b981;
      --primary-hover: #059669;
      --accent: #38bdf8;
      --danger: #ef4444;
      --text: #f8fafc;
      --muted: #94a3b8;
      --border: #475569;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }
    nav {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .brand { font-weight: 800; font-size: 1.2rem; color: var(--primary); text-decoration: none; }
    .nav-links { display: flex; gap: 1rem; flex-wrap: wrap; }
    .nav-links a { color: var(--text); text-decoration: none; font-size: 0.95rem; padding: 0.35rem 0.65rem; border-radius: 0.4rem; }
    .nav-links a:hover { background: var(--card); color: var(--primary); }
    .container { max-width: 1150px; margin: 2rem auto; padding: 0 1.5rem; }
    .panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.85rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    h1 { font-size: 1.9rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.35rem; margin-bottom: 1rem; color: var(--primary); }
    .alert { padding: 0.85rem 1.1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; font-weight: 500; }
    .alert-success { background: rgba(16, 185, 129, 0.15); border: 1px solid var(--primary); color: #6ee7b7; }
    .alert-error { background: rgba(239, 68, 68, 0.15); border: 1px solid var(--danger); color: #fca5a5; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { text-align: left; padding: 0.85rem; border-bottom: 1px solid var(--border); font-size: 0.95rem; }
    th { color: var(--muted); font-weight: 600; text-transform: uppercase; font-size: 0.8rem; }
    .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.78rem; font-weight: 600; }
    .badge-alumni { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .badge-student { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    label { display: block; font-size: 0.85rem; color: var(--muted); margin-bottom: 0.3rem; }
    input, select, textarea {
      width: 100%;
      padding: 0.6rem 0.8rem;
      background: #0f172a;
      border: 1px solid var(--border);
      border-radius: 0.45rem;
      color: var(--text);
      font-size: 0.95rem;
    }
    .btn {
      display: inline-block;
      background: var(--primary);
      color: #052e16;
      font-weight: 700;
      border: none;
      padding: 0.55rem 1rem;
      border-radius: 0.45rem;
      cursor: pointer;
      text-decoration: none;
      font-size: 0.9rem;
    }
    .btn:hover { background: var(--primary-hover); color: #fff; }
    .btn-secondary { background: var(--card); color: var(--text); }
    .btn-danger { background: var(--danger); color: #fff; }
    .actions { display: flex; gap: 0.5rem; align-items: center; }
  </style>
</head>
<body>
  <nav>
    <a href="/" class="brand">🎓 IU MIS · Alumni Tracking System</a>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/users">Users</a>
      <a href="/announcements">Announcements</a>
      <a href="/jobs">Job Postings</a>
      <a href="/applications">Applications</a>
      <a href="/api/swagger">Swagger API</a>
    </div>
  </nav>
  <main class="container">
    ${bodyContent}
  </main>
</body>
</html>`;
}

class UserView {
  static renderUsers(users = [], options = {}) {
    const flash = options.error
      ? `<div class="alert alert-error">${escapeHtml(options.error)}</div>`
      : (options.success ? `<div class="alert alert-success">Operation completed (${escapeHtml(options.success)}).</div>` : '');

    const rows = users.map(u => `
      <tr>
        <td>#${u.id}</td>
        <td><a href="/users/${u.id}" style="color: var(--accent); font-weight: 600; text-decoration: none;">${escapeHtml(u.name)}</a></td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.department)}</td>
        <td>${escapeHtml(u.graduationYear)}</td>
        <td>
          <span class="badge ${u.isAlumni ? 'badge-alumni' : 'badge-student'}">
            ${u.isAlumni ? 'Alumnus' : 'Student'}
          </span>
        </td>
        <td class="actions">
          <a href="/users/${u.id}" class="btn btn-secondary">Profile &amp; Jobs</a>
          <a href="/users/${u.id}/edit" class="btn btn-secondary">Edit</a>
          <form action="/users/${u.id}/delete" method="POST" style="display:inline;">
            <button type="submit" class="btn btn-danger">Delete</button>
          </form>
        </td>
      </tr>
    `).join('');

    return layout('Alumni & Users Directory', `
      <h1>👥 Alumni &amp; Users Directory</h1>
      <p style="color: var(--muted); margin-bottom: 1.5rem;">Manage graduate and student records. Click a user to inspect their profile and published job postings.</p>
      ${flash}

      <section class="panel">
        <h2>+ Register New User / Alumnus</h2>
        <form action="/users" method="POST">
          <div class="form-grid">
            <div>
              <label>Full Name *</label>
              <input type="text" name="name" required placeholder="e.g. Ege Gürkan Atalay" />
            </div>
            <div>
              <label>Email Address * (Required &amp; Unique)</label>
              <input type="email" name="email" required placeholder="e.g. ege@ogr.iu.edu.tr" />
            </div>
            <div>
              <label>Department</label>
              <input type="text" name="department" value="Management Information Systems" />
            </div>
            <div>
              <label>Graduation Year</label>
              <input type="number" name="graduationYear" value="2026" min="1950" max="2100" />
            </div>
            <div>
              <label>Alumni Status</label>
              <select name="isAlumni">
                <option value="true">Alumnus (Graduated)</option>
                <option value="false">Student (Enrolled)</option>
              </select>
            </div>
            <div>
              <label>Company</label>
              <input type="text" name="company" placeholder="e.g. TechNova Cloud" />
            </div>
          </div>
          <div style="margin-top: 1rem;">
            <button type="submit" class="btn">Create User</button>
          </div>
        </form>
      </section>

      <section class="panel">
        <h2>Registered Members (${users.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Grad Year</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="7">No users found.</td></tr>'}
          </tbody>
        </table>
      </section>
    `);
  }

  /**
   * Week 06 Item 8: "A page for one user, with their postings."
   */
  static renderUserDetail(user = {}) {
    const jobs = user.jobs || user.jobPostings || [];
    const applications = user.applications || [];

    const jobRows = jobs.map(j => `
      <tr>
        <td>#${j.id}</td>
        <td><a href="/jobs/${j.id}" style="color: var(--accent); text-decoration: none; font-weight: 600;">${escapeHtml(j.title)}</a></td>
        <td>${escapeHtml(j.company)}</td>
        <td>${escapeHtml(j.location)}</td>
        <td>${escapeHtml(j.jobType || 'Full-time')}</td>
        <td>${escapeHtml(j.status || 'Active')}</td>
      </tr>
    `).join('');

    const appRows = applications.map(a => `
      <tr>
        <td>#${a.id}</td>
        <td>Job #${escapeHtml(a.job_posting_id || a.jobPostingId)} ${a.jobPosting ? `— ${escapeHtml(a.jobPosting.title)} (${escapeHtml(a.jobPosting.company)})` : ''}</td>
        <td><span class="badge badge-alumni">${escapeHtml(a.status)}</span></td>
        <td>${escapeHtml(a.coverNote || '')}</td>
      </tr>
    `).join('');

    return layout(`${user.name || 'User'} · Profile & Postings`, `
      <div style="margin-bottom: 1rem;">
        <a href="/users" class="btn btn-secondary">&larr; Back to Users Directory</a>
      </div>

      <section class="panel">
        <h1>👤 ${escapeHtml(user.name)}</h1>
        <p style="color: var(--muted); margin-bottom: 1rem;">
          <span class="badge ${user.isAlumni ? 'badge-alumni' : 'badge-student'}">${user.isAlumni ? 'Alumnus' : 'Student'}</span>
          &nbsp;·&nbsp; <strong>Email:</strong> ${escapeHtml(user.email)}
          &nbsp;·&nbsp; <strong>Department:</strong> ${escapeHtml(user.department)}
          &nbsp;·&nbsp; <strong>Class of:</strong> ${escapeHtml(user.graduationYear)}
          ${user.company ? `&nbsp;·&nbsp; <strong>Company:</strong> ${escapeHtml(user.company)}` : ''}
        </p>
        <div class="actions">
          <a href="/users/${user.id}/edit" class="btn">Edit Profile</a>
          <a href="/api/users/${user.id}" class="btn btn-secondary">View JSON (LEFT JOIN)</a>
        </div>
      </section>

      <section class="panel">
        <h2>💼 Job Postings by ${escapeHtml(user.name)} (${jobs.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Company</th>
              <th>Location</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${jobRows || '<tr><td colspan="6">This user has not published any job postings yet.</td></tr>'}
          </tbody>
        </table>

        <h3 style="margin-top: 1.5rem; margin-bottom: 0.75rem; font-size: 1.05rem;">Post a New Job for ${escapeHtml(user.name)}</h3>
        <form action="/users/${user.id}/jobs" method="POST">
          <div class="form-grid">
            <div>
              <label>Job Title *</label>
              <input type="text" name="title" required placeholder="e.g. Backend Engineer" />
            </div>
            <div>
              <label>Company *</label>
              <input type="text" name="company" required placeholder="e.g. Acme Corp" />
            </div>
            <div>
              <label>Location</label>
              <input type="text" name="location" value="Istanbul (Hybrid)" />
            </div>
            <div>
              <label>Job Type</label>
              <select name="jobType">
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>
          <div style="margin-top: 0.85rem;">
            <button type="submit" class="btn">Publish Job for User #${user.id}</button>
          </div>
        </form>
      </section>

      <section class="panel">
        <h2>📝 Applications Submitted by ${escapeHtml(user.name)} (${applications.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Target Job Posting</th>
              <th>Status</th>
              <th>Cover Note</th>
            </tr>
          </thead>
          <tbody>
            ${appRows || '<tr><td colspan="4">No applications submitted by this user yet.</td></tr>'}
          </tbody>
        </table>
      </section>
    `);
  }

  static renderUserEdit(user = {}) {
    return layout(`Edit ${user.name || 'User'}`, `
      <div style="margin-bottom: 1rem;">
        <a href="/users/${user.id}" class="btn btn-secondary">&larr; Back to Profile</a>
      </div>
      <section class="panel">
        <h1>✏️ Edit User #${user.id}</h1>
        <form action="/users/${user.id}/edit" method="POST" style="margin-top: 1rem;">
          <div class="form-grid">
            <div>
              <label>Full Name *</label>
              <input type="text" name="name" value="${escapeHtml(user.name)}" required />
            </div>
            <div>
              <label>Email Address *</label>
              <input type="email" name="email" value="${escapeHtml(user.email)}" required />
            </div>
            <div>
              <label>Department</label>
              <input type="text" name="department" value="${escapeHtml(user.department)}" />
            </div>
            <div>
              <label>Graduation Year</label>
              <input type="number" name="graduationYear" value="${escapeHtml(user.graduationYear)}" />
            </div>
            <div>
              <label>Alumni Status</label>
              <select name="isAlumni">
                <option value="true" ${user.isAlumni ? 'selected' : ''}>Alumnus (Graduated)</option>
                <option value="false" ${!user.isAlumni ? 'selected' : ''}>Student (Enrolled)</option>
              </select>
            </div>
            <div>
              <label>Company</label>
              <input type="text" name="company" value="${escapeHtml(user.company || '')}" />
            </div>
          </div>
          <div style="margin-top: 1.25rem;">
            <button type="submit" class="btn">Save Changes</button>
          </div>
        </form>
      </section>
    `);
  }
}

module.exports = UserView;
