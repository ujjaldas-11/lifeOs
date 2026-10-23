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
