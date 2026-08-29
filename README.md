# Haven — Capstone: Full-Stack Production App

A stay-booking platform — hosts list places to stay, guests browse and book them. Built as the Week 6 capstone, bringing together everything from the internship: authentication, role-based permissions, file uploads, dashboards with charts, search and filtering, and a full test suite, all deployed live.

**Live frontend:** https://azamagr.github.io/haven/
**Backend API:** deployed separately on Vercel — see "Deploying" below

**Demo accounts** (after running the seed script):
| Role | Email | Password |
|---|---|---|
| Host | `host@haven.test` | `password123` |
| Guest | `guest@haven.test` | `password123` |

## The problem

Small hosts — someone renting out a cabin, a spare studio, a family cottage — don't need the full complexity of a global marketplace. They need three things: a place to list what they have, a way for people to actually book it without double-booking, and a way to see how it's doing. Haven is that, scoped down to what a single developer can build, test, and ship end to end.

## Architecture overview

```
                 ┌──────────────────────┐
  Browser  ───▶  │  GitHub Pages         │   React SPA (Vite build)
                 │  azamagr.github.io    │   React Router (hash-based)
                 │  /haven/              │
                 └───────────┬───────────┘
                             │  fetch() + JWT in Authorization header
                             ▼
                 ┌──────────────────────┐
                 │  Vercel serverless    │   Express app wrapped as a
                 │  (backend/api)        │   serverless function
                 └──────┬────────┬───────┘
                        │        │
                 Mongoose│        │Cloudinary SDK
                        ▼        ▼
              ┌─────────────┐  ┌──────────────┐
              │ MongoDB     │  │ Cloudinary    │   Listing photos —
              │ Atlas       │  │               │   stored as URLs,
              │ users,      │  │               │   never on our own
              │ listings,   │  │               │   disk (serverless
              │ bookings    │  │               │   has none)
              └─────────────┘  └──────────────┘
```

- **Frontend**: React 19 + Vite + React Router + Tailwind CSS + Recharts, deployed as a static build to GitHub Pages.
- **Backend**: Express 5 + Mongoose 9, deployed to Vercel as a serverless function. Stateless — no session storage, no local file storage; everything durable lives in Atlas or Cloudinary.
- **Auth**: JWT, issued on signup/login, stored in `localStorage`, attached to every authenticated request.
- **File storage**: Cloudinary, via a signed server-side upload (the API key/secret never reach the browser) — chosen over local disk specifically because Vercel's serverless functions have no persistent filesystem between requests.
- **CI**: every push runs the full backend and frontend test suites in GitHub Actions *before* the frontend is built and deployed — a broken test blocks the deploy.

This is a **monorepo**: `backend/` and `frontend/` are independent apps in one repo.

## Data model — two related resources, plus the user they both hang off of

```
User (name, email, password[hashed], role: guest|host)
  │
  ├─── 1:N ───▶ Listing (title, description, location, category,
  │                        pricePerNight, maxGuests, photo{url, alt})
  │                        — owned by a host
  │
  └─── 1:N ───▶ Booking (checkIn, checkOut, guests, totalPrice, status)
                          — made by any user, references a Listing
```

## Auth + role-based permissions

Every account is either a **guest** or a **host** (chosen at signup). Both can browse and book listings. Only hosts can create, edit, or delete listings, or see the dashboard — enforced in two places:

- **Backend** (the real enforcement): `backend/src/middleware/authMiddleware.js` exports `requireRole(...roles)`, applied to every host-only route in `listingRoutes.js` and `dashboardRoutes.js`. A guest's token is valid — they're just not allowed past that check (403, not 401).
- **Frontend** (the UX layer): `ProtectedRoute` accepts a `requireRole` prop and shows a plain "Hosts only" message rather than the page, and the header only renders the Dashboard link for hosts. This is convenience, not security — the backend check is what actually matters, which is why both exist and both are tested.

## Client + server validation, and one real cross-cutting bug this caught

Every form (signup, login, create/edit listing, book a stay) validates on the client for instant feedback, and every corresponding endpoint validates again on the server independently, because the client can always be bypassed.

**A genuine bug found and fixed while testing this**: number inputs (price, max guests, guest count) had native HTML `min`/`max` attributes *and* custom JS validation with a specific error message. Turns out browsers silently block form submission entirely when a number input's value violates its `min`/`max` — the `submit` event never fires, so the custom validation code (and its helpful error message) never runs. The user would click "Book" and... nothing would visibly happen. Every form in the app now sets `noValidate`, so the browser's native constraint checking never interferes and the custom validation (with an actual explanation) always runs. See "One challenge" in the case study below for the full story.

## Loading, error, and empty states

Every data-fetching view — Browse, a listing's detail page, My Bookings, the host dashboard — has three distinct states beyond "success": a skeleton loader shaped like the real content, a retry-able error state, and an empty state with copy specific to *why* it's empty (no search results vs. no bookings yet vs. no listings created yet), never a shared generic "nothing here."

## Stretch goals implemented (4, task asked for 2-3)

1. **File uploads** — listing photos go through Multer (in-memory) straight to Cloudinary; the backend never writes to disk.
2. **Search with filters** — text search (title/location) plus category, minimum guest count, and max price filters on the Browse page, all resolved server-side via a MongoDB query built from `req.query` (`listingController.js`).
3. **Dashboard with charts** — the host dashboard aggregates the logged-in host's own bookings (server-side, via `Promise.all`'d Mongoose aggregation pipelines) into revenue-by-month (line chart) and bookings-by-listing (bar chart), plus stat cards.
4. **CI/CD** — `.github/workflows/deploy.yml` runs the full backend and frontend test suites as a required step before every deploy; a failing test blocks the site from updating.

## Tests

| Layer | Tool | Count | Covers |
|---|---|---|---|
| Backend | Jest + Supertest + mongodb-memory-server | 20 | Signup/login (happy + failure), listing CRUD + RBAC + ownership, booking creation + date-overlap + guest-limit validation, cancellation ownership |
| Frontend | Vitest + React Testing Library | 19 | Component rendering, form validation, user interactions, protected-route auth/role gating, page-level loading/empty states |

**39 tests total**, well past the required 10. Cloudinary is mocked in backend tests (`tests/__mocks__/cloudinary-config.js`) so tests never make real network calls to a third-party service or need real credentials.

```bash
cd backend && npm test
cd frontend && npm test
```

## Running locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# fill in MONGO_URI, JWT_SECRET, and Cloudinary credentials
npm run seed              # creates demo host/guest accounts + 5 listings + 1 booking
npm run dev                 # http://localhost:5000
```

Generate a `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
Get free Cloudinary credentials at [cloudinary.com](https://cloudinary.com) — no card required.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000
npm run dev               # http://localhost:5173
```

## Deploying

**Backend (Vercel)** — files already included (`backend/api/index.js`, `backend/vercel.json`):
1. Push this repo to GitHub.
2. vercel.com → Add New → Project → import the repo → **Root Directory: `backend`**.
3. Environment Variables: `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
4. Deploy, then run `npm run seed` locally against that same `MONGO_URI` to populate the live database.

**Frontend (GitHub Pages)**:
1. Repo **Settings → Secrets and variables → Actions → Variables** → add `VITE_API_URL` = your Vercel backend URL.
2. Repo **Settings → Pages → Source** → **"GitHub Actions"**.
3. Push to `main` — tests run, then the frontend builds and deploys.

`frontend/vite.config.js` sets `base: '/haven/'` — update if you name your repo something else. Keep the repo name all-lowercase.

## Case study

See [`CASE_STUDY.md`](./CASE_STUDY.md) for the problem framing, tech-stack decisions and the reasoning behind them, and a detailed walkthrough of the `noValidate` bug mentioned above.
