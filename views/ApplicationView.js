/**
 * ApplicationView — views/ApplicationView.js
 * Week 06: Many-to-Many Applications Join Table View
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
    .alert { padding: 0.85rem 1.1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; }
    .alert-error { background: rgba(239, 68, 68, 0.15); border: 1px solid var(--danger); color: #fca5a5; }
    .alert-success { background: rgba(16, 185, 129, 0.15); border: 1px solid var(--primary); color: #6ee7b7; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { text-align: left; padding: 0.85rem; border-bottom: 1px solid var(--border); font-size: 0.95rem; }
    th { color: var(--muted); font-size: 0.8rem; text-transform: uppercase; }
    .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.78rem; font-weight: 600; background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    label { display: block; font-size: 0.85rem; color: var(--muted); margin-bottom: 0.3rem; }
    input, select { width: 100%; padding: 0.6rem 0.8rem; background: #0f172a; border: 1px solid var(--border); border-radius: 0.45rem; color: var(--text); }
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

class ApplicationView {
  static renderApplications(applications = [], options = {}) {
    const users = options.users || [];
    const jobs = options.jobs || [];

    const flash = options.error
      ? `<div class="alert alert-error">${escapeHtml(options.error)}</div>`
      : (options.success ? `<div class="alert alert-success">Operation completed (${escapeHtml(options.success)}).</div>` : '');

    const userOptions = users.map(u => `<option value="${u.id}">#${u.id} — ${escapeHtml(u.name)}</option>`).join('');
    const jobOptions = jobs.map(j => `<option value="${j.id}">#${j.id} — ${escapeHtml(j.title)} (${escapeHtml(j.company)})</option>`).join('');

    const rows = applications.map(a => `
      <tr>
        <td>#${a.id}</td>
        <td><a href="/users/${a.user_id}" style="color: var(--accent);">User #${a.user_id} ${a.user ? `— ${escapeHtml(a.user.name)}` : ''}</a></td>
        <td><a href="/jobs/${a.job_posting_id}" style="color: var(--primary);">Job #${a.job_posting_id} ${a.jobPosting ? `— ${escapeHtml(a.jobPosting.title)}` : ''}</a></td>
        <td><span class="badge">${escapeHtml(a.status)}</span></td>
        <td>${escapeHtml(a.coverNote || '')}</td>
        <td class="actions">
          <a href="/applications/${a.id}" class="btn btn-secondary">Review</a>
          <form action="/applications/${a.id}/delete" method="POST" style="display:inline;">
            <button type="submit" class="btn btn-danger">Withdraw</button>
          </form>
        </td>
      </tr>
    `).join('');

    return layout('Job Applications (Many-to-Many)', `
      <h1>📝 Candidate Applications (Many-to-Many Join Table)</h1>
      <p style="color: var(--muted); margin-bottom: 1.5rem;">
        Connects <code>users</code> and <code>job_postings</code> with <code>UNIQUE(user_id, job_posting_id)</code> constraint (duplicate application returns <code>409 Conflict</code>).
      </p>
      ${flash}

      <section class="panel">
        <h2>+ Submit New Application</h2>
        <form action="/applications" method="POST">
          <div class="form-grid">
            <div>
              <label>Candidate User (user_id) *</label>
              <select name="user_id" required>
                ${userOptions || '<option value="1">User #1</option>'}
              </select>
            </div>
            <div>
              <label>Target Job Posting (job_posting_id) *</label>
              <select name="job_posting_id" required>
                ${jobOptions || '<option value="1">Job #1</option>'}
              </select>
            </div>
            <div>
              <label>Status</label>
              <select name="status">
                <option value="applied">applied</option>
                <option value="interview">interview</option>
                <option value="accepted">accepted</option>
                <option value="rejected">rejected</option>
              </select>
            </div>
            <div>
              <label>Cover Note</label>
              <input type="text" name="coverNote" placeholder="Brief introduction..." />
            </div>
          </div>
          <div style="margin-top: 1rem;">
            <button type="submit" class="btn">Submit Application</button>
          </div>
        </form>
      </section>

      <section class="panel">
        <h2>Applications (${applications.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Applicant (user_id)</th>
              <th>Job Posting (job_posting_id)</th>
              <th>Status</th>
              <th>Cover Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="6">No applications found.</td></tr>'}
          </tbody>
        </table>
      </section>
    `);
  }

  static renderApplicationDetail(application = {}) {
    return layout(`Application #${application.id}`, `
      <div style="margin-bottom: 1rem;">
        <a href="/applications" class="btn btn-secondary">&larr; Back to Applications</a>
      </div>
      <section class="panel">
        <h1>📝 Application #${application.id}</h1>
        <p style="color: var(--muted); margin: 0.75rem 0;">
          <strong>Applicant:</strong> User #${application.user_id} ${application.user ? `(${escapeHtml(application.user.name)})` : ''}
          &nbsp;·&nbsp;
          <strong>Job Posting:</strong> Job #${application.job_posting_id} ${application.jobPosting ? `(${escapeHtml(application.jobPosting.title)})` : ''}
        </p>
        <p><strong>Current Status:</strong> <span class="badge">${escapeHtml(application.status)}</span></p>
        <p style="margin-top: 0.75rem;"><strong>Cover Note:</strong> ${escapeHtml(application.coverNote || 'None')}</p>

        <form action="/applications/${application.id}/edit" method="POST" style="margin-top: 1.5rem;">
          <div class="form-grid">
            <div>
              <label>Update Status</label>
              <select name="status">
                <option value="applied" ${application.status === 'applied' ? 'selected' : ''}>applied</option>
                <option value="interview" ${application.status === 'interview' ? 'selected' : ''}>interview</option>
                <option value="accepted" ${application.status === 'accepted' ? 'selected' : ''}>accepted</option>
                <option value="rejected" ${application.status === 'rejected' ? 'selected' : ''}>rejected</option>
              </select>
            </div>
          </div>
          <div style="margin-top: 1rem;">
            <button type="submit" class="btn">Update Application Status</button>
          </div>
        </form>
      </section>
    `);
  }
}

module.exports = ApplicationView;
