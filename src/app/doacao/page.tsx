"use client";
import { useState } from "react";
import { INSTITUICOES, type Instituicao } from "@/lib/data";

type Etapa = "escolha" | "pagamento" | "confirmado";

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
  white: "#FFFFFF",
  border: "#E8E0D0",
};

const instColor = (inst: Instituicao) =>
  inst.tipo === "Refeição" ? { cor: C.green, bg: C.greenL }
    : inst.tipo === "Banho" ? { cor: C.blue, bg: C.blueL }
      : { cor: C.amber, bg: C.amberL };

const Divider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "1.25rem 0" }}>
    <div style={{ flex: 1, height: 1, background: C.border }} />
    <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold, opacity: 0.6 }} />
    <div style={{ flex: 1, height: 1, background: C.border }} />
  </div>
);

// ── ILUSTRAÇÃO SVG: Natureza + Cruz ─────────────────────────────────────────
function NatureBg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
      }}
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1440 900"
    >
      <defs>
        {/* céu: aurora quente de manhã cedo */}
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4E8F5" />
          <stop offset="35%" stopColor="#EAD9C0" />
          <stop offset="65%" stopColor="#F2E4C8" />
          <stop offset="100%" stopColor="#EDE0C8" />
        </linearGradient>
        {/* sol / halo de luz */}
        <radialGradient id="sun" cx="50%" cy="38%" r="30%">
          <stop offset="0%" stopColor="#FDF0C8" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#F5DFA0" stopOpacity="0.6" />
          <stop offset="65%" stopColor="#EDD47A" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#EDD47A" stopOpacity="0" />
        </radialGradient>
        {/* névoa do horizonte */}
        <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5EDD4" stopOpacity="0" />
          <stop offset="100%" stopColor="#F5EDD4" stopOpacity="0.55" />
        </linearGradient>
        {/* colina fundo gradient */}
        <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A7A52" />
          <stop offset="100%" stopColor="#2D4A35" />
        </linearGradient>
        <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B6B44" />
          <stop offset="100%" stopColor="#1C3526" />
        </linearGradient>
        <linearGradient id="hill3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2D5234" />
          <stop offset="100%" stopColor="#162A1E" />
        </linearGradient>
      </defs>

      {/* ── CÉU ── */}
      <rect width="1440" height="900" fill="url(#sky)" />

      {/* halo solar */}
      <ellipse cx="720" cy="340" rx="420" ry="320" fill="url(#sun)" />

      {/* nuvens suaves */}
      <g opacity="0.5">
        <ellipse cx="280" cy="180" rx="130" ry="38" fill="#FFF8EE" />
        <ellipse cx="220" cy="188" rx="80" ry="28" fill="#FFF8EE" />
        <ellipse cx="340" cy="192" rx="90" ry="26" fill="#FFF8EE" />
        <ellipse cx="1100" cy="155" rx="150" ry="42" fill="#FFF8EE" />
        <ellipse cx="1040" cy="165" rx="85" ry="30" fill="#FFF8EE" />
        <ellipse cx="1180" cy="168" rx="100" ry="28" fill="#FFF8EE" />
        <ellipse cx="600" cy="120" rx="110" ry="30" fill="#FFF8EE" opacity="0.6" />
        <ellipse cx="850" cy="140" rx="90" ry="25" fill="#FFF8EE" opacity="0.5" />
      </g>

      {/* raios de luz finos vindos do topo */}
      <g stroke="#C9A84C" strokeOpacity="0.07" strokeWidth="1.5">
        {[620, 660, 700, 720, 740, 780, 820].map((x, i) => (
          <line key={i} x1={x} y1="0" x2={360 + (x - 720) * 2.2} y2="900" />
        ))}
      </g>

      {/* ── COLINAS DISTANTES (fundo) ── */}
      <path d="M0 580 Q180 500 360 530 Q540 560 720 510 Q900 460 1080 500 Q1260 540 1440 510 L1440 900 L0 900 Z"
        fill="url(#hill1)" opacity="0.45" />

      {/* ── COLINAS MÉDIAS ── */}
      <path d="M0 640 Q120 590 280 600 Q440 610 580 575 Q680 555 720 558 Q760 561 860 575 Q1000 595 1160 580 Q1300 568 1440 600 L1440 900 L0 900 Z"
        fill="url(#hill2)" opacity="0.7" />

      {/* ── COLINAS PRÓXIMAS ── */}
      <path d="M0 720 Q200 680 380 695 Q520 705 620 680 Q680 667 720 668 Q760 669 820 680 Q920 698 1060 688 Q1240 675 1440 710 L1440 900 L0 900 Z"
        fill="url(#hill3)" opacity="0.9" />

      {/* ── CHÃO / PRADO ── */}
      <path d="M0 780 Q360 755 720 762 Q1080 769 1440 755 L1440 900 L0 900 Z"
        fill="#1C2B1F" />
      <path d="M0 800 Q360 782 720 788 Q1080 794 1440 782 L1440 900 L0 900 Z"
        fill="#162018" />

      {/* ── NÉVOA DO HORIZONTE ── */}
      <rect x="0" y="490" width="1440" height="180" fill="url(#mist)" />

      {/* ── PINHEIROS DISTANTES (pequenos, na colina do fundo) ── */}
      <g fill="#1C3526" opacity="0.55">
        {[80, 140, 200, 260, 340, 420, 520, 620, 820, 920, 1020, 1120, 1200, 1280, 1360].map((x, i) => {
          const h = 55 + (i % 3) * 12;
          const cx = x;
          const base = 570 - (i % 4) * 6;
          return (
            <g key={i}>
              <polygon points={`${cx},${base - h} ${cx - 14},${base} ${cx + 14},${base}`} />
              <polygon points={`${cx},${base - h * 0.68} ${cx - 18},${base - h * 0.12} ${cx + 18},${base - h * 0.12}`} />
              <rect x={cx - 3} y={base} width={6} height={10} />
            </g>
          );
        })}
      </g>

      {/* ── PINHEIROS MÉDIOS (colina média) ── */}
      <g fill="#162A1E" opacity="0.75">
        {[50, 130, 230, 350, 470, 590, 680, 760, 860, 980, 1090, 1190, 1300, 1400].map((x, i) => {
          const h = 80 + (i % 4) * 18;
          const cx = x;
          const base = 650 - (i % 3) * 8;
          return (
            <g key={i}>
              <polygon points={`${cx},${base - h} ${cx - 18},${base} ${cx + 18},${base}`} />
              <polygon points={`${cx},${base - h * 0.7} ${cx - 23},${base - h * 0.15} ${cx + 23},${base - h * 0.15}`} />
              <polygon points={`${cx},${base - h * 0.42} ${cx - 27},${base - h * 0.28} ${cx + 27},${base - h * 0.28}`} />
              <rect x={cx - 4} y={base} width={8} height={14} />
            </g>
          );
        })}
      </g>

      {/* ── PINHEIROS GRANDES (primeiro plano) ── */}
      <g fill="#0F1E14" opacity="0.92">
        {[0, 100, 210, 330, 460, 600, 840, 980, 1110, 1240, 1360, 1440].map((x, i) => {
          const h = 130 + (i % 5) * 30;
          const cx = x;
          const base = 760 - (i % 3) * 10;
          return (
            <g key={i}>
              <polygon points={`${cx},${base - h} ${cx - 22},${base} ${cx + 22},${base}`} />
              <polygon points={`${cx},${base - h * 0.72} ${cx - 28},${base - h * 0.18} ${cx + 28},${base - h * 0.18}`} />
              <polygon points={`${cx},${base - h * 0.46} ${cx - 34},${base - h * 0.3} ${cx + 34},${base - h * 0.3}`} />
              <polygon points={`${cx},${base - h * 0.24} ${cx - 38},${base - h * 0.38} ${cx + 38},${base - h * 0.38}`} />
              <rect x={cx - 5} y={base} width={10} height={20} />
            </g>
          );
        })}
      </g>

      {/* ── CRUZ CENTRAL (horizonte, iluminada) ── */}
      {/* halo ao redor da cruz */}
      <ellipse cx="720" cy="548" rx="55" ry="48" fill="#FDF0C8" opacity="0.22" />
      <ellipse cx="720" cy="548" rx="32" ry="28" fill="#FDF0C8" opacity="0.28" />
      {/* haste vertical */}
      <rect x="714" y="492" width="12" height="88" rx="2" fill="#C9A84C" opacity="0.95" />
      {/* travessa horizontal */}
      <rect x="690" y="514" width="60" height="9" rx="2" fill="#C9A84C" opacity="0.95" />
      {/* reflexo de luz no topo da haste */}
      <rect x="716" y="492" width="4" height="20" rx="1" fill="#FDF0C8" opacity="0.5" />

      {/* ── REFLEXO NO CHÃO (água/prado) ── */}
      <ellipse cx="720" cy="820" rx="180" ry="18" fill="#C9A84C" opacity="0.06" />

      {/* ── PÁSSAROS distantes ── */}
      <g stroke="#1C3526" strokeWidth="1.2" fill="none" opacity="0.3">
        <path d="M380 230 Q384 226 388 230" />
        <path d="M393 224 Q397 220 401 224" />
        <path d="M1020 210 Q1024 206 1028 210" />
        <path d="M1033 218 Q1037 214 1041 218" />
        <path d="M1048 208 Q1052 204 1056 208" />
        <path d="M600 180 Q604 176 608 180" />
      </g>

      {/* ── OVERLAY suave no fundo para o cartão não perder legibilidade ── */}
      <rect width="1440" height="900" fill="#FAF7F2" opacity="0.28" />
    </svg>
  );
}

// ── TELA ESCOLHA ─────────────────────────────────────────────────────────────
function TelaEscolha({ onEscolher }: { onEscolher: (i: Instituicao) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{
      minHeight: "100vh", background: "#D4E8F5",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 20px", position: "relative",
    }}>
      <NatureBg />

      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 480,
        background: "rgba(255,255,255,0.86)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: 28,
        border: "1px solid rgba(232,224,208,0.9)",
        boxShadow: "0 32px 80px rgba(28,26,22,0.14), 0 4px 20px rgba(28,26,22,0.06)",
        overflow: "hidden",
      }}>
        {/* topo escuro */}
        <div style={{
          background: "linear-gradient(135deg, #1C2B1F 0%, #2D4A35 100%)",
          padding: "24px 28px 20px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -35, right: -35, width: 120, height: 120,
            borderRadius: "50%", border: `1px solid ${C.gold}`, opacity: 0.15
          }} />
          <div style={{
            position: "absolute", top: -10, right: -10, width: 65, height: 65,
            borderRadius: "50%", border: `1px solid ${C.gold}`, opacity: 0.12
          }} />

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* cruz */}
            <div style={{ position: "relative", width: 28, height: 28, flexShrink: 0 }}>
              <div style={{
                position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)",
                width: 2, height: 28, background: C.gold, opacity: 0.8, borderRadius: 2
              }} />
              <div style={{
                position: "absolute", top: "33%", left: 0,
                width: 28, height: 2, background: C.gold, opacity: 0.8, borderRadius: 2
              }} />
            </div>
            <div>
              <p style={{
                fontSize: 10, letterSpacing: 3.5, color: C.gold,
                textTransform: "uppercase", fontWeight: 600, marginBottom: 3
              }}>
                Faça uma doação
              </p>
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 20, fontWeight: 700, color: C.white, margin: 0, lineHeight: 1.2,
              }}>
                Escolha como ajudar
              </h1>
            </div>
          </div>
        </div>

        {/* corpo */}
        <div style={{ padding: "20px 24px 26px" }}>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 18, lineHeight: 1.65 }}>
            Cada doação vai diretamente para a instituição, sem intermediários.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {INSTITUICOES.map((inst) => {
              const { cor, bg } = instColor(inst);
              const isHov = hovered === inst.id;
              return (
                <button
                  key={inst.id}
                  onClick={() => onEscolher(inst)}
                  onMouseEnter={() => setHovered(inst.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: isHov ? bg : "rgba(250,247,242,0.9)",
                    border: `1.5px solid ${isHov ? cor : C.border}`,
                    borderRadius: 14, padding: "14px 16px",
                    cursor: "pointer", display: "flex",
                    alignItems: "center", gap: 13, textAlign: "left",
                    transition: "all 0.18s ease",
                    transform: isHov ? "translateX(4px)" : "none",
                    boxShadow: isHov ? `0 4px 16px ${cor}22` : "none",
                  }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: 12,
                    background: isHov ? C.white : C.stone,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, flexShrink: 0, transition: "background 0.18s",
                  }}>
                    {inst.tipo === "Refeição" ? "🍽" : inst.tipo === "Banho" ? "🚿" : "🧣"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 2,
                      fontFamily: "'Playfair Display', serif",
                    }}>{inst.nome}</p>
                    <p style={{ fontSize: 12, color: C.muted }}>{inst.tipo}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{
                      fontSize: 20, fontWeight: 700, color: cor,
                      fontFamily: "'Playfair Display', serif", lineHeight: 1,
                    }}>R$ {inst.valor}</p>
                    <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>por pessoa</p>
                  </div>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: isHov ? cor : C.stone,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: isHov ? C.white : C.muted,
                    flexShrink: 0, transition: "all 0.18s",
                  }}>→</div>
                </button>
              );
            })}
          </div>

          <Divider />
          <p style={{ textAlign: "center", fontSize: 11, color: C.muted, lineHeight: 1.8, opacity: 0.8 }}>
            🔒 Pix · Transparente · 100% para a instituição
          </p>
        </div>
      </div>

      <p style={{
        position: "relative", zIndex: 1, marginTop: 18, fontSize: 10,
        color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase"
      }}>
        DoaFácil
      </p>
    </div>
  );
}

// ── TELA PAGAMENTO ────────────────────────────────────────────────────────────
function TelaPagamento({
  inst, onConfirmar, onVoltar,
}: { inst: Instituicao; onConfirmar: (qtd: number) => void; onVoltar: () => void }) {
  const [qtd, setQtd] = useState(1);
  const { cor, bg } = instColor(inst);
  const total = inst.valor * qtd;

  return (
    <div style={{
      minHeight: "100vh", background: "#D4E8F5",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 20px", position: "relative",
    }}>
      <NatureBg />
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 480,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderRadius: 28, border: "1px solid rgba(232,224,208,0.9)",
        boxShadow: "0 32px 80px rgba(28,26,22,0.14)",
        overflow: "hidden",
      }}>
        <div style={{
          background: "linear-gradient(135deg, #1C2B1F, #2D4A35)",
          padding: "18px 22px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <button onClick={onVoltar} style={{
            background: "rgba(255,255,255,0.1)", border: "none",
            borderRadius: 8, width: 30, height: 30, cursor: "pointer",
            color: C.white, fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>←</button>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: bg,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
          }}>
            {inst.tipo === "Refeição" ? "🍽" : inst.tipo === "Banho" ? "🚿" : "🧣"}
          </div>
          <div>
            <p style={{
              fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: 2,
              textTransform: "uppercase", marginBottom: 1
            }}>Doando para</p>
            <p style={{
              fontFamily: "'Playfair Display', serif", fontSize: 16,
              fontWeight: 700, color: C.white
            }}>
              {inst.nome}
            </p>
          </div>
        </div>

        <div style={{ padding: "24px 26px" }}>
          <p style={{ fontSize: 13, color: C.muted, textAlign: "center", marginBottom: 18 }}>
            Quantas pessoas você quer ajudar?
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, marginBottom: 24 }}>
            <button onClick={() => setQtd(q => Math.max(1, q - 1))} style={{
              width: 42, height: 42, borderRadius: 11,
              border: `1.5px solid ${C.border}`, background: C.stone,
              fontSize: 20, cursor: "pointer", color: C.ink,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>−</button>
            <div style={{ textAlign: "center", minWidth: 52 }}>
              <div style={{
                fontSize: 48, fontWeight: 700, color: C.ink,
                fontFamily: "'Playfair Display', serif", lineHeight: 1
              }}>{qtd}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                {qtd === 1 ? "pessoa" : "pessoas"}
              </div>
            </div>
            <button onClick={() => setQtd(q => q + 1)} style={{
              width: 42, height: 42, borderRadius: 11,
              border: `1.5px solid ${cor}`, background: bg,
              fontSize: 20, cursor: "pointer", color: cor,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>+</button>
          </div>

          <div style={{
            background: "rgba(250,247,242,0.9)", borderRadius: 13,
            padding: "15px 18px", marginBottom: 12
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 13, color: C.muted, paddingBottom: 11,
              borderBottom: `1px solid ${C.border}`, marginBottom: 11
            }}>
              <span>{qtd}x {inst.tipo}</span>
              <span>R$ {inst.valor}/pessoa</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Total</span>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 30, fontWeight: 700, color: cor
              }}>
                R$ {total.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>

          <div style={{
            background: C.goldL, border: `1px solid ${C.gold}28`,
            borderRadius: 11, padding: "11px 15px", marginBottom: 20,
            display: "flex", gap: 9, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 15 }}>🏦</span>
            <p style={{ fontSize: 12, color: C.amber, lineHeight: 1.6 }}>
              A chave Pix aparece na próxima tela. O valor vai direto para a instituição.
            </p>
          </div>

          <button onClick={() => onConfirmar(qtd)} style={{
            width: "100%", padding: "15px", borderRadius: 13,
            background: "linear-gradient(135deg, #1C2B1F, #2D4A35)",
            color: C.white, border: "none", fontSize: 14, fontWeight: 600,
            cursor: "pointer", boxShadow: "0 8px 24px rgba(29,80,56,0.28)",
          }}>
            Confirmar · R$ {total.toFixed(2).replace(".", ",")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TELA CONFIRMADO ───────────────────────────────────────────────────────────
function TelaConfirmado({ inst, qtd, onNova }: { inst: Instituicao; qtd: number; onNova: () => void }) {
  const { cor } = instColor(inst);
  const total = inst.valor * qtd;
  const [copiado, setCopiado] = useState(false);

  const copiar = () => {
    navigator.clipboard.writeText(inst.pixKey ?? "");
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#D4E8F5",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "32px 20px", position: "relative",
    }}>
      <NatureBg />
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 440,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderRadius: 28, border: "1px solid rgba(232,224,208,0.9)",
        boxShadow: "0 32px 80px rgba(28,26,22,0.14)",
        padding: "32px 28px", textAlign: "center",
      }}>
        <div style={{
          width: 68, height: 68, borderRadius: "50%",
          background: "linear-gradient(135deg, #1C2B1F, #2D4A35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 26,
          boxShadow: "0 12px 32px rgba(29,80,56,0.28)",
        }}>✓</div>

        <p style={{
          fontSize: 10, letterSpacing: 3, color: C.gold,
          textTransform: "uppercase", fontWeight: 600, marginBottom: 10
        }}>
          Doação registrada
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(20px, 5vw, 27px)", fontWeight: 700,
          color: C.ink, lineHeight: 1.25, marginBottom: 10,
        }}>
          Que Deus abençoe<br />sua generosidade!
        </h2>
        <p style={{ color: C.muted, fontSize: 13, marginBottom: 24, lineHeight: 1.8 }}>
          <strong style={{ color: C.ink }}>{qtd} {qtd === 1 ? "pessoa" : "pessoas"}</strong> com{" "}
          <strong style={{ color: C.ink }}>{inst.tipo}</strong> via{" "}
          <strong style={{ color: C.ink }}>{inst.nome}</strong>
        </p>

        <div style={{
          background: "rgba(250,247,242,0.9)", borderRadius: 13,
          padding: "15px 17px", marginBottom: 12
        }}>
          <p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Valor da doação</p>
          <p style={{
            fontFamily: "'Playfair Display', serif", fontSize: 34,
            fontWeight: 700, color: cor
          }}>
            R$ {total.toFixed(2).replace(".", ",")}
          </p>
        </div>

        <div style={{
          background: C.goldL, border: `1px solid ${C.gold}28`,
          borderRadius: 13, padding: "13px 16px", marginBottom: 16, textAlign: "left",
        }}>
          <p style={{
            fontSize: 10, color: C.amber, fontWeight: 600, marginBottom: 6,
            letterSpacing: 0.5, textTransform: "uppercase"
          }}>Chave Pix</p>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 8
          }}>
            <span style={{ fontSize: 13, color: C.ink, fontWeight: 500, wordBreak: "break-all" }}>
              {inst.pixKey}
            </span>
            <button onClick={copiar} style={{
              background: copiado ? C.greenL : C.white,
              border: `1px solid ${copiado ? C.green : C.border}`,
              borderRadius: 8, padding: "5px 11px",
              fontSize: 11, color: copiado ? C.green : C.muted,
              cursor: "pointer", transition: "all 0.2s",
              whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {copiado ? "Copiado ✓" : "Copiar"}
            </button>
          </div>
        </div>

        <button onClick={onNova} style={{
          width: "100%", padding: "13px", borderRadius: 12,
          background: "none", border: `1.5px solid ${C.border}`,
          color: C.ink, fontSize: 13, fontWeight: 500, cursor: "pointer",
        }}>
          Fazer outra doação
        </button>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function DoacaoPage() {
  const [etapa, setEtapa] = useState<Etapa>("escolha");
  const [escolhida, setEscolhida] = useState<Instituicao | null>(null);
  const [qtd, setQtd] = useState(1);

  if (etapa === "confirmado" && escolhida)
    return <TelaConfirmado inst={escolhida} qtd={qtd}
      onNova={() => { setEtapa("escolha"); setEscolhida(null); setQtd(1); }} />;
  if (etapa === "pagamento" && escolhida)
    return <TelaPagamento inst={escolhida}
      onConfirmar={(q) => { setQtd(q); setEtapa("confirmado"); }}
      onVoltar={() => setEtapa("escolha")} />;

  return <TelaEscolha onEscolher={(i) => { setEscolhida(i); setEtapa("pagamento"); }} />;
}