import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { calcularNivel, verificarMissoesAutomaticas } from '../lib/helpers'
import crypto from 'crypto'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

// POST /api/mp/pix — gera QR Code Pix direto sem redirecionamento

// Cliente da plataforma (token da conta principal)
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
})

const router = Router()

// GET /api/mp/connect-info?token=xxx
// Retorna nome da instituição e a URL de autorização do MP
router.get('/connect-info', async (req: Request, res: Response) => {
  const { token } = req.query as { token?: string }
  if (!token) { res.status(400).json({ error: 'Token ausente' }); return }

  const inst = await prisma.instituicao.findUnique({ where: { mpConnectToken: token } })
  if (!inst) { res.status(404).json({ error: 'Link inválido ou expirado' }); return }

  const clientId = process.env.MP_CLIENT_ID
  const redirectUri = process.env.MP_REDIRECT_URI
  if (!clientId || !redirectUri) {
    res.status(500).json({ error: 'Credenciais do Mercado Pago não configuradas no servidor' })
    return
  }

  const authUrl =
    `https://auth.mercadopago.com.br/authorization` +
    `?client_id=${clientId}` +
    `&response_type=code` +
    `&platform_id=mp` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${token}`

  res.json({ instituicaoNome: inst.nome, instituicaoEmoji: inst.emoji, authUrl, jaConectado: !!inst.mercadoPagoToken })
})

// GET /api/mp/callback?code=xxx&state=token
// Callback do OAuth do Mercado Pago
router.get('/callback', async (req: Request, res: Response) => {
  const { code, state, error, error_description } = req.query as { code?: string; state?: string; error?: string; error_description?: string }
  const frontendUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

  console.log('🔁 MP callback recebido:', JSON.stringify(req.query))

  if (error) {
    console.error('❌ MP retornou erro OAuth:', error, error_description)
    res.redirect(`${frontendUrl}/conectar-mp?erro=mp-nao-autorizado&detalhe=${encodeURIComponent(error)}`)
    return
  }

  if (!code || !state) {
    console.error('❌ code ou state ausentes:', { code, state })
    res.redirect(`${frontendUrl}/conectar-mp?erro=parametros-invalidos`)
    return
  }

  const inst = await prisma.instituicao.findUnique({ where: { mpConnectToken: state } })
  if (!inst) {
    res.redirect(`${frontendUrl}/conectar-mp?erro=link-invalido`)
    return
  }

  try {
    const tokenRes = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_secret: process.env.MP_CLIENT_SECRET,
        client_id: process.env.MP_CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.MP_REDIRECT_URI,
      }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('MP token error:', err)
      res.redirect(`${frontendUrl}/conectar-mp?erro=falha-autorizacao`)
      return
    }

    const data = await tokenRes.json() as { access_token: string; user_id: number; public_key?: string }

    await prisma.instituicao.update({
      where: { id: inst.id },
      data: {
        mercadoPagoToken: data.access_token,
        mpAccountId: String(data.user_id),
        mpPublicKey: data.public_key || null,
        mpConnectToken: null, // invalida o token após uso
      },
    })

    res.redirect(`${frontendUrl}/conectar-mp?sucesso=1&inst=${encodeURIComponent(inst.nome)}`)
  } catch (err) {
    console.error('MP callback error:', err)
    res.redirect(`${frontendUrl}/conectar-mp?erro=erro-interno`)
  }
})

// GET /api/mp/chave-publica?doacaoId=xxx — retorna a public key da instituição para tokenização no frontend
router.get('/chave-publica', async (req: Request, res: Response) => {
  const doacaoId = Number(req.query.doacaoId)
  const fallback = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || ''

  if (!doacaoId) { res.json({ publicKey: fallback }); return }

  try {
    const doacao = await prisma.doacao.findUnique({
      where: { id: doacaoId },
      include: { instituicao: true },
    })
    if (!doacao?.instituicao) { res.json({ publicKey: fallback }); return }

    const inst = doacao.instituicao

    // Se já temos a chave salva, retorna direto
    if (inst.mpPublicKey) { res.json({ publicKey: inst.mpPublicKey }); return }

    // Tenta buscar via API do MP usando o token da instituição
    if (inst.mercadoPagoToken) {
      try {
        const userRes = await fetch('https://api.mercadopago.com/users/me', {
          headers: { Authorization: `Bearer ${inst.mercadoPagoToken}` },
        })
        if (userRes.ok) {
          const user = await userRes.json() as { id: number }
          const credRes = await fetch(
            `https://api.mercadopago.com/users/${user.id}/mercadopago_account/credentials`,
            { headers: { Authorization: `Bearer ${inst.mercadoPagoToken}` } }
          )
          if (credRes.ok) {
            const cred = await credRes.json() as { public_key?: string }
            if (cred.public_key) {
              await prisma.instituicao.update({ where: { id: inst.id }, data: { mpPublicKey: cred.public_key } })
              res.json({ publicKey: cred.public_key }); return
            }
          }
        }
      } catch (e) { console.error('chave-publica fetch error:', e) }
    }

    res.json({ publicKey: fallback })
  } catch {
    res.json({ publicKey: fallback })
  }
})

// POST /api/mp/pix — gera QR Code Pix direto (sem login, sem redirecionamento)
router.post('/pix', async (req: Request, res: Response) => {
  const { doacaoId } = req.body
  if (!doacaoId) { res.status(400).json({ error: 'doacaoId obrigatório' }); return }

  try {
    const doacao = await prisma.doacao.findUnique({
      where: { id: Number(doacaoId) },
      include: { instituicao: true },
    })
    if (!doacao) { res.status(404).json({ error: 'Doação não encontrada' }); return }
    if (doacao.pago) { res.status(400).json({ error: 'Doação já paga' }); return }

    const inst = doacao.instituicao
    if (!inst.mercadoPagoToken) {
      res.status(400).json({ error: 'Esta instituição ainda não configurou o recebimento de pagamentos. Entre em contato com o administrador.' }); return
    }
    const clienteInst = new MercadoPagoConfig({ accessToken: inst.mercadoPagoToken })
    const paymentClient = new Payment(clienteInst)

    const payment = await paymentClient.create({
      body: {
        transaction_amount: doacao.valorTotal,
        description: `Doação — ${inst.nome}`,
        payment_method_id: 'pix',
        payer: {
          email: doacao.doadorEmail || 'doador@humanitybearers.com.br',
          first_name: doacao.doadorNome || 'Doador',
        },
        external_reference: String(doacao.id),
        notification_url: `${process.env.NEXT_PUBLIC_URL || process.env.BACKEND_URL || 'http://localhost:3003'}/api/mp/webhook`,
      },
    })

    const pix = payment.point_of_interaction?.transaction_data
    if (!pix?.qr_code) {
      console.error('MP pix: QR Code null. payment_status:', payment.status, 'point_of_interaction:', JSON.stringify(payment.point_of_interaction))
      res.status(400).json({
        error: 'A conta do Mercado Pago desta instituição não possui chave PIX cadastrada ou o PIX não está ativo. O responsável pela instituição precisa acessar mercadopago.com.br → Configurações → Meios de pagamento → PIX e cadastrar uma chave PIX.',
        codigo: 'SEM_CHAVE_PIX',
      })
      return
    }

    // Salva o ID do pagamento MP e o método na doação
    await prisma.doacao.update({
      where: { id: doacao.id },
      data: { mpPaymentId: String(payment.id), metodoPagamento: 'pix' },
    })

    res.json({
      pixCopiaECola: pix.qr_code,
      qrCodeBase64: pix.qr_code_base64 ? `data:image/png;base64,${pix.qr_code_base64}` : null,
      valorTotal: doacao.valorTotal,
      expiracao: payment.date_of_expiration,
    })
  } catch (err: any) {
    const rawMsg: string = err?.message || String(err?.cause || '')
    console.error('MP pix error:', rawMsg, err?.cause)

    // Erro específico: conta do recebedor sem chave PIX
    const semChavePix =
      rawMsg.includes('key enabled') ||
      rawMsg.includes('QR render') ||
      rawMsg.includes('13253') ||
      rawMsg.includes('Financial Identity') ||
      rawMsg.includes('Collector user')

    if (semChavePix) {
      res.status(400).json({
        error: 'A conta do Mercado Pago desta instituição não possui chave PIX cadastrada ou o PIX não está ativo. O responsável precisa acessar mercadopago.com.br → Configurações → Meios de pagamento → PIX e cadastrar uma chave.',
        codigo: 'SEM_CHAVE_PIX',
      })
    } else {
      res.status(500).json({ error: rawMsg || 'Erro ao gerar Pix' })
    }
  }
})

// POST /api/mp/cartao-token — processa pagamento com cartão via token (Bricks)
router.post('/cartao-token', async (req: Request, res: Response) => {
  const { doacaoId, token, installments, paymentMethodId, issuerId, payerEmail, payerIdentification } = req.body
  if (!doacaoId || !token) { res.status(400).json({ error: 'doacaoId e token obrigatórios' }); return }

  try {
    const doacao = await prisma.doacao.findUnique({
      where: { id: Number(doacaoId) },
      include: { instituicao: true },
    })
    if (!doacao) { res.status(404).json({ error: 'Doação não encontrada' }); return }
    if (doacao.pago) { res.status(400).json({ error: 'Doação já paga' }); return }

    const paymentBody = {
      transaction_amount: doacao.valorTotal,
      token,
      description: `Doação — ${doacao.instituicao.nome}`,
      installments: installments || 1,
      payment_method_id: paymentMethodId,
      issuer_id: issuerId,
      payer: {
        email: payerEmail || doacao.doadorEmail || 'doador@humanitybearers.com.br',
        identification: payerIdentification,
      },
      external_reference: String(doacao.id),
      notification_url: `${process.env.NEXT_PUBLIC_URL || process.env.BACKEND_URL || 'http://localhost:3003'}/api/mp/webhook`,
    }

    // Prefere o token da instituição (combina com a public key usada na tokenização)
    // Se der erro de credenciais (17 = token/chave não batem), cai no token da plataforma
    let payment: any
    const instToken = doacao.instituicao.mercadoPagoToken
    if (instToken) {
      try {
        const instConfig = new MercadoPagoConfig({ accessToken: instToken })
        payment = await new Payment(instConfig).create({ body: paymentBody })
        console.log(`💳 Cartão via token da instituição: status=${payment.status}`)
      } catch (err: any) {
        const cause = err?.cause?.[0]?.code
        const isCredError = cause === 17 || cause === 2 || err?.status === 401
        if (isCredError) {
          console.log('💳 Token da instituição incompatível (erro', cause, '), usando plataforma')
          payment = await new Payment(mpClient).create({ body: paymentBody })
        } else {
          throw err
        }
      }
    } else {
      payment = await new Payment(mpClient).create({ body: paymentBody })
    }

    console.log(`💳 Cartão: status=${payment.status} detail=${(payment as any).status_detail}`)

    if (payment.status === 'approved') {
      await prisma.doacao.update({
        where: { id: doacao.id },
        data: { pago: true, dataPagamento: new Date(), mpPaymentId: String(payment.id), metodoPagamento: 'cartao' },
      })
    } else {
      await prisma.doacao.update({
        where: { id: doacao.id },
        data: { mpPaymentId: String(payment.id), metodoPagamento: 'cartao' },
      })
    }

    res.json({
      status: payment.status,
      statusDetail: (payment as any).status_detail,
      paymentId: payment.id,
    })
  } catch (err: any) {
    console.error('MP cartao-token error:', err?.cause || err?.message || err)
    res.status(500).json({ error: err?.message || 'Erro ao processar cartão' })
  }
})

// POST /api/mp/cartao — cria preferência Checkout Pro para cartão (redirect)
router.post('/cartao', async (req: Request, res: Response) => {
  const { doacaoId, tipoCartao } = req.body
  if (!doacaoId) { res.status(400).json({ error: 'doacaoId obrigatório' }); return }

  try {
    const doacao = await prisma.doacao.findUnique({
      where: { id: Number(doacaoId) },
      include: { instituicao: true },
    })
    if (!doacao) { res.status(404).json({ error: 'Doação não encontrada' }); return }
    if (doacao.pago) { res.status(400).json({ error: 'Doação já paga' }); return }

    const inst = doacao.instituicao
    const frontendUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

    // Usa o token da PLATAFORMA para o Checkout Pro.
    // cc_rejected_high_risk ocorre quando a conta da instituição não completou
    // verificação de identidade no MP para receber cartão.
    // PIX continua usando o token da instituição (sem essa restrição).
    const tokenParaCartao = process.env.MP_ACCESS_TOKEN || inst.mercadoPagoToken || ''
    if (!tokenParaCartao) {
      res.status(400).json({ error: 'Nenhum token de pagamento configurado.' }); return
    }
    const prefClient = new Preference(new MercadoPagoConfig({ accessToken: tokenParaCartao }))
    console.log(`💳 Checkout Pro usando token da ${process.env.MP_ACCESS_TOKEN ? 'plataforma' : 'instituição'}`)

    // Exclui apenas métodos não-cartão (boleto, transferência, etc.)
    // Não restringe crédito/débito para não causar erro fatal no checkout MP
    // caso a conta da instituição não tenha um dos subtipos habilitado
    const excludedTypes: { id: string }[] = [{ id: 'ticket' }, { id: 'bank_transfer' }, { id: 'atm' }]

    const pref = await prefClient.create({
      body: {
        items: [{
          id: String(doacao.id),
          title: `Doação — ${inst.nome}`,
          description: `${doacao.quantidade}x ${inst.tipo}`,
          category_id: 'services',
          unit_price: doacao.valorTotal,
          quantity: doacao.quantidade,
          currency_id: 'BRL',
        }],
        payer: {
          name: doacao.doadorNome || 'Doador',
          email: doacao.doadorEmail || 'doador@humanitybearers.com.br',
        },
        payment_methods: {
          excluded_payment_types: excludedTypes,
          installments: 1,
        },
        back_urls: {
          success: `${frontendUrl}/doacao?status=sucesso&id=${doacao.id}`,
          failure: `${frontendUrl}/doacao?status=falha&id=${doacao.id}`,
          pending: `${frontendUrl}/doacao?status=pendente&id=${doacao.id}`,
        },
        auto_return: 'approved',
        external_reference: String(doacao.id),
        notification_url: `${process.env.NEXT_PUBLIC_URL || process.env.BACKEND_URL || 'http://localhost:3003'}/api/mp/webhook`,
        statement_descriptor: 'HUMANITY BEARERS',
      },
    })

    // Atualiza o método de pagamento na doação
    await prisma.doacao.update({
      where: { id: doacao.id },
      data: { metodoPagamento: 'cartao' },
    })

    res.json({ init_point: pref.init_point })
  } catch (err: any) {
    console.error('MP cartao error:', err?.cause || err?.message || err)
    res.status(500).json({ error: err?.message || 'Erro ao criar pagamento com cartão' })
  }
})

// POST /api/mp/preferencia — cria preferência Checkout Pro para uma doação
router.post('/preferencia', async (req: Request, res: Response) => {
  const { doacaoId } = req.body
  if (!doacaoId) { res.status(400).json({ error: 'doacaoId obrigatório' }); return }

  try {
    const doacao = await prisma.doacao.findUnique({
      where: { id: Number(doacaoId) },
      include: { instituicao: true },
    })
    if (!doacao) { res.status(404).json({ error: 'Doação não encontrada' }); return }
    if (doacao.pago) { res.status(400).json({ error: 'Doação já paga' }); return }

    const inst = doacao.instituicao
    if (!inst.mercadoPagoToken) {
      res.status(400).json({ error: 'Esta instituição ainda não configurou o recebimento de pagamentos. Entre em contato com o administrador.' }); return
    }
    const frontendUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
    const clienteInst = new MercadoPagoConfig({ accessToken: inst.mercadoPagoToken })
    const prefClient = new Preference(clienteInst)

    const preferenceData: any = {
      items: [{
        id: String(doacao.id),
        title: `Doação — ${inst.nome}`,
        description: `${doacao.quantidade}x ${inst.tipo}`,
        unit_price: doacao.valorTotal,
        quantity: 1,
        currency_id: 'BRL',
      }],
      payer: doacao.doadorEmail ? {
        name: doacao.doadorNome,
        email: doacao.doadorEmail,
      } : { email: 'doador@humanitybearers.com.br' },
      back_urls: {
        success: `${frontendUrl}/doacao?status=sucesso&id=${doacao.id}`,
        failure: `${frontendUrl}/doacao?status=falha&id=${doacao.id}`,
        pending: `${frontendUrl}/doacao?status=pendente&id=${doacao.id}`,
      },
      auto_return: 'approved',
      external_reference: String(doacao.id),
      notification_url: `${process.env.NEXT_PUBLIC_URL || process.env.BACKEND_URL || 'http://localhost:3001'}/api/mp/webhook`,
      statement_descriptor: 'HUMANITY BEARERS',
    }

    // Se usa token da instituição E a plataforma tem token → aplica marketplace_fee (18%)
    if (inst.mercadoPagoToken && process.env.MP_ACCESS_TOKEN) {
      preferenceData.marketplace_fee = Number((doacao.valorTotal * 0.18).toFixed(2))
    }

    const pref = await prefClient.create({ body: preferenceData })

    res.json({
      preferenceId: pref.id,
      init_point: pref.init_point,           // produção
      sandbox_init_point: pref.sandbox_init_point, // testes
    })
  } catch (err: any) {
    console.error('MP preferência error:', err)
    res.status(500).json({ error: err?.message || 'Erro ao criar preferência MP' })
  }
})

// POST /api/mp/webhook — notificações automáticas do Mercado Pago
router.post('/webhook', async (req: Request, res: Response) => {
  res.sendStatus(200) // MP exige resposta imediata

  try {
    const { type, data } = req.body
    if (type !== 'payment' || !data?.id) return

    const paymentIdStr = String(data.id)

    // Busca a doação pelo mpPaymentId para obter o token correto da instituição
    const doacaoPorPagamento = await prisma.doacao.findFirst({
      where: { mpPaymentId: paymentIdStr },
      include: { instituicao: true },
    })

    // Usa o token da instituição se disponível, senão cai no token da plataforma
    const tokenUsado = doacaoPorPagamento?.instituicao?.mercadoPagoToken
      || process.env.MP_ACCESS_TOKEN
      || ''
    const clienteUsado = new MercadoPagoConfig({ accessToken: tokenUsado })
    const paymentClient = new Payment(clienteUsado)
    const payment = await paymentClient.get({ id: data.id })

    console.log(`📩 Webhook MP: payment ${paymentIdStr} status=${payment.status}`)

    if (payment.status !== 'approved') return

    const doacaoId = doacaoPorPagamento?.id || Number(payment.external_reference)
    if (!doacaoId || isNaN(doacaoId)) return

    const doacao = await prisma.doacao.findUnique({ where: { id: doacaoId } })
    if (!doacao || doacao.pago) return

    // Confirma a doação automaticamente
    await prisma.doacao.update({
      where: { id: doacaoId },
      data: { pago: true, dataPagamento: new Date(), mpPaymentId: String(data.id) },
    })

    if (doacao.doadorId) {
      const doadorAtualizado = await prisma.doador.update({
        where: { id: doacao.doadorId },
        data: {
          totalDoado: { increment: doacao.valorTotal },
          pontos: { increment: Math.round(doacao.valorTotal * 10) },
        },
      })
      const { nivel, badge } = calcularNivel(doadorAtualizado.pontos)
      await prisma.doador.update({ where: { id: doacao.doadorId }, data: { nivel, badge } })
      await verificarMissoesAutomaticas(doacao.doadorId)
    }

    console.log(`✅ Doação #${doacaoId} confirmada via webhook MP`)
  } catch (err) {
    console.error('MP webhook error:', err)
  }
})

// POST /api/mp/gerar-link/:instId  (protegido — chamado pelo admin)
router.post('/gerar-link/:instId', async (req: Request, res: Response) => {
  const id = parseInt(req.params.instId)
  const inst = await prisma.instituicao.findUnique({ where: { id } })
  if (!inst) { res.status(404).json({ error: 'Instituição não encontrada' }); return }

  const token = crypto.randomBytes(24).toString('hex')
  await prisma.instituicao.update({ where: { id }, data: { mpSetupToken: token } })

  const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '').split('/').slice(0, 3).join('/') || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
  const link = `${origin}/configurar-mp?token=${token}`

  res.json({ link, token })
})

export default router
