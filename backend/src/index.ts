import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth'
import instituicoesRoutes from './routes/instituicoes'
import doacoesRoutes from './routes/doacoes'
import rankingRoutes from './routes/ranking'
import missoesRoutes from './routes/missoes'
import eventosRoutes from './routes/eventos'
import gastosRoutes from './routes/gastos'
import dashboardRoutes from './routes/dashboard'
import adminInstituicoesRoutes from './routes/admin-instituicoes'
import adminDoacoesRoutes from './routes/admin-doacoes'
import adminRankingRoutes from './routes/admin-ranking'
import adminMissoesRoutes from './routes/admin-missoes'
import adminConfigRoutes from './routes/admin-config'
import mpRoutes from './routes/mp'
import portalRoutes from './routes/instituicao-portal'
import pedidosRoutes from './routes/pedidos'
import tagsRoutes from './routes/tags'

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = [
  'http://localhost:3000',
  process.env.NEXT_PUBLIC_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origin.startsWith('http://localhost') || allowedOrigins.some(o => origin.startsWith(o)) || origin.includes('.vercel.app')) {
      cb(null, true)
    } else {
      cb(new Error(`CORS bloqueado: ${origin}`))
    }
  },
  credentials: true,
}))
app.use(express.json())

// Rate limiting global — proteção geral
app.use(rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }))

// Rate limiting extra para endpoints públicos de geração
const gerarUnicoLimiter = rateLimit({ windowMs: 60_000, max: 6, message: { error: 'Muitas requisições. Tente em instantes.' } })
app.use('/api/tags/gerar-unico', gerarUnicoLimiter)
const doacaoLimiter = rateLimit({ windowMs: 60_000, max: 20 })
app.use('/api/doacoes', doacaoLimiter)

// Rotas públicas
app.use('/api/auth', authRoutes)
app.use('/api/instituicoes', instituicoesRoutes)
app.use('/api/doacoes', doacoesRoutes)
app.use('/api/ranking', rankingRoutes)
app.use('/api/missoes', missoesRoutes)

// Rotas admin protegidas
app.use('/api/admin/instituicoes', adminInstituicoesRoutes)
app.use('/api/admin/doacoes', adminDoacoesRoutes)
app.use('/api/admin/ranking', adminRankingRoutes)
app.use('/api/admin/missoes', adminMissoesRoutes)
app.use('/api/admin/eventos', eventosRoutes)
app.use('/api/admin/gastos', gastosRoutes)
app.use('/api/admin/dashboard', dashboardRoutes)
app.use('/api/admin/config', adminConfigRoutes)

// Mercado Pago OAuth (público — callback e connect-info)
app.use('/api/mp', mpRoutes)

// Portal das instituições (links enviados por email)
app.use('/api/portal', portalRoutes)

// Pedidos de patch (público: criar; admin: listar/atualizar)
app.use('/api/pedidos', pedidosRoutes)

// Tags (GS-HB25-D01-0247-59KJ)
app.use('/api/tags', tagsRoutes)

app.get('/health', (_, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`)
})

export default app
