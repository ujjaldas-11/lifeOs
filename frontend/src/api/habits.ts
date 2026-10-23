import { apiRequest } from "./client";
import type { ApiResponse } from "../types/auth";
import type { Habit, CreateHabitInput, UpdateHabitInput } from "../types/habit";

export async function fetchHabitsApi(): Promise<Habit[]> {
  const res = await apiRequest<ApiResponse<Habit[]>>("/habits");
  return res.data || [];
}

export async function fetchHabitByIdApi(id: number): Promise<Habit> {
  const res = await apiRequest<ApiResponse<Habit>>(`/habits/${id}`);
  if (!res.data) throw new Error(res.message || "Habit not found");
  return res.data;
}

export async function createHabitApi(input: CreateHabitInput): Promise<Habit> {
  const res = await apiRequest<ApiResponse<Habit>>("/habits", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.data) throw new Error(res.message || "Failed to create habit");
  return res.data;
}

export async function updateHabitApi(id: number, input: UpdateHabitInput): Promise<Habit> {
  const res = await apiRequest<ApiResponse<Habit>>(`/habits/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!res.data) throw new Error(res.message || "Failed to update habit");
  return res.data;
}

export async function deleteHabitApi(id: number): Promise<void> {
  await apiRequest<ApiResponse<null>>(`/habits/${id}`, {
    method: "DELETE",
  });
}

export async function checkInHabitApi(id: number, date?: string): Promise<Habit> {
  const res = await apiRequest<ApiResponse<Habit>>(`/habits/${id}/checkin`, {
    method: "POST",
    body: JSON.stringify({ date }),
  });
  if (!res.data) throw new Error(res.message || "Failed to check in habit");
  return res.data;
}
