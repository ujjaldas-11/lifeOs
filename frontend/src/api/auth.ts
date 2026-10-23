import { apiRequest } from "./client";
import type { ApiResponse, AuthResponse, User } from "../types/auth";

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await apiRequest<ApiResponse<AuthResponse>>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!res.data) {
    throw new Error(res.message || "Login failed");
  }

  return res.data;
}

export async function registerApi(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await apiRequest<ApiResponse<AuthResponse>>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.data) {
    throw new Error(res.message || "Registration failed");
  }

  return res.data;
}

export async function getCurrentUserApi(): Promise<User> {
  const res = await apiRequest<ApiResponse<User>>("/auth/me");
  if (!res.data) {
    throw new Error(res.message || "Failed to fetch user");
  }
  return res.data;
}

export async function updateProfileApi(data: {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<User> {
  const res = await apiRequest<ApiResponse<User>>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.data) {
    throw new Error(res.message || "Failed to update profile");
  }
  return res.data;
}

export async function exportDataApi(): Promise<any> {
  const res = await apiRequest<ApiResponse<any>>("/auth/export");
  if (!res.data) {
    throw new Error(res.message || "Failed to export data");
  }
  return res.data;
}

