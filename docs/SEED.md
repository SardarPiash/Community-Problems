# Seeded test credentials (Stage 5)

These accounts are created by `npm run seed` in the `server/` directory.  
All seed users use the `@cprs.local` email domain and are **removed and recreated** on each seed run.

> **Do not use these passwords in production.**

## Run the seed script

```bash
cd server
npm run seed
```

Requires MongoDB running (default: `mongodb://127.0.0.1:27017/cprs`).

---

## Users

| Role | Name | Email | Password |
|------|------|-------|----------|
| **Admin** | System Admin | `admin@cprs.local` | `Admin123!` |
| **Authority** | Roads & Drainage Authority | `authority.roads@cprs.local` | `Authority123!` |
| **Authority** | Waste Management Authority | `authority.waste@cprs.local` | `Authority123!` |
| **Citizen** | Rahim Uddin | `citizen1@cprs.local` | `Citizen123!` |
| **Citizen** | Karima Begum | `citizen2@cprs.local` | `Citizen123!` |

Authorities are seeded by admin — they cannot self-register (SRS Section 13).

---

## Sample complaints (varied statuses)

| Citizen | Category | Status |
|---------|----------|--------|
| citizen1 | Road Damage | Pending Verification |
| citizen1 | Waste Management | Verified |
| citizen1 | Water Leakage | Rejected |
| citizen2 | Streetlight | Assigned |
| citizen2 | Drainage | In Progress |
| citizen2 | Security | Resolved |
| citizen1 | Other | Unable to Resolve |

Each complaint includes a full `statusHistory` timeline. Citizens receive in-app notifications for status changes after the initial submission.

---

## Quick QA login checks

1. **Citizen** — log in as `citizen1@cprs.local` → **My Complaints** shows 4 complaints across multiple statuses.
2. **Admin** — log in as `admin@cprs.local` → admin dashboard (Stage 6) will use these records.
3. **Authority** — log in as `authority.roads@cprs.local` → assigned complaints (Stage 7) include Streetlight and Drainage.

Login at http://localhost:5173/login (with client + server running).
