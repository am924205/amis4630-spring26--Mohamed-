import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validateLoginForm, LoginFormErrors } from "../utils/validation";

const LoginForm: React.FC = () => {
  const { login, state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginFormErrors>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validateLoginForm({ email, password });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;
    try {
      await login({ email, password });
      const dest = location.state?.from || "/";
      navigate(dest, { replace: true });
    } catch {
      /* handled in state.error */
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Log In</h1>
        <form onSubmit={handleSubmit} noValidate>
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
          </div>
          {state.error && <p className="auth-error auth-error--banner" role="alert">{state.error}</p>}
          <button type="submit" className="auth-submit" disabled={state.loading}>
            {state.loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <p className="auth-card__footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
