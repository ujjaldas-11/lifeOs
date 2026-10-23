# Personal Developer Life OS — Phase 1

A personal developer workspace & task commander built with React, Vite, Tailwind CSS, shadcn-inspired UI, Express, PostgreSQL, and Prisma.

## Tech Stack
- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide React, React Router 7
- **Backend**: Node.js, Express 5, TypeScript (ES Modules)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Token) with bcrypt password hashing

---

## Phase 1 Delivered Features

### 1. Full Project Structure
- Structured monorepo layout: `backend/` and `frontend/`
- Full TypeScript typing with strict checks
- Clean separation of routes, controllers, services, middleware, and models

### 2. Database Schema (Prisma + PostgreSQL)
- **User Model**: `id`, `name`, `email`, `passwordHash`, `createdAt`, `updatedAt`
- **Task Model**: `id`, `title`, `description`, `priority` (LOW, MEDIUM, HIGH), `dueDate`, `completed`, `status`, `createdAt`, `updatedAt`, `userId`
- Relational cascading deletes (`User -> Task`)

### 3. Simple Authentication
- **User Registration** (`POST /api/auth/register`):
  - Validates name, email, password (min 6 chars)
  - Hashes password using `bcryptjs`
  - Generates signed JWT token (7-day validity)
  - **Auto-seeds 4-5 realistic developer sample tasks** across Today, Upcoming, Overdue, and Completed states!
- **User Login** (`POST /api/auth/login`):
  - Verifies credentials and returns user payload + JWT
- **Protected Routes** (`GET /api/auth/me`):
  - Token authentication middleware (`Authorization: Bearer <token>`)

### 4. Tasks Module (Full CRUD & Filters)
- **Create**: Add new task with title, description, priority, and optional due date
- **Read**: Fetch tasks filtered by:
  - `Today`: Tasks scheduled for today
  - `Upcoming`: Incomplete tasks due in the future
  - `Overdue`: Incomplete tasks past their due date
  - `Completed`: Finished tasks
  - `All`: Complete backlog
  - Search by query & filter by priority (High, Medium, Low)
- **Update**: Edit title, description, priority, due date, or toggle completion
- **Delete**: Remove tasks with confirmation

### 5. Frontend UI & Layout
- **Sidebar Navigation**:
  - Active: Dashboard (`/`), Tasks (`/tasks`)
  - Placeholders with Phase 2/3 roadmaps: Notes, Projects, Habits, Settings
  - User badge and logout action
- **Dashboard**:
  - Focus metrics: Today's Focus, Overdue Attention, Upcoming, Completion Rate
  - Today's agenda with one-click completion toggles
  - Phase 1 milestone completion checklist
- **Tasks Page**:
  - Quick inline task creation bar
  - Full modal creation & edit form with date shortcuts (Today, Tomorrow, Next Week)
  - Filter tabs with live task counts

---

## Getting Started

### 1. Database & Backend Setup
```bash
cd backend

# Configure environment variables
# Edit backend/.env if your PostgreSQL connection differs
# DATABASE_URL="postgresql://<user>@localhost:5432/lifeos_db"
# JWT_SECRET="lifeos-jwt-secret-phase1-dev-key-2026"
# PORT=5000

# Push Prisma schema and generate client
npx prisma db push
npx prisma generate

# Run backend development server
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Run frontend development server
npm run dev
```
Frontend runs on `http://localhost:5173` with proxy configured for `/api` requests to `http://localhost:5000`.

### 3. Demo Credentials
You can register a new account to experience the automatic 5-task seed, or log into the seeded demo account:
- **Email**: `alex@example.com`
- **Password**: `password123`
*(A convenient "Autofill demo account" button is provided on the login page).*