import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatBRL, formatDate } from '@/lib/format';
import { Avatar } from '@/components/avatar';
import { Asterisk } from '@/components/glyphs';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/status-badge';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 8;

function SearchForm({ owner }: { owner?: string }) {
  return (
    <form action="/" className="flex gap-2">
      <input
        type="search"
        name="owner"
        defaultValue={owner}
        placeholder="Buscar por titular…"
        className="w-full max-w-xs rounded-lg border border-line bg-surface px-3.5 py-2 text-sm placeholder:text-muted/70 focus:border-accent/50 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-lg border border-line px-4 py-2 text-sm transition hover:bg-surface-2"
      >
        Buscar
      </button>
      {owner && (
        <Link
          href="/"
          className="self-center px-2 text-sm text-muted transition hover:text-foreground"
        >
          Limpar
        </Link>
      )}
    </form>
  );
}

function Hero() {
  return (
    <section className="fade-up relative min-h-64 overflow-hidden rounded-3xl bg-dark px-7 py-8 shadow-xl shadow-dark/20">
      <div className="relative z-10 max-w-md">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-lime">
          <Asterisk size={12} />
          Rendimento composto
        </p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-on-dark sm:text-4xl">
          Seu dinheiro rendendo{' '}
          <span className="text-lime">0,52% ao mês</span>
        </h1>
        <p className="mt-3 text-sm text-on-dark/70">
          O ganho entra no saldo a cada aniversário mensal e passa a render
          junto. Simule o saque antes de confirmar e veja o valor líquido já com
          imposto.
        </p>
      </div>
      {/* As duas fotos ocupam o mesmo lugar e alternam por opacidade */}
      <div className="pointer-events-none absolute bottom-0 right-8 hidden h-60 w-48 md:block">
        <Image
          src="/person-1.png"
          alt=""
          width={513}
          height={665}
          priority
          className="hero-photo-a absolute bottom-0 right-0 h-60 w-auto object-contain"
        />
        <Image
          src="/person-2-hero.png"
          alt=""
          width={580}
          height={752}
          className="hero-photo-b absolute bottom-0 right-0 h-60 w-auto object-contain"
        />
      </div>
    </section>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="fade-up relative overflow-hidden rounded-3xl border border-dashed border-line bg-surface px-6 py-14">
      <div className="relative z-10 max-w-sm">
        <p className="text-lg font-bold">
          {filtered
            ? 'Nenhum investimento encontrado'
            : 'Nenhum investimento ainda'}
        </p>
        <p className="mt-1.5 text-sm text-muted">
          {filtered
            ? 'Tente outro nome de titular ou limpe a busca.'
            : 'Crie o primeiro investimento para começar a acompanhar o rendimento composto.'}
        </p>
        {!filtered && (
          <Link
            href="/investments/new"
            className="btn-primary mt-5 inline-block px-4 py-2 text-sm"
          >
            Criar investimento
          </Link>
        )}
      </div>
      <Image
        src="/person-2.png"
        alt=""
        width={580}
        height={1221}
        className="pointer-events-none absolute -bottom-6 right-4 hidden h-64 w-auto object-contain opacity-95 sm:block"
      />
    </div>
  );
}

export default async function Home({ searchParams }: PageProps<'/'>) {
  const params = await searchParams;
  const owner = typeof params.owner === 'string' && params.owner ? params.owner : undefined;
  const page = Math.max(1, Number(params.page) || 1);
  const result = await api.list({ owner, page, limit: PAGE_SIZE });

  return (
    <div className="space-y-6">
      <Hero />

      <div className="fade-up fade-up-delay-1 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight">
            Investimentos
            <Asterisk size={22} className="shrink-0" />
          </h2>
          <p className="mt-1 text-sm text-muted">
            {result.total === 0
              ? 'Nenhum registro'
              : `${result.total} ${result.total === 1 ? 'investimento' : 'investimentos'}`}
            {owner && (
              <>
                {' '}de <span className="text-foreground">{owner}</span>
              </>
            )}
          </p>
        </div>
        <SearchForm owner={owner} />
      </div>

      {result.data.length === 0 ? (
        <EmptyState filtered={Boolean(owner)} />
      ) : (
        <>
          {/* Desktop: tabela */}
          <div className="fade-up fade-up-delay-1 hidden overflow-hidden rounded-3xl border border-line bg-surface shadow-xl shadow-dark/5 md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5 font-medium">Titular</th>
                  <th className="px-5 py-3.5 font-medium">Criado em</th>
                  <th className="px-5 py-3.5 text-right font-medium">Valor investido</th>
                  <th className="px-5 py-3.5 text-right font-medium">Saldo atual</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="w-10" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {result.data.map((investment) => (
                  <tr
                    key={investment.id}
                    className="group relative border-b border-line/60 transition last:border-0 hover:bg-surface-2/60"
                  >
                    <td className="px-5 py-4 font-medium">
                      <span className="flex items-center gap-3">
                        <Avatar name={investment.owner} size="sm" />
                        <Link
                          href={`/investments/${investment.id}`}
                          className="after:absolute after:inset-0"
                        >
                          {investment.owner}
                        </Link>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {formatDate(investment.creationDate)}
                    </td>
                    <td className="tabular px-5 py-4 text-right">
                      {formatBRL(investment.amountCents)}
                    </td>
                    <td className="tabular px-5 py-4 text-right font-medium text-accent">
                      {formatBRL(investment.balanceCents)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={investment.status} />
                    </td>
                    <td className="px-3 py-4 text-muted/50 transition group-hover:text-accent">
                      →
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="fade-up fade-up-delay-1 space-y-3 md:hidden">
            {result.data.map((investment) => (
              <li key={investment.id}>
                <Link
                  href={`/investments/${investment.id}`}
                  className="block rounded-3xl border border-line bg-surface p-4 shadow-lg shadow-dark/5 transition active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2.5 font-medium">
                      <Avatar name={investment.owner} size="sm" />
                      {investment.owner}
                    </span>
                    <StatusBadge status={investment.status} />
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div className="text-xs text-muted">
                      <p>Criado em {formatDate(investment.creationDate)}</p>
                      <p className="tabular mt-0.5">
                        Investido: {formatBRL(investment.amountCents)}
                      </p>
                    </div>
                    <span className="tabular font-semibold text-accent">
                      {formatBRL(investment.balanceCents)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="fade-up fade-up-delay-2">
            <Pagination page={result.page} totalPages={result.totalPages} owner={owner} />
          </div>
        </>
      )}
    </div>
  );
}
