# API — Aporte

API NestJS do desafio. Documentação completa no [README principal](../README.md).

```bash
npm install
cp .env.example .env
npx prisma dev --detach    # Postgres local
npx prisma migrate dev
npx prisma generate
npm run start:dev          # http://localhost:3001 · Swagger em /docs
```

Testes: `npm test` — a regra de negócio inteira (juro composto, imposto,
validações) vive em `src/investments/domain/investment-math.ts` como funções
puras, cobertas por 10 testes de fronteira.

Deploy: blueprint em [`../render.yaml`](../render.yaml). O build roda
`prisma generate` (o client gerado não é versionado) e `prisma migrate deploy`
ao final.
