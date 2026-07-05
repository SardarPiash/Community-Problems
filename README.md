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
| Auth | `/api/auth` | Stubs (Stage 2) |
| Users | `/api/users` | Stubs (Stage 2/6) |
| Complaints | `/api/complaints` | Stubs (Stages 3–7) |
| Notifications | `/api/notifications` | Stubs (Stage 7) |
| Analytics | `/api/analytics` | Stubs (Stage 8) |

All stub endpoints return `501 Not Implemented` with the stage in which they will be built. JWT auth and RBAC middleware are added in Stage 2.
