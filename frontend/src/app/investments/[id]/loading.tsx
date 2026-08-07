export default function Loading() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="h-8 w-64 animate-pulse rounded-lg bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl bg-surface-2/70"
            style={{ animationDelay: `${index * 80}ms` }}
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-surface-2/70" />
    </div>
  );
}
