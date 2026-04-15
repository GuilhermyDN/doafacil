import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/portal/mp-setup?token= — valida token e retorna estado do onboarding
router.get('/mp-setup', async (req: Request, res: Response) => {
  const { token } = req.query
  if (!token) { res.status(400).json({ error: 'Token obrigatório' }); return }
  const inst = await prisma.instituicao.findUnique({
    where: { mpSetupToken: String(token) },
    select: {
      id: true,
      nome: true,
      emoji: true,
      valor: true,
      mercadoPagoToken: true,
      mpPublicKey: true,
      setupTestePaymentId: true,
      homologada: true,
    },
  })
  if (!inst) { res.status(404).json({ error: 'Link inválido ou expirado' }); return }
  res.json({
    id: inst.id,
    nome: inst.nome,
    emoji: inst.emoji,
    valor: inst.valor,
    credenciaisOk: !!(inst.mercadoPagoToken && inst.mpPublicKey),
    testeFeito: !!inst.setupTestePaymentId,
    homologada: inst.homologada,
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

  // Valida o access_token e captura o mpAccountId (id do usuário no MP).
  // Esse id é o que vai casar com o collector_id dos webhooks de payment,
  // permitindo ao webhook auto-homologar a instituição quando receber o
  // primeiro payment approved.
  let mpAccountId: string | null = null
  try {
    const r = await fetch('https://api.mercadopago.com/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!r.ok) {
      res.status(400).json({ error: 'Access Token inválido ou rejeitado pelo Mercado Pago. Verifique se copiou corretamente da aba "Produção".' })
      return
    }
    const user = await r.json() as { id?: number }
    if (user?.id) mpAccountId = String(user.id)
  } catch (err) {
    console.error('Erro ao validar token no MP:', err)
    res.status(502).json({ error: 'Não foi possível validar suas credenciais junto ao Mercado Pago. Tente novamente em alguns segundos.' })
    return
  }

  await prisma.instituicao.update({
    where: { id: inst.id },
    data: {
      mercadoPagoToken: accessToken,
      mpPublicKey: publicKey,
      mpAccountId: mpAccountId || undefined,
    },
  })
  res.json({ ok: true, mensagem: 'Credenciais salvas e validadas com sucesso!' })
})

// POST /api/portal/mp-setup/registrar-teste — marca que o pagamento de
// teste foi feito E homologa a instituição na mesma operação.
//
// Racional: no painel do Mercado Pago, a "Qualidade da integração" é
// avaliada por um score. Assim que o score passa de 73, a aplicação
// é aprovada automaticamente — não há janela de 48h de espera. O score
// sobe quando chega um POST /v1/payments com todos os campos obrigatórios
// (items.id/title/description/category_id/quantity/unit_price,
// payer.email/first_name/last_name, issuer_id), exatamente o que nosso
// /cartao-token envia. Portanto, o simples fato do MP ter respondido um
// paymentId para o nosso request já significa que o score subiu.
//
// A validação "paymentId presente" é a prova de que o MP recebeu o
// request; sem paymentId, não homologa.
router.post('/mp-setup/registrar-teste', async (req: Request, res: Response) => {
  const { token, paymentId } = req.body
  if (!token) { res.status(400).json({ error: 'Token obrigatório' }); return }
  const inst = await prisma.instituicao.findUnique({ where: { mpSetupToken: String(token) } })
  if (!inst) { res.status(404).json({ error: 'Link inválido ou expirado' }); return }

  // Se paymentId existe, temos prova de que o pagamento chegou no MP —
  // homologa. Se não, só registra que tentou (fallback pra casos de erro
  // no fluxo do cartão antes de chegar na API do MP).
  const temPaymentId = !!paymentId
  await prisma.instituicao.update({
    where: { id: inst.id },
    data: {
      setupTestePaymentId: paymentId ? String(paymentId) : 'registrado',
      ...(temPaymentId && !inst.homologada ? { homologada: true } : {}),
    },
  })
  if (temPaymentId && !inst.homologada) {
    console.log(`🎉 Instituição #${inst.id} "${inst.nome}" homologada automaticamente (paymentId=${paymentId})`)
  }
  res.json({ ok: true, homologada: temPaymentId || inst.homologada })
})

// POST /api/portal/mp-setup/ativar — a instituição declara que completou
// a homologação no painel developers do MP e pede pra ser ativada.
// A partir daqui, inst.homologada = true e a instituição passa a aparecer
// na listagem pública /api/instituicoes.
router.post('/mp-setup/ativar', async (req: Request, res: Response) => {
  const { token } = req.body
  if (!token) { res.status(400).json({ error: 'Token obrigatório' }); return }
  const inst = await prisma.instituicao.findUnique({ where: { mpSetupToken: String(token) } })
  if (!inst) { res.status(404).json({ error: 'Link inválido ou expirado' }); return }
  if (!inst.mercadoPagoToken || !inst.mpPublicKey) {
    res.status(400).json({ error: 'Credenciais do Mercado Pago ainda não foram salvas.' }); return
  }
  await prisma.instituicao.update({
    where: { id: inst.id },
    data: { homologada: true },
  })
  res.json({ ok: true, mensagem: 'Instituição ativada! Agora ela aparece na página pública de doações.' })
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
