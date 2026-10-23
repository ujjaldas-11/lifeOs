import { apiRequest } from "./client";
import type { ApiResponse } from "../types/auth";
import type { Project, CreateProjectInput, UpdateProjectInput, ProjectStatus } from "../types/project";

export async function fetchProjectsApi(params?: { status?: ProjectStatus; search?: string }): Promise<Project[]> {
  const query = new URLSearchParams();
  if (params?.status) {
    query.set("status", params.status);
  }
  if (params?.search && params.search.trim() !== "") {
    query.set("search", params.search.trim());
  }

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const res = await apiRequest<ApiResponse<Project[]>>(`/projects${queryString}`);
  return res.data || [];
}

export async function fetchProjectByIdApi(id: number): Promise<Project> {
  const res = await apiRequest<ApiResponse<Project>>(`/projects/${id}`);
  if (!res.data) {
    throw new Error(res.message || "Project not found");
  }
  return res.data;
}

export async function createProjectApi(input: CreateProjectInput): Promise<Project> {
  const res = await apiRequest<ApiResponse<Project>>("/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.data) {
    throw new Error(res.message || "Failed to create project");
  }
  return res.data;
}

export async function updateProjectApi(id: number, input: UpdateProjectInput): Promise<Project> {
  const res = await apiRequest<ApiResponse<Project>>(`/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!res.data) {
    throw new Error(res.message || "Failed to update project");
  }
  return res.data;
}

export async function deleteProjectApi(id: number): Promise<void> {
  await apiRequest<ApiResponse<void>>(`/projects/${id}`, {
    method: "DELETE",
  });
}
