# Progress Log

## 2026-04-20 — Notifications tab + Android build

### 1. Added Notifications bottom tab
- Added a 5th tab "Notifications" (bell icon) to the bottom tab bar in [App.js](App.js), placed between Chat and Profile.
- Imports `NotificationsScreen` and registers it as `NotificationsTab` with active `notifications` / inactive `notifications-outline` Ionicons.

### 2. Rewrote NotificationsScreen as a social feed
- Replaced the old admin task/job-seeker notifications UI in [src/screens/Notifications/NotificationsScreen.js](src/screens/Notifications/NotificationsScreen.js) with a social-media-style feed.
- Shows **5 dummy posts** mixing Instagram (`@glorytogodppec`) and YouTube (`Glory to God PPEC`) updates.
- Each card has: source badge (Instagram pink / YouTube red), thumbnail image, title, handle, caption preview, relative time, and a "View on X" link that opens the real profile URL via `Linking.openURL`.
- Pull-to-refresh supported (simulated with a 700ms delay on dummy data).
- Note: real API integration (Instagram Graph API / YouTube Data API v3) is still TODO — swap `DUMMY_POSTS` with fetched data when ready.

### 3. Fixed bottom nav layout on web
- On wide viewports React Navigation was rendering labels **beside** icons (default `beside-icon`), which looked crowded with 5 tabs.
- In [App.js](App.js) `MainTabs` `screenOptions`:
  - Forced `tabBarLabelPosition: 'below-icon'`
  - Added `tabBarItemStyle: { flexDirection: 'column' }`
  - Bumped bar height 56 → 64, increased top padding to 8, added `marginTop: 2` on labels
  - `tabBarAllowFontScaling: false` to stop label inflation on zoom
- Result: icons and labels now stack cleanly on both web and native.

### 4. Triggered Android preview build on EAS
- Account: `malik1460`
- Profile: `preview` (APK, internal distribution) from [eas.json](eas.json)
- Keystore: existing remote `Build Credentials Y4M0CZf_-7`
- Build URL: https://expo.dev/accounts/malik1460/projects/glory-to-god-app/builds/384f207a-8028-4cb4-b4ed-2f9ade3177c4
- Status at save time: queued/building on EAS cloud (expected 15–25 min total).

### Known warnings / follow-ups
- EAS flagged `cli.appVersionSource` as missing in [eas.json](eas.json) — not blocking yet, will be required in a future EAS CLI release.
- Old admin notifications screen behavior (fetch `/notifications`, mark-as-read, open related task/user) is removed. If still needed elsewhere, will need to be reintroduced under a different screen name.

---

## 2026-04-24 — Compliance & full-app architecture planning session

Planning-only session (no code changes). Client asked about adding "compliance" to the app. Below is the full discovery, architectural decisions, and next-step plan.

### 1. What the client actually meant by "compliance"

Discovery driven by client-provided file `Glory to God Compliance.xlsx` in the project root.

- **Glory to God Miami is a PPEC** (Prescribed Pediatric Extended Care) — a Florida-regulated daytime medical facility for medically-complex children. Governed by **Florida AHCA rule 59A-13**.
- Not a church (despite the name) and not a generic home health agency.
- Spreadsheet contents:
  - **Employee sheet**: 109 staff. Roles: Nurses (RN, LPN, DON), CNAs, HHAs, Therapists (OT, PTA, SLP, SLPA), MDs.
  - **AWANA sheet**: separate department. RBTs (Registered Behavior Technicians) — ABA therapy for kids with developmental needs.
  - **Manager sheet**: 3 managers — `nicolechang@glorytogodmiami.com`, `robert@glorytogodmiami.com`, `jonathankidd@glorytogodmiami.com`.
  - **Documents sheet**: 17,307 rows. Each row tracks one credential per employee.
  - **email sheet**: full employee email roster.
- **"Compliance" in this context = healthcare staff credentialing tracking**, not GDPR/app-store compliance.
- Required document types per employee (Florida AHCA-mandated):
  - **Licensing & identity**: Professional License, Driver License, SSN, I-9, W-4, Legal Status
  - **Mandatory training (most renew every 2 yrs)**: HIPAA, HIV/AIDS, Domestic Violence, Child Abuse, Medical Errors, Laws & Rules, OSHA/TB, Infection Control, Impairment in the Workplace
  - **Health & safety**: CPR, Physical Exam, Hepatitis B Refusal
  - **Employment**: Application, Resume, Background Check, Orientation, Year Eval, Liability Insurance, Confidentiality Statement, Attestation of Compliance
- File paths in spreadsheet (e.g. `Files/Nurse/Gabriel Vargas/26_Gabriel Vargas_Year Eval.pdf`) suggest documents currently live somewhere external (likely Google Drive). Needs confirmation from client.

### 2. Current app state assessment

- Stack: Expo 54, React Native 0.81, React 19. Runs on iOS, Android, and web.
- Auth (Login/Register/Forgot/Reset), AsyncStorage tokens, axios already wired.
- Existing role-based dashboards: AdminDashboard, **CleanerDashboard**, **ClientDashboard** — leftovers from a RentPlus template.
- API client in [src/utils/api.js](src/utils/api.js) defaults to `https://api.rentplus.dk/api` (RentPlus leftover) — must be replaced.
- Screens that are RentPlus leftovers and should be removed: `Orders`, `Services`, `Categories`, `Menu`, `CleanerDashboard`, `ClientDashboard`, possibly `Careers`/`HomePage`.
- Screens to keep: Auth, Home, Profile, Settings, Announcements, Gallery, Notifications, Chat, Contact, About.
- Already has `expo-image-picker`. Will need `expo-document-picker` (PDFs) and `expo-notifications` (push).
- i18n already set up with `en.json` + `es.json` in [src/languages/](src/languages/).

### 3. Full feature scope (clarified through conversation)

Client wants more than just compliance:
1. Employees upload compliance documents through app, managers download them.
2. Managers approve/reject documents, get expiration alerts.
3. Latest posts from Instagram page on Home feed.
4. Latest posts from YouTube channel on Home feed.
5. Therapist activity photos/videos appear on Home feed.
6. Photos categorized by therapy type (PT, OT, ST, ABA, Nursing).
7. Chat between parents and employees.
8. Self-registration for parents and employees; managers pre-seeded.

### 4. Architectural decisions

#### Database
- **PostgreSQL** on AWS RDS. HIPAA-eligible with BAA. Start with `db.t4g.micro` ($15/mo). Relational fit for compliance data; JSONB for flexibility where needed.
- Rejected: MongoDB (relational data fights NoSQL), Firestore (lock-in, expensive at scale, weak reporting).

#### Backend stack
- **NestJS + TypeScript** (recommended over plain Express for app of this complexity)
- **Prisma** ORM
- **Zod** for validation
- **JWT + bcrypt** auth (already wired on mobile side)
- **Redis** (AWS ElastiCache) for cache, sessions, queue backbone
- **BullMQ** for background jobs (Instagram/YouTube polling, expiration alerts)
- **Pino** logging + dedicated `audit_logs` table
- **AWS Secrets Manager** for keys
- Hosting: **AWS ECS Fargate** (BAA-friendly)

#### File storage
- **AWS S3** with signed BAA. ~$5/mo at expected scale.
- **Presigned URLs** model: file goes phone → S3 directly; backend never touches bytes.
- Bucket setup: Block all public access, Versioning ON, SSE-S3 encryption, Server access logging ON.
- Folder structure uses **employee ID** (not name): `s3://glory-to-god-compliance/employees/NUR-65095829/cpr/2026-04-24-v1.pdf`.
- Lifecycle rule: move to Glacier after 2yr, delete after 7yr (covers 5-yr AHCA retention + buffer).

#### Chat — DECISION CHANGED MID-CONVERSATION
- **Initial recommendation**: Stream Chat HIPAA tier ($499/mo) for managed compliance.
- **Revised after client feedback** ("we did free chat on cleaning app"): **Build it ourselves with Socket.IO + Postgres + S3**, same stack as cleaning app.
- Key clarification: HIPAA compliance is about the *architecture and policies*, not the vendor. The $499 was buying convenience, not legal compliance.
- HIPAA-aware additions on top of basic Socket.IO chat (~1–2 weeks extra dev time, $0 license cost):
  - Postgres column encryption for message bodies
  - S3 SSE for attachments + presigned URLs (5-min expiry) only
  - Audit log table (every send/read/download)
  - Session timeout (15 min idle → re-auth)
  - MFA for managers via TOTP (`otplib`)
  - 6-year retention then auto-delete (nightly cron)
- Chat infrastructure cost: **$0/mo** (already in AWS bill).

#### Recurring cost — revised
| Item | Cost |
|---|---|
| AWS (RDS + S3 + Fargate + storage for chat) | ~$80/mo |
| Domain, email, certs | ~$20/mo |
| Apple/Google dev accounts | ~$10/mo amortized |
| **Total recurring** | **~$100/mo** (down from initial $570/mo estimate) |

### 5. Auth / registration model

| Role | Registration |
|---|---|
| **Manager** | Pre-seeded in DB by admin (3 known emails). First-time email verification flow. **MFA required (TOTP).** Optionally Google SSO restricted to `@glorytogodmiami.com`. |
| **Employee** (Nurse, CNA, Therapist, RBT) | Pre-seeded from Excel (109 people). First-time email verification → set password. **No open self-registration** (anyone could pose as a nurse). |
| **Parent** | Self-register with email/phone. Account starts in "Pending Verification". Admin must link parent account to child record before they see anything. |
| **Admin** | Hardcoded super-admin (1 designated person). Manages users, links parents to children, seeds managers. |

### 6. Critical concerns flagged for client

These will sink the project if ignored — must be raised before implementation:

1. **Google Chat → Home feed for child photos** — STRONGLY RECOMMENDED AGAINST. Reasons:
   - Parental consent legally required before any child photo appears anywhere
   - Each photo can only be shown to that specific child's parents (not a general feed) — otherwise HIPAA breach
   - Google Chat not HIPAA-compliant on most Workspace plans
   - No audit trail
   - **Recommended alternative**: in-app therapist upload flow with explicit child tagging + consent verification + per-child visibility.
2. **HIPAA Privacy Officer** — every PPEC must have one. They must approve architecture before build starts.
3. **BAAs needed**: AWS, Google (if Chat API used), SendGrid/SES, Expo. Without these signed, app **cannot legally launch**.
4. **Parental consent forms** for child photos must exist before any photo workflow goes live.
5. **Liability insurance** — developer's professional liability must cover PHI storage. Decide who legally owns the data.
6. **State of Florida AHCA notification** may be needed depending on app scope.

### 7. Phased build plan

| Phase | Scope | Effort |
|---|---|---|
| **1. Cleanup** | Remove RentPlus leftovers (Orders, Services, Categories, Menu, Cleaner/Client dashboards). Strip `rentplus.dk` from [src/utils/api.js](src/utils/api.js). | 1–2 days |
| **2. Roles redefine** | Replace Cleaner/Client/Admin with Manager/Employee/Parent/Admin. | 1 day |
| **3. Compliance UI (mock data)** | Employee doc list, upload, manager review, manager dashboard. AsyncStorage/mock JSON; no backend yet. Service layer (`src/services/compliance.js`) abstracts data source so swapping to real API later is mechanical. | 1–2 weeks |
| **4. Backend foundation** | NestJS + Prisma + Postgres + S3 + Auth API. | 2 weeks |
| **5. Compliance backend wire-up** | Real endpoints, expiration cron, Excel data import script. | 2 weeks |
| **6. Instagram + YouTube feed** | Graph API + YouTube Data API v3 + cron polling. | 1 week |
| **7. Therapy photos (in-app upload)** | Therapist upload, child tagging, consent verification, parent-scoped visibility, therapy categorization. | 2 weeks |
| **8. Chat (DIY)** | Socket.IO + Postgres + S3 + HIPAA-aware additions (encryption, audit, retention, MFA). | 3 weeks |
| **9. HIPAA hardening** | Audit log review, encryption review, MFA, session timeout, security review. | 1–2 weeks |
| **10. QA + App Store submission** | Testing, store assets, submission. | 2 weeks |
| **Total** | | **~13–17 weeks for one developer** |

### 8. Open questions for client (block work until answered)

1. PPEC confirmed? (Affects which AHCA rule applies — 59A-13 vs 59A-8.)
2. Where do compliance documents currently live? (Excel paths suggest external storage, possibly Google Drive — needs confirmation + migration plan.)
3. Who is HIPAA Privacy Officer?
4. Does signed parental consent infrastructure exist for child photos?
5. What does therapists' photo workflow look like today? (Really Google Chat, or somewhere else?)
6. Google Workspace edition? (Standard vs Business vs Enterprise — affects Chat API HIPAA eligibility.)
7. Budget and launch deadline?
8. Who legally owns the app and the data — client or developer? (Affects BAAs and liability.)
9. English + Spanish from day one for compliance screens? (Already have i18n set up — should extend to new screens.)

### 9. Recommended next concrete step

**Phase 1 cleanup** — delete RentPlus leftover screens, strip `rentplus.dk` URL, update navigation in [App.js](App.js). Low-risk, no backend dependency, makes the project honest about what it is. Awaiting user go-ahead.

---

## 2026-04-24 — Final technology stack (locked in)

Database choice confirmed: **PostgreSQL**. Below is the definitive stack for the Glory to God PPEC app. This is the reference doc for all future build work.

### A. Mobile app (client) — already scaffolded

| Layer | Choice | Version / Notes |
|---|---|---|
| Framework | **Expo (managed workflow)** | SDK 54 |
| Runtime | React Native | 0.81.5 |
| UI lib | React | 19.1.0 |
| Language | JavaScript (migrate to TypeScript optional) | — |
| Navigation | `@react-navigation/native` + `bottom-tabs` + `native-stack` | v6 |
| HTTP | `axios` | Already wired in [src/utils/api.js](src/utils/api.js) |
| Local storage | `@react-native-async-storage/async-storage` | Non-sensitive data only |
| Secure storage | **`expo-secure-store`** (add) | JWT tokens, MFA secrets |
| Biometric lock | **`expo-local-authentication`** (add) | Face ID / fingerprint app-open gate |
| Image upload | `expo-image-picker` | Already installed |
| Document upload | **`expo-document-picker`** (add) | PDFs for compliance docs |
| Push notifications | **`expo-notifications`** (add) | Expiration alerts, chat messages |
| Date utilities | **`date-fns`** (add) | Expiration math |
| PDF preview | **`expo-web-browser`** or `react-native-pdf` (add) | View uploaded PDFs |
| Real-time chat client | **`socket.io-client`** (add) | Parent ↔ employee chat |
| SVG | `react-native-svg` + `react-native-svg-transformer` | Already installed |
| Gradients | `expo-linear-gradient` | Already installed |
| i18n | Custom setup in [src/languages/](src/languages/) | `en.json` + `es.json`, extend to all new screens |
| Build system | **EAS Build** | Account `malik1460`, preview profile in [eas.json](eas.json) |

### B. Backend (Node.js API)

| Layer | Choice | Reason |
|---|---|---|
| Runtime | **Node.js 20 LTS** | Stable through 2026 |
| Language | **TypeScript** | Type safety mandatory at this complexity |
| Framework | **NestJS** | Modules, guards, decorators fit the app's feature breadth. (Alternative: Express if team prefers — same patterns as cleaning app backend.) |
| ORM | **Prisma** | Type-safe, great Postgres support, auto-generated types, clean migrations. |
| Validation | **Zod** | Validate every request body |
| Auth | **`@nestjs/jwt` + `bcryptjs`** | Hash passwords, issue JWTs (matches mobile-side wiring) |
| Auth strategies | **`passport` + `passport-jwt`** | Guards for routes |
| MFA (managers) | **`otplib`** | TOTP via Google Authenticator |
| Security headers | **`helmet`** | XSS, CSP, HSTS |
| Rate limiting | **`@nestjs/throttler`** | Protect login and upload endpoints |
| Real-time | **`socket.io`** (with `@nestjs/websockets`) | DIY chat |
| File uploads | **Presigned URLs only** (no server-side `multer`) | Phone uploads directly to S3 |
| AWS SDK | **`@aws-sdk/client-s3`** + **`@aws-sdk/s3-request-presigner`** | Already proven in cleaning backend |
| Image processing | **`sharp`** | Thumbnails for therapy photo feed |
| Email | **`nodemailer`** (via AWS SES transport) | Same as cleaning app |
| Background jobs | **BullMQ** + **`ioredis`** | Instagram/YouTube polling, expiration alerts |
| Scheduled jobs | **`@nestjs/schedule`** | Cron-style tasks |
| Logging | **`pino`** + **`pino-http`** | Structured JSON logs → CloudWatch |
| Audit trail | Custom `audit_logs` table | AHCA-required: who did what, when |
| HTTP client (outbound) | **`axios`** | Instagram Graph API calls |
| Google APIs | **`googleapis`** | YouTube Data API v3 (+ Chat API if approved later) |
| Env config | **`@nestjs/config`** + **`dotenv`** | `.env` + AWS Secrets Manager in prod |
| Testing | **Jest** + **supertest** | Unit + e2e |

### C. Database

| Layer | Choice | Version |
|---|---|---|
| Engine | **PostgreSQL** | 16.x |
| Hosting | **AWS RDS for PostgreSQL** | `db.t4g.micro` to start, Multi-AZ for prod |
| HIPAA | ✅ Covered under AWS BAA | Request in AWS Artifact |
| Encryption at rest | AWS KMS (default on RDS) | Free |
| Connection SSL | `rejectUnauthorized: true` enforced | — |
| Backups | Automated daily + point-in-time recovery (35 days) | Built into RDS |
| Migrations | **Prisma Migrate** | Version-controlled schema |

**Core tables (initial design):**
- `users` — all roles (employee, manager, parent, admin)
- `employees` — links to users, imported from Excel
- `managers` — links to users, pre-seeded (3 rows)
- `parents` — links to users
- `children` — medical records, linked to parents + assigned therapists
- `therapy_categories` — PT, OT, ST, ABA, Nursing
- `document_types` — CPR, HIPAA, License, etc. (expiration rules)
- `documents` — per-employee credential records (metadata only; files in S3)
- `document_approvals` — manager approve/reject history
- `photos` — therapist-uploaded, tagged with child_id + therapy_category_id + consent status
- `posts` — cached Instagram + YouTube posts
- `messages` — chat messages (encrypted body column)
- `message_attachments` — S3 keys for chat files
- `notifications` — in-app notification history
- `audit_logs` — every sensitive action (view, download, approve, delete)
- `push_tokens` — Expo push tokens per device
- `consent_forms` — parental consent records for child photos

### D. File storage

| Layer | Choice |
|---|---|
| Service | **AWS S3** |
| Bucket | `glory-to-god-compliance` (single bucket, separated by prefix) |
| Access | Block all public; presigned URLs only |
| Encryption | SSE-S3 (default, free) |
| Versioning | **ON** (auto-keep old versions on re-upload) |
| Access logging | **ON** (for AHCA audit) |
| Lifecycle rules | Move to Glacier after 2 yr, delete after 7 yr |
| SDK | `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` |

**Prefix structure:**
```
s3://glory-to-god-compliance/
├── employees/{employeeId}/{docType}/{timestamp}-v{N}.pdf
├── photos/{childId}/{yyyy-mm-dd}-{uuid}.jpg
├── chat/{conversationId}/{messageId}-{filename}
└── archive/                                  ← moved here on employee termination
```

### E. Cache, queues, real-time

| Layer | Choice |
|---|---|
| Cache | **Redis 7** on **AWS ElastiCache** |
| Queue | **BullMQ** (runs on Redis) |
| Real-time | **Socket.IO** (with Redis adapter for horizontal scale) |

### F. Third-party integrations

| Service | Purpose | Account needed |
|---|---|---|
| **Expo Push Service** | Push notifications | Free, included with EAS |
| **Instagram Graph API** | Latest posts from `@glorytogodppec` | Facebook Developer App + Instagram Business account link |
| **YouTube Data API v3** | Latest videos from GtG YouTube channel | Google Cloud project (free tier 10k units/day — plenty) |
| **AWS SES** | Transactional email (invites, password reset, expiration alerts) | Must be moved out of sandbox before launch |
| **Google Chat API** (optional, not recommended) | Pull therapist media | Workspace Enterprise + BAA required |

### G. Infrastructure & DevOps

| Layer | Choice |
|---|---|
| Cloud provider | **AWS** (single vendor → single BAA) |
| API hosting | **AWS ECS Fargate** (serverless containers) or **Elastic Beanstalk** for simpler start |
| CDN (if needed later for images) | **CloudFront** |
| DNS / TLS | **Route 53** + **AWS Certificate Manager** |
| Secrets | **AWS Secrets Manager** |
| Monitoring | **CloudWatch** (logs, metrics, alarms) |
| Error tracking | **Sentry** (free tier OK) — optional but recommended |
| Uptime monitoring | **UptimeRobot** (free) or CloudWatch Synthetics |

### H. CI / CD

| Layer | Choice |
|---|---|
| Version control | **GitHub** |
| CI | **GitHub Actions** |
| Mobile builds | **EAS Build** (already set up, account `malik1460`) |
| Mobile OTA updates | **EAS Update** |
| Backend deploy | GitHub Actions → build Docker image → push to ECR → ECS deploy |
| Migrations on deploy | Prisma Migrate runs as pre-deploy step |
| Env separation | `dev` / `staging` / `production` with separate AWS accounts or VPCs |

### I. Local development

| Tool | Purpose |
|---|---|
| **Docker Desktop** | Run Postgres + Redis locally via `docker-compose.yml` |
| **Prisma Studio** | Visual DB browser |
| **Postman** / **Insomnia** | API testing |
| **ngrok** | Expose local backend to physical devices during testing |
| **Node 20 LTS** (via `nvm-windows`) | Match prod runtime |

### J. Code quality

| Tool | Purpose |
|---|---|
| **TypeScript** (backend) | Type safety |
| **ESLint** + **Prettier** | Linting + formatting (shared config across mobile + backend) |
| **Husky** + **lint-staged** | Pre-commit formatting / lint |
| **Jest** | Unit tests |
| **supertest** | HTTP integration tests |
| **Playwright** (optional) | End-to-end if a web admin ever gets built |

### K. Compliance / HIPAA-specific additions

| Area | Implementation |
|---|---|
| Encryption in transit | HTTPS everywhere, TLS 1.2+; Socket.IO over WSS |
| Encryption at rest | RDS KMS (DB), S3 SSE (files), Postgres `pgcrypto` for chat message bodies |
| Access control | Role-based (role on JWT claim) + resource-level checks (parent only sees own child, manager only sees own department) |
| Audit logging | `audit_logs` table: user_id, action, resource_type, resource_id, ip, user_agent, timestamp |
| Session management | JWT 15-min access + refresh token; idle-timeout auto-logout in app |
| MFA | Required for manager + admin (TOTP via `otplib`) |
| Password policy | Min 12 chars, bcrypt cost 12 |
| Password reset | Email token, single-use, 15-min expiry |
| Data retention | 6 years for messages, 5 years post-termination for employee docs, then auto-delete |
| Parental consent | `consent_forms` table; child photos hidden unless consent verified |
| BAAs required | AWS, Google (YouTube), Facebook/Meta (Instagram), Expo, Apple, Google Play |

### L. What's still open / needs decisions

1. **Admin web dashboard** — is there one? If yes, what stack? (Could reuse React + Tailwind or build Next.js on same backend.) Not in scope yet.
2. **Payments** — not in current scope. If added later, use Stripe.
3. **Video/voice calls in chat** — out of scope for v1.
4. **Offline mode** — out of scope for v1 (would need Watermelon DB or similar).
5. **Web version of mobile app** — already works via React Native Web but needs separate design polish.

### M. Estimated monthly running cost (steady state, post-launch)

| Item | Cost |
|---|---|
| AWS RDS (db.t4g.small, Multi-AZ) | ~$50 |
| AWS S3 (storage + requests) | ~$5 |
| AWS ECS Fargate (1 task, 0.5 vCPU / 1 GB) | ~$20 |
| AWS ElastiCache (t4g.micro) | ~$12 |
| AWS SES (email) | ~$1 |
| CloudWatch + Route 53 | ~$5 |
| Domain | ~$1 |
| Apple Dev + Google Play (amortized) | ~$10 |
| **Total** | **~$100–110 / month** |

### N. Summary cheat sheet

- **Frontend**: Expo / React Native / React Navigation (already built)
- **Backend**: Node.js 20 + TypeScript + NestJS + Prisma
- **Database**: PostgreSQL 16 on AWS RDS
- **File storage**: AWS S3 (presigned URLs)
- **Cache / queue**: Redis on AWS ElastiCache + BullMQ
- **Real-time**: Socket.IO
- **Auth**: JWT + bcrypt + TOTP MFA
- **Push**: Expo Push Service
- **Email**: AWS SES via nodemailer
- **Hosting**: AWS ECS Fargate
- **CI/CD**: GitHub Actions + EAS Build
- **Monitoring**: CloudWatch + Sentry
- **Cost**: ~$100/month running, ~13–17 weeks build effort for one developer
