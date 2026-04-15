import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'
import { verificarMissoesAutomaticas } from '../lib/helpers'
const TIPOS_MISSAO = ['PRIMEIRA_DOACAO', 'FAMILIA', 'META_REFEICAO', 'MES_COMPLETO', 'META_VALOR', 'INDICACAO', 'CUSTOM']

const router = Router()
router.use(authMiddleware)

// POST /api/admin/missoes
router.post('/', async (req: Request, res: Response) => {
  try {
    const { titulo, descricao, pontos, emoji, tipo } = req.body
    if (!titulo || !descricao || pontos === undefined || !emoji || !tipo) {
      res.status(400).json({ error: 'Todos os campos são obrigatórios' }); return
    }
    if (!TIPOS_MISSAO.includes(tipo)) {
      res.status(400).json({ error: `Tipo inválido. Use: ${TIPOS_MISSAO.join(', ')}` }); return
    }
    const missao = await prisma.missao.create({
      data: { titulo, descricao, pontos: Number(pontos), emoji, tipo },
    })
    res.status(201).json(missao)

    // Verifica retroativamente todos os doadores existentes (assíncrono — não trava a resposta)
    prisma.doador.findMany({ select: { id: true } }).then(doadores => {
      console.log(`🎯 Verificando missão "${titulo}" para ${doadores.length} doador(es) existentes...`)
      Promise.allSettled(doadores.map(d => verificarMissoesAutomaticas(d.id)))
        .then(() => console.log(`✅ Verificação retroativa de "${titulo}" concluída`))
    }).catch(() => {})
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// PUT /api/admin/missoes/:id — editar missão
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return }
    const { titulo, descricao, pontos, emoji, ativa } = req.body
    const data: any = {}
    if (titulo !== undefined) data.titulo = titulo
    if (descricao !== undefined) data.descricao = descricao
    if (pontos !== undefined) data.pontos = Number(pontos)
    if (emoji !== undefined) data.emoji = emoji
    if (ativa !== undefined) data.ativa = !!ativa
    const missao = await prisma.missao.update({ where: { id }, data })
    res.json(missao)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// DELETE /api/admin/missoes/:id — desativar missão
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return }
    await prisma.missao.update({ where: { id }, data: { ativa: false } })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// PUT /api/admin/missoes/:id/destaque — define/remove destaque
router.put('/:id/destaque', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const { destaque, periodoDestaque, inicioDestaque, fimDestaque } = req.body

    const missao = await prisma.missao.update({
      where: { id },
      data: {
        destaque: !!destaque,
        periodoDestaque: destaque ? (periodoDestaque || 'semana') : null,
        inicioDestaque: destaque && inicioDestaque ? new Date(inicioDestaque) : destaque ? new Date() : null,
        fimDestaque: destaque && fimDestaque ? new Date(fimDestaque) : null,
      },
    })
    res.json(missao)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /api/admin/missoes/doadores — lista todos doadores com missões completas
router.get('/doadores', async (_req: Request, res: Response) => {
  try {
    const doadores = await prisma.doador.findMany({
      include: {
        missoes: { include: { missao: true }, where: { completa: true } },
      },
      orderBy: { pontos: 'desc' },
    })
    res.json(doadores.map((d: any) => ({
      id: d.id,
      numero: d.numero,
      nome: d.nome,
      nivel: d.nivel,
      pontos: d.pontos,
      totalDoado: d.totalDoado,
      missoesCompletas: d.missoes.map((md: any) => ({
        titulo: md.missao.titulo,
        emoji: md.missao.emoji,
        pontos: md.missao.pontos,
        completaEm: md.completaEm,
      })),
    })))
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

export default router
