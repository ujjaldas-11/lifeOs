import { apiRequest } from "./client";
import type { ApiResponse } from "../types/auth";
import type { Event, CreateEventInput, UpdateEventInput } from "../types/event";

export async function fetchEventsApi(filter: "all" | "upcoming" | "past" = "all"): Promise<Event[]> {
  const query = filter !== "all" ? `?filter=${filter}` : "";
  const res = await apiRequest<ApiResponse<Event[]>>(`/events${query}`);
  return res.data || [];
}

export async function fetchEventByIdApi(id: number): Promise<Event> {
  const res = await apiRequest<ApiResponse<Event>>(`/events/${id}`);
  if (!res.data) throw new Error(res.message || "Event not found");
  return res.data;
}

export async function createEventApi(input: CreateEventInput): Promise<Event> {
  const res = await apiRequest<ApiResponse<Event>>("/events", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.data) throw new Error(res.message || "Failed to create event");
  return res.data;
}

export async function updateEventApi(id: number, input: UpdateEventInput): Promise<Event> {
  const res = await apiRequest<ApiResponse<Event>>(`/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!res.data) throw new Error(res.message || "Failed to update event");
  return res.data;
}

export async function deleteEventApi(id: number): Promise<void> {
  await apiRequest<ApiResponse<null>>(`/events/${id}`, {
    method: "DELETE",
  });
}
