import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body
    if (!email || !senha) {
      res.status(400).json({ error: 'Email e senha são obrigatórios' })
      return
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } })
    if (!admin) {
      res.status(401).json({ error: 'Credenciais inválidas' })
      return
    }

    const senhaValida = await bcrypt.compare(senha, admin.senha)
    if (!senhaValida) {
      res.status(401).json({ error: 'Credenciais inválidas' })
      return
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: admin.id, email: admin.email, nome: admin.nome, role: admin.role } })
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /api/auth/logout
router.post('/logout', authMiddleware, (_req: Request, res: Response) => {
  res.json({ ok: true })
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, nome: true, role: true },
    })
    if (!admin) {
      res.status(404).json({ error: 'Usuário não encontrado' })
      return
    }
    res.json(admin)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

export default router
