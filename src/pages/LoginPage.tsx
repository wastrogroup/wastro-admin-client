import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
import { Button } from "../components/ui/Button";
import { FormField } from "../components/ui/FormField";
import { useAuth } from "../features/auth/useAuth";
import { ApiError } from "../services/api";

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("admin@wastro.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to sign in");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-shell">
      <div className="login-watermark" aria-hidden="true" />
      <section className="login-panel">
        <header className="login-brand">
          <BrandMark size={52} variant="brand" />
          <div>
            <p className="eyebrow">Wastro Admin</p>
            <h1>Sign in</h1>
            <p className="subtitle">Manage catalog, stock, and orders in one place.</p>
          </div>
        </header>

        <form className="login-form" onSubmit={onSubmit}>
          <FormField
            label="Email"
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <FormField
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
          {error ? <p className="error">{error}</p> : null}
          <Button type="submit" variant="accent" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="login-descriptor">Medical Apparel | Equipment | More</p>
      </section>
    </main>
  );
}
