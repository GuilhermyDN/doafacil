import { PrismaClient, TipoMissao } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

function gerarSerial(ano: number, campanha: string, sequencia: number) {
  const anoStr = String(ano).slice(-2).padStart(2, '0')
  const seqStr = String(sequencia).padStart(4, '0')
  const chave = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 4)
  return { serial: `GS-HB${anoStr}-${campanha}-${seqStr}-${chave}`, chave }
}

async function main() {
  console.log('🌱 Iniciando seed...')

  // ── Instituições ────────────────────────────────────────────────────────────
  const instituicoes = await Promise.all([
    prisma.instituicao.upsert({
      where: { id: 1 }, update: {},
      create: { nome: 'Lar São Francisco', tipo: 'Refeicao', valor: 15, cor: '#FF4E00', bg: '#FFF3EE', emoji: '🍽️', pixKey: 'pix@larsaofrancisco.org' },
    }),
    prisma.instituicao.upsert({
      where: { id: 2 }, update: {},
      create: { nome: 'Abrigo da Paz', tipo: 'Banho', valor: 8, cor: '#000DFF', bg: '#EEF0FF', emoji: '🚿', pixKey: 'pix@abrigodapaz.org' },
    }),
    prisma.instituicao.upsert({
      where: { id: 3 }, update: {},
      create: { nome: 'Casa do Aconchego', tipo: 'Cobertor', valor: 25, cor: '#000000', bg: '#F5F5F5', emoji: '🛏️', pixKey: 'pix@casadoaconchego.org' },
    }),
  ])
  console.log(`✅ ${instituicoes.length} instituições`)

  // ── Missões (limpa antes para evitar duplicatas) ────────────────────────────
  await prisma.missaoDoador.deleteMany({})
  await prisma.missao.deleteMany({})
  const missoes = await Promise.all([
    prisma.missao.create({ data: { titulo: 'Primeira Doação',  descricao: 'Faça sua primeira doação e entre para o time!',          pontos: 100,  emoji: '🎯',      tipo: TipoMissao.PRIMEIRA_DOACAO } }),
    prisma.missao.create({ data: { titulo: 'Família Unida',    descricao: 'Doe junto com pelo menos 1 familiar.',                    pontos: 300,  emoji: '👨‍👩‍👧',    tipo: TipoMissao.FAMILIA } }),
    prisma.missao.create({ data: { titulo: 'Meta Refeição',    descricao: 'Ajude pelo menos 10 refeições.',                          pontos: 500,  emoji: '🍽️',      tipo: TipoMissao.META_REFEICAO } }),
    prisma.missao.create({ data: { titulo: 'Mês Completo',     descricao: 'Doe em pelo menos 4 semanas distintas no mês.',           pontos: 800,  emoji: '📅',       tipo: TipoMissao.MES_COMPLETO } }),
    prisma.missao.create({ data: { titulo: 'Meta de Valor',    descricao: 'Acumule R$200 em doações confirmadas.',                   pontos: 1000, emoji: '💰',       tipo: TipoMissao.META_VALOR } }),
    prisma.missao.create({ data: { titulo: 'Indicação',        descricao: 'Indique um amigo que também doe.',                        pontos: 400,  emoji: '🤝',       tipo: TipoMissao.INDICACAO } }),
  ])
  // IDs reais das missões criadas: [0]=PrimDoacao [1]=Familia [2]=MetaRef [3]=MesComp [4]=MetaValor [5]=Indicacao
  const mId = missoes.map(m => m.id)
  console.log('✅ 6 missões')

  // ── Admin ───────────────────────────────────────────────────────────────────
  const senhaHash = await bcrypt.hash('admin123', 10)
  await prisma.adminUser.upsert({
    where: { email: 'admin@igreja.com' }, update: {},
    create: { email: 'admin@igreja.com', senha: senhaHash, nome: 'Administrador', role: 'SUPER_ADMIN' },
  })
  console.log('✅ Admin: admin@igreja.com / admin123')

  // ── Evento ──────────────────────────────────────────────────────────────────
  await prisma.evento.upsert({
    where: { id: 1 }, update: {},
    create: { nome: 'Culto de Domingo', dataEvento: new Date('2026-03-29T10:00:00Z') },
  })

  // ── Doadores simulados ──────────────────────────────────────────────────────
  const doadores = [
    { nome: 'Guilhermy Damasceno', email: 'guilhermy@demo.com', tel: '11999990001', nivel: 'goat'     as const, pontos: 4200, totalDoado: 680, voluntario: true,  servico: 'Coordenação de eventos' },
    { nome: 'Ana Paula Ferreira',   email: 'ana@demo.com',       tel: '11999990002', nivel: 'ruler'    as const, pontos: 2100, totalDoado: 345, voluntario: false, servico: null },
    { nome: 'Carlos Mendes',        email: 'carlos@demo.com',    tel: '11999990003', nivel: 'tough'    as const, pontos: 950,  totalDoado: 180, voluntario: false, servico: null },
    { nome: 'Beatriz Santos',       email: 'beatriz@demo.com',   tel: '11999990004', nivel: 'fstar'    as const, pontos: 3100, totalDoado: 520, voluntario: true,  servico: 'Suporte às famílias' },
    { nome: 'Rafael Lima',          email: 'rafael@demo.com',    tel: '11999990005', nivel: 'cool'     as const, pontos: 420,  totalDoado: 75,  voluntario: false, servico: null },
    { nome: 'Mariana Costa',        email: 'mariana@demo.com',   tel: '11999990006', nivel: 'topnotch' as const, pontos: 3800, totalDoado: 610, voluntario: false, servico: null },
    { nome: 'João Victor',          email: 'joao@demo.com',      tel: '11999990007', nivel: 'nice'     as const, pontos: 100,  totalDoado: 15,  voluntario: false, servico: null },
    { nome: 'Fernanda Oliveira',    email: 'fernanda@demo.com',  tel: '11999990008', nivel: 'cool'     as const, pontos: 380,  totalDoado: 60,  voluntario: false, servico: null },
  ]

  const doadorRecords: any[] = []
  for (let i = 0; i < doadores.length; i++) {
    const d = doadores[i]
    const iniciais = d.nome.split(' ').slice(0, 2).map(n => n[0].toUpperCase()).join('')
    const rec = await prisma.doador.upsert({
      where: { email: d.email },
      update: { pontos: d.pontos, totalDoado: d.totalDoado, nivel: d.nivel, isVoluntario: d.voluntario, servicoVoluntario: d.servico },
      create: {
        nome: d.nome, email: d.email, telefone: d.tel,
        avatar: iniciais, numero: String(100001 + i),
        pontos: d.pontos, totalDoado: d.totalDoado, nivel: d.nivel,
        isVoluntario: d.voluntario, servicoVoluntario: d.servico,
      },
    })
    doadorRecords.push(rec)
  }
  console.log(`✅ ${doadorRecords.length} doadores`)

  // ── Tags simuladas (campanha D01/2025) ──────────────────────────────────────
  const tagRecords: any[] = []
  for (let i = 1; i <= 12; i++) {
    const { serial, chave } = gerarSerial(25, 'D01', i)
    // evita duplicatas de serial (improvável mas seguro)
    const existing = await prisma.tag.findUnique({ where: { serial } })
    if (existing) { tagRecords.push(existing); continue }
    const doadorId = i <= doadorRecords.length ? doadorRecords[i - 1].id : null
    const tag = await prisma.tag.create({
      data: {
        serial, ano: 25, campanha: 'D01', sequencia: i, chave,
        doadorId,
        vinculadaEm: doadorId ? new Date(Date.now() - (12 - i) * 7 * 24 * 3600 * 1000) : null,
      },
    })
    tagRecords.push(tag)
  }
  console.log(`✅ ${tagRecords.length} tags`)

  // ── Doações simuladas ───────────────────────────────────────────────────────
  const doacoesData = [
    // Guilhermy — GOAT
    { doadorIdx: 0, instId: 1, qtd: 5, diasAtras: 2,  pago: true  },
    { doadorIdx: 0, instId: 3, qtd: 2, diasAtras: 9,  pago: true  },
    { doadorIdx: 0, instId: 2, qtd: 4, diasAtras: 16, pago: true  },
    { doadorIdx: 0, instId: 1, qtd: 8, diasAtras: 23, pago: true  },
    // Ana — RULER
    { doadorIdx: 1, instId: 1, qtd: 3, diasAtras: 3,  pago: true  },
    { doadorIdx: 1, instId: 2, qtd: 5, diasAtras: 11, pago: true  },
    { doadorIdx: 1, instId: 3, qtd: 1, diasAtras: 25, pago: true  },
    // Carlos — TOUGH
    { doadorIdx: 2, instId: 2, qtd: 2, diasAtras: 5,  pago: true  },
    { doadorIdx: 2, instId: 1, qtd: 3, diasAtras: 20, pago: true  },
    // Beatriz — F-STAR
    { doadorIdx: 3, instId: 1, qtd: 6, diasAtras: 1,  pago: true  },
    { doadorIdx: 3, instId: 3, qtd: 3, diasAtras: 8,  pago: true  },
    { doadorIdx: 3, instId: 2, qtd: 4, diasAtras: 18, pago: true  },
    // Rafael — COOL
    { doadorIdx: 4, instId: 1, qtd: 1, diasAtras: 7,  pago: true  },
    { doadorIdx: 4, instId: 2, qtd: 2, diasAtras: 30, pago: false },
    // Mariana — TOPNOTCH
    { doadorIdx: 5, instId: 1, qtd: 7, diasAtras: 2,  pago: true  },
    { doadorIdx: 5, instId: 3, qtd: 4, diasAtras: 10, pago: true  },
    { doadorIdx: 5, instId: 1, qtd: 5, diasAtras: 17, pago: true  },
    // João — NICE
    { doadorIdx: 6, instId: 1, qtd: 1, diasAtras: 4,  pago: true  },
    // Fernanda — COOL
    { doadorIdx: 7, instId: 2, qtd: 3, diasAtras: 6,  pago: true  },
    { doadorIdx: 7, instId: 1, qtd: 1, diasAtras: 28, pago: false },
    // Anônimas
    { doadorIdx: -1, instId: 1, qtd: 2, diasAtras: 3,  pago: true  },
    { doadorIdx: -1, instId: 2, qtd: 1, diasAtras: 12, pago: true  },
  ]

  const insts = [null, instituicoes[0], instituicoes[1], instituicoes[2]]
  let doacoesCriadas = 0
  for (const d of doacoesData) {
    const inst = insts[d.instId]!
    const valorTotal = inst.valor * d.qtd
    const data = new Date(Date.now() - d.diasAtras * 24 * 3600 * 1000)
    const doador = d.doadorIdx >= 0 ? doadorRecords[d.doadorIdx] : null
    const tag = d.doadorIdx >= 0 && d.doadorIdx < tagRecords.length ? tagRecords[d.doadorIdx] : null
    await prisma.doacao.create({
      data: {
        doadorNome: doador?.nome ?? 'Anônimo',
        doadorEmail: doador?.email ?? null,
        doadorTel: doador?.telefone ?? null,
        doadorId: doador?.id ?? null,
        tagId: tag?.id ?? null,
        instituicaoId: inst.id,
        quantidade: d.qtd,
        valorTotal,
        pago: d.pago,
        dataCriacao: data,
        dataPagamento: d.pago ? data : null,
      },
    })
    doacoesCriadas++
  }
  console.log(`✅ ${doacoesCriadas} doações`)

  // ── Missões completadas ─────────────────────────────────────────────────────
  // Todos os doadores completaram "Primeira Doação" (mId[0])
  for (const d of doadorRecords) {
    await prisma.missaoDoador.create({
      data: { doadorId: d.id, missaoId: mId[0], completa: true, completaEm: new Date(Date.now() - 25 * 24 * 3600 * 1000) },
    })
  }
  // Doadores com mais doações completaram outras missões
  // índices: mId[1]=Familia mId[2]=MetaRef mId[3]=MesComp mId[4]=MetaValor mId[5]=Indicacao
  const missoesExtra = [
    { doadorIdx: 0, mIndexes: [1, 2, 3, 4] },
    { doadorIdx: 3, mIndexes: [1, 2, 4] },
    { doadorIdx: 5, mIndexes: [1, 2, 3] },
    { doadorIdx: 1, mIndexes: [2, 4] },
  ]
  for (const me of missoesExtra) {
    const doador = doadorRecords[me.doadorIdx]
    for (const mIndex of me.mIndexes) {
      await prisma.missaoDoador.create({
        data: { doadorId: doador.id, missaoId: mId[mIndex], completa: true, completaEm: new Date(Date.now() - 10 * 24 * 3600 * 1000) },
      })
    }
  }
  console.log('✅ Missões completadas')

  // ── Scans de tags ───────────────────────────────────────────────────────────
  for (let i = 0; i < Math.min(tagRecords.length, 6); i++) {
    const nScans = Math.floor(Math.random() * 8) + 1
    for (let s = 0; s < nScans; s++) {
      await prisma.tagScan.create({
        data: { tagId: tagRecords[i].id, ip: `192.168.1.${10 + s}`, userAgent: 'Mozilla/5.0 (iPhone)', ehDono: s === 0 },
      })
    }
  }
  console.log('✅ Scans de tags')

  // ── Gastos simulados ────────────────────────────────────────────────────────
  await prisma.gasto.deleteMany({})
  const iId = instituicoes.map(i => i.id) // [0]=Refeicao [1]=Banho [2]=Cobertor
  const gastosData = [
    // Lar São Francisco (refeição)
    { instId: iId[0], desc: 'Compra de arroz e feijão (50kg)',   valor: 180.00, diasAtras: 3,  comp: true  },
    { instId: iId[0], desc: 'Frango congelado (20kg)',            valor: 260.00, diasAtras: 8,  comp: true  },
    { instId: iId[0], desc: 'Verduras e legumes — CEAGESP',       valor: 95.50,  diasAtras: 15, comp: true  },
    { instId: iId[0], desc: 'Gás de cozinha (2 botijões)',        valor: 140.00, diasAtras: 22, comp: false },
    { instId: iId[0], desc: 'Utensílios de cozinha',              valor: 75.00,  diasAtras: 30, comp: true  },
    // Abrigo da Paz (banho)
    { instId: iId[1], desc: 'Sabonetes e shampoo (caixa)',        valor: 88.00,  diasAtras: 5,  comp: true  },
    { instId: iId[1], desc: 'Toalhas (10 unidades)',              valor: 130.00, diasAtras: 12, comp: true  },
    { instId: iId[1], desc: 'Conserto do chuveiro elétrico',      valor: 220.00, diasAtras: 18, comp: false },
    { instId: iId[1], desc: 'Produtos de higiene variados',       valor: 65.00,  diasAtras: 25, comp: true  },
    // Casa do Aconchego (cobertor)
    { instId: iId[2], desc: 'Cobertores (15 unidades)',           valor: 375.00, diasAtras: 4,  comp: true  },
    { instId: iId[2], desc: 'Colchonetes (5 unidades)',           valor: 250.00, diasAtras: 10, comp: true  },
    { instId: iId[2], desc: 'Roupas de cama — lencois',           valor: 185.00, diasAtras: 20, comp: false },
  ]
  for (const g of gastosData) {
    await prisma.gasto.create({
      data: {
        instituicaoId: g.instId,
        desc: g.desc,
        valor: g.valor,
        data: new Date(Date.now() - g.diasAtras * 24 * 3600 * 1000),
        comprovante: g.comp,
      },
    })
  }
  console.log(`✅ ${gastosData.length} gastos`)

  console.log('\n🎉 Seed concluído!')
  console.log('   Admin: admin@igreja.com / admin123')
  console.log('   Doador teste: guilhermy@demo.com / tel: 11999990001')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
