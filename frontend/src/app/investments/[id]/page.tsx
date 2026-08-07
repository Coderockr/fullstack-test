import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { formatBRL, formatDate, formatRate } from '@/lib/format';
import { Avatar } from '@/components/avatar';
import { BalanceChart } from '@/components/balance-chart';
import { StatusBadge } from '@/components/status-badge';
import { WithdrawCard } from '@/components/withdraw-card';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Investimento' };

// Tri-tom da identidade: branco, escuro-oliva e lima lado a lado
const METRIC_VARIANTS = {
  white: {
    card: 'border border-line bg-surface',
    label: 'text-muted',
    value: 'text-foreground',
    hint: 'text-muted',
  },
  dark: {
    card: 'bg-dark',
    label: 'text-on-dark/60',
    value: 'text-lime',
    hint: 'text-on-dark/60',
  },
  lime: {
    card: 'border border-dark/10 bg-lime',
    label: 'text-foreground/60',
    value: 'text-foreground',
    hint: 'text-foreground/70',
  },
} as const;

function MetricCard({
  label,
  value,
  variant = 'white',
  hint,
}: {
  label: string;
  value: string;
  variant?: keyof typeof METRIC_VARIANTS;
  hint?: string;
}) {
  const styles = METRIC_VARIANTS[variant];
  return (
    <div className={`rounded-3xl p-5 shadow-lg shadow-dark/5 ${styles.card}`}>
      <p
        className={`text-xs font-medium uppercase tracking-wider ${styles.label}`}
      >
        {label}
      </p>
      <p className={`tabular mt-1.5 text-2xl font-bold ${styles.value}`}>
        {value}
      </p>
      {hint && <p className={`mt-1 text-xs ${styles.hint}`}>{hint}</p>}
    </div>
  );
}

export default async function InvestmentPage({
  params,
}: PageProps<'/investments/[id]'>) {
  const { id } = await params;

  let detail, timeline;
  try {
    [detail, timeline] = await Promise.all([api.get(id), api.timeline(id)]);
  } catch (cause) {
    if (
      cause instanceof ApiError &&
      (cause.status === 404 || cause.status === 400)
    ) {
      notFound();
    }
    throw cause;
  }

  const yieldPercent =
    detail.amountCents > 0
      ? ((detail.gainCents / detail.amountCents) * 100).toLocaleString(
          'pt-BR',
          { maximumFractionDigits: 2 },
        )
      : '0';

  return (
    <div className="space-y-6">
      <div className="fade-up">
        <Link
          href="/"
          className="text-sm text-muted transition hover:text-foreground"
        >
          ← Investimentos
        </Link>
        <div className="mt-3 flex items-center gap-4">
          <Avatar name={detail.owner} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight">
                {detail.owner}
              </h1>
              <StatusBadge status={detail.status} />
            </div>
            <p className="mt-1 text-sm text-muted">
              Criado em {formatDate(detail.creationDate)}
              {detail.withdrawnAt && (
                <> · sacado em {formatDate(detail.withdrawnAt)}</>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="fade-up fade-up-delay-1 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Valor investido"
          value={formatBRL(detail.amountCents)}
        />
        <MetricCard
          label={detail.withdrawnAt ? 'Saldo na data do saque' : 'Saldo esperado'}
          value={formatBRL(detail.balanceCents)}
          variant="dark"
          hint={
            detail.withdrawnAt
              ? 'Congelado na data do saque'
              : 'Valor investido + ganhos compostos até hoje'
          }
        />
        <MetricCard
          label="Ganho acumulado"
          value={formatBRL(detail.gainCents)}
          variant="lime"
          hint={`+${yieldPercent}% sobre o valor inicial`}
        />
      </div>

      <section className="fade-up fade-up-delay-1 rounded-3xl border border-line bg-surface p-6 shadow-xl shadow-dark/5">
        <h2 className="font-semibold">Evolução do saldo</h2>
        <p className="mb-4 mt-1 text-sm text-muted">
          O ganho de 0,52% é pago a cada aniversário mensal da criação e passa a
          compor o saldo seguinte.
        </p>
        <BalanceChart points={timeline.points} />
      </section>

      <div className="fade-up fade-up-delay-2">
        {detail.withdrawal ? (
          <section className="rounded-3xl border border-line bg-surface p-6 shadow-xl shadow-dark/5">
            <h2 className="font-semibold">Detalhes do saque</h2>
            <dl className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Data do saque</dt>
                <dd>{formatDate(detail.withdrawal.withdrawalDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Saldo bruto</dt>
                <dd className="tabular">
                  {formatBRL(detail.withdrawal.balanceCents)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Ganho tributável</dt>
                <dd className="tabular">
                  {formatBRL(detail.withdrawal.gainCents)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">
                  Imposto ({formatRate(detail.withdrawal.taxRate)} sobre o
                  ganho)
                </dt>
                <dd className="tabular text-negative">
                  −{formatBRL(detail.withdrawal.taxCents)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
                <dt>Valor recebido</dt>
                <dd className="tabular text-accent">
                  {formatBRL(detail.withdrawal.netCents)}
                </dd>
              </div>
            </dl>
          </section>
        ) : (
          <WithdrawCard
            investmentId={detail.id}
            creationDate={detail.creationDate}
          />
        )}
      </div>
    </div>
  );
}
