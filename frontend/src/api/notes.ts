import { apiRequest } from "./client";
import type { ApiResponse } from "../types/auth";
import type { Note, CreateNoteInput, UpdateNoteInput } from "../types/note";

export async function fetchNotesApi(search?: string, tag?: string): Promise<Note[]> {
  const params = new URLSearchParams();
  if (search && search.trim()) params.set("search", search.trim());
  if (tag && tag.trim()) params.set("tag", tag.trim());

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiRequest<ApiResponse<Note[]>>(`/notes${query}`);
  return res.data || [];
}

export async function fetchNoteByIdApi(id: number): Promise<Note> {
  const res = await apiRequest<ApiResponse<Note>>(`/notes/${id}`);
  if (!res.data) throw new Error(res.message || "Note not found");
  return res.data;
}

export async function createNoteApi(input: CreateNoteInput): Promise<Note> {
  const res = await apiRequest<ApiResponse<Note>>("/notes", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.data) throw new Error(res.message || "Failed to create note");
  return res.data;
}

export async function updateNoteApi(id: number, input: UpdateNoteInput): Promise<Note> {
  const res = await apiRequest<ApiResponse<Note>>(`/notes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!res.data) throw new Error(res.message || "Failed to update note");
  return res.data;
}

export async function deleteNoteApi(id: number): Promise<void> {
  await apiRequest<ApiResponse<null>>(`/notes/${id}`, {
    method: "DELETE",
  });
}

export async function fetchTagsApi(): Promise<string[]> {
  const res = await apiRequest<ApiResponse<string[]>>("/notes/tags");
  return res.data || [];
}
