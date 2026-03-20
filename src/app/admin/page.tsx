"use client";
import { useState } from "react";
import { DOACOES_MOCK, INSTITUICOES } from "@/lib/data";

const C = {
  cream: "#FAF7F2",
  stone: "#F0EBE1",
  gold: "#B8973A",
  goldL: "#F5EDD4",
  ink: "#1C1A16",
  muted: "#7A7164",
  green: "#2D7A5F",
  greenL: "#E6F3ED",
  blue: "#2A5FA5",
  blueL: "#E6EEF8",
  amber: "#9A6B1A",
  amberL: "#F5EBD4",
  red: "#A32D2D",
  redL: "#FCEBEB",
  white: "#FFFFFF",
  border: "#E8E0D0",
  dark: "#1C2B1F",
  dark2: "#2D4A35",
};

// ── ÍCONES SVG ────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  wallet: "M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5M16 12h5",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  clock: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  check: "M20 6L9 17l-5-5",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  arrow: "M5 12h14M12 5l7 7-7 7",
  church: "M12 2L8 6H4v16h16V6h-4L12 2zM12 2v4M9 22v-6h6v6",
};

// ── MINI SPARKLINE ────────────────────────────────────────────────────────────
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 80, h = 32;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── BARRA DE PROGRESSO ────────────────────────────────────────────────────────
function ProgressBar({ pct, color, label, value }: { pct: number; color: string; label: string; value: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: C.muted }}>{value}</span>
          <span style={{
            fontSize: 12, fontWeight: 600, color, background: color + "18",
            padding: "1px 8px", borderRadius: 99
          }}>{pct}%</span>
        </div>
      </div>
      <div style={{ background: C.stone, borderRadius: 99, height: 7, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, background: `linear-gradient(90deg, ${color}aa, ${color})`,
          height: "100%", borderRadius: 99,
          transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
        }} />
      </div>
    </div>
  );
}

// ── CARD MÉTRICA ──────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, color, icon, spark }: {
  label: string; value: string; sub: string;
  color: string; icon: string; spark: number[];
}) {
  return (
    <div style={{
      background: C.white, borderRadius: 18, border: `1px solid ${C.border}`,
      padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12,
      boxShadow: "0 2px 12px rgba(28,26,22,0.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{
            fontSize: 11, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase",
            fontWeight: 600, marginBottom: 6
          }}>{label}</p>
          <p style={{
            fontSize: 28, fontWeight: 700, color, fontFamily: "'Playfair Display', serif",
            lineHeight: 1
          }}>{value}</p>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{sub}</p>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: color + "15",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon d={icon} size={18} color={color} />
        </div>
      </div>
      <Sparkline values={spark} color={color} />
    </div>
  );
}

// ── BADGE ─────────────────────────────────────────────────────────────────────
function Badge({ children, color = C.green, bg = C.greenL }: {
  children: React.ReactNode; color?: string; bg?: string;
}) {
  return (
    <span style={{
      background: bg, color, fontSize: 11, fontWeight: 600,
      padding: "3px 10px", borderRadius: 99, display: "inline-block", whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

// ── MINI DONUT CHART ──────────────────────────────────────────────────────────
function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  const r = 52, cx = 64, cy = 64, stroke = 18;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <svg width={128} height={128} viewBox="0 0 128 128">
        {/* fundo */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.stone} strokeWidth={stroke} />
        {data.map((d, i) => {
          const pct = d.value / total;
          const dash = pct * circ;
          const gap = circ - dash;
          const rotation = offset * 360 - 90;
          offset += pct;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={d.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeLinecap="butt"
              transform={`rotate(${rotation} ${cx} ${cy})`}
            />
          );
        })}
        {/* centro */}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="13" fontWeight="700"
          fill={C.ink} fontFamily="'Playfair Display', serif">
          R$ {total}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill={C.muted}>
          total
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: C.ink, lineHeight: 1.2 }}>{d.label}</p>
              <p style={{ fontSize: 11, color: C.muted }}>R$ {d.value} · {Math.round(d.value / total * 100)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [filtro, setFiltro] = useState("todas");
  const doacoes = DOACOES_MOCK;

  const total = doacoes.reduce((s, d) => s + d.valor, 0);
  const repassado = Math.round(total * 0.82);
  const pendente = total - repassado;
  const pessoas = doacoes.reduce((s, d) => s + Math.floor(d.valor / 15), 0);

  const filtradas = filtro === "todas" ? doacoes : doacoes.filter(d => d.instituicao === filtro);
  const instNomes = [...new Set(doacoes.map(d => d.instituicao))];

  const donutData = INSTITUICOES.map(inst => ({
    label: inst.nome,
    value: doacoes.filter(d => d.instituicao === inst.nome).reduce((s, d) => s + d.valor, 0),
    color: inst.tipo === "Refeição" ? C.green : inst.tipo === "Banho" ? C.blue : C.amber,
  }));

  return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: C.dark,
        display: "flex", flexDirection: "column",
        padding: "28px 0",
        position: "sticky", top: 0, height: "100vh",
      }}>
        {/* logo */}
        <div style={{ padding: "0 20px 28px", borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", width: 22, height: 22 }}>
              <div style={{
                position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)",
                width: 2, height: 22, background: C.gold, borderRadius: 2
              }} />
              <div style={{
                position: "absolute", top: "33%", left: 0,
                width: 22, height: 2, background: C.gold, borderRadius: 2
              }} />
            </div>
            <span style={{
              fontFamily: "'Playfair Display', serif", fontSize: 16,
              fontWeight: 700, color: C.white
            }}>DoaFácil</span>
          </div>
          <p style={{
            fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4,
            letterSpacing: 1, textTransform: "uppercase"
          }}>Painel da Igreja</p>
        </div>

        {/* nav */}
        <nav style={{ padding: "20px 12px", flex: 1 }}>
          {[
            { label: "Dashboard", icon: Icons.church, active: true },
            { label: "Doações", icon: Icons.wallet, active: false },
            { label: "Repasses", icon: Icons.send, active: false },
            { label: "Instituições", icon: Icons.users, active: false },
          ].map(item => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 10, marginBottom: 4,
              background: item.active ? "rgba(184,151,58,0.15)" : "transparent",
              cursor: "pointer",
            }}>
              <Icon d={item.icon} size={15}
                color={item.active ? C.gold : "rgba(255,255,255,0.4)"} />
              <span style={{
                fontSize: 13, fontWeight: item.active ? 600 : 400,
                color: item.active ? C.gold : "rgba(255,255,255,0.4)"
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </nav>

        {/* bottom */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
            19 de março de 2026<br />
            <span style={{ color: C.gold, fontWeight: 600 }}>● Online</span>
          </p>
        </div>
      </aside>

      {/* ── CONTEÚDO ── */}
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>

        {/* header */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 28
        }}>
          <div>
            <p style={{
              fontSize: 11, letterSpacing: 3, color: C.gold,
              textTransform: "uppercase", fontWeight: 600, marginBottom: 6
            }}>
              Visão geral
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 28, fontWeight: 700, color: C.ink, lineHeight: 1
            }}>
              Dashboard
            </h1>
          </div>
          <div style={{
            background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "8px 16px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
            <span style={{ fontSize: 12, color: C.muted }}>Março 2026</span>
          </div>
        </div>

        {/* métricas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          <MetricCard label="Total recebido" value={`R$ ${total}`}
            sub={`${doacoes.length} doações`} color={C.green} icon={Icons.wallet}
            spark={[20, 35, 28, 45, 38, 55, 48, 65, 52, 70, 62, 80]} />
          <MetricCard label="Repassado" value={`R$ ${repassado}`}
            sub="para instituições" color={C.blue} icon={Icons.send}
            spark={[15, 28, 22, 38, 30, 46, 40, 54, 44, 60, 52, 68]} />
          <MetricCard label="Aguardando" value={`R$ ${pendente}`}
            sub="a repassar" color={C.amber} icon={Icons.clock}
            spark={[5, 8, 6, 10, 8, 12, 10, 14, 12, 16, 14, 18]} />
          <MetricCard label="Pessoas ajudadas" value={`${pessoas}`}
            sub="este mês" color={C.dark2} icon={Icons.users}
            spark={[3, 5, 4, 7, 6, 8, 7, 10, 8, 12, 10, 14]} />
        </div>

        {/* linha do meio: donut + barras */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16, marginBottom: 20 }}>

          {/* donut */}
          <div style={{
            background: C.white, borderRadius: 18, border: `1px solid ${C.border}`,
            padding: "22px 24px", boxShadow: "0 2px 12px rgba(28,26,22,0.05)",
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 20 }}>
              Distribuição por instituição
            </p>
            <DonutChart data={donutData} />
          </div>

          {/* barras de progresso */}
          <div style={{
            background: C.white, borderRadius: 18, border: `1px solid ${C.border}`,
            padding: "22px 24px", boxShadow: "0 2px 12px rgba(28,26,22,0.05)",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 20
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>
                Alocação de recursos
              </p>
              <Badge color={C.green} bg={C.greenL}>Atualizado agora</Badge>
            </div>

            {INSTITUICOES.map(inst => {
              const v = doacoes.filter(d => d.instituicao === inst.nome)
                .reduce((s, d) => s + d.valor, 0);
              const pct = Math.round((v / total) * 100);
              const cor = inst.tipo === "Refeição" ? C.green
                : inst.tipo === "Banho" ? C.blue : C.amber;
              return (
                <ProgressBar key={inst.id} label={inst.nome}
                  value={`R$ ${v}`} pct={pct} color={cor} />
              );
            })}

            {/* resumo de repasse */}
            <div style={{
              marginTop: 8, background: C.goldL, borderRadius: 12,
              padding: "12px 16px", display: "flex", justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <p style={{
                  fontSize: 11, color: C.amber, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: 0.5
                }}>
                  Próximo repasse
                </p>
                <p style={{ fontSize: 13, color: C.ink, marginTop: 2 }}>
                  Previsto para 25/03/2026
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{
                  fontSize: 18, fontWeight: 700, color: C.amber,
                  fontFamily: "'Playfair Display', serif"
                }}>
                  R$ {pendente}
                </p>
                <p style={{ fontSize: 11, color: C.muted }}>aguardando</p>
              </div>
            </div>
          </div>
        </div>

        {/* tabela de doações */}
        <div style={{
          background: C.white, borderRadius: 18, border: `1px solid ${C.border}`,
          boxShadow: "0 2px 12px rgba(28,26,22,0.05)", overflow: "hidden",
        }}>
          {/* header da tabela */}
          <div style={{
            padding: "18px 24px", borderBottom: `1px solid ${C.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Doações recentes</p>
              <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                {filtradas.length} registros
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: C.cream, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: "6px 12px"
              }}>
                <Icon d={Icons.filter} size={13} color={C.muted} />
                <select value={filtro} onChange={e => setFiltro(e.target.value)}
                  style={{
                    border: "none", background: "transparent",
                    fontSize: 12, color: C.ink, cursor: "pointer", outline: "none"
                  }}>
                  <option value="todas">Todas</option>
                  {instNomes.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* tabela */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.cream }}>
                {["Doador", "Instituição", "Tipo", "Valor", "Data", "Status"].map(h => (
                  <th key={h} style={{
                    padding: "10px 20px", textAlign: "left",
                    fontSize: 11, color: C.muted, fontWeight: 600,
                    letterSpacing: 0.5, textTransform: "uppercase",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((d, i) => {
                const tipoCor = d.tipo === "Refeição"
                  ? { c: C.green, bg: C.greenL }
                  : d.tipo === "Banho"
                    ? { c: C.blue, bg: C.blueL }
                    : { c: C.amber, bg: C.amberL };
                return (
                  <tr key={d.id} style={{
                    borderTop: `1px solid ${C.stone}`,
                    background: i % 2 === 0 ? C.white : "rgba(250,247,242,0.5)",
                    transition: "background 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.stone)}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? C.white : "rgba(250,247,242,0.5)")}>
                    {/* doador */}
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: C.dark + "18",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 600, color: C.dark,
                          flexShrink: 0,
                        }}>
                          {d.doador.split(" ").map(w => w[0]).join("").slice(0, 2)}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>
                          {d.doador}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: C.muted }}>
                      {d.instituicao}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <Badge color={tipoCor.c} bg={tipoCor.bg}>{d.tipo}</Badge>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        fontSize: 14, fontWeight: 700, color: C.green,
                        fontFamily: "'Playfair Display', serif"
                      }}>
                        R$ {d.valor}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: C.muted }}>
                      {d.data}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Icon d={Icons.check} size={13} color={C.green} />
                        <Badge color={C.green} bg={C.greenL}>Confirmado</Badge>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* footer da tabela */}
          <div style={{
            padding: "14px 24px", borderTop: `1px solid ${C.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: C.cream,
          }}>
            <p style={{ fontSize: 12, color: C.muted }}>
              Mostrando {filtradas.length} de {doacoes.length} doações
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              {["←", "1", "2", "→"].map(p => (
                <button key={p} style={{
                  width: 28, height: 28, borderRadius: 7,
                  border: p === "1" ? `1.5px solid ${C.green}` : `1px solid ${C.border}`,
                  background: p === "1" ? C.greenL : C.white,
                  color: p === "1" ? C.green : C.muted,
                  fontSize: 12, cursor: "pointer", fontWeight: p === "1" ? 600 : 400,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}