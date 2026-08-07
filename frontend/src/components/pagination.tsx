import Link from 'next/link';

interface PaginationProps {
  page: number;
  totalPages: number;
  owner?: string;
}

function pageHref(page: number, owner?: string): string {
  const query = new URLSearchParams();
  if (owner) query.set('owner', owner);
  if (page > 1) query.set('page', String(page));
  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  return `/${suffix}`;
}

export function Pagination({ page, totalPages, owner }: PaginationProps) {
  if (totalPages <= 1) return null;

  const linkClass =
    'rounded-xl border border-line bg-surface px-3.5 py-1.5 text-sm font-medium transition hover:bg-surface-2';
  const disabledClass =
    'rounded-xl border border-line/50 px-3.5 py-1.5 text-sm text-muted/60 cursor-not-allowed';

  return (
    <nav aria-label="Paginação" className="flex items-center justify-between">
      {page > 1 ? (
        <Link href={pageHref(page - 1, owner)} className={linkClass}>
          ← Anterior
        </Link>
      ) : (
        <span className={disabledClass}>← Anterior</span>
      )}
      <span className="text-sm text-muted">
        Página {page} de {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={pageHref(page + 1, owner)} className={linkClass}>
          Próxima →
        </Link>
      ) : (
        <span className={disabledClass}>Próxima →</span>
      )}
    </nav>
  );
}
