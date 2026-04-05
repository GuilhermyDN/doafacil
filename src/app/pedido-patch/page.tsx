'use client'
import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const H = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }

const NIVEIS_CONFIG = [
  { nivel: 'killer',   nome: 'KILLER',    acoes: 5000, preco: 1000, bgCard: 'linear-gradient(135deg, #080808, #282828)', cor: '#fff',    desc: 'Lenda absoluta'        },
  { nivel: 'goat',     nome: 'G.O.A.T',  acoes: 2000, preco: 600,  bgCard: 'linear-gradient(135deg, #a07800, #d4a820)', cor: '#fff',    desc: 'Greatest Of All Time'  },
  { nivel: 'topnotch', nome: 'TOP-NOTCH',acoes: 1000, preco: 400,  bgCard: 'linear-gradient(135deg, #3060a8, #6090d0)', cor: '#fff',    desc: 'Elite dos doadores'    },
  { nivel: 'fstar',    nome: 'F★★',      acoes: 500,  preco: 300,  bgCard: 'linear-gradient(135deg, #c44a20, #e87050)', cor: '#fff',    desc: 'Fogo que não apaga'    },
  { nivel: 'ruler',    nome: 'RULER',     acoes: 200,  preco: 200,  bgCard: 'linear-gradient(135deg, #3a8c50, #6dc484)', cor: '#fff',    desc: 'Lidera pelo exemplo'   },
  { nivel: 'tough',    nome: 'TOUGH',     acoes: 100,  preco: 100,  bgCard: 'linear-gradient(135deg, #c0ccd8, #dce6f0)', cor: '#1a2a3a', desc: 'Resistência que inspira'},
  { nivel: 'cool',     nome: 'COOL',      acoes: 50,   preco: 100,  bgCard: 'linear-gradient(135deg, #bcd4e8, #d8eaf6)', cor: '#1a3a5c', desc: 'Já é um doador frequente'},
  { nivel: 'nice',     nome: 'NICE',      acoes: 20,   preco: 100,  bgCard: 'linear-gradient(135deg, #c8c8d8, #e0e0ec)', cor: '#222',    desc: 'O começo da jornada'   },
]

const DONOR = { nivel: 'donor', nome: 'DONOR', acoes: 1, preco: 500, bgCard: 'linear-gradient(135deg, #7e5cac, #b47fd4)', cor: '#fff', desc: 'Para quem já doou ao menos 1 vez' }

function getNivelByDoacoes(total: number) {
  return NIVEIS_CONFIG.find(n => total >= n.acoes) ?? null
}

type Step = 'verificar' | 'escolher' | 'form' | 'sucesso'

type Doador = {
  nome: string; nivel: string; totalDoacoes: number; numero: string
  email?: string; telefone?: string; avatar?: string; pontos?: number
  totalDoado?: number; homenagem?: string | null
  isVoluntario?: boolean; servicoVoluntario?: string | null
  missoesCompletas?: { titulo: string; emoji: string; pontos: number; completaEm: string }[]
  ultimaDoacao?: { valorTotal: number; dataPagamento: string; instituicao: { nome: string; emoji: string } } | null
}

export default function PedidoPatchPage() {
  const [step, setStep]         = useState<Step>('verificar')
  const [busca, setBusca]       = useState('')
  const [buscando, setBuscando] = useState(false)
  const [erroBusca, setErroBusca] = useState('')
  const [doador, setDoador]     = useState<Doador | null>(null)
  const [nivelSel, setNivelSel] = useState('')
  const [form, setForm]         = useState({ doadorNome: '', doadorEmail: '', doadorTel: '', endereco: '', cidade: '', cep: '', observacoes: '' })
  const [enviando, setEnviando] = useState(false)
  const [pedidoId, setPedidoId] = useState<number | null>(null)
  const [preco, setPreco]       = useState(0)
  const [erroForm, setErroForm] = useState('')

  const nivelAtual  = doador ? getNivelByDoacoes(doador.totalDoacoes) : null
  const temDonor    = doador ? doador.isVoluntario === true : false
  const nivelInfo   = nivelSel === 'donor' ? DONOR : NIVEIS_CONFIG.find(n => n.nivel === nivelSel) ?? null

  async function verificar() {
    if (!busca.trim()) return
    setBuscando(true); setErroBusca('')
    try {
      const r = await fetch(`${API}/api/missoes/buscar?q=${encodeURIComponent(busca.trim())}`, { headers: H })
      const d = await r.json()
      const lista = Array.isArray(d) ? d : []
      if (lista.length === 0) {
        setErroBusca('Nenhum doador encontrado com esse email ou telefone.')
        return
      }
      const found = lista[0]
      if (found.totalDoacoes < 1) {
        setErroBusca('Você ainda não tem doações registradas. Faça sua primeira doação para desbloquear as insígnias!')
        return
      }
      setDoador(found)
      setForm(f => ({ ...f, doadorNome: found.nome, doadorEmail: found.email ?? '', doadorTel: found.telefone ?? '' }))
      setStep('escolher')
    } catch {
      setErroBusca('Erro de conexão. Tente novamente.')
    } finally { setBuscando(false) }
  }

  async function enviar() {
    if (!form.doadorNome || !form.doadorEmail || !form.endereco || !form.cidade || !form.cep) {
      setErroForm('Preencha todos os campos obrigatórios'); return
    }
    setErroForm(''); setEnviando(true)
    try {
      const r = await fetch(`${API}/api/pedidos`, {
        method: 'POST', headers: H,
        body: JSON.stringify({ ...form, nivel: nivelSel }),
      })
      const d = await r.json()
      if (!r.ok) { setErroForm(d.error || 'Erro ao enviar pedido'); return }
      setPedidoId(d.pedidoId); setPreco(d.preco)
      setStep('sucesso')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch { setErroForm('Erro de conexão. Tente novamente.') }
    finally { setEnviando(false) }
  }

  const inp = (label: string, key: keyof typeof form, placeholder: string, required = true, type = 'text') => (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
        {label}{required ? ' *' : ''}
      </label>
      <input type={type} value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff' }}
      />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e' }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:0.85} 50%{opacity:1} }
        .patch-card { transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .patch-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 16px 40px rgba(0,0,0,0.5) !important; }
        .patch-img { animation: shimmer 3s ease-in-out infinite; }
      `}</style>

      {/* TOPBAR */}
      <div style={{ background: '#000', borderBottom: '1px solid #1a1a1a', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 22, background: '#FF4E00', borderRadius: 2 }} />
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: "'Playfair Display',serif" }}>Humanity Bearers</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>🎖️ Insígnias Oficiais</span>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── VERIFICAÇÃO ── */}
        {step === 'verificar' && (
          <>
            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
              <div style={{ fontSize: 52, marginBottom: 10 }}>🎖️</div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Insígnias Humanity Bearers</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Patches físicos desenhados à mão · Cada insígnia é conquistada</p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: '28px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Verifique suas doações</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 20px' }}>Digite seu email ou telefone cadastrado para ver qual insígnia você conquistou.</p>

              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && verificar()}
                  placeholder="email@exemplo.com ou (11) 99999-9999"
                  style={{ flex: 1, border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '13px 16px', fontSize: 14, outline: 'none', background: 'rgba(255,255,255,0.06)', color: '#fff' }}
                />
                <button onClick={verificar} disabled={buscando}
                  style={{ background: buscando ? '#333' : '#FF4E00', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 22px', fontSize: 14, fontWeight: 700, cursor: buscando ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                  {buscando ? '...' : 'Verificar'}
                </button>
              </div>

              {erroBusca && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '14px', marginTop: 14 }}>
                  <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>{erroBusca}</p>
                </div>
              )}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0, lineHeight: 1.7 }}>
                Ainda não doou? <a href="/doacao" style={{ color: '#FF4E00', textDecoration: 'none', fontWeight: 600 }}>Faça sua primeira doação →</a>
              </p>
            </div>
          </>
        )}

        {/* ── ESCOLHER PATCH ── */}
        {step === 'escolher' && doador && (() => {
          // adapta texto para fundo claro (nice/cool/tough) ou escuro
          const lightBg = nivelAtual ? nivelAtual.cor !== '#fff' : false
          const txt      = lightBg ? nivelAtual!.cor          : '#fff'
          const txtMuted = lightBg ? nivelAtual!.cor + 'aa'   : 'rgba(255,255,255,0.5)'
          const metricBg = lightBg ? 'rgba(0,0,0,0.07)'       : 'rgba(255,255,255,0.1)'
          const metricTxt= lightBg ? nivelAtual!.cor           : '#fff'
          const metricSub= lightBg ? nivelAtual!.cor + '99'   : 'rgba(255,255,255,0.45)'
          const divider  = lightBg ? 'rgba(0,0,0,0.1)'        : 'rgba(255,255,255,0.08)'
          const lastBg   = lightBg ? 'rgba(0,0,0,0.05)'       : 'rgba(255,255,255,0.05)'
          const btnBg    = lightBg ? 'rgba(0,0,0,0.08)'       : 'rgba(255,255,255,0.1)'
          const btnTxt   = lightBg ? nivelAtual!.cor + 'bb'   : 'rgba(255,255,255,0.5)'
          return (
          <>
            {/* card do doador — progresso */}
            <div style={{ background: nivelAtual?.bgCard ?? 'linear-gradient(135deg,#1a1a1a,#2a2a2a)', borderRadius: 20, padding: '24px', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: metricBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                  {doador.avatar || (doador.totalDoacoes >= 5000 ? '👑' : doador.totalDoacoes >= 2000 ? '🐐' : doador.totalDoacoes >= 1000 ? '💠' : doador.totalDoacoes >= 500 ? '🔥' : doador.totalDoacoes >= 200 ? '💚' : doador.totalDoacoes >= 100 ? '🤍' : doador.totalDoacoes >= 50 ? '🩵' : '🩶')}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: txt, margin: 0, fontFamily: "'Playfair Display',serif" }}>{doador.nome}</p>
                  <p style={{ fontSize: 12, color: txtMuted, margin: '3px 0 0' }}>
                    {doador.isVoluntario
                      ? <><span style={{ background: 'rgba(168,85,247,0.25)', color: '#c084fc', borderRadius: 99, padding: '1px 8px', fontSize: 10, fontWeight: 700, marginRight: 4 }}>DONOR</span>{doador.servicoVoluntario || 'Voluntário'}</>
                      : <>Nível <strong style={{ color: '#FF4E00' }}>{nivelAtual?.nome ?? 'NICE'}</strong></>
                    }
                    {doador.homenagem && <span style={{ fontStyle: 'italic' }}> · "{doador.homenagem}"</span>}
                  </p>
                </div>
                <button onClick={() => { setStep('verificar'); setDoador(null); setBusca('') }}
                  style={{ background: btnBg, border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, color: btnTxt, cursor: 'pointer', flexShrink: 0 }}>
                  Trocar
                </button>
              </div>

              {/* métricas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Doações', value: String(doador.totalDoacoes), emoji: '🎁' },
                  { label: 'Pontos', value: (doador.pontos ?? 0).toLocaleString(), emoji: '⭐' },
                  { label: 'Total doado', value: `R$ ${(doador.totalDoado ?? 0).toFixed(0)}`, emoji: '💰' },
                ].map(m => (
                  <div key={m.label} style={{ background: metricBg, borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18 }}>{m.emoji}</div>
                    <p style={{ fontSize: 15, fontWeight: 800, color: metricTxt, margin: '4px 0 2px' }}>{m.value}</p>
                    <p style={{ fontSize: 10, color: metricSub, margin: 0 }}>{m.label}</p>
                  </div>
                ))}
              </div>

              {/* missões */}
              {(doador.missoesCompletas?.length ?? 0) > 0 && (
                <div style={{ marginTop: 16, borderTop: `1px solid ${divider}`, paddingTop: 14 }}>
                  <p style={{ fontSize: 11, color: metricSub, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 10px' }}>🏆 Missões concluídas</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {doador.missoesCompletas!.map((m: any, i: number) => (
                      <div key={i} style={{ background: metricBg, borderRadius: 20, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14 }}>{m.emoji}</span>
                        <span style={{ fontSize: 11, color: metricTxt, fontWeight: 600 }}>{m.titulo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* última doação */}
              {doador.ultimaDoacao && (
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, background: lastBg, borderRadius: 10, padding: '10px 14px' }}>
                  <span style={{ fontSize: 20 }}>{doador.ultimaDoacao.instituicao.emoji}</span>
                  <div>
                    <p style={{ fontSize: 11, color: metricSub, margin: 0 }}>Última doação</p>
                    <p style={{ fontSize: 13, color: metricTxt, fontWeight: 600, margin: 0 }}>{doador.ultimaDoacao.instituicao.nome} · R$ {doador.ultimaDoacao.valorTotal.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0, whiteSpace: 'nowrap' }}>Suas insígnias disponíveis</p>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* DONOR — sempre disponível pra quem doou */}
            {temDonor && (
              <div className="patch-card" onClick={() => { setNivelSel('donor'); setStep('form'); window.scrollTo({top:0,behavior:'smooth'}) }}
                style={{ background: DONOR.bgCard, borderRadius: 20, border: '1.5px solid rgba(168,85,247,0.4)', boxShadow: '0 8px 30px rgba(100,50,180,0.25)', display: 'flex', alignItems: 'center', gap: 16, padding: '20px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/patches/donor.jpg" alt="DONOR" className="patch-img"
                  style={{ width: 80, height: 80, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))', flexShrink: 0 }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 99, padding: '2px 10px', fontSize: 9, color: '#fff', fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>ESPECIAL</div>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>DONOR</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Para quem já doou ao menos 1 vez</p>
                </div>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', flexShrink: 0 }}>R$ 500</p>
              </div>
            )}

            {/* patch do nível atual */}
            {nivelAtual && (
              <div className="patch-card" onClick={() => { setNivelSel(nivelAtual.nivel); setStep('form'); window.scrollTo({top:0,behavior:'smooth'}) }}
                style={{ background: nivelAtual.bgCard, borderRadius: 20, border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 30px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 16, padding: '20px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/patches/${nivelAtual.nivel}.jpg`} alt={nivelAtual.nome} className="patch-img"
                  style={{ width: 80, height: 80, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))', flexShrink: 0 }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 99, padding: '2px 10px', fontSize: 9, color: '#fff', fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>SEU NÍVEL</div>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: nivelAtual.cor, margin: '0 0 4px' }}>{nivelAtual.nome}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{nivelAtual.acoes}+ doações · {nivelAtual.desc}</p>
                </div>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', flexShrink: 0 }}>R$ {nivelAtual.preco}</p>
              </div>
            )}

            {/* próximo nível */}
            {(() => {
              const idx = nivelAtual ? NIVEIS_CONFIG.indexOf(nivelAtual) : NIVEIS_CONFIG.length - 1
              const proximo = NIVEIS_CONFIG[idx - 1]
              if (!proximo) return null
              const faltam = proximo.acoes - doador.totalDoacoes
              return (
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '16px 20px', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/patches/${proximo.nivel}.jpg`} alt={proximo.nome}
                    style={{ width: 52, height: 52, objectFit: 'contain', opacity: 0.4, flexShrink: 0 }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.35)', margin: '0 0 2px' }}>Próximo nível: {proximo.nome}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: 0 }}>Faltam <strong style={{ color: '#FF4E00' }}>{faltam} doação{faltam !== 1 ? 'ões' : ''}</strong> para desbloquear</p>
                  </div>
                </div>
              )
            })()}
          </>
          )
        })()}

        {/* ── FORMULÁRIO ── */}
        {step === 'form' && nivelInfo && (
          <>
            <div style={{ background: nivelInfo.bgCard, borderRadius: 20, padding: '20px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/patches/${nivelInfo.nivel}.jpg`} alt={nivelInfo.nome}
                style={{ width: 80, height: 80, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: nivelInfo.cor, margin: '0 0 2px', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{nivelInfo.nome}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 8px' }}>{nivelInfo.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>R$ {nivelInfo.preco}</span>
                  <button onClick={() => setStep('escolher')} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, padding: '4px 12px', fontSize: 11, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600 }}>← Trocar</button>
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 20, padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>📦 Dados para entrega</p>
              {inp('Nome completo', 'doadorNome', 'Seu nome')}
              {inp('Email', 'doadorEmail', 'seu@email.com', true, 'email')}
              {inp('WhatsApp / Telefone', 'doadorTel', '(11) 99999-9999', false, 'tel')}
              {inp('Endereço completo', 'endereco', 'Rua, número, complemento')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Cidade *</label>
                  <input value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} placeholder="São Paulo"
                    style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>CEP *</label>
                  <input value={form.cep} onChange={e => setForm(f => ({ ...f, cep: e.target.value }))} placeholder="01234-567"
                    style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Observações</label>
                <textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                  placeholder="Alguma observação sobre o pedido..." rows={2}
                  style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              {erroForm && <p style={{ fontSize: 13, color: '#ef4444', textAlign: 'center', margin: 0 }}>{erroForm}</p>}
              <div style={{ background: '#f9fafb', borderRadius: 12, padding: '14px', border: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: 12, color: '#555', margin: 0, lineHeight: 1.6 }}>
                  💳 Após confirmar, entraremos em contato para combinar o <strong>pagamento via Pix</strong>. O patch será enviado assim que confirmado.
                </p>
              </div>
              <button onClick={enviar} disabled={enviando}
                style={{ background: enviando ? '#e5e7eb' : '#111', color: enviando ? '#9ca3af' : '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: enviando ? 'not-allowed' : 'pointer' }}>
                {enviando ? 'Enviando...' : `Confirmar pedido · R$ ${nivelInfo.preco}`}
              </button>
            </div>
          </>
        )}

        {/* ── SUCESSO ── */}
        {step === 'sucesso' && (
          <div style={{ background: '#fff', borderRadius: 24, padding: '40px 28px', textAlign: 'center', marginTop: 20 }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 800, color: '#111', margin: '0 0 8px' }}>Pedido #{pedidoId} registrado!</h2>
            <p style={{ fontSize: 14, color: '#888', margin: '0 0 20px', lineHeight: 1.6 }}>
              Entraremos em contato pelo email <strong>{form.doadorEmail}</strong> para confirmar o pagamento.
            </p>
            {nivelInfo && (
              <div style={{ background: nivelInfo.bgCard, borderRadius: 16, padding: '16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/patches/${nivelInfo.nivel}.jpg`} alt={nivelInfo.nome}
                  style={{ width: 60, height: 60, objectFit: 'contain' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 16, fontWeight: 900, color: nivelInfo.cor, margin: 0, fontFamily: "'Playfair Display',serif" }}>{nivelInfo.nome}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '2px 0 0' }}>R$ {preco.toFixed(2)}</p>
                </div>
              </div>
            )}
            <div style={{ background: '#f0fdf4', borderRadius: 14, padding: '16px', border: '1.5px solid #22c55e33', marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: '#166534', fontWeight: 700, margin: '0 0 6px' }}>✅ Próximos passos</p>
              <p style={{ fontSize: 12, color: '#555', margin: 0, lineHeight: 1.7 }}>1. Aguarde nosso contato por email / WhatsApp<br />2. Realize o pagamento via <strong>Pix</strong><br />3. Receba sua insígnia pelos correios 📬</p>
            </div>
            <button onClick={() => { setStep('verificar'); setBusca(''); setDoador(null); setNivelSel(''); setPedidoId(null) }}
              style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Fazer outro pedido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
