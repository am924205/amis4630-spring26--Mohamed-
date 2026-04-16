export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): boolean {
  if (!password || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

export interface RegisterFormErrors {
  email?: string;
  password?: string;
  displayName?: string;
}

export function validateRegisterForm(input: {
  email: string;
  password: string;
  displayName: string;
}): RegisterFormErrors {
  const errors: RegisterFormErrors = {};
  if (!input.email) errors.email = "Email is required.";
  else if (!isValidEmail(input.email)) errors.email = "Enter a valid email address.";
  if (!input.password) errors.password = "Password is required.";
  else if (!isValidPassword(input.password))
    errors.password = "Password must be 8+ characters with at least one uppercase letter and one digit.";
  if (!input.displayName) errors.displayName = "Display name is required.";
  return errors;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export function validateLoginForm(input: { email: string; password: string }): LoginFormErrors {
  const errors: LoginFormErrors = {};
  if (!input.email) errors.email = "Email is required.";
  else if (!isValidEmail(input.email)) errors.email = "Enter a valid email address.";
  if (!input.password) errors.password = "Password is required.";
  return errors;
}
