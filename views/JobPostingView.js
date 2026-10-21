/**
 * JobPostingView — views/JobPostingView.js
 * Week 06: Job Postings & Career Board Views
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
      --accent: #38bdf8;
      --danger: #ef4444;
      --text: #f8fafc;
      --muted: #94a3b8;
      --border: #475569;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
    nav { background: var(--surface); border-bottom: 1px solid var(--border); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-weight: 800; font-size: 1.2rem; color: var(--primary); text-decoration: none; }
    .nav-links { display: flex; gap: 1rem; }
    .nav-links a { color: var(--text); text-decoration: none; font-size: 0.95rem; padding: 0.35rem 0.65rem; border-radius: 0.4rem; }
    .container { max-width: 1150px; margin: 2rem auto; padding: 0 1.5rem; }
    .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 0.85rem; padding: 1.5rem; margin-bottom: 2rem; }
    h1 { font-size: 1.9rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.35rem; margin-bottom: 1rem; color: var(--primary); }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { text-align: left; padding: 0.85rem; border-bottom: 1px solid var(--border); font-size: 0.95rem; }
    th { color: var(--muted); font-size: 0.8rem; text-transform: uppercase; }
    .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.78rem; font-weight: 600; background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    label { display: block; font-size: 0.85rem; color: var(--muted); margin-bottom: 0.3rem; }
    input, select, textarea { width: 100%; padding: 0.6rem 0.8rem; background: #0f172a; border: 1px solid var(--border); border-radius: 0.45rem; color: var(--text); }
    .btn { display: inline-block; background: var(--primary); color: #052e16; font-weight: 700; border: none; padding: 0.55rem 1rem; border-radius: 0.45rem; cursor: pointer; text-decoration: none; font-size: 0.9rem; }
    .btn-secondary { background: var(--card); color: var(--text); }
    .btn-danger { background: var(--danger); color: #fff; }
    .actions { display: flex; gap: 0.5rem; }
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

class JobPostingView {
  static renderJobs(jobs = [], options = {}) {
    const users = options.users || [];
    const userOptions = users.map(u => `<option value="${u.id}">#${u.id} — ${escapeHtml(u.name)}</option>`).join('');

    const rows = jobs.map(j => `
      <tr>
        <td>#${j.id}</td>
        <td><a href="/jobs/${j.id}" style="color: var(--accent); font-weight: 600; text-decoration: none;">${escapeHtml(j.title)}</a></td>
        <td>${escapeHtml(j.company)}</td>
        <td>${escapeHtml(j.location)}</td>
        <td><span class="badge">${escapeHtml(j.jobType)}</span></td>
        <td><a href="/users/${j.user_id}" style="color: var(--primary);">User #${j.user_id}</a></td>
        <td class="actions">
          <a href="/jobs/${j.id}" class="btn btn-secondary">Details &amp; Apply</a>
          <a href="/jobs/${j.id}/edit" class="btn btn-secondary">Edit</a>
          <form action="/jobs/${j.id}/delete" method="POST" style="display:inline;">
            <button type="submit" class="btn btn-danger">Delete</button>
          </form>
        </td>
      </tr>
    `).join('');

    return layout('Job Postings Board', `
      <h1>💼 Alumni Job Postings Board (One-to-Many)</h1>
      <p style="color: var(--muted); margin-bottom: 1.5rem;">Every job posting belongs to an alumni user (<code>job_postings.user_id -> users.id</code>).</p>

      <section class="panel">
        <h2>+ Create New Job Posting</h2>
        <form action="/jobs" method="POST">
          <div class="form-grid">
            <div>
              <label>Posted By User (FK: user_id) *</label>
              <select name="user_id" required>
                ${userOptions || '<option value="1">User #1</option>'}
              </select>
            </div>
            <div>
              <label>Job Title *</label>
              <input type="text" name="title" required placeholder="e.g. Junior Backend Developer" />
            </div>
            <div>
              <label>Company *</label>
              <input type="text" name="company" required placeholder="e.g. TechNova Cloud" />
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
            <div>
              <label>Salary</label>
              <input type="text" name="salary" placeholder="e.g. $50,000" />
            </div>
          </div>
          <div style="margin-top: 1rem;">
            <button type="submit" class="btn">Publish Job Posting</button>
          </div>
        </form>
      </section>

      <section class="panel">
        <h2>Active Opportunities (${jobs.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Company</th>
              <th>Location</th>
              <th>Type</th>
              <th>Owner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="7">No job postings found.</td></tr>'}
          </tbody>
        </table>
      </section>
    `);
  }

  static renderJobDetail(job = {}, options = {}) {
    const applications = options.applications || [];
    const users = options.users || [];
    const userOptions = users.map(u => `<option value="${u.id}">#${u.id} — ${escapeHtml(u.name)}</option>`).join('');

    const appRows = applications.map(a => `
      <tr>
        <td>#${a.id}</td>
        <td>User #${a.user_id} ${a.user ? `(${escapeHtml(a.user.name)})` : ''}</td>
        <td><span class="badge">${escapeHtml(a.status)}</span></td>
        <td>${escapeHtml(a.coverNote || '')}</td>
      </tr>
    `).join('');

    return layout(job.title || 'Job Detail', `
      <div style="margin-bottom: 1rem;">
        <a href="/jobs" class="btn btn-secondary">&larr; Back to Job Board</a>
      </div>
      <section class="panel">
        <span class="badge">${escapeHtml(job.jobType)}</span>
        <h1 style="margin-top: 0.5rem;">${escapeHtml(job.title)}</h1>
        <p style="color: var(--muted); margin-bottom: 1rem;">
          <strong>Company:</strong> ${escapeHtml(job.company)} &nbsp;·&nbsp;
          <strong>Location:</strong> ${escapeHtml(job.location)} &nbsp;·&nbsp;
          <strong>Owner:</strong> <a href="/users/${job.user_id}" style="color: var(--primary);">User #${job.user_id}</a>
        </p>
        <p>${escapeHtml(job.description)}</p>
      </section>

      <section class="panel">
        <h2>🚀 Apply to This Job Posting</h2>
        <form action="/jobs/${job.id}/applications" method="POST">
          <div class="form-grid">
            <div>
              <label>Applicant User *</label>
              <select name="user_id" required>
                ${userOptions || '<option value="1">User #1</option>'}
              </select>
            </div>
            <div>
              <label>Cover Note</label>
              <input type="text" name="coverNote" placeholder="Why are you a great fit?" />
            </div>
          </div>
          <div style="margin-top: 1rem;">
            <button type="submit" class="btn">Submit Application</button>
          </div>
        </form>
      </section>

      <section class="panel">
        <h2>👥 Applicants for Job #${job.id} (${applications.length})</h2>
        <table>
          <thead>
            <tr>
              <th>App ID</th>
              <th>Applicant</th>
              <th>Status</th>
              <th>Cover Note</th>
            </tr>
          </thead>
          <tbody>
            ${appRows || '<tr><td colspan="4">No applications received yet.</td></tr>'}
          </tbody>
        </table>
      </section>
    `);
  }

  static renderJobEdit(job = {}) {
    return layout(`Edit Job #${job.id}`, `
      <div style="margin-bottom: 1rem;">
        <a href="/jobs/${job.id}" class="btn btn-secondary">&larr; Back</a>
      </div>
      <section class="panel">
        <h1>✏️ Edit Job Posting #${job.id}</h1>
        <form action="/jobs/${job.id}/edit" method="POST" style="margin-top: 1rem;">
          <div class="form-grid">
            <div>
              <label>Title *</label>
              <input type="text" name="title" value="${escapeHtml(job.title)}" required />
            </div>
            <div>
              <label>Company *</label>
              <input type="text" name="company" value="${escapeHtml(job.company)}" required />
            </div>
            <div>
              <label>Location</label>
              <input type="text" name="location" value="${escapeHtml(job.location)}" />
            </div>
            <div>
              <label>Status</label>
              <select name="status">
                <option value="Active" ${job.status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Closed" ${job.status === 'Closed' ? 'selected' : ''}>Closed</option>
                <option value="Draft" ${job.status === 'Draft' ? 'selected' : ''}>Draft</option>
              </select>
            </div>
          </div>
          <div style="margin-top: 1rem;">
            <button type="submit" class="btn">Save Changes</button>
          </div>
        </form>
      </section>
    `);
  }
}

module.exports = JobPostingView;
