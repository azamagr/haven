import { ChevronDown } from "lucide-react";

export default function SelectField({ label, error, options, id, ...selectProps }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-muted mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          {...selectProps}
          className={`w-full appearance-none bg-bg border rounded-lg pl-3.5 pr-9 py-2.5 text-sm focus:outline-none transition-colors ${
            error ? "border-red-400" : "border-line focus:border-teal/60"
          }`}
        >
          <option value="">Select…</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
