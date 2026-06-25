# 🔥 HabitStreak

HabitStreak is a full-stack habit tracking web app that helps you build daily routines and visualize your progress with a GitHub-style contribution grid. Create habits, mark them as complete each day, and watch your streaks grow. Built as a hands-on DevOps learning project covering Docker, PostgreSQL, CI/CD pipelines, and automated testing.

---

## 🛠 Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | React 18, TypeScript, Vite, Tailwind CSS |
| Backend        | Node.js, Express, TypeScript        |
| Database       | PostgreSQL 15                       |
| ORM            | Prisma                              |
| Testing        | Vitest, Supertest                   |
| Containerization | Docker, Docker Compose            |
| CI/CD          | GitHub Actions                      |

---

## 📋 Prerequisites

Before you begin, install these tools on your machine:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | v20 or higher | https://nodejs.org |
| **Docker Desktop** | Latest | https://www.docker.com/products/docker-desktop |
| **Git** | Any recent | https://git-scm.com |
| **VS Code** | Latest | https://code.visualstudio.com |

### Recommended VS Code Extensions

Install these from the Extensions panel (`Ctrl+Shift+X`) for the best experience:

- **Prisma** — syntax highlighting for `.prisma` files
- **ESLint** — linting in the editor
- **Tailwind CSS IntelliSense** — autocomplete for Tailwind classes
- **Docker** — manage containers from VS Code
- **GitLens** — enhanced Git features

---

## 🚀 Quick Start (Docker — Recommended)

This is the easiest way. Docker handles everything automatically.

### Step 1 — Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/habitstreak.git
cd habitstreak
```

### Step 2 — Create your environment file

```bash
cp .env.example .env
```

You don't need to edit anything for local development. The defaults work out of the box.

### Step 3 — Start the entire application

```bash
docker compose up --build
```

This single command will:
1. Pull the PostgreSQL 15 Docker image
2. Start the database and wait for it to be healthy
3. Build the Express server image and run database migrations
4. Build the React frontend with Vite and serve it via nginx

> ⏱ The first build takes **2–4 minutes** because it downloads base images and installs npm packages. Subsequent starts are much faster.

### Step 4 — Open the app

Visit **http://localhost:3000** in your browser.

The API is available at **http://localhost:5000/api**.

### Stopping the app

```bash
# Stop containers (keeps your data)
docker compose down

# Stop containers AND delete all data (fresh start)
docker compose down -v
```

---

## 💻 Running Without Docker (Manual Setup)

Use this if you want to run the server and client directly on your machine for faster development iteration.

### Prerequisites for manual setup
- Node.js 20+
- A running PostgreSQL instance (you can still use Docker just for the DB)

### Step 1 — Start only the database with Docker

```bash
docker compose up db -d
```

### Step 2 — Set up the server

```bash
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

The server starts at **http://localhost:5000**.

### Step 3 — Set up the client (new terminal)

```bash
cd client
npm install
npm run dev
```

The client starts at **http://localhost:3000** with hot reload.

> The Vite dev server proxies `/api` requests to `http://localhost:5000`, so you don't need to configure CORS.

---

## 🧪 Running Tests

### Unit Tests (no database needed)

Unit tests cover pure business logic: streak calculation and date utilities.

```bash
cd tests
npm install
npx vitest run unit
```

### Integration Tests (requires a running database)

Integration tests call the real API against a real PostgreSQL test database.

**Step 1** — Start a test database:
```bash
docker compose up db -d
```

**Step 2** — Create the test database and run migrations:
```bash
# Connect to PostgreSQL and create the test DB
docker exec -it habitstreak_db psql -U postgres -c "CREATE DATABASE habitstreak_test;"

# Run migrations on the test DB
cd server
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/habitstreak_test \
  npx prisma migrate deploy
```

**Step 3** — Run the integration tests:
```bash
cd tests
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/habitstreak_test \
  npx vitest run integration
```

### Run All Tests

```bash
cd tests
npm install
npx vitest run
```

### Watch Mode (reruns tests on file save)

```bash
cd tests
npx vitest
```

---

## 🔄 CI/CD Pipeline

The GitHub Actions pipeline at `.github/workflows/ci.yml` runs automatically on every push and pull request to `main`. It has four sequential jobs:

### Job 1 — `lint-and-typecheck` 🔍

**What it does:** Runs TypeScript's compiler (`tsc --noEmit`) on both the server and client without emitting any files. This catches type errors, wrong imports, and mismatched interfaces before any code runs.

**Why it matters:** TypeScript type errors are free to catch at this stage. Finding them here takes seconds; finding them in production takes hours.

### Job 2 — `unit-tests` 🧪

**What it does:** Runs the Vitest unit tests in `tests/unit/`. No database needed — these are pure function tests.

**Why it matters:** Unit tests are the fastest feedback loop. They verify that core business logic (streak calculation, date formatting) is correct in complete isolation.

**Depends on:** Job 1 passing.

### Job 3 — `integration-tests` 🔗

**What it does:** GitHub Actions spins up a real PostgreSQL 15 container as a "service". The job then runs Prisma migrations against it and executes the Supertest API tests in `tests/integration/`.

**Why it matters:** Unit tests can't catch bugs that only appear when multiple layers interact — like a controller using the wrong Prisma query, or a migration being out of sync with the schema.

**Depends on:** Job 2 passing.

### Job 4 — `docker-build` 🐳

**What it does:** Builds both `Dockerfile.server` and `Dockerfile.client` from scratch and confirms the images are created successfully.

**Why it matters:** A passing test suite means nothing if the Docker build is broken. This job catches issues like missing `COPY` paths, invalid multi-stage references, or missing build dependencies.

**Depends on:** Job 3 passing.

---

## 📁 Folder Structure

```
habitstreak/
├── .github/
│   └── workflows/
│       └── ci.yml              ← GitHub Actions pipeline definition
│
├── client/                     ← React 18 frontend (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── api/habits.ts       ← All fetch() calls to the backend API
│   │   ├── components/
│   │   │   ├── HabitCard.tsx   ← Individual habit card with streak grid
│   │   │   ├── HabitForm.tsx   ← Form to create a new habit
│   │   │   ├── StreakGrid.tsx  ← GitHub-style 12-week contribution grid
│   │   │   └── StatsBar.tsx   ← Top summary: totals, completions, best streak
│   │   ├── pages/
│   │   │   └── Dashboard.tsx   ← Main page — orchestrates all components
│   │   └── types/index.ts      ← Shared TypeScript types
│   ├── vite.config.ts          ← Vite config with /api proxy
│   └── tailwind.config.ts      ← Tailwind theme (Inter font, brand colors)
│
├── server/                     ← Express backend (TypeScript + Prisma)
│   ├── src/
│   │   ├── controllers/
│   │   │   └── habitController.ts  ← Request handlers for all routes
│   │   ├── lib/
│   │   │   ├── prisma.ts           ← Prisma client singleton
│   │   │   ├── streakUtils.ts      ← Pure streak calculation functions
│   │   │   └── dateUtils.ts        ← Date formatting helpers
│   │   ├── middleware/
│   │   │   └── errorHandler.ts     ← Global error and 404 handlers
│   │   ├── routes/
│   │   │   └── habits.ts           ← Express router — maps URLs to controllers
│   │   └── index.ts                ← Express app entry point
│   └── prisma/
│       ├── schema.prisma           ← Database schema (Habit, HabitLog models)
│       └── migrations/             ← Auto-generated SQL migration files
│
├── tests/                      ← All tests (separate package for clean deps)
│   ├── unit/
│   │   ├── streak.test.ts      ← Tests for calculateStreak()
│   │   └── dateUtils.test.ts   ← Tests for date helpers
│   ├── integration/
│   │   └── habits.api.test.ts  ← API tests using Supertest + real DB
│   └── setup.ts                ← Global test setup (env vars, DB URL)
│
├── docker-compose.yml          ← Local dev: db + server + client
├── docker-compose.test.yml     ← CI testing: db-test + test-runner
├── Dockerfile.server           ← Multi-stage: build TS → lean node runner
├── Dockerfile.client           ← Multi-stage: Vite build → nginx static server
├── nginx.conf                  ← Nginx config: SPA routing + /api proxy
├── .env.example                ← Template for environment variables
└── README.md                   ← This file
```

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check — returns `{ status: "ok" }` |
| `GET` | `/api/habits` | List all habits with current streak |
| `POST` | `/api/habits` | Create a habit `{ name, description?, color }` |
| `DELETE` | `/api/habits/:id` | Delete a habit and all its logs |
| `POST` | `/api/habits/:id/log` | Mark today as completed |
| `DELETE` | `/api/habits/:id/log` | Unmark today |
| `GET` | `/api/habits/:id/logs` | Get logs for last 365 days |
| `GET` | `/api/habits/:id/streak` | Get `{ currentStreak, longestStreak, totalDays }` |

---

## 🐛 Troubleshooting

**"Port 5432 is already in use"**
You have another PostgreSQL running locally. Either stop it or change the port mapping in `docker-compose.yml` from `5432:5432` to `5433:5432` and update your `DATABASE_URL`.

**"Cannot connect to database" after `docker compose up`**
The server might have started before the database was fully ready. The `healthcheck` in `docker-compose.yml` handles this automatically, but if you see the error, run `docker compose restart server`.

**Blank page at http://localhost:3000**
Check that the client container started: `docker compose ps`. If the client shows as running but the page is blank, open DevTools Console — likely an API error. Confirm the server is running at http://localhost:5000/api/health.

**"prisma: command not found"**
Run `npm install` inside the `server/` directory first. Prisma CLI is a dev dependency.

---

## 📚 Learning Resources

Since you're learning DevOps, here are the official docs for each technology used:

- [Docker Compose documentation](https://docs.docker.com/compose/)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)
- [Vitest documentation](https://vitest.dev/)
- [PostgreSQL documentation](https://www.postgresql.org/docs/)
