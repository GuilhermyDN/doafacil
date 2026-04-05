'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const H = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }

function ConfigurarMpInner() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''

  const [inst, setInst] = useState<{ nome: string; emoji: string; configurado: boolean } | null>(null)
  const [erro, setErro] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    if (!token) { setErro('Link inválido'); return }
    fetch(`${API}/api/portal/mp-setup?token=${token}`, { headers: H })
      .then(r => r.json())
      .then(d => { if (d.error) setErro(d.error); else setInst(d) })
      .catch(() => setErro('Erro ao carregar. Verifique sua conexão.'))
  }, [token])

  async function salvar() {
    setSalvando(true)
    try {
      const r = await fetch(`${API}/api/portal/mp-setup`, {
        method: 'POST',
        headers: H,
        body: JSON.stringify({ token, publicKey: publicKey.trim(), accessToken: accessToken.trim() }),
      })
      const d = await r.json()
      if (!r.ok) { setErro(d.error); return }
      setSalvo(true)
    } catch { setErro('Erro ao salvar. Tente novamente.') }
    finally { setSalvando(false) }
  }

  if (erro) return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '40px 32px', maxWidth: 400, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 8 }}>Link inválido</h2>
        <p style={{ fontSize: 14, color: '#888' }}>{erro}</p>
      </div>
    </div>
  )

  if (!inst) return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#888' }}>Carregando...</p>
    </div>
  )

  if (salvo) return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '40px 32px', maxWidth: 420, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 8 }}>Configurado com sucesso!</h2>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>
          As credenciais do <strong>{inst.nome}</strong> foram salvas.<br/>
          A partir de agora as doações serão recebidas diretamente na sua conta Mercado Pago.
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '40px 16px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* header */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '28px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>+</span>
            <span style={{ fontSize: 18, fontWeight: 700 }}>Humanity Bearers</span>
            <span style={{ color: '#aaa' }}>×</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#009ee3' }}>Mercado Pago</span>
          </div>
          <div style={{ fontSize: 40, margin: '8px 0' }}>{inst.emoji}</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0 }}>{inst.nome}</h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 6 }}>Configure suas credenciais para receber doações diretamente</p>
        </div>

        {/* instruções */}
        <div style={{ background: '#fffbeb', borderRadius: 16, padding: '18px 20px', border: '1px solid #fde68a' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>📋 Como obter suas credenciais</p>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#78350f', lineHeight: 2 }}>
            <li>Acesse <strong>mercadopago.com.br/developers</strong></li>
            <li>Faça login com a conta da sua instituição</li>
            <li>Clique em <strong>"Suas integrações"</strong> → <strong>"Criar aplicação"</strong></li>
            <li>Após criar, vá em <strong>"Credenciais de produção"</strong></li>
            <li>Copie a <strong>Public Key</strong> e o <strong>Access Token</strong> abaixo</li>
          </ol>
        </div>

        {/* formulário */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Public Key</label>
            <input
              value={publicKey}
              onChange={e => setPublicKey(e.target.value)}
              placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 13, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Access Token</label>
            <input
              type="password"
              value={accessToken}
              onChange={e => setAccessToken(e.target.value)}
              placeholder="APP_USR-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxx-xxxxxxxxx"
              style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 13, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {erro && <p style={{ fontSize: 12, color: '#ef4444' }}>{erro}</p>}
          <button
            onClick={salvar}
            disabled={salvando || !publicKey.trim() || !accessToken.trim()}
            style={{ background: salvando ? '#9ca3af' : '#111', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: salvando ? 'not-allowed' : 'pointer' }}>
            {salvando ? 'Salvando...' : 'Salvar e começar a receber doações →'}
          </button>
        </div>

        {/* tutorial */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 12 }}>🎬 Tutorial em vídeo</p>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 12, overflow: 'hidden' }}>
            <iframe
              src="https://www.youtube.com/embed/lGuGNXmCAf8"
              title="Como obter credenciais no Mercado Pago"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
            />
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#aaa' }}>
          🔒 Seus dados são protegidos. O Humanity Bearers nunca tem acesso ao saldo da sua conta.
        </p>
      </div>
    </div>
  )
}

export default function ConfigurarMpPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Carregando...</div>}>
      <ConfigurarMpInner />
    </Suspense>
  )
}
