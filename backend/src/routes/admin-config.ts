import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/auth'

const router = Router()
router.use(authMiddleware)

// GET /api/admin/config
router.get('/', async (_req: Request, res: Response) => {
  try {
    let config = await prisma.siteConfig.findUnique({ where: { id: 1 } })
    if (!config) {
      config = await prisma.siteConfig.create({ data: { id: 1 } })
    }
    // Nunca retorna secrets completos — mascara tokens
    res.json({
      ...config,
      mpAccessToken: config.mpAccessToken ? '••••••••' + config.mpAccessToken.slice(-6) : '',
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro interno' })
  }
})

// PUT /api/admin/config
router.put('/', async (req: Request, res: Response) => {
  try {
    const {
      nomeOrganizacao, emailContato, whatsapp,
      mpAccessToken, mpPublicKey, pixChaveAdmin,
    } = req.body

    const data: any = {}
    if (nomeOrganizacao !== undefined)  data.nomeOrganizacao  = nomeOrganizacao
    if (emailContato    !== undefined)  data.emailContato     = emailContato
    if (whatsapp        !== undefined)  data.whatsapp         = whatsapp
    if (mpPublicKey     !== undefined)  data.mpPublicKey      = mpPublicKey
    if (pixChaveAdmin   !== undefined)  data.pixChaveAdmin    = pixChaveAdmin
    if (mpAccessToken   !== undefined && !mpAccessToken.includes('•'))  data.mpAccessToken  = mpAccessToken

    const config = await prisma.siteConfig.upsert({
      where: { id: 1 },
      create: { id: 1, ...data },
      update: data,
    })

    res.json({ ok: true, config })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro interno' })
  }
})

export default router
