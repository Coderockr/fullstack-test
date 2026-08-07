'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, ApiError, type WithdrawalResult } from '@/lib/api';
import { formatBRL, formatDate, formatRate, todayIso } from '@/lib/format';

interface WithdrawCardProps {
  investmentId: string;
  creationDate: string;
}

export function WithdrawCard({ investmentId, creationDate }: WithdrawCardProps) {
  const router = useRouter();
  const today = todayIso();
  const [withdrawalDate, setWithdrawalDate] = useState(today);
  const [preview, setPreview] = useState<WithdrawalResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function handleDateChange(value: string) {
    setWithdrawalDate(value);
    setPreview(null); // simulação anterior deixa de valer
    setError(null);
  }

  async function simulate() {
    setBusy(true);
    setError(null);
    try {
      setPreview(await api.previewWithdrawal(investmentId, withdrawalDate));
    } catch (cause) {
      setPreview(null);
      setError(
        cause instanceof ApiError
          ? cause.message
          : 'Não foi possível conectar à API.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await api.withdraw(investmentId, withdrawalDate);
      router.refresh(); // a página recarrega já no estado "sacado"
    } catch (cause) {
      setBusy(false);
      setError(
        cause instanceof ApiError
          ? cause.message
          : 'Não foi possível conectar à API.',
      );
    }
  }

  return (
    <section className="rounded-3xl border border-line bg-surface p-6 shadow-xl shadow-dark/5">
      <h2 className="font-semibold">Sacar investimento</h2>
      <p className="mt-1 text-sm text-muted">
        O saque é sempre total. O imposto incide apenas sobre o ganho, conforme
        a idade do investimento na data escolhida.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label htmlFor="withdrawalDate" className="text-sm font-medium">
            Data do saque
          </label>
          <input
            id="withdrawalDate"
            type="date"
            value={withdrawalDate}
            min={creationDate}
            max={today}
            onChange={(event) => handleDateChange(event.target.value)}
            className="tabular rounded-lg border border-line bg-surface-2 px-3.5 py-2 text-sm focus:border-accent/50 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={simulate}
          disabled={busy || !withdrawalDate}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy && !preview ? 'Simulando…' : 'Simular saque'}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-negative-soft px-3.5 py-2.5 text-sm text-negative"
        >
          {error}
        </p>
      )}

      {preview && (
        <div className="mt-4 space-y-3 rounded-2xl bg-dark p-5 text-on-dark">
          <p className="text-xs font-medium uppercase tracking-wider text-on-dark/60">
            Simulação para {formatDate(preview.withdrawalDate)}
          </p>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-on-dark/70">Saldo bruto</dt>
              <dd className="tabular">{formatBRL(preview.balanceCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-on-dark/70">Ganho acumulado</dt>
              <dd className="tabular">{formatBRL(preview.gainCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-on-dark/70">
                Imposto ({formatRate(preview.taxRate)} sobre o ganho)
              </dt>
              <dd className="tabular text-red-300">
                −{formatBRL(preview.taxCents)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-on-dark/15 pt-2.5">
              <dt className="text-base font-semibold">Você recebe</dt>
              <dd className="tabular text-2xl font-bold text-lime">
                {formatBRL(preview.netCents)}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={confirm}
            disabled={busy}
            className="w-full rounded-xl bg-lime px-4 py-2.5 text-sm font-bold text-dark transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? 'Confirmando…' : 'Confirmar saque'}
          </button>
        </div>
      )}
    </section>
  );
}
