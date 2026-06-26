# HabitStreak

A full-stack habit tracking application with a GitHub-style contribution grid for visualizing progress over time. Users can create habits, log daily completions, and track current and longest streaks across a rolling 365-day window.

The project was built as a practical exercise in modern full-stack and DevOps practices: containerized development with Docker, a typed Node.js/PostgreSQL backend, automated testing at the unit and integration level, and a four-stage CI pipeline running on GitHub Actions.

## Features

- Create, view, and delete habits with custom names, descriptions, and colors
- Mark habits complete or incomplete for the current day
- GitHub-style 12-week contribution grid per habit
- Automatic calculation of current streak, longest streak, and total completions
- Dashboard summary view across all habits
- Fully containerized local environment via Docker Compose

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 15 |
| ORM | Prisma |
| Testing | Vitest, Supertest |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |

## Architecture

```
habitstreak/
├── client/                     React frontend (Vite + TypeScript + Tailwind)
│   └── src/
│       ├── api/                API client functions
│       ├── components/         HabitCard, HabitForm, StreakGrid, StatsBar
│       ├── pages/               Dashboard
│       └── types/               Shared TypeScript types
│
├── server/                     Express backend (TypeScript + Prisma)
│   ├── src/
│   │   ├── controllers/        Route handlers
│   │   ├── lib/                 Prisma client, streak and date utilities
│   │   ├── middleware/         Error handling
│   │   └── routes/              API route definitions
│   └── prisma/                  Schema and migrations
│
├── tests/                      Unit and integration test suites
├── docker-compose.yml          Local development stack
├── Dockerfile.server           Multi-stage server build
├── Dockerfile.client           Multi-stage client build (served via nginx)
└── .github/workflows/ci.yml    CI pipeline definition
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- Docker Desktop
- Git

### Setup

```bash
git clone https://github.com/Muhammad-Arhan/habitstreak.git
cd habitstreak
cp .env.example .env
docker compose up --build
```

The application will be available at:

- Frontend: http://localhost:3000
- API: http://localhost:5000/api

To stop the stack:

```bash
docker compose down        # stop containers, keep data
docker compose down -v     # stop containers and remove data
```

### Running Without Docker

Start the database only:

```bash
docker compose up db -d
```

Run the backend:

```bash
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Run the frontend in a separate terminal:

```bash
cd client
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to the backend, so no additional CORS configuration is required.

## Running Tests

Unit tests (no database required):

```bash
cd tests
npm install
npx vitest run unit
```

Integration tests (requires a running PostgreSQL instance):

```bash
docker compose up db -d
docker exec -it habitstreak_db psql -U postgres -c "CREATE DATABASE habitstreak_test;"

cd server
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/habitstreak_test npx prisma migrate deploy

cd ../tests
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/habitstreak_test npx vitest run integration
```

Run the full suite:

```bash
cd tests
npx vitest run
```

## CI/CD Pipeline

The pipeline defined in `.github/workflows/ci.yml` runs on every push and pull request to `main`, with four sequential jobs:

1. **lint-and-typecheck** — Runs the TypeScript compiler in no-emit mode across both the client and server to catch type errors and import issues before tests run.
2. **unit-tests** — Runs isolated unit tests covering streak calculation and date utilities.
3. **integration-tests** — Spins up a PostgreSQL service container, applies Prisma migrations, and runs Supertest API tests against the real stack.
4. **docker-build** — Builds both production Docker images to confirm the application is deployable.

Each job depends on the previous one passing, so failures surface as early as possible in the pipeline.

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/habits` | List all habits with current streak |
| POST | `/api/habits` | Create a habit |
| DELETE | `/api/habits/:id` | Delete a habit and its logs |
| POST | `/api/habits/:id/log` | Mark today as completed |
| DELETE | `/api/habits/:id/log` | Unmark today |
| GET | `/api/habits/:id/logs` | Get logs for the last 365 days |
| GET | `/api/habits/:id/streak` | Get current streak, longest streak, and total days |

## License

This project is open source and available for personal and educational use.