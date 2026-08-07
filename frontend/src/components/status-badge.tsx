export function StatusBadge({ status }: { status: 'ACTIVE' | 'WITHDRAWN' }) {
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
        Ativo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-muted" aria-hidden />
      Sacado
    </span>
  );
}
