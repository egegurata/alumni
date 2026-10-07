/**
 * AnnouncementView — views/AnnouncementView.js
 * Week 04 Homework: Announcement Management Interface
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
    .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.78rem; font-weight: 600; background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
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

class AnnouncementView {
  static renderAnnouncements(announcements = []) {
    const rows = announcements.map(a => `
      <tr>
        <td>#${a.id}</td>
        <td><a href="/announcements/${a.id}" style="color: var(--accent); font-weight: 600; text-decoration: none;">${escapeHtml(a.title)}</a></td>
        <td><span class="badge">${escapeHtml(a.category)}</span></td>
        <td>${escapeHtml(a.author)}</td>
        <td>${escapeHtml(a.date)}</td>
        <td class="actions">
          <a href="/announcements/${a.id}" class="btn btn-secondary">View</a>
          <a href="/announcements/${a.id}/edit" class="btn btn-secondary">Edit</a>
          <form action="/announcements/${a.id}/delete" method="POST" style="display:inline;">
            <button type="submit" class="btn btn-danger">Delete</button>
          </form>
        </td>
      </tr>
    `).join('');

    return layout('Announcements Management', `
      <h1>📢 Announcements &amp; Bulletins</h1>
      <p style="color: var(--muted); margin-bottom: 1.5rem;">Publish and manage institutional notices, career fairs, and alumni events.</p>

      <section class="panel">
        <h2>+ Publish New Announcement</h2>
        <form action="/announcements" method="POST">
          <div class="form-grid">
            <div>
              <label>Title *</label>
              <input type="text" name="title" required placeholder="Announcement headline" />
            </div>
            <div>
              <label>Category</label>
              <select name="category">
                <option value="General">General</option>
                <option value="Event">Event</option>
                <option value="Career">Career</option>
                <option value="Academic">Academic</option>
              </select>
            </div>
            <div>
              <label>Author</label>
              <input type="text" name="author" value="MIS Alumni Office" />
            </div>
            <div>
              <label>Date</label>
              <input type="date" name="date" value="2026-10-25" />
            </div>
          </div>
          <div style="margin-top: 1rem;">
            <label>Content</label>
            <textarea name="content" rows="3" placeholder="Detailed description..."></textarea>
          </div>
          <div style="margin-top: 1rem;">
            <button type="submit" class="btn">Publish Announcement</button>
          </div>
        </form>
      </section>

      <section class="panel">
        <h2>All Announcements (${announcements.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Author</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="6">No announcements available.</td></tr>'}
          </tbody>
        </table>
      </section>
    `);
  }

  static renderAnnouncementDetail(announcement = {}) {
    return layout(announcement.title || 'Announcement Detail', `
      <div style="margin-bottom: 1rem;">
        <a href="/announcements" class="btn btn-secondary">&larr; Back to Announcements</a>
      </div>
      <section class="panel">
        <span class="badge">${escapeHtml(announcement.category)}</span>
        <h1 style="margin-top: 0.75rem;">${escapeHtml(announcement.title)}</h1>
        <p style="color: var(--muted); margin-bottom: 1.25rem;">
          Published by <strong>${escapeHtml(announcement.author)}</strong> on ${escapeHtml(announcement.date)}
        </p>
        <p style="font-size: 1.05rem;">${escapeHtml(announcement.content)}</p>
        <div class="actions" style="margin-top: 1.5rem;">
          <a href="/announcements/${announcement.id}/edit" class="btn">Edit</a>
        </div>
      </section>
    `);
  }

  static renderAnnouncementEdit(announcement = {}) {
    return layout(`Edit Announcement #${announcement.id}`, `
      <div style="margin-bottom: 1rem;">
        <a href="/announcements/${announcement.id}" class="btn btn-secondary">&larr; Back</a>
      </div>
      <section class="panel">
        <h1>✏️ Edit Announcement #${announcement.id}</h1>
        <form action="/announcements/${announcement.id}/edit" method="POST" style="margin-top: 1rem;">
          <div class="form-grid">
            <div>
              <label>Title *</label>
              <input type="text" name="title" value="${escapeHtml(announcement.title)}" required />
            </div>
            <div>
              <label>Category</label>
              <select name="category">
                <option value="General" ${announcement.category === 'General' ? 'selected' : ''}>General</option>
                <option value="Event" ${announcement.category === 'Event' ? 'selected' : ''}>Event</option>
                <option value="Career" ${announcement.category === 'Career' ? 'selected' : ''}>Career</option>
                <option value="Academic" ${announcement.category === 'Academic' ? 'selected' : ''}>Academic</option>
              </select>
            </div>
            <div>
              <label>Author</label>
              <input type="text" name="author" value="${escapeHtml(announcement.author)}" />
            </div>
            <div>
              <label>Date</label>
              <input type="date" name="date" value="${escapeHtml(announcement.date)}" />
            </div>
          </div>
          <div style="margin-top: 1rem;">
            <label>Content</label>
            <textarea name="content" rows="4">${escapeHtml(announcement.content)}</textarea>
          </div>
          <div style="margin-top: 1rem;">
            <button type="submit" class="btn">Update Announcement</button>
          </div>
        </form>
      </section>
    `);
  }
}

module.exports = AnnouncementView;
