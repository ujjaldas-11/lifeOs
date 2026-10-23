import { apiRequest } from "./client";
import type { ApiResponse } from "../types/auth";
import type { HeatmapDay, WeeklyRetrospective } from "../types/analytics";

export async function fetchHeatmapApi(days = 90): Promise<HeatmapDay[]> {
  const res = await apiRequest<ApiResponse<HeatmapDay[]>>(`/analytics/heatmap?days=${days}`);
  return res.data || [];
}

export async function fetchRetrospectiveApi(): Promise<WeeklyRetrospective> {
  const res = await apiRequest<ApiResponse<WeeklyRetrospective>>("/analytics/retrospective");
  if (!res.data) {
    throw new Error(res.message || "Failed to fetch retrospective");
  }
  return res.data;
}
