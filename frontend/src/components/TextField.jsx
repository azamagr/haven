import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function TextField({ label, error, type, id, ...inputProps }) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (revealed ? "text" : "password") : type;

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-muted mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          {...inputProps}
          className={`w-full bg-bg border rounded-lg px-3.5 py-2.5 text-sm placeholder:text-muted/50 focus:outline-none transition-colors ${
            isPassword ? "pr-10" : ""
          } ${error ? "border-red-400" : "border-line focus:border-teal/60"}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            tabIndex={-1}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
          >
            {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
