import { AuthUser } from "../types/Auth";

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: AuthUser; token: string } }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, loading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        loading: false,
        error: null,
        user: action.payload.user,
        token: action.payload.token,
      };
    case "AUTH_FAILURE":
      return { ...state, loading: false, error: action.payload };
    case "LOGOUT":
      return { ...initialAuthState };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export function isAdmin(state: AuthState): boolean {
  return !!state.user?.roles?.includes("Admin");
}

export function isAuthenticated(state: AuthState): boolean {
  return !!state.token && !!state.user;
}
