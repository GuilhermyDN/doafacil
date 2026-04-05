import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'

const router = Router()
router.use(authMiddleware)

// GET /api/admin/doacoes?instituicaoId=&pago=&dataInicio=&dataFim=&page=&limit=
router.get('/', async (req: Request, res: Response) => {
  try {
    const { instituicaoId, pago, dataInicio, dataFim } = req.query
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const where: any = {}
    if (instituicaoId) where.instituicaoId = parseInt(instituicaoId as string)
    if (pago !== undefined) where.pago = pago === 'true'
    if (dataInicio || dataFim) {
      where.dataCriacao = {}
      if (dataInicio) where.dataCriacao.gte = new Date(dataInicio as string)
      if (dataFim) where.dataCriacao.lte = new Date(dataFim as string)
    }

    const [doacoes, total] = await Promise.all([
      prisma.doacao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataCriacao: 'desc' },
        include: { instituicao: true },
      }),
      prisma.doacao.count({ where }),
    ])

    res.json({ doacoes, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /api/admin/doacoes/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const doacao = await prisma.doacao.findUnique({
      where: { id },
      include: { instituicao: true, doador: true },
    })
    if (!doacao) {
      res.status(404).json({ error: 'Doação não encontrada' })
      return
    }
    res.json(doacao)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

export default router
