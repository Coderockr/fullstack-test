import type { Metadata } from 'next';
import Link from 'next/link';
import { CreateForm } from '@/components/create-form';

export const metadata: Metadata = { title: 'Novo investimento' };

export default function NewInvestmentPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="fade-up">
        <Link
          href="/"
          className="text-sm text-muted transition hover:text-foreground"
        >
          ← Investimentos
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          Novo investimento
        </h1>
        <p className="mt-1 text-sm text-muted">
          Rende 0,52% ao mês, composto, pago a cada aniversário mensal da
          criação.
        </p>
      </div>
      <div className="fade-up fade-up-delay-1 rounded-3xl border border-line bg-surface p-6 shadow-xl shadow-dark/5">
        <CreateForm />
      </div>
    </div>
  );
}
