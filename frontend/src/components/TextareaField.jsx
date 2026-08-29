export default function TextareaField({ label, error, id, ...textareaProps }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-muted mb-1.5">
        {label}
      </label>
      <textarea
        id={id}
        {...textareaProps}
        className={`w-full bg-bg border rounded-lg px-3.5 py-2.5 text-sm placeholder:text-muted/50 focus:outline-none transition-colors resize-none ${
          error ? "border-red-400" : "border-line focus:border-teal/60"
        }`}
      />
      {error && (
        <p role="alert" className="text-xs text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
