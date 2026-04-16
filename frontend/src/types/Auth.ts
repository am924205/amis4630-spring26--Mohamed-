export interface AuthUser {
  email: string;
  displayName: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  email: string;
  displayName: string;
  roles: string[];
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}
