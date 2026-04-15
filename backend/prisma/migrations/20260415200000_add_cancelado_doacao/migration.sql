-- AlterTable: adiciona campo cancelado na Doacao para marcar PIX expirados
ALTER TABLE "Doacao" ADD COLUMN IF NOT EXISTS "cancelado" BOOLEAN NOT NULL DEFAULT false;
