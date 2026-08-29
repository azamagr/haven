import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { validateEmail, validatePassword, validateName } from "../utils/validators";
import TextField from "../components/TextField";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("guest");
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const errors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: password !== confirmPassword ? "Passwords don't match." : "",
    };
    setFieldErrors(errors);
    return Object.values(errors).every((e) => !e);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await signup({ name: name.trim(), email: email.trim(), password, role });
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(err.message || "Couldn't create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <h1 className="font-display font-bold text-3xl text-center mb-6">Join Haven</h1>

        <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-line bg-panel p-6 space-y-4">
          <fieldset>
            <legend className="block text-xs font-medium text-muted mb-1.5">I want to…</legend>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("guest")}
                className={`text-sm px-3 py-2.5 rounded-lg border transition-colors ${
                  role === "guest" ? "bg-teal text-teal-ink border-teal" : "border-line text-muted"
                }`}
              >
                Book a stay
              </button>
              <button
                type="button"
                onClick={() => setRole("host")}
                className={`text-sm px-3 py-2.5 rounded-lg border transition-colors ${
                  role === "host" ? "bg-teal text-teal-ink border-teal" : "border-line text-muted"
                }`}
              >
                Host a place
              </button>
            </div>
          </fieldset>

          <TextField id="signup-name" label="Full name" type="text" value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name} />
          <TextField id="signup-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} />
          <div>
            <TextField
              id="signup-password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
            />
            {!fieldErrors.password && (
              <p className="text-xs text-muted/60 mt-1">At least 8 characters, including a number.</p>
            )}
          </div>
          <TextField
            id="signup-confirm"
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
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
            {submitting ? "Creating account…" : "Sign up"}
          </button>

          <p className="text-xs text-center text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-teal hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
