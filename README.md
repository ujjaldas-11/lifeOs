# Personal Developer Life OS — Phase 1, Phase 2 & Phase 3

A complete developer operating system & task commander built with React, Vite, Tailwind CSS, Antigravity flat dark theme, Express 5, PostgreSQL, and Prisma.

## Tech Stack
- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide React, React Router 7
- **Theme**: Antigravity Flat Dark Theme (neutral charcoal `#0d0f14`, sharp `#222736` borders, crisp `#e6edf3` typography, 0 gradients)
- **Backend**: Node.js, Express 5, TypeScript (ES Modules)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Token) with bcrypt password hashing

---

## Architecture & Features Overview

### Phase 1: Authentication & Tasks Module (Completed)
1. **Database Schema (PostgreSQL + Prisma)**:
   - User and Task models with relational cascades.
2. **Simple Authentication**:
   - `POST /api/auth/register` (hashes password, signs JWT, auto-seeds sample data)
   - `POST /api/auth/login` (verifies credentials, issues JWT)
   - `GET /api/auth/me` (protected profile route)
3. **Tasks Backlog Module (`/tasks`)**:
   - Full CRUD: Create, Read, Update, Delete tasks
   - Fields: `title`, `description`, `priority` (`HIGH`, `MEDIUM`, `LOW`), `dueDate`, `completed`, `projectId`, `kanbanColumn`
   - Filter pipeline: `Today` / `Upcoming` / `Overdue` / `Completed` / `All`
   - Live search & priority filter
   - Quick inline task creator + full modal with date presets

---

### Phase 2: Habits, Events & Notes Modules (Completed)

1. **Habits Module (`/habits`)**:
   - Fields: `name`, `frequency` (`DAILY`, weekdays, etc.), `currentStreak`, `longestStreak`
   - 1-click daily check-in with `HabitLog` table (`@@unique([habitId, date])`)
   - 7-day mini consistency activity strip and streak counter 🔥
2. **Events Module (`/events`)**:
   - Fields: `title`, `description`, `date`, `time`
   - Upcoming, Today, All, and Past event filters with relative day countdowns
3. **Notes Module (`/notes`)**:
   - Fields: `title`, `content` (Markdown), `tags` (`String[]`)
   - Real-time search by title or content snippet, tag filtering and live preview mode

---

### Phase 3: Developer Focus, Projects Kanban, Global Command Palette & Analytics (Completed)

#### 1. Antigravity Flat Dark Theme
- Replaced gradients with clean, flat developer IDE surfaces (`#0d0f14` body, `#13161f` panels, `#222736` borders, `#e6edf3` text).
- Monospace badges (`font-mono`) for shortcuts, tags, and metrics.
- Removed all `bg-gradient-to-...` and radial glow blurs.

#### 2. Projects & Kanban Workflow (`/projects`)
- Fields: `name`, `description`, `techStack` (`String[]`), `githubUrl`, `status` (`ACTIVE`, `ON_HOLD`, `COMPLETED`)
- Multi-column **Kanban Board** with 4 columns:
  - `TODO` → `IN_PROGRESS` → `REVIEW` → `DONE`
- Quick shift arrows between columns, auto-completion sync, and inline project task additions.
- Tech stack tags, GitHub repo linkage, and progress percentage meters.

#### 3. Developer Focus & Pomodoro Timer
- Accessible via Topbar, Command Palette (`P`), or directly on task cards.
- Modes: 25m Pomodoro, 50m Deep Work, 5m Short Break, 15m Long Break.
- Links focus session directly to specific backlog tasks.
- Logs focus sessions to PostgreSQL (`FocusSession`), contributing to the daily activity matrix.

#### 4. Global Command Palette (`Cmd + K` / `Ctrl + K`)
- Keyboard shortcut `⌘K` or `Ctrl+K` opens the spotlight overlay anywhere in the app.
- Instant search and navigation across Dashboard, Projects, Tasks, Habits, Events, Notes, and Settings.
- Quick action launchers for starting Pomodoro focus, adding tasks, and creating projects.

#### 5. 90-Day Developer Activity Heatmap & Retrospective
- GitHub-style contribution matrix aggregating completed tasks, habit check-ins, notes written, and focus minutes.
- Past 7-day retrospective summary cards (completed count, habit consistency %, deep focus hours, notes documented).

#### 6. Settings & Full Workspace Backup (`/settings`)
- User profile updates: Name, email, and password changes.
- **Data Sovereignty / JSON Export**: 1-click full offline JSON download (`lifeos-workspace-backup-YYYY-MM-DD.json`) containing all user entities.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL running locally (e.g. database `lifeos_db`)

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Web application opens on http://localhost:5173
```

### 3. Demo Credentials
- **Email**: `alex@example.com`
- **Password**: `password123`
*(Or click the "⚡ Autofill seeded demo account" button on the login screen).*