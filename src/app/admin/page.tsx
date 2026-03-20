"use client";
import { useState } from "react";
import {
  DOACOES_MOCK, INSTITUICOES, RANKING_MOCK, MISSOES_MOCK, QR_EVENTOS,
  type Doador,
} from "@/lib/data";

// ── BRAND COLORS ─────────────────────────────────────────────────────────────
const C = {
  // brand
  blue:    "#000DFF",
  blueL:   "#e0e4ff",
  orange:  "#FF4E00",
  orangeL: "#fff0eb",
  black:   "#000000",
  white:   "#FFFFFF",
  // ui
  cream:   "#f8f8f8",
  stone:   "#f0f0f0",
  border:  "#e2e2e2",
  ink:     "#111111",
  muted:   "#777777",
  // aliases kept for compatibility
  green:   "#000DFF",
  greenL:  "#e0e4ff",
  gold:    "#FF4E00",
  goldL:   "#fff0eb",
  amber:   "#FF4E00",
  amberL:  "#fff0eb",
  dark:    "#000000",
  dark2:   "#111111",
  sidebar: "#000000",
};

const NIVEL_COLOR: Record<string, { cor: string; bg: string; glow: string }> = {
  bronze:   { cor: "#cd7f32", bg: "#fdf2e8", glow: "#cd7f3255" },
  prata:    { cor: "#9ea3b0", bg: "#f0f1f4", glow: "#9ea3b055" },
  ouro:     { cor: "#FF4E00", bg: "#fff0eb", glow: "#FF4E0055" },
  diamante: { cor: "#000DFF", bg: "#e0e4ff", glow: "#000DFF55" },
  lenda:    { cor: "#FF4E00", bg: "#fff0eb", glow: "#FF4E0055" },
};

// ── SVG ICON ────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  wallet:  "M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5M16 12h5",
  send:    "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  clock:   "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
  users:   "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  check:   "M20 6L9 17l-5-5",
  filter:  "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  church:  "M12 2L8 6H4v16h16V6h-4L12 2zM12 2v4M9 22v-6h6v6",
  menu:    "M3 12h18M3 6h18M3 18h18",
  close:   "M18 6L6 18M6 6l12 12",
  trophy:  "M8 21h8M12 17v4M7 4H4a1 1 0 00-1 1v3c0 3.31 2.69 6 6 6s6-2.69 6-6V5a1 1 0 00-1-1h-3M17 4h3a1 1 0 011 1v3c0 3.31-2.69 6-6 6",
  star:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  qr:      "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM17 14h.01M14 14h.01M20 14h.01M14 17h.01M17 17h.01M20 17h.01M14 20h7",
  game:    "M6 12h4M8 10v4M15 11h.01M17 13h.01M21 8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V8z",
  heart:   "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
};

// ── BEAR MASCOT IMAGE ────────────────────────────────────────────────────────
function UrsinhoSVG({ size = 80 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/ursinho.png" alt="Ursinho mascote" width={size} height={size}
      style={{ objectFit: "contain", display: "block" }} />
  );
}

// ── QR CODE VISUAL ───────────────────────────────────────────────────────────
function QRCodeVisual({ value, size = 120, color = "#111" }: { value: string; size?: number; color?: string }) {
  const hash = (s: string) => s.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
  const seed = hash(value);
  const cells = 11;
  const cellSize = size / cells;
  const filled: boolean[][] = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      if ((r < 3 && c < 3) || (r < 3 && c >= cells - 3) || (r >= cells - 3 && c < 3)) return true;
      const bit = (seed >> ((r * cells + c) % 30)) & 1;
      return (r + c) % 2 === bit % 2;
    })
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" rx="4"/>
      {filled.map((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c * cellSize + 1} y={r * cellSize + 1} width={cellSize - 1} height={cellSize - 1} fill={color} rx="1"/> : null
        )
      )}
    </svg>
  );
}

// ── SPARKLINE ────────────────────────────────────────────────────────────────
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values), min = Math.min(...values), range = max - min || 1;
  const w = 80, h = 32;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProgressBar({ pct, color, label, value }: { pct: number; color: string; label: string; value: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: C.muted }}>{value}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color, background: color + "18", padding: "1px 8px", borderRadius: 99 }}>{pct}%</span>
        </div>
      </div>
      <div style={{ background: C.stone, borderRadius: 99, height: 7, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color}aa,${color})`, height: "100%", borderRadius: 99, transition: "width 0.8s" }} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, color, icon, spark }: {
  label: string; value: string; sub: string; color: string; icon: string; spark: number[];
}) {
  return (
    <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 2px 12px rgba(28,26,22,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 11, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>{label}</p>
          <p style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "'Playfair Display',serif", lineHeight: 1 }}>{value}</p>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{sub}</p>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon d={icon} size={18} color={color} />
        </div>
      </div>
      <Sparkline values={spark} color={color} />
    </div>
  );
}

function Badge({ children, color = C.green, bg = C.greenL }: { children: React.ReactNode; color?: string; bg?: string }) {
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, display: "inline-block", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  const r = 52, cx = 64, cy = 64, stroke = 18, circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
      <svg width={128} height={128} viewBox="0 0 128 128" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.stone} strokeWidth={stroke} />
        {data.map((d, i) => {
          const pct = d.value / total, dash = pct * circ, gap = circ - dash;
          const rotation = offset * 360 - 90; offset += pct;
          return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`} strokeLinecap="butt" transform={`rotate(${rotation} ${cx} ${cy})`} />;
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink} fontFamily="'Playfair Display',serif">R$ {total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill={C.muted}>total</text>
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

function RankingCard({ doador, posicao }: { doador: Doador; posicao: number }) {
  const nivel = NIVEL_COLOR[doador.nivel];
  const isPodium = posicao <= 3;
  const podiumEmoji = ["🥇", "🥈", "🥉"][posicao - 1] ?? "";
  return (
    <div style={{
      background: isPodium ? `linear-gradient(135deg, ${nivel.bg}, white)` : C.white,
      borderRadius: 16,
      border: `${isPodium ? "2px" : "1px"} solid ${isPodium ? nivel.cor + "55" : C.border}`,
      padding: "16px 18px",
      display: "flex", alignItems: "center", gap: 14,
      boxShadow: isPodium ? `0 4px 20px ${nivel.glow}` : "0 1px 6px rgba(28,26,22,0.04)",
    }}>
      <div style={{ fontSize: isPodium ? 22 : 14, fontWeight: 700, minWidth: 32, textAlign: "center", color: isPodium ? nivel.cor : C.muted, fontFamily: "'Playfair Display', serif" }}>
        {isPodium ? podiumEmoji : `#${posicao}`}
      </div>
      <div style={{
        width: isPodium ? 46 : 38, height: isPodium ? 46 : 38, borderRadius: "50%",
        background: isPodium ? `linear-gradient(135deg, ${nivel.cor}cc, ${nivel.cor})` : C.stone,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: isPodium ? 14 : 12, fontWeight: 700, color: isPodium ? "white" : C.muted, flexShrink: 0,
        boxShadow: isPodium ? `0 4px 12px ${nivel.glow}` : "none",
      }}>
        {doador.avatar}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <p style={{ fontSize: isPodium ? 15 : 13, fontWeight: 600, color: C.ink }}>{doador.nome}</p>
          {doador.missaoCompleta && (
            <span style={{ fontSize: 10, background: "#1D9E7520", color: "#1D9E75", padding: "1px 7px", borderRadius: 99, fontWeight: 600 }}>✓ Missão</span>
          )}
        </div>
        <p style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{doador.apelido}</p>
        {doador.badge && <p style={{ fontSize: 11, color: nivel.cor, fontWeight: 600, marginTop: 3 }}>{doador.badge}</p>}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontSize: isPodium ? 20 : 16, fontWeight: 700, color: nivel.cor, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{doador.pontos.toLocaleString("pt-BR")}</p>
        <p style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>pontos</p>
        <p style={{ fontSize: 11, color: C.green, fontWeight: 600, marginTop: 2 }}>R$ {doador.totalDoado}</p>
      </div>
    </div>
  );
}

type Tab = "dashboard" | "ranking" | "qrcodes" | "homenagens" | "missao";

const TABS: { id: Tab; label: string; icon: string; emoji?: string }[] = [
  { id: "dashboard",  label: "Dashboard",   icon: Icons.church },
  { id: "ranking",    label: "Ranking",      icon: Icons.trophy, emoji: "🐻" },
  { id: "qrcodes",    label: "QR Codes",     icon: Icons.qr },
  { id: "homenagens", label: "Homenagens",   icon: Icons.heart },
  { id: "missao",     label: "Missão",       icon: Icons.game },
];

export default function AdminPage() {
  const [tab, setTab]               = useState<Tab>("dashboard");
  const [filtro, setFiltro]         = useState("todas");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const doacoes   = DOACOES_MOCK;
  const total     = doacoes.reduce((s, d) => s + d.valor, 0);
  const repassado = Math.round(total * 0.82);
  const pendente  = total - repassado;
  const pessoas   = doacoes.reduce((s, d) => s + Math.floor(d.valor / 15), 0);
  const filtradas = filtro === "todas" ? doacoes : doacoes.filter(d => d.instituicao === filtro);
  const instNomes = Array.from(new Set(doacoes.map(d => d.instituicao)));
  const donutData = INSTITUICOES.map(inst => ({
    label: inst.nome,
    value: doacoes.filter(d => d.instituicao === inst.nome).reduce((s, d) => s + d.valor, 0),
    color: inst.tipo === "Refeição" ? C.green : inst.tipo === "Banho" ? C.blue : C.amber,
  }));

  const SidebarContent = () => (
    <>
      <div style={{ padding: "0 16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <UrsinhoSVG size={40} />
          </div>
          <div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>DoaFácil</p>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>Painel da Igreja</p>
          </div>
        </div>
      </div>
      <nav style={{ padding: "16px 10px", flex: 1 }}>
        {TABS.map(item => {
          const active = tab === item.id;
          return (
            <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, marginBottom: 3, background: active ? "rgba(184,151,58,0.15)" : "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
              {item.emoji
                ? <span style={{ fontSize: 16, lineHeight: 1 }}>{item.emoji}</span>
                : <Icon d={item.icon} size={15} color={active ? C.gold : "rgba(255,255,255,0.35)"} />}
              <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? C.gold : "rgba(255,255,255,0.4)" }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "14px 18px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", lineHeight: 1.7 }}>
          20 de março de 2026<br />
          <span style={{ color: C.gold, fontWeight: 600 }}>● Online</span>
        </p>
      </div>
    </>
  );

  const tabInfo = TABS.find(t => t.id === tab)!;

  // ── DASHBOARD ────────────────────────────────────────────────────────────
  const renderDashboard = () => (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
        <MetricCard label="Total recebido" value={`R$ ${total}`} sub={`${doacoes.length} doações`} color={C.green} icon={Icons.wallet} spark={[20,35,28,45,38,55,48,65,52,70,62,80]} />
        <MetricCard label="Repassado" value={`R$ ${repassado}`} sub="para instituições" color={C.blue} icon={Icons.send} spark={[15,28,22,38,30,46,40,54,44,60,52,68]} />
        <MetricCard label="Aguardando" value={`R$ ${pendente}`} sub="a repassar" color={C.amber} icon={Icons.clock} spark={[5,8,6,10,8,12,10,14,12,16,14,18]} />
        <MetricCard label="Pessoas ajudadas" value={`${pessoas}`} sub="este mês" color={C.dark2} icon={Icons.users} spark={[3,5,4,7,6,8,7,10,8,12,10,14]} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 20 }}>
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "22px 24px", boxShadow: "0 2px 12px rgba(28,26,22,0.05)" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 20 }}>Distribuição por instituição</p>
          <DonutChart data={donutData} />
        </div>
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "22px 24px", boxShadow: "0 2px 12px rgba(28,26,22,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Alocação de recursos</p>
            <Badge color={C.green} bg={C.greenL}>Atualizado agora</Badge>
          </div>
          {INSTITUICOES.map(inst => {
            const v = doacoes.filter(d => d.instituicao === inst.nome).reduce((s, d) => s + d.valor, 0);
            const pct = Math.round((v / total) * 100);
            const cor = inst.tipo === "Refeição" ? C.green : inst.tipo === "Banho" ? C.blue : C.amber;
            return <ProgressBar key={inst.id} label={inst.nome} value={`R$ ${v}`} pct={pct} color={cor} />;
          })}
          <div style={{ marginTop: 8, background: C.goldL, borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <p style={{ fontSize: 11, color: C.amber, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Próximo repasse</p>
              <p style={{ fontSize: 13, color: C.ink, marginTop: 2 }}>25/03/2026</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: C.amber, fontFamily: "'Playfair Display',serif" }}>R$ {pendente}</p>
              <p style={{ fontSize: 11, color: C.muted }}>aguardando</p>
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(28,26,22,0.05)", overflow: "hidden" }}>
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Doações recentes</p>
            <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{filtradas.length} registros</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.cream, border: `1px solid ${C.border}`, borderRadius: 10, padding: "6px 12px" }}>
            <Icon d={Icons.filter} size={13} color={C.muted} />
            <select value={filtro} onChange={e => setFiltro(e.target.value)} style={{ border: "none", background: "transparent", fontSize: 12, color: C.ink, cursor: "pointer", outline: "none" }}>
              <option value="todas">Todas</option>
              {instNomes.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
            <thead>
              <tr style={{ background: C.cream }}>
                {["Doador","Instituição","Tipo","Valor","Data","Status"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((d, i) => {
                const tc = d.tipo === "Refeição" ? { c: C.green, bg: C.greenL } : d.tipo === "Banho" ? { c: C.blue, bg: C.blueL } : { c: C.amber, bg: C.amberL };
                return (
                  <tr key={d.id} style={{ borderTop: `1px solid ${C.stone}`, background: i % 2 === 0 ? C.white : "rgba(250,247,242,0.5)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.dark + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: C.dark, flexShrink: 0 }}>
                          {d.doador.split(" ").map(w => w[0]).join("").slice(0, 2)}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: C.ink, whiteSpace: "nowrap" }}>{d.doador}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.muted, whiteSpace: "nowrap" }}>{d.instituicao}</td>
                    <td style={{ padding: "12px 16px" }}><Badge color={tc.c} bg={tc.bg}>{d.tipo}</Badge></td>
                    <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 14, fontWeight: 700, color: C.green, fontFamily: "'Playfair Display',serif", whiteSpace: "nowrap" }}>R$ {d.valor}</span></td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.muted, whiteSpace: "nowrap" }}>{d.data}</td>
                    <td style={{ padding: "12px 16px" }}><div style={{ display: "flex", alignItems: "center", gap: 5 }}><Icon d={Icons.check} size={13} color={C.green} /><Badge color={C.green} bg={C.greenL}>Confirmado</Badge></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.cream, flexWrap: "wrap", gap: 8 }}>
          <p style={{ fontSize: 12, color: C.muted }}>Mostrando {filtradas.length} de {doacoes.length} doações</p>
        </div>
      </div>
    </>
  );

  // ── RANKING ──────────────────────────────────────────────────────────────
  const renderRanking = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "linear-gradient(135deg, #0e0e0e 0%, #1a1a1a 100%)", borderRadius: 22, padding: "24px 28px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -20, top: -20, opacity: 0.06 }}><UrsinhoSVG size={180} /></div>
        <UrsinhoSVG size={72} />
        <div style={{ flex: 1, minWidth: 200, position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 11, color: C.gold, letterSpacing: 3, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>🐻 Missão do Ursinho</p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(18px,3vw,26px)", fontWeight: 700, color: "#fff", lineHeight: 1.2, margin: 0 }}>Ranking de Doadores</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 6, lineHeight: 1.5 }}>Cada R$1 doado = 10 pontos · Complete missões para ganhar bônus!</p>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { label: "Doadores",   value: RANKING_MOCK.length,                          color: C.gold   },
            { label: "Top pontos", value: RANKING_MOCK[0].pontos.toLocaleString("pt-BR"), color: C.orange },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center", background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "12px 20px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Playfair Display',serif" }}>{stat.value}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(Object.entries(NIVEL_COLOR) as [string, { cor: string; bg: string; glow: string }][]).map(([nivel, { cor, bg }]) => (
          <span key={nivel} style={{ background: bg, color: cor, fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 99, border: `1px solid ${cor}33`, textTransform: "capitalize" }}>
            {nivel === "lenda" ? "🏆 " : nivel === "diamante" ? "💎 " : nivel === "ouro" ? "⭐ " : nivel === "prata" ? "🥈 " : "🥉 "}{nivel}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {RANKING_MOCK.map((doador, i) => <RankingCard key={doador.id} doador={doador} posicao={i + 1} />)}
      </div>
      <div style={{ background: C.goldL, borderRadius: 16, padding: "16px 20px", border: `1px solid ${C.gold}28` }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.amber, marginBottom: 8 }}>📋 Como funciona a pontuação?</p>
        {["R$ 1 doado = 10 pontos base", "Missões concluídas garantem pontos bônus", "Lenda (2000+ pts) · Diamante (1500+) · Ouro (1000+) · Prata (500+) · Bronze (0+)", "Top 3 recebem homenagem especial no culto!"].map((r, i) => (
          <p key={i} style={{ fontSize: 12, color: C.amber, lineHeight: 1.5 }}>• {r}</p>
        ))}
      </div>
    </div>
  );

  // ── QR CODES ─────────────────────────────────────────────────────────────
  const renderQRCodes = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "linear-gradient(135deg, #1C2B1F, #2D4A35)", borderRadius: 18, padding: "20px 24px", color: "white", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ width: 48, height: 48, background: "rgba(255,255,255,0.1)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon d={Icons.qr} size={24} color={C.gold} />
        </div>
        <div>
          <p style={{ fontSize: 11, color: C.gold, letterSpacing: 3, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Entrega de QR</p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, margin: 0 }}>Códigos para o Culto</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Exiba no telão ou imprima para distribuir na entrada</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
        {QR_EVENTOS.map((qr, i) => {
          const inst = INSTITUICOES.find(ins => ins.id === qr.instituicaoId)!;
          const cor  = inst.tipo === "Refeição" ? C.green : inst.tipo === "Banho" ? C.blue : C.amber;
          const bg   = inst.tipo === "Refeição" ? C.greenL : inst.tipo === "Banho" ? C.blueL : C.amberL;
          return (
            <div key={i} style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 4px 16px rgba(28,26,22,0.07)" }}>
              <div style={{ background: `linear-gradient(90deg, ${cor}18, ${cor}28)`, borderBottom: `1px solid ${cor}22`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{inst.emoji}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: cor }}>{inst.nome}</p>
                  <p style={{ fontSize: 10, color: C.muted }}>{qr.evento} · {qr.dataEvento}</p>
                </div>
              </div>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ padding: 12, background: "#fafafa", borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <QRCodeVisual value={qr.pixKey + qr.valor + qr.dataEvento} size={110} color={cor} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: cor, fontFamily: "'Playfair Display',serif" }}>R$ {qr.valor}</p>
                  <p style={{ fontSize: 11, color: C.muted }}>por pessoa</p>
                </div>
                <div style={{ background: bg, borderRadius: 10, padding: "8px 14px", width: "100%", textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: cor, fontWeight: 600, letterSpacing: 0.5, marginBottom: 2 }}>CHAVE PIX</p>
                  <p style={{ fontSize: 10, color: cor, wordBreak: "break-all", lineHeight: 1.4 }}>{qr.pixKey}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ background: C.goldL, borderRadius: 14, padding: "14px 18px", border: `1px solid ${C.gold}28`, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <p style={{ fontSize: 12, color: C.amber, lineHeight: 1.7 }}>
          <strong>Dica:</strong> Use Ctrl+P para imprimir esta página e distribuir os QR Codes na entrada da igreja. Cada código direciona direto para a chave Pix da instituição!
        </p>
      </div>
    </div>
  );

  // ── HOMENAGENS ───────────────────────────────────────────────────────────
  const renderHomenagens = () => {
    const todos = RANKING_MOCK;

    // Medalha SVG inline
    const Medalha = ({ cor, pos }: { cor: string; pos: number }) => (
      <svg width={56} height={68} viewBox="0 0 56 68" style={{ flexShrink: 0 }}>
        {/* fita */}
        <path d="M20 0 L28 18 L36 0 Z" fill={cor} opacity="0.85"/>
        <path d="M20 0 L23 0 L31 18 L28 18 Z" fill={cor} opacity="0.55"/>
        {/* círculo */}
        <circle cx="28" cy="44" r="22" fill={cor} />
        <circle cx="28" cy="44" r="18" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/>
        <circle cx="28" cy="44" r="14" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        {/* número */}
        <text x="28" y="50" textAnchor="middle" fontSize="18" fontWeight="800"
          fill="white" fontFamily="'Playfair Display',serif">{pos}</text>
      </svg>
    );

    // Diploma SVG (papel enrolado)
    const DiplomaDecor = ({ cor }: { cor: string }) => (
      <svg width={32} height={32} viewBox="0 0 32 32" style={{ flexShrink: 0, opacity: 0.7 }}>
        <rect x="2" y="6" width="28" height="20" rx="2" fill="#fffbe6" stroke={cor} strokeWidth="1.5"/>
        <line x1="7" y1="12" x2="25" y2="12" stroke={cor} strokeWidth="1" opacity="0.5"/>
        <line x1="7" y1="16" x2="25" y2="16" stroke={cor} strokeWidth="1" opacity="0.5"/>
        <line x1="7" y1="20" x2="18" y2="20" stroke={cor} strokeWidth="1" opacity="0.5"/>
        <circle cx="25" cy="21" r="4" fill={cor} opacity="0.4"/>
        <circle cx="25" cy="21" r="2" fill={cor} opacity="0.7"/>
      </svg>
    );

    const medalCores = ["#FF4E00", "#9ea3b0", "#cd7f32", "#000DFF", "#6600cc", "#2d7a2d", "#777"];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── LOUSA / HEADER ESTILO PAROQUIAL ── */}
        <div style={{
          background: "#1a2e1a",
          borderRadius: 20,
          padding: "28px 32px",
          position: "relative", overflow: "hidden",
          border: "3px solid #2d4a2d",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4), 0 4px 20px rgba(0,0,0,0.3)",
        }}>
          {/* textura giz */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "repeating-linear-gradient(0deg, white 0px, transparent 1px, transparent 3px)", pointerEvents: "none" }}/>

          {/* ursinho no canto */}
          <div style={{ position: "absolute", right: 16, bottom: -8, opacity: 0.15 }}>
            <UrsinhoSVG size={90} />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(22px,4vw,32px)", fontWeight: 700,
              color: "#f5f0e0", letterSpacing: 1, marginBottom: 6,
              textShadow: "0 1px 3px rgba(0,0,0,0.5)",
            }}>
              🏫 Quadro de Homenagens
            </p>
            <p style={{ fontSize: 13, color: "rgba(245,240,224,0.55)", lineHeight: 1.6 }}>
              Quem mais doou neste mês merece reconhecimento público.
              Essas conquistas ficam expostas na entrada da igreja — como na lousa da missão! 🙏
            </p>
            {/* linha giz decorativa */}
            <div style={{ marginTop: 16, height: 2, background: "rgba(245,240,224,0.18)", borderRadius: 1 }}/>
            <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Ranking visível aos doadores", "Atualizado a cada culto", "Reconhecimento na lousa"].map((tag, i) => (
                <span key={i} style={{ fontSize: 10, color: "rgba(245,240,224,0.5)", border: "1px solid rgba(245,240,224,0.15)", borderRadius: 99, padding: "2px 10px", letterSpacing: 0.5 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── PÓDIO TOP 3 ── */}
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "24px", overflow: "hidden" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 20 }}>🏆 Pódio do Mês</p>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", justifyContent: "center", flexWrap: "wrap" }}>
            {[1, 0, 2].map((idx) => {
              const d = todos[idx];
              if (!d) return null;
              const pos = idx + 1;
              const heights = [140, 180, 110];
              const podiumH = heights[idx];
              const cor = medalCores[idx];
              return (
                <div key={d.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, flex: "0 0 auto" }}>
                  {/* diploma acima do pódio */}
                  <DiplomaDecor cor={cor} />
                  {/* avatar */}
                  <div style={{
                    width: idx === 0 ? 54 : 44, height: idx === 0 ? 54 : 44,
                    borderRadius: "50%", background: cor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: idx === 0 ? 16 : 13, fontWeight: 800, color: "white",
                    boxShadow: `0 4px 16px ${cor}55`, marginBottom: 6,
                    border: `3px solid white`,
                  }}>{d.avatar}</div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.ink, textAlign: "center", maxWidth: 80, lineHeight: 1.2, marginBottom: 4 }}>{d.nome.split(" ")[0]}</p>
                  <p style={{ fontSize: 11, color: cor, fontWeight: 700, marginBottom: 6 }}>R$ {d.totalDoado}</p>
                  {/* coluna do pódio */}
                  <div style={{
                    width: 80, height: podiumH,
                    background: cor,
                    borderRadius: "6px 6px 0 0",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
                    paddingTop: 10,
                    boxShadow: `inset 0 4px 12px rgba(255,255,255,0.15)`,
                  }}>
                    <Medalha cor={`rgba(255,255,255,0.9)`} pos={pos} />
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 700, marginTop: 6 }}>
                      {d.pontos.toLocaleString("pt-BR")} pts
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── LISTA COMPLETA ESTILO LOUSA ── */}
        <div style={{
          background: "#1a2e1a", borderRadius: 18,
          border: "2px solid #2d4a2d",
          overflow: "hidden",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)",
        }}>
          {/* header */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(245,240,224,0.1)", display: "flex", justifyContent: "space-between" }}>
            <p style={{ fontSize: 12, color: "rgba(245,240,224,0.6)", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Quadro Geral</p>
            <p style={{ fontSize: 11, color: "rgba(245,240,224,0.35)" }}>{todos.length} participantes</p>
          </div>
          {todos.map((d, i) => {
            const cor = medalCores[Math.min(i, medalCores.length - 1)];
            const podiumEmoji = ["🥇", "🥈", "🥉"][i] ?? `${i + 1}º`;
            return (
              <div key={d.id} style={{
                padding: "14px 20px",
                borderBottom: i < todos.length - 1 ? "1px solid rgba(245,240,224,0.06)" : "none",
                display: "flex", alignItems: "center", gap: 14,
                background: i < 3 ? `${cor}08` : "transparent",
              }}>
                {/* posição */}
                <span style={{ fontSize: i < 3 ? 20 : 13, minWidth: 28, textAlign: "center", color: cor, fontWeight: 700, fontFamily: "'Playfair Display',serif" }}>
                  {podiumEmoji}
                </span>
                {/* avatar */}
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: cor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>
                  {d.avatar}
                </div>
                {/* info */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#f5f0e0" }}>{d.nome}</p>
                  <p style={{ fontSize: 11, color: "rgba(245,240,224,0.4)" }}>{d.apelido}{d.missaoCompleta ? " · ✓ Missão" : ""}</p>
                </div>
                {/* prêmio */}
                {d.badge && (
                  <span style={{ fontSize: 10, background: `${cor}22`, color: cor, padding: "3px 10px", borderRadius: 99, fontWeight: 700, whiteSpace: "nowrap" }}>
                    {d.badge}
                  </span>
                )}
                {/* valor */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: cor, fontFamily: "'Playfair Display',serif" }}>R$ {d.totalDoado}</p>
                  <p style={{ fontSize: 10, color: "rgba(245,240,224,0.35)" }}>{d.pontos.toLocaleString("pt-BR")} pts</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── PRÊMIOS / PLAQUINHAS ── */}
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "22px 24px" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 4 }}>📜 Prêmios & Plaquinhas</p>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 18, lineHeight: 1.5 }}>
            Entregues pessoalmente pelo pastor ao fim do culto — igual às brincadeiras na lousa!
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 12 }}>
            {[
              { icon: "🎤", titulo: "Fala no Culto",     desc: "Top 1 compartilha sua motivação", cor: "#FF4E00", quem: "1º lugar" },
              { icon: "📜", titulo: "Diploma de Papel",  desc: "Certificado impresso na mão pelo pastor", cor: "#cd7f32", quem: "Top 3" },
              { icon: "🏅", titulo: "Plaquinha de Honra",desc: "Placa com o nome exposta na entrada", cor: "#000DFF", quem: "Top 5" },
              { icon: "🎁", titulo: "Surpresa Especial", desc: "Presente simbólico, surpresa no fim", cor: "#6600cc", quem: "Sorteio" },
            ].map((item, i) => (
              <div key={i} style={{
                background: item.cor + "08",
                border: `2px dashed ${item.cor}33`,
                borderRadius: 14, padding: "16px",
                position: "relative",
              }}>
                {/* fita de categoria no canto */}
                <div style={{ position: "absolute", top: 8, right: 8, background: item.cor, color: "white", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99, letterSpacing: 0.5 }}>
                  {item.quem}
                </div>
                <p style={{ fontSize: 26, marginBottom: 8 }}>{item.icon}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 4 }}>{item.titulo}</p>
                <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  };

  // ── MISSÃO ───────────────────────────────────────────────────────────────
  const renderMissao = () => {
    const totalPontos = MISSOES_MOCK.filter(m => m.completa).reduce((s, m) => s + m.pontos, 0);
    const maxPontos   = MISSOES_MOCK.reduce((s, m) => s + m.pontos, 0);
    const pct = Math.round((totalPontos / maxPontos) * 100);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: "linear-gradient(135deg, #0e0e0e, #1a1a1a)", borderRadius: 22, padding: "28px", position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
          <div style={{ position: "absolute", right: -30, bottom: -30, opacity: 0.07 }}><UrsinhoSVG size={220} /></div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            <UrsinhoSVG size={80} />
            <div style={{ flex: 1, minWidth: 200, position: "relative", zIndex: 1 }}>
              <p style={{ fontSize: 10, color: C.orange, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>🎮 GAME MODE</p>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(20px,3.5vw,30px)", fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>Missão do Ursinho</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>Complete todas as missões e suba no ranking!</p>
              <div style={{ marginTop: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Progresso das Missões</p>
                  <p style={{ fontSize: 11, color: C.gold, fontWeight: 600 }}>{totalPontos} / {maxPontos} pts</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 10, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.orange}, ${C.gold})`, height: "100%", borderRadius: 99, transition: "width 0.8s" }} />
                </div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{pct}% completo</p>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
          {MISSOES_MOCK.map(missao => (
            <div key={missao.id} style={{ background: missao.completa ? "linear-gradient(135deg, #E1F5EE, #f5fff9)" : C.white, borderRadius: 16, border: `${missao.completa ? "2px" : "1px"} solid ${missao.completa ? C.green + "55" : C.border}`, padding: "16px 18px", boxShadow: missao.completa ? `0 4px 16px ${C.green}22` : "0 1px 6px rgba(28,26,22,0.04)", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: missao.completa ? C.green + "22" : C.stone, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {missao.completa ? "✅" : missao.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{missao.titulo}</p>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: missao.completa ? C.greenL : C.goldL, color: missao.completa ? C.green : C.amber }}>+{missao.pontos} pts</span>
                </div>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{missao.descricao}</p>
                {missao.completa && <p style={{ fontSize: 11, color: C.green, fontWeight: 600, marginTop: 6 }}>✓ Missão concluída!</p>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: "linear-gradient(135deg, #0e0e0e, #1a1a1a)", borderRadius: 18, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize: 36 }}>🐻</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Convida seus amigos!</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>Quanto mais gente participar, mais pessoas recebem ajuda — e mais pontos você ganha!</p>
          </div>
          <div style={{ background: C.orange, color: "white", fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
            +400 pts · Missão Galera
          </div>
        </div>
      </div>
    );
  };

  // ── LAYOUT ───────────────────────────────────────────────────────────────
  return (
    <>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40 }} />
      )}
      <div style={{ minHeight: "100vh", background: C.cream, display: "flex" }}>
        {/* sidebar desktop */}
        <aside style={{ width: 220, flexShrink: 0, background: C.sidebar, display: "flex", flexDirection: "column", padding: "24px 0", position: "sticky", top: 0, height: "100vh" }} className="hidden-mobile">
          <SidebarContent />
        </aside>

        {/* sidebar mobile */}
        <aside style={{ position: "fixed", top: 0, left: 0, height: "100vh", width: 240, background: C.sidebar, display: "flex", flexDirection: "column", padding: "24px 0", zIndex: 50, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.25s ease" }}>
          <button onClick={() => setSidebarOpen(false)} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={Icons.close} size={16} color="#fff" />
          </button>
          <SidebarContent />
        </aside>

        <main style={{ flex: 1, padding: "24px 20px", overflowY: "auto", minWidth: 0 }}>
          {/* topbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} className="show-mobile">
              <Icon d={Icons.menu} size={18} color={C.ink} />
            </button>
            <div>
              <p style={{ fontSize: 11, letterSpacing: 3, color: C.gold, textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>
                {tabInfo.emoji ? `${tabInfo.emoji} ` : ""}Painel
              </p>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 700, color: C.ink, lineHeight: 1 }}>{tabInfo.label}</h1>
            </div>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "6px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
              <span style={{ fontSize: 12, color: C.muted }}>Mar 2026</span>
            </div>
          </div>

          {/* mobile tab pills */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }} className="show-mobile">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: tab === t.id ? C.dark : C.white, color: tab === t.id ? C.gold : C.muted, border: `1px solid ${tab === t.id ? C.dark : C.border}`, cursor: "pointer" }}>
                {t.emoji || ""}{t.label}
              </button>
            ))}
          </div>

          {tab === "dashboard"  && renderDashboard()}
          {tab === "ranking"    && renderRanking()}
          {tab === "qrcodes"    && renderQRCodes()}
          {tab === "homenagens" && renderHomenagens()}
          {tab === "missao"     && renderMissao()}
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
