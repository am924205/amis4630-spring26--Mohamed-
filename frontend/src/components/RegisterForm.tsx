import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validateRegisterForm, RegisterFormErrors } from "../utils/validation";

const RegisterForm: React.FC = () => {
  const { register, state } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errors, setErrors] = useState<RegisterFormErrors>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validateRegisterForm({ email, password, displayName });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;
    try {
      await register({ email, password, displayName });
      navigate("/", { replace: true });
    } catch {
      /* handled in state.error */
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Create Account</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              aria-invalid={!!errors.displayName}
            />
            {errors.displayName && <p className="auth-error" role="alert">{errors.displayName}</p>}
          </div>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="auth-error" role="alert">{errors.email}</p>}
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
            />
            {errors.password && <p className="auth-error" role="alert">{errors.password}</p>}
            <p className="auth-hint">8+ chars, 1 uppercase, 1 number</p>
          </div>
          {state.error && <p className="auth-error auth-error--banner" role="alert">{state.error}</p>}
          <button type="submit" className="auth-submit" disabled={state.loading}>
            {state.loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
