-- CreateTable
CREATE TABLE "investments" (
    "id" UUID NOT NULL,
    "owner" TEXT NOT NULL,
    "amount_cents" BIGINT NOT NULL,
    "creation_date" DATE NOT NULL,
    "withdrawn_at" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "investments_owner_creation_date_idx" ON "investments"("owner", "creation_date");

-- Regras do domínio garantidas também no banco (defesa em profundidade):
-- um bug na aplicação não consegue gravar investimento negativo nem saque antes da criação
ALTER TABLE "investments"
  ADD CONSTRAINT "investments_amount_non_negative" CHECK ("amount_cents" >= 0);

ALTER TABLE "investments"
  ADD CONSTRAINT "investments_withdrawal_not_before_creation"
  CHECK ("withdrawn_at" IS NULL OR "withdrawn_at" >= "creation_date");
