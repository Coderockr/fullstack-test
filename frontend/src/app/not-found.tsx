import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-line bg-surface px-6 py-16 text-center shadow-xl shadow-dark/5">
      <p className="text-lg font-medium">Investimento não encontrado</p>
      <p className="max-w-sm text-sm text-muted">
        O registro pode ter sido removido ou o endereço está incorreto.
      </p>
      <Link href="/" className="btn-primary px-4 py-2 text-sm">
        Voltar para investimentos
      </Link>
    </div>
  );
}
