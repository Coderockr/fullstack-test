'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-line bg-surface px-6 py-16 text-center shadow-xl shadow-dark/5">
      <p className="text-lg font-medium">Não foi possível carregar os dados</p>
      <p className="max-w-sm text-sm text-muted">
        A API pode estar iniciando (no plano gratuito ela hiberna após
        inatividade — o primeiro acesso leva até um minuto). Tente novamente.
      </p>
      <button onClick={reset} className="btn-primary px-4 py-2 text-sm">
        Tentar novamente
      </button>
    </div>
  );
}
