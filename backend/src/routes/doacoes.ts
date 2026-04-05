import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'
import { calcularNivel, verificarMissoesAutomaticas } from '../lib/helpers'

const router = Router()

// GET /api/doacoes/:id/status — verifica se doação foi paga
router.get('/:id/status', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return }
  const doacao = await prisma.doacao.findUnique({
    where: { id },
    select: { id: true, pago: true, dataPagamento: true, valorTotal: true, doadorNome: true },
  })
  if (!doacao) { res.status(404).json({ error: 'Doação não encontrada' }); return }
  res.json(doacao)
})

// POST /api/doacoes — registrar intenção de doação
router.post('/', async (req: Request, res: Response) => {
  try {
    const { doadorNome, doadorEmail, doadorTel, tagSerial, instituicaoId, quantidade, eventoId } = req.body

    if (!doadorNome || !instituicaoId || !quantidade) {
      res.status(400).json({ error: 'doadorNome, instituicaoId e quantidade são obrigatórios' })
      return
    }

    const inst = await prisma.instituicao.findUnique({ where: { id: Number(instituicaoId) } })
    if (!inst) {
      res.status(404).json({ error: 'Instituição não encontrada' })
      return
    }

    const valorTotal = inst.valor * Number(quantidade)

    let doadorId: number | undefined
    let tagId: number | undefined

    // Resolve tag serial → tagId
    if (tagSerial) {
      const tag = await prisma.tag.findUnique({ where: { serial: tagSerial } })
      if (tag) tagId = tag.id
    }

    if (doadorEmail) {
      const iniciais = doadorNome
        .split(' ')
        .slice(0, 2)
        .map((n: string) => n[0]?.toUpperCase() || '')
        .join('')

      const gerarNumero = () => String(Math.floor(100000 + Math.random() * 900000))

      const doador = await prisma.doador.upsert({
        where: { email: doadorEmail },
        update: { telefone: doadorTel || undefined },
        create: {
          nome: doadorNome,
          email: doadorEmail,
          telefone: doadorTel || null,
          avatar: iniciais,
          numero: gerarNumero(),
        },
      })
      doadorId = doador.id

      // Vincula a tag ao doador se ainda estiver livre
      if (tagId) {
        const tag = await prisma.tag.findUnique({ where: { id: tagId } })
        if (tag && !tag.doadorId) {
          await prisma.tag.update({
            where: { id: tagId },
            data: { doadorId, vinculadaEm: new Date() },
          })
        }
      }
    }

    const doacao = await prisma.doacao.create({
      data: {
        doadorNome,
        doadorEmail: doadorEmail || null,
        doadorTel: doadorTel || null,
        doadorId: doadorId || null,
        tagId: tagId || null,
        instituicaoId: Number(instituicaoId),
        eventoId: eventoId ? Number(eventoId) : null,
        quantidade: Number(quantidade),
        valorTotal,
      },
    })

    res.status(201).json({
      doacaoId: doacao.id,
      pixKey: inst.pixKey,
      valorTotal,
      instrucoes: `Transfira R$ ${valorTotal.toFixed(2)} para a chave Pix: ${inst.pixKey}`,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /api/doacoes/:id/confirmar — admin confirma pagamento
router.post('/:id/confirmar', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)

    const doacao = await prisma.doacao.findUnique({ where: { id } })
    if (!doacao) {
      res.status(404).json({ error: 'Doação não encontrada' })
      return
    }
    if (doacao.pago) {
      res.status(400).json({ error: 'Doação já confirmada' })
      return
    }

    const doacaoConfirmada = await prisma.doacao.update({
      where: { id },
      data: { pago: true, dataPagamento: new Date() },
    })

    if (doacao.doadorId) {
      await prisma.doador.update({
        where: { id: doacao.doadorId },
        data: {
          totalDoado: { increment: doacao.valorTotal },
          pontos:     { increment: Math.round(doacao.valorTotal * 10) },
        },
      })

      // nível baseado em número de doações (ações)
      const totalDoacoes = await prisma.doacao.count({ where: { doadorId: doacao.doadorId, pago: true } })
      const { nivel, badge } = calcularNivel(totalDoacoes)
      await prisma.doador.update({ where: { id: doacao.doadorId }, data: { nivel, badge } })

      await verificarMissoesAutomaticas(doacao.doadorId)
    }

    res.json(doacaoConfirmada)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

export default router
