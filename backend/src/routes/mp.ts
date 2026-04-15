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

// POST /api/mp/cartao-token — Checkout Transparente
router.post('/cartao-token', async (req: Request, res: Response) => {
  const { doacaoId, token, installments, paymentMethodId, issuerId, bin, payerEmail, payerIdentification, cardholderName } = req.body
  if (!doacaoId || !token) { res.status(400).json({ error: 'doacaoId e token obrigatórios' }); return }

  try {
    const doacao = await prisma.doacao.findUnique({
      where: { id: Number(doacaoId) },
      include: { instituicao: true },
    })
    if (!doacao) { res.status(404).json({ error: 'Doação não encontrada' }); return }
    if (doacao.pago) { res.status(400).json({ error: 'Doação já paga' }); return }

    // Email — obrigatório. Sem fallback fraco: o antifraude do MP bloqueia
    // pagamentos que chegam com o mesmo email genérico repetidas vezes.
    const email = (payerEmail || doacao.doadorEmail || '').trim()
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'É necessário informar um e-mail válido antes de pagar com cartão.' }); return
    }

    // Nome — usa o da doação ou o nome digitado no cartão como fallback.
    // Nunca enviamos "Doador" / "Anônimo" pois o MP flag'a como padrão de fraude.
    const nomeBruto = (doacao.doadorNome || cardholderName || '').trim()
    const nomeEhReal = nomeBruto.length > 0
      && nomeBruto.toLowerCase() !== 'doador'
      && nomeBruto.toLowerCase() !== 'anônimo'
      && nomeBruto.toLowerCase() !== 'anonimo'
    if (!nomeEhReal) {
      res.status(400).json({ error: 'É necessário informar seu nome antes de pagar com cartão.' }); return
    }
    const partesNome = nomeBruto.split(/\s+/)
    const firstName = partesNome[0]
    const lastName = partesNome.length > 1 ? partesNome.slice(1).join(' ') : firstName

    const inst = doacao.instituicao
    if (!inst.mercadoPagoToken) {
      res.status(400).json({ error: 'Esta instituição ainda não configurou o recebimento de pagamentos.' }); return
    }

    // Resolve issuer_id: se o frontend não conseguiu (SDK falhou),
    // busca via API do MP usando o BIN do cartão.
    let finalIssuerId = issuerId
    if (!finalIssuerId && bin && paymentMethodId) {
      try {
        const r = await fetch(
          `https://api.mercadopago.com/v1/payment_methods/card_issuers?payment_method_id=${encodeURIComponent(paymentMethodId)}&bin=${encodeURIComponent(bin)}`,
          { headers: { Authorization: `Bearer ${inst.mercadoPagoToken}` } }
        )
        if (r.ok) {
          const arr = await r.json() as Array<{ id?: string }>
          if (Array.isArray(arr) && arr[0]?.id) finalIssuerId = arr[0].id
        }
      } catch (e) { console.error('issuer_id lookup failed:', e) }
    }

    const paymentBody: any = {
      transaction_amount: doacao.valorTotal,
      token,
      description: `Doação — ${doacao.instituicao.nome}`,
      installments: installments || 1,
      payment_method_id: paymentMethodId,
      issuer_id: finalIssuerId,
      statement_descriptor: 'HUMANITYBEARERS',
      payer: {
        email,
        first_name: firstName,
        last_name: lastName,
        identification: payerIdentification,
      },
      // Campos de homologação do MP — melhoram o índice de aprovação do antifraude
      additional_info: {
        items: [
          {
            id: String(doacao.id),
            title: `Doação — ${doacao.instituicao.nome}`,
            description: `${doacao.quantidade}x ${doacao.instituicao.tipo || 'doação'}`,
            category_id: 'donations',
            quantity: doacao.quantidade || 1,
            unit_price: Number((doacao.valorTotal / (doacao.quantidade || 1)).toFixed(2)),
          },
        ],
        payer: {
          first_name: firstName,
          last_name: lastName,
        },
      },
      external_reference: String(doacao.id),
      notification_url: `${process.env.NEXT_PUBLIC_URL || process.env.BACKEND_URL || 'http://localhost:3003'}/api/mp/webhook`,
    }

    console.log(`💳 Cartão iniciando — inst=${inst.id} paymentMethodId=${paymentMethodId} issuer_id=${finalIssuerId || '(none)'} email=${email}`)

    // IMPORTANTE: chamamos POST /v1/payments direto via fetch em vez de usar
    // o SDK (new Payment(...).create()). O SDK v2 do Node tem um schema interno
    // que **remove `additional_info`** silenciosamente antes de enviar, o que
    // impede a homologação do MP (que exige items.id/title/description/etc).
    const mpResp = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${inst.mercadoPagoToken}`,
        'X-Idempotency-Key': `doacao-${doacao.id}-${Date.now()}`,
      },
      body: JSON.stringify(paymentBody),
    })
    const payment: any = await mpResp.json()
    if (!mpResp.ok) {
      console.error('MP cartao-token HTTP error:', mpResp.status, JSON.stringify(payment))
      const msg = payment?.message || payment?.cause?.[0]?.description || 'Erro ao processar cartão'
      res.status(mpResp.status).json({ error: msg })
      return
    }
    console.log(`💳 Cartão (inst ${inst.id}): status=${payment.status} detail=${payment.status_detail} id=${payment.id}`)

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

    const threeDsInfo = payment.three_ds_info || null
    res.json({
      status: payment.status,
      statusDetail: payment.status_detail,
      paymentId: payment.id,
      threeDsInfo, // { external_resource_url, creq } quando pending_challenge
    })
  } catch (err: any) {
    const cause = err?.cause || err
    console.error('MP cartao-token error:', JSON.stringify(cause, null, 2))
    const msgMp = (cause as any)?.message || err?.message || 'Erro ao processar cartão'
    res.status(500).json({ error: msgMp })
  }
})

// GET /api/mp/status-doacao?doacaoId=xxx — polling de status para o 3DS
router.get('/status-doacao', async (req: Request, res: Response) => {
  const doacaoId = Number(req.query.doacaoId)
  if (!doacaoId) { res.status(400).json({ error: 'doacaoId obrigatório' }); return }
  try {
    const doacao = await prisma.doacao.findUnique({ where: { id: doacaoId }, select: { pago: true, mpPaymentId: true } })
    if (!doacao) { res.status(404).json({ error: 'Doação não encontrada' }); return }
    res.json({ pago: doacao.pago, mpPaymentId: doacao.mpPaymentId })
  } catch {
    res.status(500).json({ error: 'Erro interno' })
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

    // Usa SEMPRE o access_token da instituição (colado manualmente no
    // fluxo /configurar-mp?token=X pelo próprio responsável dela). Assim
    // o dinheiro cai direto na conta MP da instituição — como o PIX já faz.
    //
    // Versão anterior fallava pra process.env.MP_ACCESS_TOKEN (conta da
    // plataforma) como tentativa de contornar cc_rejected_high_risk — mas
    // isso (a) fazia o dinheiro cair na conta pessoal do dev, quebrando o
    // modelo marketplace, e (b) disparava o bloqueio de self-payment do MP
    // quando o próprio dev tentava testar.
    if (!inst.mercadoPagoToken) {
      res.status(400).json({
        error: 'Esta instituição ainda não configurou as credenciais do Mercado Pago. Peça ao admin para gerar um link de configuração.',
      })
      return
    }
    const prefClient = new Preference(new MercadoPagoConfig({ accessToken: inst.mercadoPagoToken }))
    console.log(`💳 Checkout Pro — doacao=${doacao.id} inst=${inst.id} nome="${inst.nome}"`)

    // Exclui apenas métodos não-cartão (boleto, transferência, etc.)
    // Não restringe crédito/débito para não causar erro fatal no checkout MP
    // caso a conta da instituição não tenha um dos subtipos habilitado
    const excludedTypes: { id: string }[] = [{ id: 'ticket' }, { id: 'bank_transfer' }, { id: 'atm' }]

    // Payer enriquecido — o Checkout Pro bloqueia o botão "Pagar" quando
    // o objeto payer chega com dados insuficientes. Quebramos o nome em
    // first_name/surname, passamos telefone e (quando houver) CPF.
    const nomeBruto = (doacao.doadorNome || '').trim()
    const nomeEhReal = nomeBruto.length > 0
      && nomeBruto.toLowerCase() !== 'doador'
      && nomeBruto.toLowerCase() !== 'anônimo'
      && nomeBruto.toLowerCase() !== 'anonimo'
    const partesNome = nomeEhReal ? nomeBruto.split(/\s+/) : []
    const firstName = partesNome[0] || 'Doador'
    const surname = partesNome.length > 1 ? partesNome.slice(1).join(' ') : 'Solidário'

    // Telefone — separa DDD dos demais dígitos (padrão MP)
    const telDigits = (doacao.doadorTel || '').replace(/\D/g, '')
    const phone = telDigits.length >= 10
      ? { area_code: telDigits.slice(0, 2), number: telDigits.slice(2) }
      : undefined

    const payerPref: any = {
      name: firstName,
      surname,
      email: (doacao.doadorEmail || '').trim() || 'doador@humanitybearers.com.br',
    }
    if (phone) payerPref.phone = phone

    const pref = await prefClient.create({
      body: {
        items: [{
          id: String(doacao.id),
          title: `Doação — ${inst.nome}`,
          description: `${doacao.quantidade}x ${inst.tipo}`,
          category_id: 'services',
          unit_price: Number((doacao.valorTotal / (doacao.quantidade || 1)).toFixed(2)),
          quantity: doacao.quantidade || 1,
          currency_id: 'BRL',
        }],
        payer: payerPref,
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
        statement_descriptor: 'HUMANITYBEARERS',
      },
    })
    console.log(`💳 Preferência criada — doacao=${doacao.id} pref_id=${pref.id} payer=${firstName} ${surname} <${payerPref.email}>`)

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
