import { prisma } from './prisma'
import { TipoMissao, NivelDoador } from '@prisma/client'

// Níveis baseados em número de doações realizadas (ações)
export const NIVEIS_CONFIG = [
  { nivel: 'killer'   as NivelDoador, acoes: 5000, nome: 'KILLER',    preco: 1000, emoji: '👑', cor: '#0f0f0f', desc: '5000 ações' },
  { nivel: 'goat'     as NivelDoador, acoes: 2000, nome: 'G.O.A.T',   preco: 600,  emoji: '🐐', cor: '#d4a017', desc: '2000 ações' },
  { nivel: 'topnotch' as NivelDoador, acoes: 1000, nome: 'TOP-NOTCH', preco: 400,  emoji: '💠', cor: '#4f9ef8', desc: '1000 ações' },
  { nivel: 'fstar'    as NivelDoador, acoes: 500,  nome: 'F★★',       preco: 300,  emoji: '🔥', cor: '#e05c1a', desc: '500 ações'  },
  { nivel: 'ruler'    as NivelDoador, acoes: 200,  nome: 'RULER',     preco: 200,  emoji: '💚', cor: '#22c55e', desc: '200 ações'  },
  { nivel: 'tough'    as NivelDoador, acoes: 100,  nome: 'TOUGH',     preco: 100,  emoji: '🤍', cor: '#9ca3af', desc: '100 ações'  },
  { nivel: 'cool'     as NivelDoador, acoes: 50,   nome: 'COOL',      preco: 100,  emoji: '🩵', cor: '#7dd3fc', desc: '50 ações'   },
  { nivel: 'nice'     as NivelDoador, acoes: 20,   nome: 'NICE',      preco: 100,  emoji: '🩶', cor: '#c4c4c4', desc: '20 ações'   },
]

export const DONOR_PATCH = { nome: 'DONOR', preco: 500, emoji: '💜', desc: 'Para quem já doou ao menos 1 vez' }

export function calcularNivel(totalDoacoes: number): { nivel: NivelDoador; badge: string } {
  for (const n of NIVEIS_CONFIG) {
    if (totalDoacoes >= n.acoes) return { nivel: n.nivel, badge: `${n.emoji} ${n.nome}` }
  }
  return { nivel: 'nice', badge: '🩶 NICE' }
}

export function nivelConfig(nivel: NivelDoador) {
  return NIVEIS_CONFIG.find(n => n.nivel === nivel) ?? NIVEIS_CONFIG[NIVEIS_CONFIG.length - 1]
}

export async function verificarMissoesAutomaticas(doadorId: number) {
  const doador = await prisma.doador.findUnique({ where: { id: doadorId } })
  if (!doador) return

  const doacoesConfirmadas = await prisma.doacao.findMany({
    where: { doadorId, pago: true },
  })

  await tentarCompletarMissao(doadorId, TipoMissao.PRIMEIRA_DOACAO, doacoesConfirmadas.length === 1)

  await tentarCompletarMissao(doadorId, TipoMissao.META_VALOR, doador.totalDoado >= 200)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const doacoesMes = doacoesConfirmadas.filter((d: any) => {
    const dt = d.dataPagamento || d.dataCriacao
    return dt >= startOfMonth && dt <= endOfMonth
  })
  const semanasDistintas = new Set(
    doacoesMes.map((d: any) => {
      const dt: Date = d.dataPagamento || d.dataCriacao
      return Math.floor((dt.getDate() - 1) / 7)
    })
  )
  await tentarCompletarMissao(doadorId, TipoMissao.MES_COMPLETO, semanasDistintas.size >= 4)
}

async function tentarCompletarMissao(doadorId: number, tipo: TipoMissao, condicao: boolean) {
  if (!condicao) return

  const missao = await prisma.missao.findFirst({ where: { tipo, ativa: true } })
  if (!missao) return

  const existing = await prisma.missaoDoador.findUnique({
    where: { doadorId_missaoId: { doadorId, missaoId: missao.id } },
  })
  if (existing?.completa) return

  if (existing) {
    await prisma.missaoDoador.update({
      where: { id: existing.id },
      data: { completa: true, completaEm: new Date() },
    })
  } else {
    await prisma.missaoDoador.create({
      data: { doadorId, missaoId: missao.id, completa: true, completaEm: new Date() },
    })
  }

  const doadorAtualizado = await prisma.doador.update({
    where: { id: doadorId },
    data: { pontos: { increment: missao.pontos }, missaoCompleta: true },
  })

  // recalcula nível baseado no total de doações
  const totalDoacoes = await prisma.doacao.count({ where: { doadorId, pago: true } })
  const { nivel, badge } = calcularNivel(totalDoacoes)
  await prisma.doador.update({ where: { id: doadorId }, data: { nivel, badge } })
}
