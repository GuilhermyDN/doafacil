'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const H = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }

type Gasto = { id: number; descricao: string; valor: number; data: string; comprovante: boolean }
type Inst  = { nome: string; emoji: string; gastos: Gasto[] }

function GastosInstituicaoInner() {
  const params = useSearchParams()
  const token  = params.get('token') ?? ''

  const [inst, setInst]       = useState<Inst | null>(null)
  const [erro, setErro]       = useState('')
  const [form, setForm]       = useState({ descricao: '', valor: '', data: new Date().toISOString().split('T')[0], comprovante: false })
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo]     = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'novo' | 'historico'>('novo')

  function load() {
    if (!token) { setErro('Link inválido'); return }
    fetch(`${API}/api/portal/gastos?token=${token}`, { headers: H })
      .then(r => r.json())
      .then(d => { if (d.error) setErro(d.error); else setInst(d) })
      .catch(() => setErro('Erro ao carregar. Verifique sua conexão.'))
  }

  useEffect(() => { load() }, [token])

  async function salvarGasto() {
    if (!form.descricao.trim() || !form.valor || !form.data) return
    setSalvando(true)
    try {
      const r = await fetch(`${API}/api/portal/gastos`, {
        method: 'POST',
        headers: H,
        body: JSON.stringify({ token, ...form, valor: Number(form.valor) }),
      })
      const d = await r.json()
      if (!r.ok) { alert(d.error); return }
      setSalvo(true)
      setForm({ descricao: '', valor: '', data: new Date().toISOString().split('T')[0], comprovante: false })
      setTimeout(() => setSalvo(false), 2000)
      load()
    } catch { alert('Erro ao salvar. Tente novamente.') }
    finally { setSalvando(false) }
  }

  if (erro) return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '40px 32px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 8 }}>Link inválido</h2>
        <p style={{ fontSize: 14, color: '#888' }}>{erro}</p>
      </div>
    </div>
  )

  if (!inst) return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>⏳</div>
        <p style={{ color: '#888', fontSize: 14 }}>Carregando...</p>
      </div>
    </div>
  )

  const total    = inst.gastos.reduce((s, g) => s + g.valor, 0)
  const comProva = inst.gastos.filter(g => g.comprovante).length
  const mesAtual = new Date().toISOString().slice(0, 7)
  const totalMes = inst.gastos.filter(g => g.data.startsWith(mesAtual)).reduce((s, g) => s + g.valor, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* topbar */}
      <div style={{ background: '#111', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#ef4444', fontSize: 20, fontWeight: 900 }}>+</span>
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>Humanity Bearers</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Portal da Instituição</span>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* header da instituição */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            {inst.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: '#9ca3af', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>Registro de Gastos</p>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: '2px 0 0' }}>{inst.nome}</h1>
          </div>
        </div>

        {/* métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { label: 'Total Geral', value: `R$ ${total.toFixed(2)}`, emoji: '💰', cor: '#111' },
            { label: 'Este Mês', value: `R$ ${totalMes.toFixed(2)}`, emoji: '📅', cor: '#3b82f6' },
            { label: 'Com Comprovante', value: `${comProva}/${inst.gastos.length}`, emoji: '📎', cor: '#22c55e' },
          ].map(m => (
            <div key={m.label} style={{ background: '#fff', borderRadius: 14, padding: '14px 12px', textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 22 }}>{m.emoji}</div>
              <p style={{ fontSize: 15, fontWeight: 800, color: m.cor, margin: '4px 0 2px' }}>{m.value}</p>
              <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>{m.label}</p>
            </div>
          ))}
        </div>

        {/* abas */}
        <div style={{ display: 'flex', background: '#e5e7eb', borderRadius: 12, padding: 4, gap: 4 }}>
          {(['novo', 'historico'] as const).map(a => (
            <button key={a} onClick={() => setAbaAtiva(a)}
              style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: abaAtiva === a ? '#fff' : 'transparent', color: abaAtiva === a ? '#111' : '#9ca3af', boxShadow: abaAtiva === a ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}>
              {a === 'novo' ? '+ Novo Gasto' : `📋 Histórico (${inst.gastos.length})`}
            </button>
          ))}
        </div>

        {/* formulário */}
        {abaAtiva === 'novo' && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>Registrar novo gasto</p>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Descrição</label>
              <input
                value={form.descricao}
                onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                placeholder="Ex: Compra de alimentos, Conta de luz..."
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Valor (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.valor}
                  onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                  placeholder="0,00"
                  style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Data</label>
                <input
                  type="date"
                  value={form.data}
                  onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                  style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${form.comprovante ? '#22c55e' : '#e5e7eb'}`, background: form.comprovante ? '#f0fdf4' : '#f9fafb', transition: 'all 0.15s' }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${form.comprovante ? '#22c55e' : '#d1d5db'}`, background: form.comprovante ? '#22c55e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                {form.comprovante && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
              </div>
              <input type="checkbox" checked={form.comprovante} onChange={e => setForm(f => ({ ...f, comprovante: e.target.checked }))} style={{ display: 'none' }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>📎 Tenho comprovante</p>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Nota fiscal, recibo ou foto</p>
              </div>
            </label>

            <button
              onClick={salvarGasto}
              disabled={salvando || !form.descricao.trim() || !form.valor}
              style={{ background: salvo ? '#22c55e' : (!form.descricao.trim() || !form.valor ? '#e5e7eb' : '#111'), color: salvo || (!form.descricao.trim() || !form.valor) ? (salvo ? '#fff' : '#9ca3af') : '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: salvando || !form.descricao.trim() || !form.valor ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
              {salvando ? 'Salvando...' : salvo ? '✓ Gasto registrado!' : 'Registrar gasto'}
            </button>
          </div>
        )}

        {/* histórico */}
        {abaAtiva === 'historico' && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            {inst.gastos.length === 0
              ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
                  <p style={{ color: '#9ca3af', fontSize: 14 }}>Nenhum gasto registrado ainda.</p>
                  <button onClick={() => setAbaAtiva('novo')} style={{ marginTop: 12, background: '#111', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Registrar primeiro gasto</button>
                </div>
              )
              : inst.gastos.map((g, i) => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: i < inst.gastos.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    💸
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.descricao}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{new Date(g.data).toLocaleDateString('pt-BR')}</p>
                      {g.comprovante && <span style={{ fontSize: 10, background: '#f0fdf4', color: '#22c55e', padding: '1px 6px', borderRadius: 99, fontWeight: 600 }}>📎 comprovante</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#ef4444', flexShrink: 0 }}>- R$ {g.valor.toFixed(2)}</span>
                </div>
              ))
            }
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: '#c4c4c4', paddingBottom: 16 }}>
          Humanity Bearers · Transparência nas doações
        </p>
      </div>
    </div>
  )
}

export default function GastosInstituicaoPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Carregando...</div>}>
      <GastosInstituicaoInner />
    </Suspense>
  )
}
