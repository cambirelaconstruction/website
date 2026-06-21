# Cambirela Construction — Website

Professional flooring contractor website for Destin, FL.

## Project Structure

```
/
├── index.html          ← Main website
├── css/styles.css      ← All styles (mobile-first responsive)
├── js/main.js          ← Frontend JS (nav, animations, portfolio loader, form)
├── admin/index.html    ← Admin panel (login, upload projects, view leads)
├── api/
│   ├── server.js       ← Node.js + Express API
│   ├── package.json
│   └── cambirela.db    ← SQLite database (auto-created on first run)
└── images/projects/    ← Uploaded before/after photos
```

## Running Locally

### Frontend only (no admin features)
Just open `index.html` in a browser.

### With full backend (admin + contact form)

```bash
cd api
npm install
npm run dev
```

API runs on `http://localhost:3001`

### Admin Panel
Go to `/admin` on the live site (or open `admin/index.html`).

Default password: `cambirela2024`

**Change it before going live:** Set `ADMIN_PASSWORD` environment variable.

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/projects` | Public | List all projects |
| POST | `/api/contact` | Public | Submit estimate request |
| POST | `/api/admin/login` | — | Verify password |
| GET | `/api/admin/contacts` | Admin | View all leads |
| POST | `/api/admin/projects` | Admin | Upload new project (before/after) |
| PATCH | `/api/admin/projects/:id` | Admin | Edit project title/caption |
| DELETE | `/api/admin/projects/:id` | Admin | Delete project + images |

## Deploying to Vercel + Railway

### Frontend → Vercel
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repo → Deploy
3. Set custom domain: `cambirelaconstruction.com`

### Backend → Railway
1. Go to [railway.app](https://railway.app) → New project → Deploy from GitHub
2. Set root directory to `api/`
3. Set env variable: `ADMIN_PASSWORD=your_secure_password`
4. Copy Railway URL → update `API` variable in `admin/index.html` and fetch calls in `js/main.js`

## SEO Checklist
- [ ] Replace `(850) 000-0000` with your real phone number
- [ ] Replace `info@cambirelaconstruction.com` with your real email
- [ ] Update WhatsApp link with real number (`wa.me/1850XXXXXXX`)
- [ ] Register Google Business Profile at business.google.com
- [ ] Submit sitemap to Google Search Console
- [ ] Add real project photos to build portfolio
- [ ] Get first 5 Google reviews from friends/family/early clients
