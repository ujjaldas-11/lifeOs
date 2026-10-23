import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import type { JwtPayload, UserAuthResponse } from "../models/model.user.js";
import { getLocalDateString } from "./habit.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "lifeos-jwt-secret-phase1-dev-key-2026";

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const seedSampleDataForUser = async (userId: number) => {
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0);
  const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

  // 1. Check & Seed Tasks
  const taskCount = await prisma.task.count({ where: { userId } });
  if (taskCount === 0) {
    await prisma.task.createMany({
      data: [
        {
          title: "Review Pull Request #42 on Architecture Refactor",
          description: "Check the PR changes, run local integration tests and leave code review comments.",
          priority: "HIGH",
          dueDate: twoDaysAgo,
          completed: false,
          status: "PENDING",
          userId,
        },
        {
          title: "Initialize LifeOS Database & Authentication System",
          description: "Set up Prisma schema, configure PostgreSQL connection and implement JWT auth.",
          priority: "HIGH",
          dueDate: yesterday,
          completed: true,
          status: "COMPLETED",
          userId,
        },
        {
          title: "Complete Tasks View & Filter Implementation",
          description: "Build clean task cards with interactive status toggles and filter categories.",
          priority: "HIGH",
          dueDate: todayEnd,
          completed: false,
          status: "PENDING",
          userId,
        },
        {
          title: "Configure CI/CD Pipelines & Automated Testing",
          description: "Add GitHub actions for linting, typechecking, and unit tests on commit.",
          priority: "MEDIUM",
          dueDate: inThreeDays,
          completed: false,
          status: "PENDING",
          userId,
        },
        {
          title: "Explore Developer Habit Tracking & Note Taking",
          description: "Research UI patterns and data structures for Phase 2 developer modules.",
          priority: "LOW",
          dueDate: inFiveDays,
          completed: false,
          status: "PENDING",
          userId,
        },
      ],
    });
  }

  // 2. Check & Seed Habits
  const habitCount = await prisma.habit.count({ where: { userId } });
  if (habitCount === 0) {
    const todayStr = getLocalDateString(now);
    const yesterdayStr = getLocalDateString(yesterday);
    const twoDaysAgoStr = getLocalDateString(twoDaysAgo);
    const threeDaysAgoStr = getLocalDateString(new Date(now.getTime() - 3 * 86400000));

    // Habit 1: Active 3-day streak with checkin today
    const h1 = await prisma.habit.create({
      data: {
        name: "Solve 1 Algorithmic / System Problem",
        frequency: "DAILY",
        currentStreak: 3,
        longestStreak: 5,
        lastCompletedAt: now,
        userId,
      },
    });
    await prisma.habitLog.createMany({
      data: [
        { habitId: h1.id, date: twoDaysAgoStr },
        { habitId: h1.id, date: yesterdayStr },
        { habitId: h1.id, date: todayStr },
      ],
    });

    // Habit 2: Active 2-day streak (checked in yesterday, pending today)
    const h2 = await prisma.habit.create({
      data: {
        name: "Review Team PRs & RFC Architecture",
        frequency: "Mon,Tue,Wed,Thu,Fri",
        currentStreak: 2,
        longestStreak: 4,
        lastCompletedAt: yesterday,
        userId,
      },
    });
    await prisma.habitLog.createMany({
      data: [
        { habitId: h2.id, date: twoDaysAgoStr },
        { habitId: h2.id, date: yesterdayStr },
      ],
    });

    // Habit 3: Deep Work Block
    const h3 = await prisma.habit.create({
      data: {
        name: "30-min Deep Focus Block (No Slack)",
        frequency: "DAILY",
        currentStreak: 4,
        longestStreak: 12,
        lastCompletedAt: now,
        userId,
      },
    });
    await prisma.habitLog.createMany({
      data: [
        { habitId: h3.id, date: threeDaysAgoStr },
        { habitId: h3.id, date: twoDaysAgoStr },
        { habitId: h3.id, date: yesterdayStr },
        { habitId: h3.id, date: todayStr },
      ],
    });
  }

  // 3. Check & Seed Events
  const eventCount = await prisma.event.count({ where: { userId } });
  if (eventCount === 0) {
    await prisma.event.createMany({
      data: [
        {
          title: "Sprint Planning & Backlog Grooming",
          description: "Refine user stories, estimate velocity, and align deliverables for next sprint.",
          date: now,
          time: "02:30 PM",
          userId,
        },
        {
          title: "Technical Architecture & API Contract Sync",
          description: "Review GraphQL vs REST endpoints, schema validation rules, and caching layer.",
          date: inTwoDays,
          time: "11:00 AM",
          userId,
        },
        {
          title: "Weekly Engineering Team Demo & Retrospective",
          description: "Present LifeOS Phase 2 features (Habits, Events, Notes) to the team.",
          date: inFiveDays,
          time: "04:00 PM",
          userId,
        },
      ],
    });
  }

  // 4. Check & Seed Notes
  const noteCount = await prisma.note.count({ where: { userId } });
  if (noteCount === 0) {
    await prisma.note.createMany({
      data: [
        {
          title: "Personal LifeOS Phase 2 Architecture Notes",
          content: `# Developer Life OS — Phase 2 Design

## Modules Overview
- **Habits**: Tracks daily consistency, streak counts, and consecutive logs.
- **Events**: Chronological schedule for sprint planning, demos, and syncs.
- **Notes**: Instant technical scratchpad with tag taxonomies and full-text search.

## Key Design Principles
1. Low-friction data entry with instant visual feedback.
2. Responsive layout styled with Tailwind CSS.
3. User-scoped security enforced at the Express middleware layer.`,
          tags: ["architecture", "lifeos", "v2"],
          userId,
        },
        {
          title: "PostgreSQL & Prisma Indexing Best Practices",
          content: `### Indexing Checklist for Developer Backends
- Add foreign key indexes on high-cardinality relations (e.g. \`userId\`).
- Use composite unique indexes for idempotency (e.g. \`@@unique([habitId, date])\`).
- Leverage PostgreSQL native string arrays (\`String[]\`) for multi-tag filtering without extra junction tables.
- Run \`EXPLAIN ANALYZE\` periodically to verify query plans.`,
          tags: ["database", "postgres", "performance"],
          userId,
        },
        {
          title: "Git Conventional Commits Standard",
          content: `### Commit Types Reference
- **feat**: A new feature (e.g., \`feat(habits): add streak calculation logic\`)
- **fix**: A bug fix (e.g., \`fix(auth): correct token expiration handling\`)
- **docs**: Documentation only changes
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **test**: Adding or correcting unit & integration tests`,
          tags: ["git", "standards", "cheatsheet"],
          userId,
        },
      ],
    });
  }

  // 5. Check & Seed Projects
  const projectCount = await prisma.project.count({ where: { userId } });
  if (projectCount === 0) {
    const proj1 = await prisma.project.create({
      data: {
        name: "LifeOS Platform v3",
        description: "Personal Developer Operating System featuring Kanban, Focus Timer, Habits, and Command Palette.",
        techStack: ["React 19", "Vite", "Tailwind CSS", "TypeScript", "Prisma", "PostgreSQL"],
        githubUrl: "https://github.com/developer/lifeOs",
        status: "ACTIVE",
        userId,
      },
    });

    const userTasks = await prisma.task.findMany({ where: { userId }, take: 3 });
    if (userTasks.length > 0 && userTasks[0]) {
      await prisma.task.update({
        where: { id: userTasks[0].id },
        data: { projectId: proj1.id, kanbanColumn: "DONE" },
      });
      if (userTasks[1]) {
        await prisma.task.update({
          where: { id: userTasks[1].id },
          data: { projectId: proj1.id, kanbanColumn: "IN_PROGRESS" },
        });
      }
      if (userTasks[2]) {
        await prisma.task.update({
          where: { id: userTasks[2].id },
          data: { projectId: proj1.id, kanbanColumn: "TODO" },
        });
      }
    }
  }
};

export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<UserAuthResponse> => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    },
  });

  // Seed sample data for new user
  await seedSampleDataForUser(newUser.id);

  const token = generateToken({
    userId: newUser.id,
    email: newUser.email,
    name: newUser.name,
  });

  return {
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
    token,
  };
};

export const loginUser = async (
  email: string,
  password: string
): Promise<UserAuthResponse> => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Ensure user has sample data for Phase 2 if empty
  await seedSampleDataForUser(user.id);

  const token = generateToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

export const getUserById = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const updateUserProfile = async (
  userId: number,
  input: {
    name?: string | undefined;
    email?: string | undefined;
    currentPassword?: string | undefined;
    newPassword?: string | undefined;
  }
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const data: { name?: string; email?: string; passwordHash?: string } = {};

  if (input.name && input.name.trim()) {
    data.name = input.name.trim();
  }

  if (input.email && input.email.trim()) {
    const normalized = input.email.trim().toLowerCase();
    if (normalized !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: normalized } });
      if (existing) throw new Error("Email already taken by another account");
      data.email = normalized;
    }
  }

  if (input.newPassword) {
    if (!input.currentPassword) {
      throw new Error("Current password is required to set a new password");
    }
    const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new Error("Current password does not match");
    }
    if (input.newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }
    const salt = await bcrypt.genSalt(10);
    data.passwordHash = await bcrypt.hash(input.newPassword, salt);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updated;
};

export const exportAllUserData = async (userId: number) => {
  const [user, tasks, habits, events, notes, projects, focusSessions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.task.findMany({ where: { userId } }),
    prisma.habit.findMany({
      where: { userId },
      include: { logs: true },
    }),
    prisma.event.findMany({ where: { userId } }),
    prisma.note.findMany({ where: { userId } }),
    prisma.project.findMany({
      where: { userId },
      include: { tasks: true, notes: true },
    }),
    prisma.focusSession.findMany({ where: { userId } }),
  ]);

  return {
    version: "3.0.0",
    exportedAt: new Date().toISOString(),
    user,
    stats: {
      tasksCount: tasks.length,
      habitsCount: habits.length,
      eventsCount: events.length,
      notesCount: notes.length,
      projectsCount: projects.length,
      focusSessionsCount: focusSessions.length,
    },
    data: {
      tasks,
      habits,
      events,
      notes,
      projects,
      focusSessions,
    },
  };
};
