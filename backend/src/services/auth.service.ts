import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import type { JwtPayload, UserAuthResponse } from "../models/model.user.js";

const JWT_SECRET = process.env.JWT_SECRET || "lifeos-jwt-secret-phase1-dev-key-2026";

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
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

  // Seed 4-5 sample developer tasks after user registers
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0);
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        title: "Review Pull Request #42 on Architecture Refactor",
        description: "Check the PR changes, run local integration tests and leave code review comments.",
        priority: "HIGH",
        dueDate: twoDaysAgo,
        completed: false,
        status: "PENDING",
        userId: newUser.id,
      },
      {
        title: "Initialize LifeOS Database & Authentication System",
        description: "Set up Prisma schema, configure PostgreSQL connection and implement JWT auth.",
        priority: "HIGH",
        dueDate: yesterday,
        completed: true,
        status: "COMPLETED",
        userId: newUser.id,
      },
      {
        title: "Complete Tasks View & Filter Implementation",
        description: "Build clean task cards with interactive status toggles and filter categories.",
        priority: "HIGH",
        dueDate: todayEnd,
        completed: false,
        status: "PENDING",
        userId: newUser.id,
      },
      {
        title: "Configure CI/CD Pipelines & Automated Testing",
        description: "Add GitHub actions for linting, typechecking, and unit tests on commit.",
        priority: "MEDIUM",
        dueDate: inThreeDays,
        completed: false,
        status: "PENDING",
        userId: newUser.id,
      },
      {
        title: "Explore Developer Habit Tracking & Note Taking",
        description: "Research UI patterns and data structures for Phase 2 developer modules.",
        priority: "LOW",
        dueDate: inFiveDays,
        completed: false,
        status: "PENDING",
        userId: newUser.id,
      },
    ],
  });

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
