import { apiJson } from "./apiClient";
import { AuthResponse, LoginRequest, RegisterRequest } from "../types/Auth";

export async function login(req: LoginRequest): Promise<AuthResponse> {
  return apiJson<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(req),
    skipAuth: true,
  });
}

export async function register(req: RegisterRequest): Promise<AuthResponse> {
  return apiJson<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(req),
    skipAuth: true,
  });
}
