import type { Task } from "./task";
import type { Note } from "./note";

export type ProjectStatus = "ACTIVE" | "ON_HOLD" | "COMPLETED";

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  techStack: string[];
  githubUrl?: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  userId: number;
  tasks?: Task[];
  notes?: Note[];
  _count?: {
    tasks: number;
    notes: number;
  };
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  techStack?: string[];
  githubUrl?: string;
  status?: ProjectStatus;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  techStack?: string[];
  githubUrl?: string;
  status?: ProjectStatus;
}
