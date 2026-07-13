# AI Academic Operating System (Phase 1)

An AI-powered academic assistant for college students. Organize your semester,
subjects, timetable, attendance, exams and study sessions — then let an LLM
(Gemini or OpenAI) generate personalized study plans from your real data.

> Stack: **MERN** (MongoDB, Express, React, Node) + **LLM**

## Features (Phase 1)

- **Authentication** — JWT + bcrypt (register / login / me)
- **Profile** — college, branch, semester, target SGPA, daily study goal
- **Semesters** — create, activate, delete; projected SGPA per semester
- **Subjects** — credits, faculty, difficulty, internal/end-sem marks
- **Timetable** — weekly classes + automatic **free-slot** detection
- **Attendance** — present/absent tracking, live % and "classes you can skip"
- **Exams** — exam dates + preparation status, days-until countdown
- **SGPA/CGPA** — computed on the backend (LLM never calculates grades)
- **Study Tracker** — start/stop focus timer + study history
- **Dashboard** — cards + Recharts (study hours, attendance, time by subject)
- **AI Planner** — Daily Plan, Subject Priority Engine, Life Optimizer

## Architecture

```
client/   React + Vite + Tailwind + shadcn-style UI + Redux Toolkit + Recharts
server/   Node + Express + Mongoose + JWT + Zod validation
```

All calculations (attendance %, SGPA, free slots, priority score) run on the
**backend**. The LLM only consumes precomputed numbers and produces schedules —
it never computes grades or attendance.

## Prerequisites

- Node.js 20+
- MongoDB (local, or MongoDB Atlas connection string)
- (Optional) Gemini or OpenAI API key for the AI Planner

## Setup

```bash
# 1. Install all workspaces (root + client + server)
npm install

# 2. Configure the backend
cp server/.env server/.env
# then edit server/.env: set MONGO_URI, JWT_SECRET, and (optionally) AI keys

# 3. Run a local MongoDB (skip if using Atlas)
docker run -d --name aacos-mongo -p 27017:27017 mongo:7

# 4. Start both client and server
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5000 (the Vite dev server proxies `/api` to it)

### Environment variables (`server/.env`)

| Variable | Description |
| --- | --- |
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `CLIENT_URL` | Allowed CORS origin (default `http://localhost:5173`) |
| `AI_PROVIDER` | `gemini` or `openai` (leave empty to disable AI) |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Gemini config |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | OpenAI config |

The AI Planner shows a clear "not configured" notice when no provider/key is set,
so the rest of the app works without any AI keys.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Run client + server together |
| `npm run dev:server` | Run only the API |
| `npm run dev:client` | Run only the frontend |
| `npm run build` | Build the client for production |
| `npm run lint` | Lint the client |
| `npm --workspace server run lint` | Lint the server |

## REST API

```
Auth        POST /api/auth/register | POST /api/auth/login | GET /api/auth/me
Profile     GET/PUT /api/users/me/profile
Semesters   GET/POST/PUT/DELETE /api/semesters | GET /api/semesters/:id/sgpa
Subjects    GET/POST/PUT/DELETE /api/subjects
Timetable   GET/POST/PUT/DELETE /api/timetable | GET /api/timetable/free-slots
Attendance  GET/POST/PUT /api/attendance
Exams       GET/POST/PUT/DELETE /api/exams
Study       POST /api/study/start | POST /api/study/stop | GET /api/study/history | GET /api/study/active
Dashboard   GET /api/dashboard
AI          GET /api/ai/status | POST /api/ai/daily-plan | POST /api/ai/priority | POST /api/ai/life-plan
```

## Business logic

- **Attendance %** = `present / (present + absent) × 100`
- **SGPA** = `Σ(gradePoint × credits) / Σ(credits)` (marks → grade point bands)
- **Free slots** = gaps between timetable entries per day (08:00–22:00 window)
- **Priority score** = `credits×3 + examWeight + difficultyWeight + attendanceWeight + preparationWeight`

# AI_PERSONALIZED_ACADEMIC_OPTIMIZER
