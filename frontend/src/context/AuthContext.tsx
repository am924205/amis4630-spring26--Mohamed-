import React, { createContext, useContext, useEffect, useReducer } from "react";
import { AuthUser, LoginRequest, RegisterRequest } from "../types/Auth";
import * as authService from "../services/authService";
import {
  AuthAction,
  AuthState,
  authReducer,
  initialAuthState,
  isAdmin,
  isAuthenticated,
} from "./authReducer";
import { getStoredUser, getToken, setStoredUser, setToken } from "../services/apiClient";

interface AuthContextType {
  state: AuthState;
  login: (req: LoginRequest) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function hydrate(): AuthState {
  const token = getToken();
  const userJson = getStoredUser();
  if (token && userJson) {
    try {
      const user = JSON.parse(userJson) as AuthUser;
      return { ...initialAuthState, token, user };
    } catch {
      setToken(null);
      setStoredUser(null);
    }
  }
  return initialAuthState;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, undefined, hydrate);

  // Keep localStorage in sync on logout
  useEffect(() => {
    if (!state.token) {
      setToken(null);
      setStoredUser(null);
    }
  }, [state.token]);

  const performAuth = async (
    action: () => Promise<{ token: string; email: string; displayName: string; roles: string[] }>
  ) => {
    dispatch({ type: "AUTH_START" } as AuthAction);
    try {
      const res = await action();
      const user: AuthUser = { email: res.email, displayName: res.displayName, roles: res.roles };
      setToken(res.token);
      setStoredUser(JSON.stringify(user));
      dispatch({ type: "AUTH_SUCCESS", payload: { user, token: res.token } });
    } catch (err: any) {
      dispatch({ type: "AUTH_FAILURE", payload: err?.message || "Authentication failed" });
      throw err;
    }
  };

  const login = (req: LoginRequest) => performAuth(() => authService.login(req));
  const register = (req: RegisterRequest) => performAuth(() => authService.register(req));

  const logout = () => dispatch({ type: "LOGOUT" });
  const clearError = () => dispatch({ type: "CLEAR_ERROR" });

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        clearError,
        isAuthenticated: isAuthenticated(state),
        isAdmin: isAdmin(state),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
