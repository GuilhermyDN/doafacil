-- CreateEnum
CREATE TYPE "TipoInstituicao" AS ENUM ('Refeicao', 'Banho', 'Cobertor');

-- CreateEnum
CREATE TYPE "NivelDoador" AS ENUM ('bronze', 'prata', 'ouro', 'diamante', 'lenda');

-- CreateEnum
CREATE TYPE "TipoMissao" AS ENUM ('PRIMEIRA_DOACAO', 'FAMILIA', 'META_REFEICAO', 'MES_COMPLETO', 'META_VALOR', 'INDICACAO', 'CUSTOM');

-- CreateEnum
CREATE TYPE "RoleAdmin" AS ENUM ('SUPER_ADMIN', 'ADMIN');

-- CreateTable
CREATE TABLE "Instituicao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoInstituicao" NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "cor" TEXT NOT NULL,
    "bg" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "pixKey" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Instituicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doacao" (
    "id" SERIAL NOT NULL,
    "doadorNome" TEXT NOT NULL,
    "doadorEmail" TEXT,
    "doadorId" INTEGER,
    "instituicaoId" INTEGER NOT NULL,
    "eventoId" INTEGER,
    "quantidade" INTEGER NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPagamento" TIMESTAMP(3),
    "observacao" TEXT,

    CONSTRAINT "Doacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doador" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "apelido" TEXT,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "avatar" TEXT NOT NULL,
    "totalDoado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pontos" INTEGER NOT NULL DEFAULT 0,
    "nivel" "NivelDoador" NOT NULL DEFAULT 'bronze',
    "badge" TEXT,
    "homenagem" TEXT,
    "missaoCompleta" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Doador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Missao" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "pontos" INTEGER NOT NULL,
    "emoji" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "tipo" "TipoMissao" NOT NULL,

    CONSTRAINT "Missao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissaoDoador" (
    "id" SERIAL NOT NULL,
    "doadorId" INTEGER NOT NULL,
    "missaoId" INTEGER NOT NULL,
    "completa" BOOLEAN NOT NULL DEFAULT false,
    "completaEm" TIMESTAMP(3),

    CONSTRAINT "MissaoDoador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "dataEvento" TIMESTAMP(3) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QREvento" (
    "id" SERIAL NOT NULL,
    "eventoId" INTEGER NOT NULL,
    "instituicaoId" INTEGER NOT NULL,
    "urlDoacao" TEXT NOT NULL,
    "qrCodeBase64" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "QREvento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" SERIAL NOT NULL,
    "instituicaoId" INTEGER NOT NULL,
    "desc" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "comprovante" BOOLEAN NOT NULL DEFAULT false,
    "arquivoUrl" TEXT,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "role" "RoleAdmin" NOT NULL DEFAULT 'ADMIN',

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Doador_email_key" ON "Doador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MissaoDoador_doadorId_missaoId_key" ON "MissaoDoador"("doadorId", "missaoId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "Doacao" ADD CONSTRAINT "Doacao_doadorId_fkey" FOREIGN KEY ("doadorId") REFERENCES "Doador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doacao" ADD CONSTRAINT "Doacao_instituicaoId_fkey" FOREIGN KEY ("instituicaoId") REFERENCES "Instituicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doacao" ADD CONSTRAINT "Doacao_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissaoDoador" ADD CONSTRAINT "MissaoDoador_doadorId_fkey" FOREIGN KEY ("doadorId") REFERENCES "Doador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissaoDoador" ADD CONSTRAINT "MissaoDoador_missaoId_fkey" FOREIGN KEY ("missaoId") REFERENCES "Missao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QREvento" ADD CONSTRAINT "QREvento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QREvento" ADD CONSTRAINT "QREvento_instituicaoId_fkey" FOREIGN KEY ("instituicaoId") REFERENCES "Instituicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_instituicaoId_fkey" FOREIGN KEY ("instituicaoId") REFERENCES "Instituicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
