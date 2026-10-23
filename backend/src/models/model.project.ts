export type ProjectStatus = "ACTIVE" | "ON_HOLD" | "COMPLETED";

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  techStack: string[];
  githubUrl?: string | null;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  tasksCount?: number;
  completedTasksCount?: number;
  progressPercentage?: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string | null | undefined;
  techStack?: string[] | undefined;
  githubUrl?: string | null | undefined;
  status?: ProjectStatus | undefined;
}

export interface UpdateProjectInput {
  name?: string | undefined;
  description?: string | null | undefined;
  techStack?: string[] | undefined;
  githubUrl?: string | null | undefined;
  status?: ProjectStatus | undefined;
}
