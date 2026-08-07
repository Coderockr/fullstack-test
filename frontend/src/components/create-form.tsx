'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { formatBRL, todayIso } from '@/lib/format';

const inputClass =
  'w-full rounded-lg border border-line bg-surface-2 px-3.5 py-2.5 text-sm placeholder:text-muted/60 focus:border-accent/50 focus:outline-none';

export function CreateForm() {
  const router = useRouter();
  const today = todayIso();
  const [owner, setOwner] = useState('');
  const [amountCents, setAmountCents] = useState<number | null>(null);
  const [creationDate, setCreationDate] = useState(today);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Máscara: o usuário digita dígitos e o campo exibe reais formatados.
  // O estado guarda centavos inteiros — o mesmo formato que a API espera.
  function handleAmountChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 13);
    setAmountCents(digits ? Number.parseInt(digits, 10) : null);
  }

  const canSubmit =
    owner.trim().length > 0 && amountCents !== null && !submitting;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit || amountCents === null) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.create({
        owner: owner.trim(),
        amountCents,
        creationDate,
      });
      router.push(`/investments/${created.id}`);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : 'Não foi possível conectar à API. Tente novamente.',
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="owner" className="text-sm font-medium">
          Titular
        </label>
        <input
          id="owner"
          type="text"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          placeholder="Nome de quem investe"
          maxLength={120}
          required
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="amount" className="text-sm font-medium">
          Valor inicial
        </label>
        <input
          id="amount"
          type="text"
          inputMode="numeric"
          value={amountCents === null ? '' : formatBRL(amountCents)}
          onChange={(event) => handleAmountChange(event.target.value)}
          placeholder="R$ 0,00"
          required
          className={`${inputClass} tabular`}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="creationDate" className="text-sm font-medium">
          Data de criação
        </label>
        <input
          id="creationDate"
          type="date"
          value={creationDate}
          max={today}
          onChange={(event) => setCreationDate(event.target.value)}
          required
          className={inputClass}
        />
        <p className="text-xs text-muted">Hoje ou uma data no passado.</p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-negative-soft px-3.5 py-2.5 text-sm text-negative"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="btn-primary w-full px-4 py-2.5 text-sm"
      >
        {submitting ? 'Criando…' : 'Criar investimento'}
      </button>
    </form>
  );
}
