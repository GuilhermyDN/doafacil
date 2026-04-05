import { Router, Request, Response } from 'express'
import QRCode from 'qrcode'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'

const router = Router()
router.use(authMiddleware)

// GET /api/admin/eventos
router.get('/', async (_req: Request, res: Response) => {
  try {
    const eventos = await prisma.evento.findMany({ orderBy: { dataEvento: 'desc' } })
    res.json(eventos)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /api/admin/eventos — cria evento e gera QR Codes por instituição
router.post('/', async (req: Request, res: Response) => {
  try {
    const { nome, dataEvento } = req.body
    if (!nome || !dataEvento) {
      res.status(400).json({ error: 'nome e dataEvento são obrigatórios' })
      return
    }

    const evento = await prisma.evento.create({
      data: { nome, dataEvento: new Date(dataEvento) },
    })

    const instituicoes = await prisma.instituicao.findMany({ where: { ativo: true } })
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

    const qrCodes = await Promise.all(
      instituicoes.map(async (inst: any) => {
        const urlDoacao = `${baseUrl}/doacao?inst=${inst.id}&evento=${evento.id}`
        const qrCodeBase64 = await QRCode.toDataURL(urlDoacao)
        return prisma.qREvento.create({
          data: {
            eventoId: evento.id,
            instituicaoId: inst.id,
            urlDoacao,
            qrCodeBase64,
            valor: inst.valor,
          },
        })
      })
    )

    res.status(201).json({ evento, qrCodes })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /api/admin/eventos/:id/qrcodes
router.get('/:id/qrcodes', async (req: Request, res: Response) => {
  try {
    const eventoId = parseInt(req.params.id)
    const qrCodes = await prisma.qREvento.findMany({
      where: { eventoId },
      include: { instituicao: true },
    })
    res.json(qrCodes)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

export default router
