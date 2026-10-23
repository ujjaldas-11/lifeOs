import { apiRequest } from "./client";
import type { ApiResponse } from "../types/auth";
import type { FocusSession, FocusSummary, CreateFocusSessionInput } from "../types/focus";

export async function logFocusSessionApi(input: CreateFocusSessionInput): Promise<FocusSession> {
  const res = await apiRequest<ApiResponse<FocusSession>>("/focus", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.data) {
    throw new Error(res.message || "Failed to record focus session");
  }
  return res.data;
}

export async function fetchFocusSummaryApi(): Promise<FocusSummary> {
  const res = await apiRequest<ApiResponse<FocusSummary>>("/focus/summary");
  if (!res.data) {
    throw new Error(res.message || "Failed to fetch focus summary");
  }
  return res.data;
}
