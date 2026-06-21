const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cambirela2024';

// DB setup
const db = new Database(path.join(__dirname, 'cambirela.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    caption TEXT,
    category TEXT DEFAULT 'other',
    before_image TEXT NOT NULL,
    after_image TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, phone TEXT, email TEXT,
    service TEXT, sqft TEXT, message TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Upload storage
const uploadDir = path.join(__dirname, '..', 'images', 'projects');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(file.mimetype));
  }
});

app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '..', 'images')));

// Simple token auth middleware for admin routes
function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ── PUBLIC ROUTES ──────────────────────────────

// GET all projects
app.get('/api/projects', (req, res) => {
  const rows = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  res.json(rows);
});

// POST contact form
app.post('/api/contact', (req, res) => {
  const { name, phone, email, service, sqft, message } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required.' });
  db.prepare(
    'INSERT INTO contacts (name, phone, email, service, sqft, message) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, phone, email || '', service || '', sqft || '', message || '');
  console.log(`New lead: ${name} — ${phone} — ${service}`);
  res.json({ ok: true });
});

// ── ADMIN ROUTES ───────────────────────────────

// POST login check
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) return res.json({ ok: true });
  res.status(401).json({ error: 'Wrong password' });
});

// GET all contacts (leads)
app.get('/api/admin/contacts', adminAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
  res.json(rows);
});

// POST new project with before/after images
app.post('/api/admin/projects',
  adminAuth,
  upload.fields([{ name: 'before', maxCount: 1 }, { name: 'after', maxCount: 1 }]),
  (req, res) => {
    const { title, caption, category } = req.body;
    if (!title || !req.files?.before || !req.files?.after) {
      return res.status(400).json({ error: 'Title, before and after images are required.' });
    }
    const beforePath = `/images/projects/${req.files.before[0].filename}`;
    const afterPath = `/images/projects/${req.files.after[0].filename}`;
    const result = db.prepare(
      'INSERT INTO projects (title, caption, category, before_image, after_image) VALUES (?, ?, ?, ?, ?)'
    ).run(title, caption || '', category || 'other', beforePath, afterPath);
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
    res.json(project);
  }
);

// PATCH update project metadata
app.patch('/api/admin/projects/:id', adminAuth, (req, res) => {
  const { title, caption, category } = req.body;
  db.prepare('UPDATE projects SET title=?, caption=?, category=? WHERE id=?')
    .run(title, caption, category, req.params.id);
  const project = db.prepare('SELECT * FROM projects WHERE id=?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
});

// DELETE project
app.delete('/api/admin/projects/:id', adminAuth, (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id=?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  // Remove image files
  [project.before_image, project.after_image].forEach(imgPath => {
    const full = path.join(__dirname, '..', imgPath);
    if (fs.existsSync(full)) fs.unlinkSync(full);
  });
  db.prepare('DELETE FROM projects WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Cambirela API running on http://localhost:${PORT}`));
