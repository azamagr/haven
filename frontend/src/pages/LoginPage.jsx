import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { validateEmail } from "../utils/validators";
import TextField from "../components/TextField";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const errors = { email: validateEmail(email), password: password ? "" : "Password is required." };
    setFieldErrors(errors);
    return Object.values(errors).every((e) => !e);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err.message || "Couldn't log you in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <h1 className="font-display font-bold text-3xl text-center mb-6">Welcome back</h1>

        <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-line bg-panel p-6 space-y-4">
          <TextField
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />
          <TextField
            id="login-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          {serverError && (
            <p role="alert" className="text-sm text-red-600 text-center">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-teal text-teal-ink font-medium text-sm px-4 py-2.5 rounded-full hover:brightness-110 transition disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Logging in…" : "Log in"}
          </button>

          <p className="text-xs text-center text-muted">
            Don't have an account?{" "}
            <Link to="/signup" className="text-teal hover:underline">
              Sign up
            </Link>
          </p>
          <p className="text-xs text-center text-muted/70 font-mono">
            demo: host@haven.test / guest@haven.test — password123
          </p>
        </form>
      </div>
    </main>
  );
}
