import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'

const router = Router()
router.use(authMiddleware)

// POST /api/admin/gastos
router.post('/', async (req: Request, res: Response) => {
  try {
    const { instituicaoId, desc, valor, data, comprovante, arquivoUrl } = req.body

    if (!instituicaoId || !desc || valor === undefined || !data) {
      res.status(400).json({ error: 'instituicaoId, desc, valor e data são obrigatórios' })
      return
    }

    const gasto = await prisma.gasto.create({
      data: {
        instituicaoId: Number(instituicaoId),
        desc,
        valor: Number(valor),
        data: new Date(data),
        comprovante: Boolean(comprovante),
        arquivoUrl: arquivoUrl || null,
      },
    })

    res.status(201).json(gasto)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

export default router
