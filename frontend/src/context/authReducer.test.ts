import {
  authReducer,
  initialAuthState,
  isAdmin,
  isAuthenticated,
} from "./authReducer";

describe("authReducer", () => {
  test("AUTH_START sets loading and clears error", () => {
    const start = { ...initialAuthState, error: "old" };
    const next = authReducer(start, { type: "AUTH_START" });
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  test("AUTH_SUCCESS stores user and token and clears loading", () => {
    const next = authReducer(initialAuthState, {
      type: "AUTH_SUCCESS",
      payload: {
        user: { email: "a@b.com", displayName: "A", roles: ["User"] },
        token: "jwt.token.value",
      },
    });
    expect(next.token).toBe("jwt.token.value");
    expect(next.user?.email).toBe("a@b.com");
    expect(next.loading).toBe(false);
  });

  test("LOGOUT clears user and token", () => {
    const loggedIn = {
      ...initialAuthState,
      user: { email: "a@b.com", displayName: "A", roles: ["User"] },
      token: "t",
    };
    const next = authReducer(loggedIn, { type: "LOGOUT" });
    expect(next.user).toBeNull();
    expect(next.token).toBeNull();
  });

  test("AUTH_FAILURE stores error and clears loading", () => {
    const next = authReducer(
      { ...initialAuthState, loading: true },
      { type: "AUTH_FAILURE", payload: "Invalid credentials" }
    );
    expect(next.error).toBe("Invalid credentials");
    expect(next.loading).toBe(false);
  });

  test("isAdmin / isAuthenticated helpers", () => {
    const adminState = {
      ...initialAuthState,
      user: { email: "a@b.com", displayName: "A", roles: ["Admin"] },
      token: "t",
    };
    expect(isAdmin(adminState)).toBe(true);
    expect(isAuthenticated(adminState)).toBe(true);
    expect(isAdmin(initialAuthState)).toBe(false);
    expect(isAuthenticated(initialAuthState)).toBe(false);
  });
});
