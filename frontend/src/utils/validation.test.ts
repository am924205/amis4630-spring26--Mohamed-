import {
  isValidEmail,
  isValidPassword,
  validateLoginForm,
  validateRegisterForm,
} from "./validation";

describe("validation helpers", () => {
  test("isValidEmail accepts well-formed addresses", () => {
    expect(isValidEmail("student@osu.edu")).toBe(true);
    expect(isValidEmail("a.b+c@example.com")).toBe(true);
  });

  test("isValidEmail rejects malformed addresses", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("no-at-symbol")).toBe(false);
    expect(isValidEmail("foo@bar")).toBe(false);
  });

  test("isValidPassword enforces length, digit, uppercase", () => {
    expect(isValidPassword("Abcdef12")).toBe(true);
    expect(isValidPassword("short1A")).toBe(false);
    expect(isValidPassword("alllowercase1")).toBe(false);
    expect(isValidPassword("NoDigitsHere")).toBe(false);
  });

  test("validateRegisterForm flags all missing fields", () => {
    const errors = validateRegisterForm({ email: "", password: "", displayName: "" });
    expect(errors.email).toBeTruthy();
    expect(errors.password).toBeTruthy();
    expect(errors.displayName).toBeTruthy();
  });

  test("validateLoginForm returns empty object when valid", () => {
    const errors = validateLoginForm({ email: "x@y.com", password: "anything" });
    expect(errors).toEqual({});
  });
});
