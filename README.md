# Community Problem Reporting System (CPRS)

A MERN stack web application that lets citizens report local community problems (road damage, waste, water leakage, streetlights, drainage, security) to the responsible authorities, with a verifiable and trackable complaint workflow.

Requirements source of truth: `docs/SRS.md`.

## Structure

```
Community-Problems/
├── client/                 # React SPA (Vite + Tailwind CSS)
│   └── src/
├── server/                 # Express REST API (MVC)
│   └── src/
├── docs/
│   ├── SRS.md              # Requirements specification
│   ├── SEED.md             # Test account credentials
│   ├── ACCEPTANCE.md       # UAT checklist (SRS Section 15)
│   ├── DEPLOYMENT.md       # Production deployment notes
│   └── postman/            # Postman collection
├── PROMPT.md               # Staged build instructions
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/cprs`) or a connection string in `server/.env`

## Setup & Run

### Server (port 5000)

```bash
cd server
cp .env.example .env   # adjust MONGO_URI if needed
npm install
npm run dev            # or: npm start
```

Health check: `GET http://localhost:5000/api/health`

### Client (port 5173)

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 — the client proxies `/api/*` to the server.

### Seed test data (new machine / fresh DB)

After MongoDB is running and `server/.env` is configured, run **`npm run seed`** (from the `server/` directory) to load admin, authority, citizen accounts and sample complaints:

```bash
cd server
npm install
npm run seed
```

**Quick copy:** from the project root, run **`cd server && npm run seed`**

Creates admin, authority, and citizen test accounts plus sample complaints in varied statuses. Re-running seed replaces all `@cprs.local` users and their data.  
**Credentials:** see [`docs/SEED.md`](docs/SEED.md).

## API route groups (SRS Section 10)

| Group | Base path | Status |
|-------|-----------|--------|
| Auth | `/api/auth` | **Stage 2** — register, login, forgot/reset password |
| Users | `/api/users` | **Stage 2** — `/me` profile; admin list in Stage 6 |
| Complaints | `/api/complaints` | **Stage 3–4** — submit + citizen tracking; admin/authority in Stages 6–7 |
| Notifications | `/api/notifications` | **Stage 4/7** — list + mark read (FR-6.2) |
| Analytics | `/api/analytics` | **Stage 6/8** — summary (FR-4.5, FR-7.2) + CSV export (FR-7.1) |

### Auth endpoints (Stage 2)

| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/register` | Public — citizen registration (FR-1.1, FR-1.2) |
| POST | `/api/auth/login` | Public — returns JWT (FR-1.3) |
| POST | `/api/auth/forgot-password` | Public — email reset link (FR-1.4) |
| POST | `/api/auth/reset-password` | Public — set new password with token |
| GET | `/api/users/me` | JWT — view profile (FR-1.5) |
| PUT | `/api/users/me` | JWT — edit profile (FR-1.5) |

JWT is sent as `Authorization: Bearer <token>`. Passwords are bcrypt-hashed; RBAC middleware enforces roles server-side (SRS Section 12).

Without SMTP configured, forgot-password reset links are printed to the server console.

### Complaint submission (Stage 3)

| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/complaints` | JWT citizen — multipart form: category, title, description, location, images (up to 3 JPG/PNG, 5MB each) |

Complaint images are stored on local disk under `server/uploads/` and served at `/uploads/<filename>`. New complaints default to status `Pending Verification` with an auto-generated `complaintId` (e.g. `CPRS-20260705-A1B2C3`).

### Complaint tracking (Stage 4)

| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/complaints/mine` | JWT citizen — list own complaints; query: `status`, `category`, `search` |
| GET | `/api/complaints/:id` | JWT — detail + status timeline (citizen: own only) |
| GET | `/api/notifications` | JWT — in-app notifications for status changes (FR-3.3) |

Status changes in Stages 6–7 use `server/src/utils/statusChange.js` to append history and create citizen notifications automatically.

### Admin dashboard (Stage 6)

Log in as `admin@cprs.local` → http://localhost:5173/admin

| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/complaints` | Admin — all complaints; filters: status, category, authority, dateFrom, dateTo, search |
| PUT | `/api/complaints/:id/verify` | Admin — body: `{ decision: "verified" \| "rejected", reason? }` |
| PUT | `/api/complaints/:id/assign` | Admin — body: `{ authorityId }` (verified complaints only) |
| GET | `/api/users` | Admin — list citizen & authority accounts; `?role=citizen\|authority` |
| PUT | `/api/users/:id/status` | Admin — body: `{ status: "active" \| "disabled" }` |
| GET | `/api/analytics/summary` | Admin — volume by category/status, resolved %, avg resolution days |

### Authority panel (Stage 7)

Log in as `authority.roads@cprs.local` → http://localhost:5173/assigned

| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/complaints/assigned` | Authority — complaints assigned to you; `?status=` filter |
| PUT | `/api/complaints/:id/status` | Authority — body: `{ status, note }` (In Progress, Resolved, Unable to Resolve) |
| PUT | `/api/notifications/:id/read` | Authenticated — mark notification as read |

Status updates append to `statusHistory`, notify the citizen in-app, and optionally email when SMTP is configured (FR-6.3).

### Reports & analytics (Stage 8)

Admin → **Analytics** tab at http://localhost:5173/admin

| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/analytics/summary` | Admin — total complaints, resolved %, avg resolution days, breakdowns |
| GET | `/api/analytics/export` | Admin — CSV download; query: `dateFrom`, `dateTo` (ISO dates) |

## Documentation

| Document | Purpose |
|----------|---------|
| [`docs/SRS.md`](docs/SRS.md) | Requirements specification |
| [`docs/SEED.md`](docs/SEED.md) | Test credentials — run **`cd server && npm run seed`** |
| [`docs/ACCEPTANCE.md`](docs/ACCEPTANCE.md) | UAT checklist (SRS Section 15) |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Production deployment guide |
| [`docs/postman/CPRS.postman_collection.json`](docs/postman/CPRS.postman_collection.json) | Postman API collection |

## Deployment (production)

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for environment variables, build steps, Nginx proxy example, HTTPS, and MongoDB notes.

**Quick production build:**

```bash
cd server && npm ci && npm start          # API on PORT (default 5000)
cd client && npm ci && npm run build      # static files in client/dist/
```

Do **not** run `npm run seed` in production.
