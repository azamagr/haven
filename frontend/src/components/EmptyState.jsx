export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <Icon className="w-9 h-9 text-muted mx-auto" strokeWidth={1.5} />
      <p className="text-ink font-medium mt-3">{title}</p>
      <p className="text-sm text-muted mt-1">{description}</p>
      {action}
    </div>
  );
}
