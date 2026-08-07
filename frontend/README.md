# Frontend — Aporte

Interface Next.js do desafio. Documentação completa no
[README principal](../README.md).

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev                  # http://localhost:3000
```

Pontos de interesse:

- `src/lib/api.ts` — client tipado da API (única porta de saída HTTP).
- `src/app/globals.css` — design tokens: o tema inteiro em um bloco de
  variáveis.
- `src/components/balance-chart.tsx` — gráfico SVG feito à mão (dados vêm do
  endpoint `/timeline`; o frontend não recalcula rendimento).
- `src/components/withdraw-card.tsx` — fluxo de saque em duas etapas
  (simular → confirmar) usando o `/withdrawal-preview`.

Sem dependências além do scaffold do `create-next-app`.
