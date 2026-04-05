import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/missoes
router.get('/', async (_req: Request, res: Response) => {
  try {
    const missoes = await prisma.missao.findMany({
      where: { ativa: true },
      include: { _count: { select: { doadores: { where: { completa: true } } } } },
    })
    res.json(missoes.map((m: any) => ({ ...m, totalCompletas: m._count.doadores })))
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /api/missoes/destaque — missões em destaque com progresso da comunidade
router.get('/destaque', async (_req: Request, res: Response) => {
  try {
    const missoes = await prisma.missao.findMany({
      where: { ativa: true, destaque: true },
      include: {
        _count: { select: { doadores: { where: { completa: true } } } },
        doadores: {
          where: { completa: true },
          orderBy: { completaEm: 'desc' },
          take: 5,
          include: { doador: { select: { numero: true, avatar: true, nivel: true } } },
        },
      },
      orderBy: { inicioDestaque: 'desc' },
    })
    res.json(missoes.map((m: any) => ({
      id: m.id,
      titulo: m.titulo,
      descricao: m.descricao,
      pontos: m.pontos,
      emoji: m.emoji,
      periodoDestaque: m.periodoDestaque,
      inicioDestaque: m.inicioDestaque,
      fimDestaque: m.fimDestaque,
      totalCompletas: m._count.doadores,
      recentes: m.doadores.map((md: any) => ({
        numero: md.doador.numero,
        avatar: md.doador.avatar,
        nivel: md.doador.nivel,
        completaEm: md.completaEm,
      })),
    })))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /api/missoes/progresso?doadorId=
router.get('/progresso', async (req: Request, res: Response) => {
  try {
    const doadorId = req.query.doadorId ? parseInt(req.query.doadorId as string) : null

    const missoes = await prisma.missao.findMany({ where: { ativa: true } })

    if (!doadorId) {
      const resultado = missoes.map((m: any) => ({ missao: m, completa: false, completaEm: null }))
      res.json(resultado)
      return
    }

    const missoesDoador = await prisma.missaoDoador.findMany({
      where: { doadorId },
      include: { missao: true },
    })

    const resultado = missoes.map((m: any) => {
      const md = missoesDoador.find((md: any) => md.missaoId === m.id)
      return {
        missao: m,
        completa: md?.completa ?? false,
        completaEm: md?.completaEm ?? null,
      }
    })

    res.json(resultado)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /api/missoes/buscar?q= — busca doador por nome, número, email, telefone ou serial de tag
router.get('/buscar', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim()
    if (!q) { res.status(400).json({ error: 'Informe um nome, número ou serial' }); return }

    // ── Detectar se parece serial de tag (ex: GS-HB25-D01-0001-AB12) ──────────
    const isSerial = /^GS-/i.test(q) || /^[A-Z]{2}-[A-Z]{2}\d{2}-/.test(q.toUpperCase())

    if (isSerial) {
      const tag = await prisma.tag.findUnique({
        where: { serial: q.toUpperCase() },
        include: {
          doador: {
            include: {
              missoes: { include: { missao: true }, where: { completa: true } },
              doacoes: { where: { pago: true }, select: { valorTotal: true, dataPagamento: true, instituicao: { select: { nome: true, emoji: true } } } },
            },
          },
          doacoes: {
            where: { pago: true },
            select: { valorTotal: true, dataPagamento: true, instituicao: { select: { nome: true, emoji: true } } },
            orderBy: { dataPagamento: 'desc' },
            take: 10,
          },
        },
      })

      if (!tag) { res.json([]); return }

      // Tag vinculada a um doador → retorna perfil completo do doador
      if (tag.doador) {
        const d = tag.doador as any
        res.json([{
          id: d.id,
          numero: d.numero,
          nome: d.nome,
          avatar: d.avatar,
          nivel: d.nivel,
          badge: d.badge,
          pontos: d.pontos,
          totalDoado: d.totalDoado,
          homenagem: d.homenagem,
          isVoluntario: d.isVoluntario,
          servicoVoluntario: d.servicoVoluntario,
          missoesCompletas: d.missoes.map((md: any) => ({
            titulo: md.missao.titulo,
            emoji: md.missao.emoji,
            pontos: md.missao.pontos,
            completaEm: md.completaEm,
          })),
          totalDoacoes: d.doacoes.length,
          ultimaDoacao: d.doacoes[0] ?? null,
          tagSerial: tag.serial,
        }])
        return
      }

      // Tag anônima (não vinculada) → retorna perfil baseado apenas na tag
      const totalDoado = tag.doacoes.reduce((s: number, d: any) => s + (d.valorTotal ?? 0), 0)
      res.json([{
        id: null,
        numero: null,
        nome: null,
        avatar: '🏷️',
        nivel: 'cool',
        badge: null,
        pontos: 0,
        totalDoado,
        homenagem: null,
        isVoluntario: false,
        servicoVoluntario: null,
        missoesCompletas: [],
        totalDoacoes: tag.doacoes.length,
        ultimaDoacao: tag.doacoes[0] ?? null,
        tagSerial: tag.serial,
        anonimo: true,
      }])
      return
    }

    // ── Busca normal por nome / número / telefone / email ────────────────────
    const doadores = await prisma.doador.findMany({
      where: {
        OR: [
          { numero: { equals: q } },
          { nome: { contains: q, mode: 'insensitive' } },
          { telefone: { contains: q } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: {
        missoes: { include: { missao: true }, where: { completa: true } },
        doacoes: { where: { pago: true }, select: { valorTotal: true, dataPagamento: true, instituicao: { select: { nome: true, emoji: true } } } },
        tags: { select: { serial: true }, take: 1, orderBy: { createdAt: 'desc' } },
      },
      take: 10,
    })

    res.json(doadores.map((d: any) => ({
      id: d.id,
      numero: d.numero,
      nome: d.nome,
      email: d.email,
      telefone: d.telefone,
      avatar: d.avatar,
      nivel: d.nivel,
      badge: d.badge,
      pontos: d.pontos,
      totalDoado: d.totalDoado,
      homenagem: d.homenagem,
      isVoluntario: d.isVoluntario,
      servicoVoluntario: d.servicoVoluntario,
      missoesCompletas: d.missoes.map((md: any) => ({
        titulo: md.missao.titulo,
        emoji: md.missao.emoji,
        pontos: md.missao.pontos,
        completaEm: md.completaEm,
      })),
      totalDoacoes: d.doacoes.length,
      ultimaDoacao: d.doacoes[0] ?? null,
      tagSerial: d.tags[0]?.serial ?? null,
    })))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro interno' })
  }
})

export default router
