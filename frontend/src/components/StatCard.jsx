export default function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
        <Icon className="w-4 h-4 text-muted" />
      </div>
      <p className="font-mono font-semibold text-2xl mt-3">{value}</p>
    </div>
  );
}
