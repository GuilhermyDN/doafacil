import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'

const router = Router()
router.use(authMiddleware)

// PUT /api/admin/ranking/:doadorId/voluntario — designar/remover voluntário DONOR
router.put('/:doadorId/voluntario', async (req: Request, res: Response) => {
  try {
    const doadorId = parseInt(req.params.doadorId)
    const { isVoluntario, servicoVoluntario } = req.body

    const doador = await prisma.doador.update({
      where: { id: doadorId },
      data: {
        isVoluntario: Boolean(isVoluntario),
        servicoVoluntario: servicoVoluntario || null,
      },
    })
    res.json(doador)
  } catch (err: any) {
    if (err.code === 'P2025') { res.status(404).json({ error: 'Doador não encontrado' }); return }
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /api/admin/ranking/voluntarios — lista todos os voluntários
router.get('/voluntarios', async (_req: Request, res: Response) => {
  try {
    const voluntarios = await prisma.doador.findMany({
      where: { isVoluntario: true },
      select: { id: true, nome: true, email: true, telefone: true, numero: true, avatar: true, servicoVoluntario: true, createdAt: true },
      orderBy: { nome: 'asc' },
    })
    res.json(voluntarios)
  } catch { res.status(500).json({ error: 'Erro interno' }) }
})

// PUT /api/admin/ranking/:doadorId/homenagem
router.put('/:doadorId/homenagem', async (req: Request, res: Response) => {
  try {
    const doadorId = parseInt(req.params.doadorId)
    const { homenagem } = req.body

    if (homenagem === undefined) {
      res.status(400).json({ error: 'Campo homenagem é obrigatório' })
      return
    }

    const doador = await prisma.doador.update({
      where: { id: doadorId },
      data: { homenagem },
    })
    res.json(doador)
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Doador não encontrado' })
      return
    }
    res.status(500).json({ error: 'Erro interno' })
  }
})

export default router
