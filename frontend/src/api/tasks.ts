import { apiRequest } from "./client";
import type { ApiResponse } from "../types/auth";
import type { Task, CreateTaskInput, UpdateTaskInput, FilterType, Priority } from "../types/task";

export interface TaskFilterParams {
  filter?: FilterType;
  priority?: Priority;
  search?: string;
}

export async function fetchTasksApi(params: TaskFilterParams = {}): Promise<Task[]> {
  const query = new URLSearchParams();

  if (params.filter && params.filter !== "all") {
    query.set("filter", params.filter);
  }
  if (params.priority) {
    query.set("priority", params.priority);
  }
  if (params.search && params.search.trim() !== "") {
    query.set("search", params.search.trim());
  }

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const res = await apiRequest<ApiResponse<Task[]>>(`/tasks${queryString}`);
  return res.data || [];
}

export async function fetchTaskByIdApi(id: number): Promise<Task> {
  const res = await apiRequest<ApiResponse<Task>>(`/tasks/${id}`);
  if (!res.data) {
    throw new Error(res.message || "Task not found");
  }
  return res.data;
}

export async function createTaskApi(input: CreateTaskInput): Promise<Task> {
  const res = await apiRequest<ApiResponse<Task>>("/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.data) {
    throw new Error(res.message || "Failed to create task");
  }
  return res.data;
}

export async function updateTaskApi(id: number, input: UpdateTaskInput): Promise<Task> {
  const res = await apiRequest<ApiResponse<Task>>(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!res.data) {
    throw new Error(res.message || "Failed to update task");
  }
  return res.data;
}

export async function toggleTaskCompleteApi(id: number, completed: boolean): Promise<Task> {
  return updateTaskApi(id, { completed });
}

export async function deleteTaskApi(id: number): Promise<void> {
  await apiRequest<ApiResponse<null>>(`/tasks/${id}`, {
    method: "DELETE",
  });
}
