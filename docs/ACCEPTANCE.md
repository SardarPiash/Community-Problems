# Acceptance Criteria Checklist (SRS Section 15)

Use this checklist for UAT and final project sign-off.

## Functional requirements (Must-have)

| ID | Requirement | Status |
|----|-------------|--------|
| FR-1.1 | Citizen registration (name, email, phone, password) | Done |
| FR-1.2 | Email + password validation | Done |
| FR-1.3 | Login returns JWT | Done |
| FR-2.1–FR-2.5 | Complaint submission with images | Done |
| FR-3.1–FR-3.3 | Citizen list, detail timeline, notifications | Done |
| FR-4.1–FR-4.4 | Admin queue, verify/reject, assign, user management | Done |
| FR-5.1–FR-5.4 | Authority assigned list, status updates, notes, notifications | Done |
| FR-6.1 | In-app notifications for status changes | Done |

## Should-have / Could-have (implemented)

| ID | Requirement | Status |
|----|-------------|--------|
| FR-1.4 | Forgot password | Done |
| FR-1.5 | Profile view/edit | Done |
| FR-3.4 | Citizen filter/search | Done |
| FR-4.5 | Admin analytics view | Done |
| FR-6.2 | Mark notifications read | Done |
| FR-6.3 | Optional email notifications | Done (when SMTP configured) |
| FR-7.1 | CSV export by date range | Done |
| FR-7.2 | Dashboard metrics (total, resolved %, avg resolution) | Done |

## Role-based access

- [x] Citizen routes require JWT + `citizen` role where applicable
- [x] Admin routes require JWT + `admin` role
- [x] Authority routes require JWT + `authority` role
- [x] Citizens cannot access admin/authority endpoints (403)
- [x] Disabled accounts cannot log in

## End-to-end workflow (SRS Section 7.1)

1. [x] Citizen registers/logs in and submits complaint
2. [x] Complaint enters as `Pending Verification`
3. [x] Admin verifies or rejects
4. [x] Admin assigns verified complaint to authority
5. [x] Authority updates status until resolved
6. [x] Citizen notified at each status change; full history visible

## Non-functional (SRS Section 6)

| Area | Implementation |
|------|----------------|
| Security | bcrypt passwords, JWT auth, server-side RBAC, input validation, image type/size checks |
| Maintainability | MVC structure: routes → controllers → models |
| Usability | Responsive Tailwind UI for citizen, admin, authority |
| Browser support | Target: latest Chrome, Firefox, Edge, Safari (manual UAT) |
| Data integrity | All status changes logged in `statusHistory` |

## Security review (SRS Section 12)

- [x] Passwords never stored in plaintext
- [x] JWT required on protected routes
- [x] RBAC enforced server-side (not UI-only)
- [x] Form/body validation on auth and complaints
- [x] Upload validation (jpg/png, 5MB, max 3 files)
- [ ] HTTPS in production — **configure at deploy time** (see `docs/DEPLOYMENT.md`)

## API documentation

- [x] Postman collection: `docs/postman/CPRS.postman_collection.json`
- [x] Endpoints documented in `README.md`

## QA smoke test (quick)

```bash
cd server && npm run seed
# Server + client running, then:
# 1. citizen1@cprs.local — submit + track complaint
# 2. admin@cprs.local — verify + assign
# 3. authority.roads@cprs.local — update status
# 4. citizen1 — check notification + timeline
# 5. admin — Analytics tab → Export CSV
```

**Definition of Done:** All Must-have rows above pass manual QA; no open critical security gaps.
