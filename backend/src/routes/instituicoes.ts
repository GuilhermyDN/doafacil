import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/instituicoes — só retorna instituições que completaram todo
// o onboarding (ativo=true E homologada=true). Instituições em setup não
// aparecem para doadores — nem PIX, nem cartão.
router.get('/', async (_req: Request, res: Response) => {
  try {
    const instituicoes = await prisma.instituicao.findMany({
      where: { ativo: true, homologada: true },
    })
    res.json(instituicoes)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /api/instituicoes/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const inst = await prisma.instituicao.findUnique({ where: { id } })
    if (!inst) {
      res.status(404).json({ error: 'Instituição não encontrada' })
      return
    }
    res.json(inst)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /api/instituicoes/:id/gastos
router.get('/:id/gastos', async (req: Request, res: Response) => {
  try {
    const instituicaoId = parseInt(req.params.id)
    const gastos = await prisma.gasto.findMany({
      where: { instituicaoId },
      orderBy: { data: 'desc' },
    })
    res.json(gastos)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

export default router
