'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const H = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }

type Estado = {
  id: number
  nome: string
  emoji: string
  valor: number
  credenciaisOk: boolean
  testeFeito: boolean
  homologada: boolean
}

type Passo = 1 | 2 | 3 | 4 | 5 // 5 = sucesso final

function ConfigurarMpInner() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  // Quando o doador volta da tela de teste (/doacao?setup=...), ele volta pra
  // /configurar-mp?token=X&etapa=3 para seguir pro passo de homologação.
  const etapaQuery = params.get('etapa')

  const [estado, setEstado] = useState<Estado | null>(null)
  const [erro, setErro] = useState('')
  const [passo, setPasso] = useState<Passo>(1)

  // Form passo 1
  const [publicKey, setPublicKey] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Passo 4
  const [ativando, setAtivando] = useState(false)

  const recarregar = () => {
    if (!token) { setErro('Link inválido'); return }
    fetch(`${API}/api/portal/mp-setup?token=${token}`, { headers: H })
      .then(r => r.json())
      .then((d: Estado | { error: string }) => {
        if ('error' in d) { setErro(d.error); return }
        setEstado(d)
        // Decide o passo inicial pelo estado + query param
        if (d.homologada) setPasso(5)
        else if (etapaQuery === '3' && d.credenciaisOk) setPasso(3)
        else if (d.testeFeito && !d.homologada) setPasso(3)
        else if (d.credenciaisOk && !d.testeFeito) setPasso(2)
        else setPasso(1)
      })
      .catch(() => setErro('Erro ao carregar. Verifique sua conexão.'))
  }

  useEffect(recarregar, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  async function salvarCredenciais() {
    setErro(''); setSalvando(true)
    try {
      const r = await fetch(`${API}/api/portal/mp-setup`, {
        method: 'POST', headers: H,
        body: JSON.stringify({ token, publicKey: publicKey.trim(), accessToken: accessToken.trim() }),
      })
      const d = await r.json()
      if (!r.ok) { setErro(d.error || 'Erro ao salvar'); return }
      // Recarrega estado e avança pra o passo 2
      recarregar()
    } catch { setErro('Erro ao salvar. Tente novamente.') }
    finally { setSalvando(false) }
  }

  async function iniciarTeste() {
    // Redireciona para o fluxo de doação em modo setup — a tela /doacao
    // reconhece ?setup=1 e pula a escolha de instituição, cria uma doação
    // de R$ 1 em nome dessa própria instituição e abre direto o cartão.
    if (!estado) return
    window.location.href = `/doacao?setup=1&inst=${estado.id}&token=${encodeURIComponent(token)}`
  }

  async function confirmarAtivacao() {
    setErro(''); setAtivando(true)
    try {
      const r = await fetch(`${API}/api/portal/mp-setup/ativar`, {
        method: 'POST', headers: H, body: JSON.stringify({ token }),
      })
      const d = await r.json()
      if (!r.ok) { setErro(d.error || 'Erro ao ativar'); return }
      recarregar()
    } catch { setErro('Erro ao ativar. Tente novamente.') }
    finally { setAtivando(false) }
  }

  // ── Renderização ──

  if (erro && !estado) return (
    <div style={tela.full}>
      <div style={tela.card}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 8 }}>Link inválido</h2>
        <p style={{ fontSize: 14, color: '#888' }}>{erro}</p>
      </div>
    </div>
  )

  if (!estado) return (
    <div style={tela.full}>
      <p style={{ color: '#888' }}>Carregando...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '32px 16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Header com progresso */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '24px 26px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>+</span>
            <span style={{ fontSize: 17, fontWeight: 700 }}>Humanity Bearers</span>
            <span style={{ color: '#aaa' }}>×</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#009ee3' }}>Mercado Pago</span>
          </div>
          <div style={{ fontSize: 40, margin: '6px 0' }}>{estado.emoji}</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0 }}>{estado.nome}</h1>

          {/* Progresso visual */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 18 }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} style={{
                width: 32, height: 6, borderRadius: 3,
                background: passo >= n ? '#000DFF' : '#e5e7eb',
                transition: 'background 0.2s',
              }} />
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#888', marginTop: 10, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
            {passo === 5 ? 'Finalizado ✓' : `Passo ${passo} de 4`}
          </p>
        </div>

        {/* ── PASSO 1: CREDENCIAIS ── */}
        {passo === 1 && (
          <>
            <div style={box.info}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>📋 Como obter suas credenciais</p>
              <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#78350f', lineHeight: 2 }}>
                <li>Acesse <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noreferrer" style={{ color: '#b45309', textDecoration: 'underline' }}>mercadopago.com.br/developers</a></li>
                <li>Faça login com a conta da sua instituição</li>
                <li>Clique em <strong>Suas integrações</strong> → <strong>Criar aplicação</strong></li>
                <li>Após criar, vá em <strong>Credenciais de produção</strong></li>
                <li>Copie a <strong>Public Key</strong> e o <strong>Access Token</strong> abaixo</li>
              </ol>
            </div>

            <div style={box.card}>
              <h2 style={h2}>🔑 Passo 1 — Credenciais do Mercado Pago</h2>
              <p style={sub}>Cole aqui as credenciais de produção que você copiou do painel developers do Mercado Pago.</p>
              <div>
                <label style={label}>Public Key</label>
                <input value={publicKey} onChange={e => setPublicKey(e.target.value)}
                  placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" style={input} />
              </div>
              <div>
                <label style={label}>Access Token</label>
                <input type="password" value={accessToken} onChange={e => setAccessToken(e.target.value)}
                  placeholder="APP_USR-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxx-xxxxxxxxx" style={input} />
              </div>
              {erro && <p style={{ fontSize: 12, color: '#ef4444' }}>{erro}</p>}
              <button onClick={salvarCredenciais}
                disabled={salvando || !publicKey.trim() || !accessToken.trim()}
                style={{ ...btn, background: salvando ? '#9ca3af' : '#000DFF' }}>
                {salvando ? 'Salvando...' : 'Salvar credenciais →'}
              </button>
            </div>
          </>
        )}

        {/* ── PASSO 2: PAGAMENTO DE TESTE ── */}
        {passo === 2 && (
          <div style={box.card}>
            <h2 style={h2}>💳 Passo 2 — Pagamento de teste</h2>
            <p style={sub}>
              Credenciais salvas com sucesso ✓ Agora precisamos enviar <strong>1 pagamento de teste</strong> com cartão
              de crédito pra sua conta Mercado Pago. Esse passo é <strong>obrigatório</strong> — é ele que cumpre o
              checklist de homologação do Mercado Pago.
            </p>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: '#78350f', fontWeight: 600, marginBottom: 6 }}>⚠️ Importante</p>
              <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>
                O pagamento pode até ser <strong>recusado</strong> pelo antifraude — isso não é problema. O que importa
                é o request chegar na sua conta MP com todos os campos obrigatórios, pra o painel de homologação liberar.
                Valor: <strong>R$ {estado.valor.toFixed(2).replace('.', ',')}</strong>.
              </p>
            </div>
            {erro && <p style={{ fontSize: 12, color: '#ef4444' }}>{erro}</p>}
            <button onClick={iniciarTeste} style={{ ...btn, background: '#000DFF' }}>
              Fazer pagamento de teste →
            </button>
          </div>
        )}

        {/* ── PASSO 3: HOMOLOGAÇÃO NO PAINEL MP ── */}
        {passo === 3 && (
          <div style={box.card}>
            <h2 style={h2}>✅ Passo 3 — Solicitar homologação no Mercado Pago</h2>
            <p style={sub}>
              Ótimo, o pagamento de teste já chegou na sua conta ✓ Agora você precisa ir até o painel de developers do
              Mercado Pago e solicitar a homologação da sua aplicação:
            </p>
            <ol style={{ margin: '12px 0 16px', paddingLeft: 20, fontSize: 13, color: '#555', lineHeight: 1.9 }}>
              <li>Vá em <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noreferrer" style={{ color: '#000DFF' }}>mercadopago.com.br/developers/panel/app</a></li>
              <li>Abra a aplicação que você criou</li>
              <li>No menu lateral, clique em <strong>Avaliação → Qualidade da integração</strong></li>
              <li>O checklist deve estar <strong>100% verde</strong> (espere de 15 min a 2h se ainda não atualizou)</li>
              <li>Clique em <strong>&quot;Ir para produção&quot;</strong> ou <strong>&quot;Solicitar homologação&quot;</strong></li>
              <li>O Mercado Pago libera em até 48h</li>
            </ol>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: '#1e40af', lineHeight: 1.6 }}>
                💡 Só volte aqui e clique no botão abaixo <strong>depois</strong> que o Mercado Pago aprovar a sua
                homologação. Se clicar antes, sua instituição vai aparecer no site, mas os pagamentos por cartão serão
                rejeitados.
              </p>
            </div>
            {erro && <p style={{ fontSize: 12, color: '#ef4444' }}>{erro}</p>}
            <button onClick={confirmarAtivacao} disabled={ativando}
              style={{ ...btn, background: ativando ? '#9ca3af' : '#16a34a' }}>
              {ativando ? 'Ativando...' : 'Já fui aprovada, ativar minha instituição →'}
            </button>
          </div>
        )}

        {/* ── PASSO 5: SUCESSO FINAL ── */}
        {passo === 5 && (
          <div style={{ ...box.card, textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#16a34a', marginBottom: 8 }}>
              Sua instituição está no ar!
            </h2>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7 }}>
              <strong>{estado.nome}</strong> agora aparece na página pública de doações do Humanity Bearers e pode
              receber PIX e cartão. O dinheiro cai direto na sua conta do Mercado Pago.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

const tela = {
  full: { minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  card: { background: '#fff', borderRadius: 20, padding: '40px 32px', maxWidth: 400, textAlign: 'center' as const, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' } as React.CSSProperties,
}
const box = {
  card: { background: '#fff', borderRadius: 20, padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' as const, gap: 14 } as React.CSSProperties,
  info: { background: '#fffbeb', borderRadius: 16, padding: '18px 20px', border: '1px solid #fde68a' } as React.CSSProperties,
}
const h2: React.CSSProperties = { fontSize: 18, fontWeight: 800, color: '#111', margin: 0 }
const sub: React.CSSProperties = { fontSize: 13, color: '#555', lineHeight: 1.7, margin: 0 }
const label: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 6 }
const input: React.CSSProperties = { width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 13, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }
const btn: React.CSSProperties = { color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 }

export default function ConfigurarMpPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Carregando...</div>}>
      <ConfigurarMpInner />
    </Suspense>
  )
}
