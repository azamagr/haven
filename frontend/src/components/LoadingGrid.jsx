export default function LoadingGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-line bg-panel overflow-hidden animate-pulse">
          <div className="h-40 w-full bg-line/60" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-3/4 bg-line/60 rounded" />
            <div className="h-3 w-1/2 bg-line/40 rounded" />
            <div className="h-3 w-1/3 bg-line/40 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
