import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/portal/mp-setup?token= — valida token e retorna dados da instituição
router.get('/mp-setup', async (req: Request, res: Response) => {
  const { token } = req.query
  if (!token) { res.status(400).json({ error: 'Token obrigatório' }); return }
  const inst = await prisma.instituicao.findUnique({
    where: { mpSetupToken: String(token) },
    select: { id: true, nome: true, emoji: true, mercadoPagoToken: true, mpPublicKey: true },
  })
  if (!inst) { res.status(404).json({ error: 'Link inválido ou expirado' }); return }
  res.json({
    id: inst.id,
    nome: inst.nome,
    emoji: inst.emoji,
    configurado: !!(inst.mercadoPagoToken && inst.mpPublicKey),
  })
})

// POST /api/portal/mp-setup — salva credenciais MP da instituição
router.post('/mp-setup', async (req: Request, res: Response) => {
  const { token, publicKey, accessToken } = req.body
  if (!token || !publicKey || !accessToken) {
    res.status(400).json({ error: 'Token, publicKey e accessToken são obrigatórios' }); return
  }
  if (!publicKey.startsWith('APP_USR-') || !accessToken.startsWith('APP_USR-')) {
    res.status(400).json({ error: 'Credenciais inválidas. Certifique-se de copiar corretamente do painel Mercado Pago.' }); return
  }
  const inst = await prisma.instituicao.findUnique({ where: { mpSetupToken: String(token) } })
  if (!inst) { res.status(404).json({ error: 'Link inválido ou expirado' }); return }
  await prisma.instituicao.update({
    where: { id: inst.id },
    data: { mercadoPagoToken: accessToken, mpPublicKey: publicKey },
  })
  res.json({ ok: true, mensagem: 'Credenciais salvas com sucesso! Sua instituição já pode receber doações.' })
})

// GET /api/portal/gastos?token= — valida token e retorna gastos da instituição
router.get('/gastos', async (req: Request, res: Response) => {
  const { token } = req.query
  if (!token) { res.status(400).json({ error: 'Token obrigatório' }); return }
  const inst = await prisma.instituicao.findUnique({
    where: { gastosToken: String(token) },
    select: { id: true, nome: true, emoji: true, gastos: { orderBy: { data: 'desc' } } },
  })
  if (!inst) { res.status(404).json({ error: 'Link inválido ou expirado' }); return }
  res.json(inst)
})

// POST /api/portal/gastos — cadastra gasto
router.post('/gastos', async (req: Request, res: Response) => {
  const { token, descricao, valor, data, comprovante } = req.body
  if (!token || !descricao || valor === undefined || !data) {
    res.status(400).json({ error: 'Campos obrigatórios: descricao, valor, data' }); return
  }
  const inst = await prisma.instituicao.findUnique({ where: { gastosToken: String(token) } })
  if (!inst) { res.status(404).json({ error: 'Link inválido' }); return }
  const gasto = await prisma.gasto.create({
    data: { desc: descricao, valor: Number(valor), data: new Date(data), comprovante: Boolean(comprovante), instituicaoId: inst.id },
  })
  res.status(201).json(gasto)
})

export default router
