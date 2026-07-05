# Community Problem Reporting System (CPRS)

A MERN stack web application that lets citizens report local community problems (road damage, waste, water leakage, streetlights, drainage, security) to the responsible authorities, with a verifiable and trackable complaint workflow.

Requirements source of truth: `docs/SRS.md`.

## Structure

```
shihab/
├── client/                 # React SPA (Vite + Tailwind CSS)
│   └── src/
│       ├── components/     # Shared layout/UI components
│       └── pages/          # Route pages
├── server/                 # Express REST API (MVC)
│   └── src/
│       ├── config/         # DB connection
│       ├── controllers/    # Request handlers
│       ├── models/         # Mongoose models (User, Complaint, Notification)
│       ├── routes/         # Route groups per SRS Section 10
│       ├── app.js          # Express app (middleware + routes)
│       └── server.js       # Entry point
└── docs/SRS.md             # Requirements specification
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

## API route groups (SRS Section 10)

| Group | Base path | Status |
|-------|-----------|--------|
| Auth | `/api/auth` | **Stage 2** — register, login, forgot/reset password |
| Users | `/api/users` | **Stage 2** — `/me` profile; admin list in Stage 6 |
| Complaints | `/api/complaints` | Stubs (Stages 3–7), JWT + RBAC protected |
| Notifications | `/api/notifications` | Stubs (Stage 7), JWT protected |
| Analytics | `/api/analytics` | Stubs (Stage 8), admin JWT + RBAC |

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
