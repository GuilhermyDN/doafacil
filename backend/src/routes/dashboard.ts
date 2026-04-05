import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'

const router = Router()
router.use(authMiddleware)

// GET /api/admin/dashboard/resumo
router.get('/resumo', async (_req: Request, res: Response) => {
  try {
    const doacoesConfirmadas = await prisma.doacao.findMany({
      where: { pago: true },
      include: { instituicao: true },
    })

    const doacoesPendentes = await prisma.doacao.findMany({ where: { pago: false } })

    const totalArrecadado = Math.round(doacoesConfirmadas.reduce((sum: number, d: any) => sum + d.valorTotal, 0) * 100) / 100
    const totalRepassado  = Math.round(totalArrecadado * 0.82 * 100) / 100
    const totalPendente   = Math.round(doacoesPendentes.reduce((sum: number, d: any) => sum + d.valorTotal, 0) * 100) / 100
    const pessoasAjudadas = doacoesConfirmadas.reduce((sum: number, d: any) => sum + d.quantidade, 0)

    // Agrupamento por instituição
    const porInst: Record<number, { nome: string; total: number }> = {}
    for (const d of doacoesConfirmadas) {
      if (!porInst[d.instituicaoId]) {
        porInst[d.instituicaoId] = { nome: d.instituicao.nome, total: 0 }
      }
      porInst[d.instituicaoId].total = Math.round((porInst[d.instituicaoId].total + d.valorTotal) * 100) / 100
    }

    const doacoesPorInstituicao = Object.entries(porInst).map(([id, { nome, total }]) => ({
      instituicaoId: Number(id),
      nome,
      total,
      percentual: totalArrecadado > 0 ? Math.round((total / totalArrecadado) * 100) : 0,
    }))

    // Sparklines: últimos 7 meses
    const sparklines: { label: string; valores: number[] }[] = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleString('pt-BR', { month: 'short' })
      const inicio = new Date(d.getFullYear(), d.getMonth(), 1)
      const fim = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      const total = doacoesConfirmadas
        .filter((dc: any) => dc.dataPagamento && dc.dataPagamento >= inicio && dc.dataPagamento <= fim)
        .reduce((sum: number, dc: any) => sum + dc.valorTotal, 0)
      sparklines.push({ label, valores: [Math.round(total * 100) / 100] })
    }

    // Próximo repasse: primeiro dia do próximo mês
    const proximoRepasse = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    res.json({
      totalArrecadado,
      totalRepassado,
      totalPendente,
      pessoasAjudadas,
      totalDoacoes: doacoesConfirmadas.length,
      doacoesPorInstituicao,
      sparklines,
      proximoRepasse,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

export default router
