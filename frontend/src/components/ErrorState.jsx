import { CloudOff, RotateCcw } from "lucide-react";

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <CloudOff className="w-9 h-9 text-muted mx-auto" strokeWidth={1.5} />
      <p className="text-ink font-medium mt-3">Something went wrong.</p>
      <p className="text-sm text-muted mt-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 mt-5 bg-teal text-teal-ink font-medium text-sm px-5 py-2.5 rounded-full hover:brightness-110 transition"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
      )}
    </div>
  );
}
