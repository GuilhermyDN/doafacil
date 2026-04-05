'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

const NIVEIS: Record<string, { label: string; emoji: string; cor: string }> = {
  nice:     { label: 'NICE',     emoji: '🌱', cor: '#a8d8a8' },
  cool:     { label: 'COOL',     emoji: '❄️',  cor: '#a8c8e8' },
  tough:    { label: 'TOUGH',    emoji: '⚡',  cor: '#f0c080' },
  ruler:    { label: 'RULER',    emoji: '👑',  cor: '#e8a060' },
  fstar:    { label: 'F-STAR',   emoji: '⭐',  cor: '#c080e0' },
  topnotch: { label: 'TOPNOTCH', emoji: '🔥',  cor: '#e06080' },
  goat:     { label: 'GOAT',     emoji: '🐐',  cor: '#60c0e0' },
  killer:   { label: 'KILLER',   emoji: '💀',  cor: '#000000' },
}

interface TagData {
  serial: string
  campanha: string
  ano: number
  vinculada: boolean
  vinculadaEm: string | null
  nivel: string | null
  pontos: number
  totalDoado: number
  isVoluntario: boolean
  ultimasDoacoes: { data: string; instituicao: string; emoji: string; valor: number }[]
}

export default function TagPage() {
  const params = useParams()
  const serial = decodeURIComponent(params.serial as string)

  const [tag, setTag] = useState<TagData | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [etapa, setEtapa] = useState<'perfil' | 'vincular'>('perfil')

  // Form de vinculação
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [vinculado, setVinculado] = useState(false)

  useEffect(() => {
    fetch(`${API}/api/tags/${encodeURIComponent(serial)}`, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setErro(data.error); return }
        setTag(data)
        // Registra o scan
        fetch(`${API}/api/tags/${encodeURIComponent(serial)}/scan`, { method: 'POST' }).catch(() => {})
      })
      .catch(() => setErro('Não foi possível carregar a tag.'))
      .finally(() => setLoading(false))
  }, [serial])

  const handleVincular = async () => {
    if (!nome.trim() || !email.trim() || !telefone.trim()) return
    setSalvando(true)
    try {
      const res = await fetch(`${API}/api/tags/${encodeURIComponent(serial)}/vincular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ nome: nome.trim(), email: email.trim(), telefone: telefone.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Erro ao vincular'); return }
      setVinculado(true)
      // Recarrega dados da tag
      const r2 = await fetch(`${API}/api/tags/${encodeURIComponent(serial)}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      })
      setTag(await r2.json())
      setEtapa('perfil')
    } catch {
      setErro('Erro ao vincular tag')
    } finally {
      setSalvando(false)
    }
  }

  const nivel = tag?.nivel ? NIVEIS[tag.nivel] : null

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, letterSpacing: 2 }}>CARREGANDO...</p>
    </div>
  )

  if (erro && !tag) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <div style={{ fontSize: 48 }}>🏷️</div>
      <p style={{ color: '#ff4444', fontSize: 14 }}>{erro}</p>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'monospace' }}>{serial}</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>

      {/* Header */}
      <div style={{ width: '100%', maxWidth: 440, marginBottom: 24 }}>
        <p style={{ fontSize: 10, letterSpacing: 4, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>
          Grupo Solidário · Humanity Bearers
        </p>
        <p style={{ fontSize: 11, letterSpacing: 3, color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', textAlign: 'center', fontFamily: 'monospace' }}>
          SCAN · CONNECT · IMPACT
        </p>
      </div>

      {/* Card serial */}
      <div style={{
        width: '100%', maxWidth: 440,
        background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, overflow: 'hidden',
      }}>

        {/* Serial strip */}
        <div style={{
          background: nivel ? nivel.cor + '18' : 'rgba(255,255,255,0.03)',
          borderBottom: `1px solid ${nivel ? nivel.cor + '30' : 'rgba(255,255,255,0.06)'}`,
          padding: '20px 24px',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <p style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Serial</p>
          <p style={{
            fontFamily: 'monospace', fontSize: 20, fontWeight: 700, letterSpacing: 2,
            color: nivel ? nivel.cor : '#fff',
          }}>{tag?.serial}</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
            Campanha {tag?.campanha} · {tag?.ano ? `20${tag.ano}` : ''}
          </p>
        </div>

        <div style={{ padding: '24px' }}>

          {/* Não vinculada → oferecer vinculação */}
          {!tag?.vinculada && etapa === 'perfil' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏷️</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Tag não vinculada</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24, lineHeight: 1.6 }}>
                Esta é a sua tag? Vincule agora para começar a acumular pontos e acompanhar seu progresso.
              </p>
              <button
                onClick={() => setEtapa('vincular')}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  background: '#000DFF', color: '#fff', border: 'none',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}>
                Esta tag é minha →
              </button>
            </div>
          )}

          {/* Form de vinculação */}
          {etapa === 'vincular' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Vincular tag</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, lineHeight: 1.6 }}>
                Seus dados ficam guardados apenas para uso interno. No sistema, você é identificado pelo serial.
              </p>
              {['nome', 'email', 'telefone'].map((campo) => (
                <input key={campo}
                  placeholder={campo === 'nome' ? 'Seu nome *' : campo === 'email' ? 'Email *' : 'Telefone *'}
                  value={campo === 'nome' ? nome : campo === 'email' ? email : telefone}
                  onChange={e => campo === 'nome' ? setNome(e.target.value) : campo === 'email' ? setEmail(e.target.value) : setTelefone(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#fff', outline: 'none',
                  }}
                />
              ))}
              {erro && <p style={{ fontSize: 12, color: '#ff4444' }}>{erro}</p>}
              <button
                onClick={handleVincular}
                disabled={salvando || !nome.trim() || !email.trim() || !telefone.trim()}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, marginTop: 4,
                  background: nome.trim() && email.trim() && telefone.trim() ? '#000DFF' : 'rgba(255,255,255,0.08)',
                  color: '#fff', border: 'none', fontSize: 14, fontWeight: 700,
                  cursor: nome.trim() && email.trim() && telefone.trim() ? 'pointer' : 'not-allowed',
                }}>
                {salvando ? 'Vinculando...' : 'Confirmar →'}
              </button>
              <button onClick={() => setEtapa('perfil')}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', padding: '8px 0' }}>
                Cancelar
              </button>
            </div>
          )}

          {/* Perfil vinculado */}
          {tag?.vinculada && etapa === 'perfil' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {vinculado && (
                <div style={{ background: '#00a65018', border: '1px solid #00a65040', borderRadius: 10, padding: '12px 16px' }}>
                  <p style={{ fontSize: 13, color: '#00a650', fontWeight: 600 }}>✓ Tag vinculada com sucesso!</p>
                </div>
              )}

              {/* Nível */}
              {nivel && (
                <div style={{
                  background: nivel.cor + '15', border: `1px solid ${nivel.cor}30`,
                  borderRadius: 14, padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{ fontSize: 36 }}>{nivel.emoji}</div>
                  <div>
                    <p style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>Nível atual</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: nivel.cor, fontFamily: "'Playfair Display', serif" }}>{nivel.label}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>Pontos</p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{tag.pontos}</p>
                  </div>
                </div>
              )}

              {/* Total doado */}
              <div style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Total doado</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: "'Playfair Display', serif" }}>
                  R$ {tag.totalDoado.toFixed(2).replace('.', ',')}
                </p>
              </div>

              {/* Últimas doações */}
              {tag.ultimasDoacoes.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 10 }}>Últimas doações</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {tag.ultimasDoacoes.map((d, i) => (
                      <div key={i} style={{
                        background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}>
                        <span style={{ fontSize: 18 }}>{d.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{d.instituicao}</p>
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{new Date(d.data).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>R$ {d.valor.toFixed(2).replace('.', ',')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Voluntário */}
              {tag.isVoluntario && (
                <div style={{ background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.2)', borderRadius: 10, padding: '12px 16px' }}>
                  <p style={{ fontSize: 13, color: '#ffc800', fontWeight: 600 }}>🎖️ Voluntário Humanity Bearers</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <p style={{ marginTop: 24, fontSize: 10, color: 'rgba(255,255,255,0.1)', letterSpacing: 3, textTransform: 'uppercase' }}>
        Humanity Bearers · Use when humanity is required
      </p>
    </div>
  )
}
