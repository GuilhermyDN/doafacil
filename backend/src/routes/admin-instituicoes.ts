import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'
import crypto from 'crypto'

const router = Router()
router.use(authMiddleware)

// POST /api/admin/instituicoes
router.post('/', async (req: Request, res: Response) => {
  try {
    const { nome, tipo, valor, pixKey, emoji, cor, bg, mercadoPagoToken, mpPublicKey } = req.body
    if (!nome || !tipo || valor === undefined || !pixKey || !emoji || !cor || !bg) {
      res.status(400).json({ error: 'Todos os campos são obrigatórios' })
      return
    }
    const mpSetupToken = crypto.randomBytes(24).toString('hex')
    const gastosToken  = crypto.randomBytes(24).toString('hex')
    const inst = await prisma.instituicao.create({
      data: { nome, tipo, valor: Number(valor), pixKey, emoji, cor, bg, mercadoPagoToken, mpPublicKey, mpSetupToken, gastosToken },
    })
    res.status(201).json(inst)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// PUT /api/admin/instituicoes/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const { nome, tipo, valor, pixKey, emoji, cor, bg, ativo, mercadoPagoToken, mpPublicKey } = req.body

    const inst = await prisma.instituicao.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(tipo !== undefined && { tipo }),
        ...(valor !== undefined && { valor: Number(valor) }),
        ...(pixKey !== undefined && { pixKey }),
        ...(emoji !== undefined && { emoji }),
        ...(cor !== undefined && { cor }),
        ...(bg !== undefined && { bg }),
        ...(ativo !== undefined && { ativo: Boolean(ativo) }),
        ...(mercadoPagoToken !== undefined && { mercadoPagoToken: mercadoPagoToken || null }),
        ...(mpPublicKey !== undefined && { mpPublicKey: mpPublicKey || null }),
      },
    })
    res.json(inst)
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Instituição não encontrada' })
      return
    }
    res.status(500).json({ error: 'Erro interno' })
  }
})

// DELETE /api/admin/instituicoes/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    await prisma.instituicao.delete({ where: { id } })
    res.json({ ok: true })
  } catch (err: any) {
    if (err.code === 'P2025') { res.status(404).json({ error: 'Instituição não encontrada' }); return }
    res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /api/admin/instituicoes/:id/gerar-links — gera/regenera tokens de setup e gastos
router.post('/:id/gerar-links', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const mpSetupToken = crypto.randomBytes(24).toString('hex')
    const gastosToken  = crypto.randomBytes(24).toString('hex')
    const inst = await prisma.instituicao.update({
      where: { id },
      data: { mpSetupToken, gastosToken },
    })
    const base = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
    res.json({
      linkMp:     `${base}/configurar-mp?token=${inst.mpSetupToken}`,
      linkGastos: `${base}/gastos-instituicao?token=${inst.gastosToken}`,
    })
  } catch (err: any) {
    if (err.code === 'P2025') { res.status(404).json({ error: 'Instituição não encontrada' }); return }
    res.status(500).json({ error: 'Erro interno' })
  }
})

export default router
