import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { calcularNivel } from '../lib/helpers'

const router = Router()

// GET /api/ranking?mes=&ano=&limit=20
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20
    const mes = req.query.mes ? parseInt(req.query.mes as string) : new Date().getMonth() + 1
    const ano = req.query.ano ? parseInt(req.query.ano as string) : new Date().getFullYear()

    const startDate = new Date(ano, mes - 1, 1)
    const endDate = new Date(ano, mes, 0, 23, 59, 59)

    // Buscar doadores com doações confirmadas no período
    const doadores = await prisma.doador.findMany({
      where: {
        doacoes: {
          some: {
            pago: true,
            dataPagamento: { gte: startDate, lte: endDate },
          },
        },
      },
      take: limit,
      orderBy: { pontos: 'desc' },
    })

    const ranking = doadores.map((d: any, index: number) => {
      const { nivel, badge } = calcularNivel(d.pontos)
      return {
        ...d,
        posicao: index + 1,
        nivel,
        badge,
      }
    })

    res.json(ranking)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

export default router
