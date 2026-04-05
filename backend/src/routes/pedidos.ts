import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'
import { NIVEIS_CONFIG, DONOR_PATCH } from '../lib/helpers'

const router = Router()

// POST /api/pedidos — criar pedido de patch (público)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { doadorNome, doadorEmail, doadorTel, nivel, endereco, cidade, cep, observacoes } = req.body
    if (!doadorNome || !doadorEmail || !nivel || !endereco || !cidade || !cep) {
      res.status(400).json({ error: 'Campos obrigatórios: nome, email, nivel, endereço, cidade, cep' })
      return
    }

    let preco = 0
    if (nivel === 'donor') {
      preco = DONOR_PATCH.preco
    } else {
      const cfg = NIVEIS_CONFIG.find(n => n.nivel === nivel)
      if (!cfg) { res.status(400).json({ error: 'Nível inválido' }); return }
      preco = cfg.preco
    }

    const pedido = await prisma.pedidoPatch.create({
      data: { doadorNome, doadorEmail, doadorTel, nivel, preco, endereco, cidade, cep, observacoes },
    })

    res.status(201).json({ ok: true, pedidoId: pedido.id, preco, mensagem: `Pedido #${pedido.id} registrado! Entraremos em contato pelo email ${doadorEmail} para confirmar o pagamento.` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /api/pedidos — listar todos pedidos (admin)
router.get('/', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const pedidos = await prisma.pedidoPatch.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(pedidos)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

// PUT /api/pedidos/:id/status — atualizar status (admin)
router.put('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const { status } = req.body
    const validos = ['pendente', 'produzindo', 'enviado', 'entregue']
    if (!validos.includes(status)) { res.status(400).json({ error: 'Status inválido' }); return }
    const pedido = await prisma.pedidoPatch.update({ where: { id }, data: { status } })
    res.json(pedido)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

export default router
