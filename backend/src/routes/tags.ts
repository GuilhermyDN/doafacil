import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'
import crypto from 'crypto'

const router = Router()

// ── Gera serial no formato GS-HB25-D01-0247-59KJ ─────────────────────────────
function gerarSerial(ano: number, campanha: string, sequencia: number): { serial: string; chave: string } {
  const anoStr = String(ano).slice(-2).padStart(2, '0')
  const seqStr = String(sequencia).padStart(4, '0')
  const chave = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 4)
  const serial = `GS-HB${anoStr}-${campanha}-${seqStr}-${chave}`
  return { serial, chave }
}

// ── GET /api/tags/:serial — perfil público da tag ─────────────────────────────
router.get('/:serial', async (req: Request, res: Response) => {
  const { serial } = req.params
  const tag = await prisma.tag.findUnique({
    where: { serial },
    include: {
      doador: {
        select: {
          nome: true,
          nivel: true,
          pontos: true,
          totalDoado: true,
          isVoluntario: true,
        },
      },
      doacoes: {
        where: { pago: true },
        orderBy: { dataCriacao: 'desc' },
        take: 5,
        include: { instituicao: { select: { nome: true, emoji: true } } },
      },
    },
  })
  if (!tag) { res.status(404).json({ error: 'Tag não encontrada' }); return }

  res.json({
    serial: tag.serial,
    campanha: tag.campanha,
    ano: tag.ano,
    vinculada: !!tag.doadorId,
    vinculadaEm: tag.vinculadaEm,
    nivel: tag.doador?.nivel ?? null,
    pontos: tag.doador?.pontos ?? 0,
    totalDoado: tag.doador?.totalDoado ?? 0,
    isVoluntario: tag.doador?.isVoluntario ?? false,
    ultimasDoacoes: tag.doacoes.map(d => ({
      data: d.dataCriacao,
      instituicao: d.instituicao.nome,
      emoji: d.instituicao.emoji,
      valor: d.valorTotal,
    })),
  })
})

// ── POST /api/tags/:serial/vincular — primeira vez: vincula tag a uma pessoa ──
router.post('/:serial/vincular', async (req: Request, res: Response) => {
  const { serial } = req.params
  const { nome, email, telefone } = req.body

  if (!nome || !email || !telefone) {
    res.status(400).json({ error: 'nome, email e telefone são obrigatórios' })
    return
  }

  const tag = await prisma.tag.findUnique({ where: { serial } })
  if (!tag) { res.status(404).json({ error: 'Tag não encontrada' }); return }
  if (tag.doadorId) { res.status(409).json({ error: 'Tag já vinculada' }); return }

  try {
    const iniciais = nome.split(' ').slice(0, 2).map((n: string) => n[0]?.toUpperCase() || '').join('')
    const gerarNumero = () => String(Math.floor(100000 + Math.random() * 900000))

    // Cada tag tem seu próprio Doador. O mesmo email pode existir em
    // múltiplos doadores (um por tag que a pessoa usou). A identidade
    // no sistema é o serial da tag, não o email.
    const doador = await prisma.doador.create({
      data: { nome, email, telefone, avatar: iniciais, numero: gerarNumero() },
    })

    const tagAtualizada = await prisma.tag.update({
      where: { serial },
      data: { doadorId: doador.id, vinculadaEm: new Date() },
    })

    res.json({ ok: true, serial: tagAtualizada.serial, doadorId: doador.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao vincular tag' })
  }
})

// ── POST /api/tags/:serial/scan — registra um scan do QR ─────────────────────
router.post('/:serial/scan', async (req: Request, res: Response) => {
  const { serial } = req.params
  const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || ''
  const userAgent = req.headers['user-agent'] || ''

  const tag = await prisma.tag.findUnique({ where: { serial }, include: { doador: true } })
  if (!tag) { res.status(404).json({ error: 'Tag não encontrada' }); return }

  await prisma.tagScan.create({
    data: { tagId: tag.id, ip, userAgent, ehDono: false },
  })

  res.json({
    serial: tag.serial,
    vinculada: !!tag.doadorId,
    nivel: tag.doador?.nivel ?? null,
    pontos: tag.doador?.pontos ?? 0,
  })
})

// ── POST /api/tags/gerar-unico — público: gera 1 tag nova para o doador ───────
// Chamado pela página de doação quando não há tag na URL
router.post('/gerar-unico', async (_req: Request, res: Response) => {
  try {
    // Lê configurações de campanha ativas
    const cfg = await prisma.siteConfig.findFirst()
    const campanha = cfg?.campanhaAtual ?? 'D01'
    const ano = cfg?.campanhaAno ?? 25

    // Próxima sequência disponível para esta campanha
    const ultima = await prisma.tag.findFirst({
      where: { campanha },
      orderBy: { sequencia: 'desc' },
    })
    let seq = (ultima?.sequencia ?? 0) + 1

    // Garante serial único (retenta em caso de colisão de chave)
    let serial: string, chave: string, tentativas = 0
    do {
      const g = gerarSerial(ano, campanha, seq)
      serial = g.serial
      chave = g.chave
      const existe = await prisma.tag.findUnique({ where: { serial } })
      if (!existe) break
      seq++
      tentativas++
    } while (tentativas < 10)

    const tag = await prisma.tag.create({
      data: { serial, ano, campanha, sequencia: seq, chave },
    })

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
    const qrUrl = `${baseUrl}/doacao?tag=${tag.serial}`

    res.status(201).json({ serial: tag.serial, qrUrl })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao gerar serial' })
  }
})

// ── ADMIN ─────────────────────────────────────────────────────────────────────

// GET /api/tags — lista todas as tags (admin)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const { campanha, status } = req.query

  const where: any = {}
  if (campanha) where.campanha = campanha
  if (status === 'livre') where.doadorId = null
  if (status === 'vinculada') where.doadorId = { not: null }

  const tags = await prisma.tag.findMany({
    where,
    orderBy: [{ campanha: 'asc' }, { sequencia: 'asc' }],
    include: {
      doador: { select: { nome: true, email: true, nivel: true, pontos: true } },
      _count: { select: { scans: true } },
    },
  })

  res.json(tags.map(t => ({
    id: t.id,
    serial: t.serial,
    campanha: t.campanha,
    ano: t.ano,
    sequencia: t.sequencia,
    loteId: t.loteId,
    createdAt: t.createdAt,
    vinculada: !!t.doadorId,
    vinculadaEm: t.vinculadaEm,
    doador: t.doador ? { nome: t.doador.nome, nivel: t.doador.nivel, pontos: t.doador.pontos } : null,
    totalScans: t._count.scans,
  })))
})

// POST /api/tags/gerar — gera lote de tags (admin)
router.post('/gerar', authMiddleware, async (req: Request, res: Response) => {
  const { quantidade, campanha, ano } = req.body

  if (!quantidade || !campanha || !ano) {
    res.status(400).json({ error: 'quantidade, campanha e ano são obrigatórios' })
    return
  }

  const qtd = Number(quantidade)
  if (qtd < 1 || qtd > 500) {
    res.status(400).json({ error: 'quantidade deve ser entre 1 e 500' })
    return
  }

  // Descobre a última sequência desta campanha
  const ultima = await prisma.tag.findFirst({
    where: { campanha, ano: Number(ano) },
    orderBy: { sequencia: 'desc' },
  })
  let proximaSeq = (ultima?.sequencia ?? 0) + 1

  // UUID único pra este lote — toda tag desta chamada compartilha esse id.
  // Permite ao frontend agrupar com 100% de precisão.
  const loteId = crypto.randomUUID()

  const tags = []
  const seriesGeradas: string[] = []

  for (let i = 0; i < qtd; i++) {
    let serial: string
    let chave: string
    // Garante serial único (re-gera chave se colidir)
    do {
      const gerado = gerarSerial(Number(ano), campanha, proximaSeq)
      serial = gerado.serial
      chave = gerado.chave
    } while (seriesGeradas.includes(serial))

    seriesGeradas.push(serial)
    tags.push({ serial, ano: Number(ano), campanha, sequencia: proximaSeq, chave, loteId })
    proximaSeq++
  }

  await prisma.tag.createMany({ data: tags, skipDuplicates: true })

  res.json({ ok: true, geradas: tags.length, primeira: tags[0].serial, ultima: tags[tags.length - 1].serial, loteId })
})

export default router
