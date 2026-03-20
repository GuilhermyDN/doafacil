"use client";
import { useState } from "react";
import { DOACOES_MOCK, GASTOS_MOCK, INSTITUICOES, type Gasto, type Instituicao } from "@/lib/data";

const C = {
  cream: "#FAF7F2", stone: "#F0EBE1", gold: "#B8973A", goldL: "#F5EDD4",
  ink: "#1C1A16", muted: "#7A7164", green: "#2D7A5F", greenL: "#E6F3ED",
  blue: "#2A5FA5", blueL: "#E6EEF8", amber: "#9A6B1A", amberL: "#F5EBD4",
  red: "#A32D2D", redL: "#FCEBEB", white: "#FFFFFF", border: "#E8E0D0",
  dark: "#1C2B1F", dark2: "#2D4A35",
};

const instColor = (inst: Instituicao) =>
  inst.tipo === "Refeição" ? { cor: C.green, bg: C.greenL }
    : inst.tipo === "Banho" ? { cor: C.blue, bg: C.blueL }
      : { cor: C.amber, bg: C.amberL };

const Icon = ({ d, size = 16, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  receipt: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  check: "M20 6L9 17l-5-5",
  warning: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  plus: "M12 5v14M5 12h14",
  upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  wallet: "M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5M16 12h5",
  arrow: "M5 12h14M12 5l7 7-7 7",
  calendar: "M8 6V4m8 2V4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  menu: "M3 12h18M3 6h18M3 18h18",
  close: "M18 6L6 18M6 6l12 12",
};

function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span style={{
      background: bg, color, fontSize: 11, fontWeight: 600,
      padding: "3px 10px", borderRadius: 99, display: "inline-flex",
      alignItems: "center", gap: 4, whiteSpace: "nowrap"
    }}>
      {children}
    </span>
  );
}

function MetricCard({ label, value, sub, color, icon, highlight }: {
  label: string; value: string; sub?: string; color: string; icon: string; highlight?: boolean;
}) {
  return (
    <div style={{
      background: highlight ? color : C.white, borderRadius: 16,
      border: `1px solid ${highlight ? color : C.border}`, padding: "18px 20px",
      boxShadow: highlight ? `0 8px 24px ${color}30` : "0 2px 8px rgba(28,26,22,0.04)"
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 10
      }}>
        <p style={{
          fontSize: 11, color: highlight ? "rgba(255,255,255,0.7)" : C.muted,
          letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600
        }}>{label}</p>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: highlight ? "rgba(255,255,255,0.2)" : color + "18",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Icon d={icon} size={15} color={highlight ? C.white : color} />
        </div>
      </div>
      <p style={{
        fontSize: 26, fontWeight: 700, color: highlight ? C.white : color,
        fontFamily: "'Playfair Display',serif", lineHeight: 1, marginBottom: 4
      }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: highlight ? "rgba(255,255,255,0.65)" : C.muted }}>{sub}</p>}
    </div>
  );
}

function HealthGauge({ pct, cor }: { pct: number; cor: string }) {
  const clamp = Math.min(100, Math.max(0, pct));
  const status = clamp > 80 ? { label: "Atenção", c: C.red } : clamp > 50 ? { label: "Moderado", c: C.amber } : { label: "Saudável", c: C.green };
  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6
      }}>
        <span style={{ fontSize: 12, color: C.muted }}>Utilização do orçamento</span>
        <Badge color={status.c} bg={status.c + "18"}>{status.label} · {clamp}%</Badge>
      </div>
      <div style={{ background: C.stone, borderRadius: 99, height: 10, overflow: "hidden" }}>
        <div style={{
          width: `${clamp}%`,
          background: clamp > 80 ? `linear-gradient(90deg,${C.amber},${C.red})`
            : clamp > 50 ? `linear-gradient(90deg,${cor},${C.amber})`
              : `linear-gradient(90deg,${cor}88,${cor})`,
          height: "100%", borderRadius: 99, transition: "width 0.8s cubic-bezier(.4,0,.2,1)"
        }} />
      </div>
    </div>
  );
}

function FormGasto({ cor, bg, onSalvar, onCancelar }: {
  cor: string; bg: string; onSalvar: (g: Gasto) => void; onCancelar: () => void;
}) {
  const [desc, setDesc] = useState("");
  const [valor, setValor] = useState("");
  const [arquivo, setArquivo] = useState("");
  const handleSalvar = () => {
    if (!desc || !valor) return;
    onSalvar({ desc, valor: parseFloat(valor), data: "19/03/2026", comprovante: !!arquivo });
    setDesc(""); setValor(""); setArquivo("");
  };
  return (
    <div style={{
      background: bg, border: `1.5px solid ${cor}40`,
      borderRadius: 16, padding: "20px", marginBottom: 16
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 14 }}>
        Novo registro de gasto
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
        <input placeholder="Descrição do gasto (ex: Compra de alimentos)"
          value={desc} onChange={e => setDesc(e.target.value)}
          style={{
            border: `1px solid ${C.border}`, borderRadius: 10,
            padding: "10px 14px", fontSize: 13, color: C.ink,
            background: C.white, outline: "none", width: "100%"
          }} />
        <input type="number" placeholder="R$ Valor"
          value={valor} onChange={e => setValor(e.target.value)}
          style={{
            border: `1px solid ${C.border}`, borderRadius: 10,
            padding: "10px 14px", fontSize: 13, color: C.ink,
            background: C.white, outline: "none", width: "100%"
          }} />
      </div>
      <div onClick={() => setArquivo(arquivo ? "" : "comprovante.pdf")} style={{
        border: `1.5px dashed ${arquivo ? cor : C.border}`, borderRadius: 10,
        padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center",
        gap: 10, cursor: "pointer", background: arquivo ? bg : C.white, transition: "all 0.2s"
      }}>
        <Icon d={Icons.upload} size={16} color={arquivo ? cor : C.muted} />
        <span style={{ fontSize: 12, color: arquivo ? cor : C.muted }}>
          {arquivo ? `✓ ${arquivo} anexado` : "Clique para anexar comprovante"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={handleSalvar} style={{
          background: `linear-gradient(135deg,${C.dark},${C.dark2})`,
          color: C.white, border: "none", borderRadius: 10, padding: "9px 20px",
          fontSize: 13, fontWeight: 600, cursor: "pointer"
        }}>
          Salvar registro
        </button>
        <button onClick={onCancelar} style={{
          background: "none", border: `1px solid ${C.border}`,
          borderRadius: 10, padding: "9px 16px", fontSize: 13, color: C.muted, cursor: "pointer"
        }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function GastoItem({ g, cor, bg, index }: { g: Gasto; cor: string; bg: string; index: number }) {
  return (
    <div style={{ display: "flex", gap: 12, position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: g.comprovante ? bg : C.stone,
          border: `2px solid ${g.comprovante ? cor : C.border}`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
          <Icon d={g.comprovante ? Icons.check : Icons.receipt} size={13} color={g.comprovante ? cor : C.muted} />
        </div>
        {index > 0 && <div style={{ width: 1.5, flex: 1, background: C.border, minHeight: 16, marginTop: 4 }} />}
      </div>
      <div style={{
        flex: 1, background: C.white, border: `1px solid ${C.border}`,
        borderRadius: 14, padding: "12px 16px", marginBottom: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        boxShadow: "0 1px 4px rgba(28,26,22,0.04)", gap: 12, flexWrap: "wrap"
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 4 }}>{g.desc}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Icon d={Icons.calendar} size={11} color={C.muted} />
            <span style={{ fontSize: 11, color: C.muted }}>{g.data}</span>
            {g.comprovante
              ? <Badge color={cor} bg={bg}><Icon d={Icons.check} size={10} color={cor} />Comprovante</Badge>
              : <Badge color={C.amber} bg={C.amberL}><Icon d={Icons.warning} size={10} color={C.amber} />Sem comprovante</Badge>
            }
          </div>
        </div>
        <p style={{
          fontSize: 16, fontWeight: 700, color: C.red,
          fontFamily: "'Playfair Display',serif", whiteSpace: "nowrap"
        }}>
          − R$ {g.valor}
        </p>
      </div>
    </div>
  );
}

export default function InstituicaoPage() {
  const [instSel, setInstSel] = useState(INSTITUICOES[0]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [gastos, setGastos] = useState<Record<number, Gasto[]>>(GASTOS_MOCK);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { cor, bg } = instColor(instSel);
  const doacoesInst = DOACOES_MOCK.filter(d => d.instituicao === instSel.nome);
  const recebido = doacoesInst.reduce((s, d) => s + d.valor, 0);
  const gastosInst = gastos[instSel.id] ?? [];
  const utilizado = gastosInst.reduce((s, g) => s + g.valor, 0);
  const restante = recebido - utilizado;
  const pctUsado = recebido > 0 ? Math.min(100, Math.round((utilizado / recebido) * 100)) : 0;
  const semComp = gastosInst.filter(g => !g.comprovante).length;

  const handleAddGasto = (g: Gasto) => {
    setGastos(prev => ({ ...prev, [instSel.id]: [g, ...(prev[instSel.id] ?? [])] }));
    setMostrarForm(false);
  };

  const SidebarContent = () => (
    <>
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
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
            fontFamily: "'Playfair Display',serif", fontSize: 16,
            fontWeight: 700, color: C.white
          }}>DoaFácil</span>
        </div>
        <p style={{
          fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4,
          letterSpacing: 1, textTransform: "uppercase"
        }}>Prestação de Contas</p>
      </div>
      <div style={{ padding: "20px 12px", flex: 1 }}>
        <p style={{
          fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5,
          textTransform: "uppercase", marginBottom: 12, paddingLeft: 12
        }}>Instituições</p>
        {INSTITUICOES.map(inst => {
          const { cor: c } = instColor(inst);
          const ativa = instSel.id === inst.id;
          return (
            <button key={inst.id}
              onClick={() => { setInstSel(inst); setMostrarForm(false); setSidebarOpen(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, marginBottom: 4,
                background: ativa ? c + "22" : "transparent", border: "none",
                cursor: "pointer", textAlign: "left", transition: "background 0.15s"
              }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: ativa ? c : "rgba(255,255,255,0.2)", flexShrink: 0
              }} />
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 12, fontWeight: ativa ? 600 : 400,
                  color: ativa ? C.white : "rgba(255,255,255,0.45)", lineHeight: 1.3
                }}>
                  {inst.nome}
                </p>
                <p style={{ fontSize: 10, color: ativa ? c : "rgba(255,255,255,0.25)" }}>
                  {inst.tipo}
                </p>
              </div>
              {ativa && <div style={{ width: 3, height: 20, borderRadius: 99, background: c }} />}
            </button>
          );
        })}
      </div>
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
          Março 2026<br />
          <span style={{ color: C.gold, fontWeight: 600 }}>● Atualizado</span>
        </p>
      </div>
    </>
  );

  return (
    <>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40
        }} />
      )}

      <div style={{ minHeight: "100vh", background: C.cream, display: "flex" }}>

        {/* sidebar desktop */}
        <aside style={{
          width: 220, flexShrink: 0, background: C.dark,
          display: "flex", flexDirection: "column", padding: "28px 0",
          position: "sticky", top: 0, height: "100vh"
        }}
          className="hidden-mobile">
          <SidebarContent />
        </aside>

        {/* sidebar mobile drawer */}
        <aside style={{
          position: "fixed", top: 0, left: 0, height: "100vh", width: 240,
          background: C.dark, display: "flex", flexDirection: "column",
          padding: "28px 0", zIndex: 50,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease"
        }}>
          <button onClick={() => setSidebarOpen(false)} style={{
            position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.1)",
            border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Icon d={Icons.close} size={16} color={C.white} />
          </button>
          <SidebarContent />
        </aside>

        <main style={{ flex: 1, padding: "24px 20px", overflowY: "auto", minWidth: 0 }}>

          {/* topbar */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 20, gap: 10
          }}>
            <button onClick={() => setSidebarOpen(true)} className="show-mobile"
              style={{
                background: C.white, border: `1px solid ${C.border}`, borderRadius: 10,
                width: 38, height: 38, cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
              <Icon d={Icons.menu} size={18} color={C.ink} />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: 10, letterSpacing: 3, color: C.gold,
                textTransform: "uppercase", fontWeight: 600, marginBottom: 2
              }}>
                {instSel.tipo}
              </p>
              <h1 style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(18px,4vw,24px)", fontWeight: 700, color: C.ink, lineHeight: 1
              }}>
                {instSel.nome}
              </h1>
            </div>
            <button onClick={() => setMostrarForm(f => !f)} style={{
              background: `linear-gradient(135deg,${C.dark},${C.dark2})`,
              color: C.white, border: "none", borderRadius: 10, padding: "8px 14px",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
              boxShadow: `0 4px 12px ${cor}44`
            }}>
              <Icon d={Icons.plus} size={13} color={C.white} />
              <span>Registrar gasto</span>
            </button>
          </div>

          {/* header instituição */}
          <div style={{
            background: `linear-gradient(135deg,${C.dark},${C.dark2})`,
            borderRadius: 18, padding: "20px 24px", marginBottom: 20,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 12, position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", right: -30, top: -30, width: 140, height: 140,
              borderRadius: "50%", border: `1px solid ${cor}`, opacity: 0.15
            }} />
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 13, background: bg,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
              }}>
                {instSel.tipo === "Refeição" ? "🍽" : instSel.tipo === "Banho" ? "🚿" : "🧣"}
              </div>
              <div>
                <p style={{
                  fontSize: 10, letterSpacing: 3, color: cor,
                  textTransform: "uppercase", fontWeight: 600, marginBottom: 3
                }}>{instSel.tipo}</p>
                <p style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 18, fontWeight: 700, color: C.white
                }}>{instSel.nome}</p>
              </div>
            </div>
            {semComp > 0 && (
              <div style={{
                background: C.amberL, border: `1px solid ${C.amber}40`,
                borderRadius: 10, padding: "7px 12px",
                display: "flex", alignItems: "center", gap: 6
              }}>
                <Icon d={Icons.warning} size={13} color={C.amber} />
                <span style={{ fontSize: 12, color: C.amber, fontWeight: 500 }}>
                  {semComp} sem comprovante
                </span>
              </div>
            )}
          </div>

          {/* métricas */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
            gap: 12, marginBottom: 16
          }}>
            <MetricCard label="Recebido" value={`R$ ${recebido}`}
              sub={`${doacoesInst.length} doações`} color={cor} icon={Icons.wallet} />
            <MetricCard label="Utilizado" value={`R$ ${utilizado}`}
              sub={`${gastosInst.length} gastos`} color={C.red} icon={Icons.receipt} />
            <MetricCard label="Saldo"
              value={`R$ ${Math.abs(restante)}`}
              sub={restante < 0 ? "Saldo negativo" : "Disponível"}
              color={restante < 0 ? C.red : cor} icon={Icons.arrow}
              highlight={restante < 0} />
          </div>

          {/* gauge */}
          <div style={{
            background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
            padding: "16px 20px", marginBottom: 16,
            boxShadow: "0 2px 8px rgba(28,26,22,0.04)"
          }}>
            <HealthGauge pct={pctUsado} cor={cor} />
          </div>

          {/* formulário */}
          {mostrarForm && (
            <FormGasto cor={cor} bg={bg}
              onSalvar={handleAddGasto} onCancelar={() => setMostrarForm(false)} />
          )}

          {/* timeline */}
          <div style={{
            background: C.white, borderRadius: 18, border: `1px solid ${C.border}`,
            padding: "20px 20px", boxShadow: "0 2px 8px rgba(28,26,22,0.04)"
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 8
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Histórico de gastos</p>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  {gastosInst.length} registros · {gastosInst.filter(g => g.comprovante).length} com comprovante
                </p>
              </div>
              <Badge color={cor} bg={bg}>Total: R$ {utilizado}</Badge>
            </div>

            {gastosInst.length === 0 ? (
              <div style={{ textAlign: "center", padding: "36px 20px", color: C.muted }}>
                <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.3 }}>📋</div>
                <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Nenhum gasto registrado</p>
                <p style={{ fontSize: 12 }}>Clique em "Registrar gasto" para começar.</p>
              </div>
            ) : (
              <div>
                {gastosInst.map((g, i) => (
                  <GastoItem key={i} g={g} cor={cor} bg={bg} index={gastosInst.length - 1 - i} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}