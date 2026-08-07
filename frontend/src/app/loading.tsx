export default function Loading() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="h-8 w-56 animate-pulse rounded-lg bg-surface-2" />
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-2xl bg-surface-2/70"
            style={{ animationDelay: `${index * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
