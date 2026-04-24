"use client";
import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

const NIVEL_COLOR: Record<string, string> = {
  nice: "#9ca3af", cool: "#7dd3fc", tough: "#9ca3af", ruler: "#22c55e",
  fstar: "#e05c1a", topnotch: "#4f9ef8", goat: "#d4a017", killer: "#0f0f0f",
};

function AvatarEmoji({ avatar, nivel, size = 34 }: { avatar: string; nivel: string; size?: number }) {
  const cor = NIVEL_COLOR[nivel] || "#9ca3af";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid ${cor}`,
      background: "#1a1a1a",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.5, flexShrink: 0,
    }}>
      {avatar}
    </div>
  );
}

type MissaoDestaque = {
  id: number;
  titulo: string;
  descricao: string;
  pontos: number;
  emoji: string;
  periodoDestaque: string | null;
  inicioDestaque: string | null;
  fimDestaque: string | null;
  totalCompletas: number;
  recentes: { numero: string; avatar: string; nivel: string; completaEm: string }[];
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function PeriodoBadge({ periodo }: { periodo: string | null }) {
  if (!periodo) return null;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
      padding: "3px 10px", borderRadius: 99,
      background: periodo === "semana" ? "rgba(255,78,0,0.15)" : "rgba(0,13,255,0.12)",
      color: periodo === "semana" ? "#FF4E00" : "#000DFF",
      border: `1px solid ${periodo === "semana" ? "rgba(255,78,0,0.3)" : "rgba(0,13,255,0.2)"}`,
    }}>
      {periodo === "semana" ? "📌 Semana" : "📌 Mês"}
    </span>
  );
}

export default function MissoesPage() {
  const [missoes, setMissoes] = useState<MissaoDestaque[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [resultado, setResultado] = useState<any | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [buscaErro, setBuscaErro] = useState("");

  useEffect(() => {
    fetch(`${API}/api/missoes/destaque`, { headers: { "ngrok-skip-browser-warning": "true" } })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setMissoes(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const buscarDoador = async () => {
    const q = busca.trim();
    if (!q) return;
    setBuscando(true);
    setBuscaErro("");
    setResultado(null);
    try {
      const r = await fetch(`${API}/api/missoes/buscar?q=${encodeURIComponent(q)}`, { headers: { "ngrok-skip-browser-warning": "true" } });
      const data = await r.json();
      if (Array.isArray(data) && data.length > 0) setResultado(data[0]);
      else setBuscaErro("Nenhum resultado encontrado para esse serial, nome ou número.");
    } catch {
      setBuscaErro("Erro ao buscar. Tente novamente.");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a0a0a 0%, #111 60%, #0e0a00 100%)",
      color: "#fff",
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      padding: "0 0 60px",
    }}>
      {/* HERO */}
      <div style={{
        background: "linear-gradient(135deg, #0e0e0e, #1a1000)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "48px 20px 36px",
        textAlign: "center",
      }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px,6vw,52px)", fontWeight: 800, margin: "0 0 16px", color: "#fff", letterSpacing: 1 }}>
          Missões Bearer
        </h1>
        <div style={{ display: "inline-block", background: "#FF4E00", color: "#fff", fontSize: 13, fontWeight: 800, letterSpacing: 2, padding: "8px 20px", borderRadius: 99, fontFamily: "monospace", marginBottom: 16 }}>
          SCAN•CONNECT•IMPACT
        </div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto 24px" }}>
          Complete ações, acumule pontos e evolua no ranking de humanidade.
        </p>

        {/* busca de doador */}
        <div style={{ maxWidth: 440, margin: "0 auto", display: "flex", gap: 8 }}>
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            onKeyDown={e => e.key === "Enter" && buscarDoador()}
            placeholder="Nome, número ou serial (GS-HB25-D01-...)"
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 12,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", fontSize: 14, outline: "none",
            }}
          />
          <button onClick={buscarDoador} disabled={buscando}
            style={{
              padding: "12px 20px", borderRadius: 12,
              background: "#FF4E00", color: "#fff", fontWeight: 700,
              border: "none", cursor: "pointer", fontSize: 14,
              opacity: buscando ? 0.6 : 1,
            }}>
            {buscando ? "..." : "Ver"}
          </button>
        </div>
        {buscaErro && <p style={{ fontSize: 12, color: "#ff6b6b", marginTop: 8 }}>{buscaErro}</p>}
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px 0" }}>
        {/* resultado de busca */}
        {resultado && (
          <div style={{
            background: "rgba(255,255,255,0.04)", border: `1px solid ${resultado.anonimo ? "rgba(255,255,255,0.12)" : "rgba(255,78,0,0.25)"}`,
            borderRadius: 18, padding: "20px 22px", marginBottom: 28,
          }}>
            {/* cabeçalho do perfil */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
              <div style={{ fontSize: 36 }}>{resultado.avatar}</div>
              <div style={{ flex: 1 }}>
                {resultado.anonimo ? (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>Doador Anônimo</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>Identificado pela tag</p>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>{resultado.nome}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", margin: "2px 0 0" }}>
                      #{resultado.numero} · {resultado.nivel?.toUpperCase()}
                    </p>
                  </>
                )}
                {/* tag serial badge */}
                {resultado.tagSerial && (
                  <a href={`/tag/${resultado.tagSerial}`}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "2px 8px", textDecoration: "none" }}>
                    🏷️ {resultado.tagSerial}
                  </a>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                {!resultado.anonimo && (
                  <p style={{ fontSize: 18, fontWeight: 800, color: "#FF4E00", margin: 0 }}>{resultado.pontos ?? 0} pts</p>
                )}
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>
                  {resultado.totalDoacoes} doação{resultado.totalDoacoes !== 1 ? "ões" : ""} · R$ {(resultado.totalDoado ?? 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* missões (só para perfis não-anônimos) */}
            {!resultado.anonimo && resultado.missoesCompletas?.length > 0 && (
              <>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Missões completas</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {resultado.missoesCompletas.map((m: any, i: number) => (
                    <span key={i} title={m.titulo} style={{
                      background: "rgba(255,78,0,0.12)", border: "1px solid rgba(255,78,0,0.2)",
                      borderRadius: 8, padding: "4px 10px", fontSize: 13,
                    }}>
                      {m.emoji} {m.titulo}
                    </span>
                  ))}
                </div>
              </>
            )}
            {!resultado.anonimo && resultado.missoesCompletas?.length === 0 && (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Nenhuma missão completa ainda.</p>
            )}

            {/* para anônimos: link para página da tag */}
            {resultado.anonimo && resultado.tagSerial && (
              <a href={`/tag/${resultado.tagSerial}`} style={{
                display: "inline-flex", alignItems: "center", gap: 8, marginTop: 4,
                fontSize: 13, fontWeight: 600, color: "#FF4E00", textDecoration: "none",
                background: "rgba(255,78,0,0.08)", border: "1px solid rgba(255,78,0,0.2)",
                borderRadius: 10, padding: "8px 14px",
              }}>
                Ver perfil completo da tag →
              </a>
            )}

            <button onClick={() => { setResultado(null); setBusca(""); }}
              style={{ display: "block", marginTop: 14, fontSize: 11, color: "rgba(255,255,255,0.3)", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
              ✕ fechar
            </button>
          </div>
        )}

        {/* missões destaque */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            Carregando missões...
          </div>
        )}

        {!loading && missoes.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🎯</p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)" }}>Nenhuma missão em destaque no momento.</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>O admin vai escolher em breve!</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {missoes.map(m => (
            <div key={m.id} style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: 20, padding: "22px 24px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}>
              {/* header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, flexShrink: 0,
                }}>
                  {m.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: 0 }}>{m.titulo}</h2>
                    <PeriodoBadge periodo={m.periodoDestaque} />
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, margin: 0 }}>{m.descricao}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "#FF4E00", margin: 0 }}>+{m.pontos}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>PONTOS</p>
                </div>
              </div>

              {/* stats */}
              <div style={{
                background: "rgba(255,255,255,0.04)", borderRadius: 12,
                padding: "12px 16px", marginBottom: m.recentes.length > 0 ? 14 : 0,
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <div>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>{m.totalCompletas}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: 0 }}>
                    {m.totalCompletas === 1 ? "pessoa completou" : "pessoas completaram"}
                  </p>
                </div>
                {m.inicioDestaque && (
                  <div style={{ marginLeft: "auto" }}>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 }}>
                      {m.fimDestaque
                        ? `até ${formatDate(m.fimDestaque)}`
                        : `desde ${formatDate(m.inicioDestaque)}`}
                    </p>
                  </div>
                )}
              </div>

              {/* recentes */}
              {m.recentes.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                    Completaram recentemente
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {m.recentes.map((r, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        background: "rgba(255,255,255,0.03)", borderRadius: 10,
                        padding: "8px 12px",
                      }}>
                        <AvatarEmoji avatar={r.avatar} nivel={r.nivel} size={32} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>#{r.numero}</p>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: 0 }}>{r.nivel?.toUpperCase()}</p>
                        </div>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{formatDate(r.completaEm)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        {!loading && (
          <div style={{
            marginTop: 32, background: "rgba(255,78,0,0.08)",
            border: "1px solid rgba(255,78,0,0.2)",
            borderRadius: 18, padding: "24px", textAlign: "center",
          }}>
            <p style={{ fontSize: 22, marginBottom: 8 }}>🐻</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Quer subir no ranking?</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
              Complete missões, convide amigos e faça a diferença na vida de pessoas em situação de rua.
            </p>
            <a href="/doacao" style={{
              display: "inline-block", background: "#FF4E00", color: "#fff",
              fontWeight: 900, fontSize: 15, padding: "14px 32px",
              borderRadius: 12, textDecoration: "none", letterSpacing: 1,
            }}>
              mete marcha →
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
