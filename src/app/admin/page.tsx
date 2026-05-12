"use client";
import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { type Doador, type Missao, type Doacao } from "@/lib/data";
import {
  login as apiLogin, logout as apiLogout, isLoggedIn,
  getDoacoes, getRanking, getMissoes, getEventos, getEventoQRCodes,
  getDashboardResumo, getAdminInstituicoes, getGastos, postGasto, postInstituicao, putInstituicao, deleteInstituicao, gerarLinksInstituicao,
  type QREvento, type Evento, type DashboardResumo,
} from "@/lib/api";

// ── BRAND COLORS ─────────────────────────────────────────────────────────────
const C = {
  // brand
  blue:     "#000DFF",
  blueL:    "#e0e4ff",
  orange:   "#FF4E00",
  orangeL:  "#fff0eb",
  black:    "#000000",
  white:    "#FFFFFF",
  offWhite: "#f4f4f4",
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

const NIVEL_COLOR: Record<string, { cor: string; bg: string; glow: string; emoji: string; nome: string }> = {
  nice:     { cor: "#9ca3af", bg: "#f5f5f5",  glow: "#9ca3af55", emoji: "🩶", nome: "NICE"     },
  cool:     { cor: "#7dd3fc", bg: "#e0f2fe",  glow: "#7dd3fc55", emoji: "🩵", nome: "COOL"     },
  tough:    { cor: "#9ca3af", bg: "#f3f4f6",  glow: "#9ca3af55", emoji: "🤍", nome: "TOUGH"    },
  ruler:    { cor: "#22c55e", bg: "#f0fdf4",  glow: "#22c55e55", emoji: "💚", nome: "RULER"    },
  fstar:    { cor: "#e05c1a", bg: "#fff0eb",  glow: "#e05c1a55", emoji: "🔥", nome: "F★★"     },
  topnotch: { cor: "#4f9ef8", bg: "#eff6ff",  glow: "#4f9ef855", emoji: "💠", nome: "TOP-NOTCH"},
  goat:     { cor: "#d4a017", bg: "#fef9ec",  glow: "#d4a01755", emoji: "🐐", nome: "G.O.A.T" },
  killer:   { cor: "#0f0f0f", bg: "#f0f0f0",  glow: "#0f0f0f55", emoji: "👑", nome: "KILLER"  },
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
  receipt: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  settings:"M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
};

// ── QR helpers (lib local 'qrcode' — não depende mais de qrserver.com que
//    estava falhando por CORS/disponibilidade) ─────────────────────────────
function QRPreview({ url, size = 140 }: { url: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string>("");
  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: size * 2, errorCorrectionLevel: "M" })
      .then(setDataUrl).catch(() => setDataUrl(""));
  }, [url, size]);
  if (!dataUrl) return <div style={{ width: size, height: size, background: "#f4f4f4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#999" }}>gerando…</div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="QR" width={size} height={size} />;
}

/** Tipo mínimo para detectar lotes. Preferência: loteId (UUID gerado
 *  pelo backend a partir do POST /api/tags/gerar). Fallback: gap detection
 *  via createdAt+sequência (pra tags geradas antes do loteId existir). */
type TagLoteCalc = { id?: number; sequencia: number; campanha: string; createdAt?: string | Date; ano?: number; loteId?: string | null };

function calcularLotes<T extends TagLoteCalc>(todas: T[]): Map<number, { numero: number; total: number }> {
  const GAP_LOTE_MS = 60_000; // gap > 60s entre tags consecutivas → novo lote (fallback)
  const mapa = new Map<number, { numero: number; total: number }>();

  // === 1) Tags COM loteId — agrupamento exato ===
  const porLote = new Map<string, T[]>();
  const semLote: T[] = [];
  for (const t of todas) {
    if (t.loteId) {
      (porLote.get(t.loteId) ?? porLote.set(t.loteId, []).get(t.loteId)!).push(t);
    } else {
      semLote.push(t);
    }
  }
  for (const grupo of porLote.values()) {
    const ordenado = [...grupo].sort((a, b) => a.sequencia - b.sequencia);
    const total = ordenado.length;
    ordenado.forEach((t, idx) => {
      if (t.id !== undefined) mapa.set(t.id, { numero: idx + 1, total });
    });
  }

  // === 2) Tags SEM loteId (legado) — gap detection por campanha+ano ===
  const porGrupo = new Map<string, T[]>();
  for (const t of semLote) {
    const k = `${t.campanha}|${t.ano ?? ""}`;
    (porGrupo.get(k) ?? porGrupo.set(k, []).get(k)!).push(t);
  }
  for (const grupo of porGrupo.values()) {
    // Sort por createdAt; tags sem createdAt vão por sequencia
    grupo.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (ta !== tb) return ta - tb;
      return a.sequencia - b.sequencia;
    });
    // Detecção de lote por gap: percorre e quebra quando gap > 60s
    let loteAtual: T[] = [];
    const lotes: T[][] = [];
    let prevTs: number | null = null;
    for (const t of grupo) {
      const ts = t.createdAt ? new Date(t.createdAt).getTime() : null;
      if (prevTs !== null && ts !== null && (ts - prevTs) > GAP_LOTE_MS) {
        if (loteAtual.length) lotes.push(loteAtual);
        loteAtual = [];
      }
      loteAtual.push(t);
      prevTs = ts;
    }
    if (loteAtual.length) lotes.push(loteAtual);
    // Atribui numero/total a cada tag
    for (const lote of lotes) {
      const total = lote.length;
      // Dentro do lote, ordena por sequencia pra numerar 1..N
      const ordenado = [...lote].sort((a, b) => a.sequencia - b.sequencia);
      ordenado.forEach((t, idx) => {
        if (t.id !== undefined) mapa.set(t.id, { numero: idx + 1, total });
      });
    }
  }
  return mapa;
}

/** Calcula contador NNN/TOTAL real do lote ao qual a tag pertence. */
function loteInfoDe<T extends TagLoteCalc>(tag: T, todas: T[]): { contador: string; numero: number; total: number } {
  const info = (tag.id !== undefined ? calcularLotes(todas).get(tag.id) : undefined) ?? { numero: 1, total: 1 };
  const padLen = String(info.total).length;
  return {
    numero: info.numero,
    total: info.total,
    contador: `${String(info.numero).padStart(padLen, '0')}/${info.total}`,
  };
}

async function baixarQRComContador(serial: string, contador: string) {
  // Gera QR localmente como dataURL — não depende de internet/CDN externo
  const qrDataUrl = await QRCode.toDataURL(`https://humanitybearers.tech/doacao?tag=${encodeURIComponent(serial)}`, {
    margin: 1, width: 800, errorCorrectionLevel: "M",
  });
  const canvas = document.createElement("canvas");
  const padding = 30;
  const qrSize = 400;
  const textAreaH = 100;
  canvas.width = qrSize + padding * 2;
  canvas.height = qrSize + padding * 2 + textAreaH;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const img = new Image();
  img.src = qrDataUrl;
  await new Promise(res => { img.onload = res; img.onerror = res; });
  ctx.drawImage(img, padding, padding, qrSize, qrSize);
  // Contador NNN/TOTAL em destaque (laranja, grande)
  ctx.fillStyle = "#FF4E00";
  ctx.font = "bold 28px monospace";
  ctx.textAlign = "center";
  ctx.fillText(contador, canvas.width / 2, qrSize + padding + 36);
  // Serial em monospace
  ctx.fillStyle = "#111111";
  ctx.font = "bold 18px monospace";
  ctx.fillText(serial, canvas.width / 2, qrSize + padding + 64);
  // Tagline
  ctx.fillStyle = "#777777";
  ctx.font = "12px sans-serif";
  ctx.fillText("SCAN · CONNECT · IMPACT", canvas.width / 2, qrSize + padding + 86);
  // Download
  const a = document.createElement("a");
  const safeContador = contador.replace("/", "-of-");
  a.download = `${serial}_${safeContador}.png`;
  a.href = canvas.toDataURL("image/png");
  a.click();
}

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
  const nivel = NIVEL_COLOR[doador.nivel] ?? NIVEL_COLOR['nice'];
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

type Tab = "dashboard" | "ranking" | "homenagens" | "missao" | "prestacao" | "instituicoes" | "config" | "pedidos" | "tags";

const TABS: { id: Tab; label: string; icon: string; emoji?: string }[] = [
  { id: "dashboard",   label: "Dashboard",       icon: Icons.church, emoji: "🐻" },
  { id: "ranking",     label: "Ranking",          icon: Icons.trophy, emoji: "🐻" },
  { id: "tags",        label: "Tags",             icon: Icons.qr },
  { id: "homenagens",  label: "Homenagens",       icon: Icons.heart },
  { id: "missao",      label: "Missão",           icon: Icons.game },
  { id: "prestacao",   label: "Prestação",        icon: Icons.wallet },
  { id: "instituicoes",label: "Instituições",     icon: Icons.users },
  { id: "config",      label: "Configurações",    icon: Icons.settings },
  { id: "pedidos",     label: "Pedidos Patch",    icon: Icons.receipt, emoji: "🎖️" },
];

// ── LOGIN FORM ────────────────────────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erro, setErro]   = useState("");
  const [loading, setLoading] = useState(false);

  // Se chegou aqui via redirect de sessão expirada (?sessao=expirou),
  // mostra aviso amigável em vez de "Credenciais inválidas" enigmático.
  const [aviso, setAviso] = useState<string>("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("sessao") === "expirou") {
      setAviso("Sua sessão expirou. Faça login novamente.");
      // limpa o param da URL pra não persistir no F5
      window.history.replaceState({}, "", "/admin");
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !senha) { setErro("Preencha email e senha"); return; }
    setLoading(true); setErro("");
    try {
      await apiLogin(email, senha);
      onLogin();
    } catch (e: any) {
      setErro(e.message || "Credenciais inválidas");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.black }}>
      <div style={{ background: C.white, borderRadius: 24, padding: "40px 36px", width: "100%", maxWidth: 380, boxShadow: "0 40px 100px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <UrsinhoSVG size={64} />
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.ink, marginTop: 12 }}>Humanity Bearers Admin</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Acesso restrito à liderança</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
            style={{ border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, outline: "none" }} />
          <div style={{ position: "relative" }}>
            <input type={senhaVisivel ? "text" : "password"} value={senha} onChange={e => setSenha(e.target.value)} placeholder="Senha"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "12px 44px 12px 14px", fontSize: 13, outline: "none", width: "100%" }} />
            <button type="button" onClick={() => setSenhaVisivel(v => !v)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.muted, padding: 0, lineHeight: 1 }}>
              {senhaVisivel ? "🙈" : "👁️"}
            </button>
          </div>
          {aviso && (
            <div style={{ background: "#fff3cd", border: "1px solid #ffe69c", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#7a5d00", textAlign: "center" }}>
              ⚠️ {aviso}
            </div>
          )}
          {erro && <p style={{ fontSize: 12, color: C.orange, textAlign: "center" }}>{erro}</p>}
          <button onClick={handleLogin} disabled={loading}
            style={{ background: C.black, color: C.white, border: "none", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [tab, setTab]               = useState<Tab>("dashboard");
  const [filtro, setFiltro]         = useState("todas");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // dados carregados da API
  const [doacoes, setDoacoes]           = useState<Doacao[]>([]);
  const [ranking, setRanking]           = useState<Doador[]>([]);
  const [missoes, setMissoes]           = useState<Missao[]>([]);
  const [doadoresMissoes, setDoadoresMissoes] = useState<any[]>([]);
  const [eventos, setEventos]           = useState<Evento[]>([]);
  const [qrEventos, setQrEventos]       = useState<QREvento[]>([]);
  const [resumo, setResumo]             = useState<DashboardResumo | null>(null);
  const [loadingData, setLoadingData]   = useState(false);
  // gastos admin
  const [gastosInstId, setGastosInstId] = useState<number | null>(null);
  const [gastosLista, setGastosLista]   = useState<import("@/lib/data").Gasto[]>([]);
  const [gastosLoading, setGastosLoading] = useState(false);
  const [gastosInsts, setGastosInsts]   = useState<import("@/lib/data").Instituicao[]>([]);
  const [gastoForm, setGastoForm]       = useState({ desc: "", valor: "", data: new Date().toISOString().slice(0,10), comprovante: false });
  const [gastoSaving, setGastoSaving]   = useState(false);
  // instituicoes tab
  const TIPO_DEFAULTS = {
    Refeicao: { emoji: "🍽", cor: "#000DFF", bg: "#e0e4ff" },
    Banho:    { emoji: "🐾", cor: "#FF8C00", bg: "#fff3e0" },
    Cobertor: { emoji: "🌳", cor: "#22c55e", bg: "#f0fdf4" },
  };
  const instFormBlank = { nome: "", tipo: "Refeicao" as "Refeicao"|"Banho"|"Cobertor", valor: "", pixKey: "", emoji: "🍽", cor: "#000DFF", bg: "#e0e4ff", site: "" };
  const [instAdminList, setInstAdminList] = useState<import("@/lib/data").Instituicao[]>([]);
  const [instAdminForm, setInstAdminForm] = useState(instFormBlank);
  const [instAdminEditing, setInstAdminEditing] = useState<number | "new" | null>(null);
  const [instAdminSaving, setInstAdminSaving] = useState(false);
  const instEditFormRef = useRef<HTMLDivElement>(null);
  const [instLinkGerado, setInstLinkGerado]         = useState<Record<number, string>>({});
  const [instLinkGastosGerado, setInstLinkGastosGerado] = useState<Record<number, string>>({});
  const [instLinkCopiado, setInstLinkCopiado]       = useState<Record<number, boolean>>({});
  const [instLinkGastosCopiado, setInstLinkGastosCopiado] = useState<Record<number, boolean>>({});
  // prestacao tab
  const [prestInsts, setPrestInsts]     = useState<import("@/lib/data").Instituicao[]>([]);
  const [prestInstId, setPrestInstId]   = useState<number | null>(null);
  const [prestGastos, setPrestGastos]   = useState<import("@/lib/data").Gasto[]>([]);
  const [prestLoading, setPrestLoading] = useState(false);
  // config tab — configs globais do site
  const [siteConfig, setSiteConfig]   = useState<Record<string, string>>({});
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaved, setConfigSaved]   = useState(false);
  // voluntários DONOR
  const [voluntarios, setVoluntarios]         = useState<any[]>([]);
  const [buscarVoluntario, setBuscarVoluntario] = useState('');
  const [resultadosBusca, setResultadosBusca]  = useState<any[]>([]);
  const [buscandoVol, setBuscandoVol]          = useState(false);
  const [servicoVol, setServicoVol]            = useState('');
  const [salvandoVol, setSalvandoVol]          = useState<Record<number, boolean>>({});
  // pedidos de patch
  const [pedidos, setPedidos]               = useState<any[]>([]);
  const [pedidosLoading, setPedidosLoading] = useState(false);
  const [pedidosSaving, setPedidosSaving]   = useState<Record<number, boolean>>({});
  // tags GS-HB
  const [tags, setTags]                     = useState<any[]>([]);
  const [tagsLoading, setTagsLoading]       = useState(false);
  const [tagsFiltroCampanha, setTagsFiltroCampanha] = useState('');
  const [tagsFiltroStatus, setTagsFiltroStatus]     = useState('');
  const [gerarQtd, setGerarQtd]             = useState('10');
  const [gerarCampanha, setGerarCampanha]   = useState('D01');
  // Default = últimos 2 dígitos do ano atual (sai do hardcoded '25')
  const [gerarAno, setGerarAno]             = useState(String(new Date().getFullYear()).slice(-2));
  const [gerandoTags, setGerandoTags]       = useState(false);
  const [tagsGeradas, setTagsGeradas]       = useState<{ primeira: string; ultima: string; geradas: number } | null>(null);
  const [tagQrAberto, setTagQrAberto]       = useState<string | null>(null); // serial do QR aberto
  // missões — doador selecionado para ver progresso
  const [selectedDoadorIdMissao, setSelectedDoadorIdMissao] = useState<number | null>(null);
  // missões — form criação/edição
  const missaoFormBlank = { emoji: "🎯", titulo: "", descricao: "", pontos: "100" };
  const [missaoForm, setMissaoForm] = useState(missaoFormBlank);
  const [missaoFormOpen, setMissaoFormOpen] = useState(false);
  const [missaoEditId, setMissaoEditId] = useState<number | null>(null);
  const [missaoSaving, setMissaoSaving] = useState(false);

  useEffect(() => {
    setAutenticado(isLoggedIn());
  }, []);

  useEffect(() => {
    if (!autenticado) return;
    setLoadingData(true);
    Promise.all([
      getDoacoes({ limit: 50 }).then(r => setDoacoes(r.doacoes)).catch(() => {}),
      getRanking().then(setRanking).catch(() => {}),
      getMissoes().then(setMissoes).catch(() => {}),
      getEventos().then(async (evs) => {
        setEventos(evs);
        if (evs.length > 0) {
          const qrs = await getEventoQRCodes(evs[0].id).catch(() => []);
          setQrEventos(qrs);
        }
      }).catch(() => {}),
      getDashboardResumo().then(setResumo).catch(() => {}),
    ]).finally(() => setLoadingData(false));
  }, [autenticado]);

  // carregar instituições para aba gastos
  useEffect(() => {
    if (!autenticado) return;
    getAdminInstituicoes().then(insts => {
      setGastosInsts(insts);
      if (insts.length > 0 && !gastosInstId) setGastosInstId(insts[0].id);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autenticado]);

  // carregar instituições para aba instituicoes
  useEffect(() => {
    if (!autenticado || tab !== "instituicoes") return;
    getAdminInstituicoes().then(setInstAdminList);
  }, [autenticado, tab]);

  // scroll ao formulário de edição quando abre
  useEffect(() => {
    if (instAdminEditing !== null) {
      setTimeout(() => instEditFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, [instAdminEditing]);

  // carregar instituições para aba prestação
  useEffect(() => {
    if (!autenticado || tab !== "prestacao") return;
    getAdminInstituicoes().then(insts => {
      setPrestInsts(insts);
      if (insts.length > 0 && !prestInstId) setPrestInstId(insts[0].id);
    });
  }, [autenticado, tab]);

  useEffect(() => {
    if (!prestInstId) return;
    setPrestLoading(true);
    getGastos(prestInstId).then(setPrestGastos).finally(() => setPrestLoading(false));
  }, [prestInstId]);

  // carregar configs globais do site
  useEffect(() => {
    if (!autenticado || tab !== "config") return;
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
    const token = localStorage.getItem('admin_token');
    fetch(`${API}/api/admin/config`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } })
      .then(r => r.json())
      .then(d => setSiteConfig(d))
      .catch(() => {});
  }, [autenticado, tab]);

  useEffect(() => {
    if (!gastosInstId) return;
    setGastosLoading(true);
    getGastos(gastosInstId).then(setGastosLista).finally(() => setGastosLoading(false));
  }, [gastosInstId]);

  // carregar voluntários
  useEffect(() => {
    if (!autenticado || tab !== "ranking") return;
    const API2 = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
    const token = localStorage.getItem('admin_token');
    fetch(`${API2}/api/admin/ranking/voluntarios`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setVoluntarios(d) }).catch(() => {});
  }, [autenticado, tab]);

  // carregar pedidos de patch
  useEffect(() => {
    if (!autenticado || tab !== "pedidos") return;
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
    const token = localStorage.getItem('admin_token');
    setPedidosLoading(true);
    fetch(`${API}/api/pedidos`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setPedidos(d) }).catch(() => {})
      .finally(() => setPedidosLoading(false));
  }, [autenticado, tab]);

  // carregar doadores com missões (lazy — só quando aba missao é aberta)
  useEffect(() => {
    if (!autenticado || tab !== "missao") return;
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
    const token = localStorage.getItem('admin_token');
    setDoadoresMissoes([]);
    fetch(`${API}/api/admin/missoes/doadores`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } })
      .then(r => r.json())
      .then(d => {
        console.log('[missoes/doadores]', d);
        if (Array.isArray(d)) setDoadoresMissoes(d);
      })
      .catch(e => console.error('[missoes/doadores] erro:', e));
  }, [autenticado, tab]);

  // carregar tags
  useEffect(() => {
    if (!autenticado || tab !== "tags") return;
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
    const token = localStorage.getItem('admin_token');
    setTagsLoading(true);
    const params = new URLSearchParams();
    if (tagsFiltroCampanha) params.set('campanha', tagsFiltroCampanha);
    if (tagsFiltroStatus) params.set('status', tagsFiltroStatus);
    fetch(`${API}/api/tags?${params}`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setTags(d) }).catch(() => {})
      .finally(() => setTagsLoading(false));
  }, [autenticado, tab, tagsFiltroCampanha, tagsFiltroStatus]);

  if (!autenticado) return <LoginForm onLogin={() => setAutenticado(true)} />;

  const total     = resumo?.totalArrecadado ?? 0;
  const repassado = resumo?.totalRepassado  ?? 0;
  const pendente  = resumo?.totalPendente   ?? 0;
  const pessoas   = resumo?.pessoasAjudadas ?? 0;
  const filtradas = filtro === "todas" ? doacoes : doacoes.filter(d => d.instituicao?.nome === filtro);
  const instNomes = Array.from(new Set(doacoes.map(d => d.instituicao?.nome || "").filter(Boolean)));
  const donutData = (resumo?.doacoesPorInstituicao ?? []).map((inst, i) => ({
    label: inst.nome,
    value: inst.total,
    color: [C.green, C.blue, C.amber][i % 3],
  }));

  const SidebarContent = () => (
    <>
      <div style={{ padding: "0 16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <UrsinhoSVG size={40} />
          </div>
          <div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>Humanity Bearers</p>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>Painel Administrativo</p>
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
          {(resumo?.doacoesPorInstituicao ?? []).map((inst, idx) => {
            const pct = inst.percentual;
            const cor = [C.green, C.blue, C.amber][idx % 3];
            return <ProgressBar key={inst.instituicaoId} label={inst.nome} value={`R$ ${inst.total.toFixed(2)}`} pct={pct} color={cor} />;
          })}
          <div style={{ marginTop: 8, background: C.goldL, borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <p style={{ fontSize: 11, color: C.amber, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Próximo repasse</p>
              <p style={{ fontSize: 13, color: C.ink, marginTop: 2 }}>{resumo?.proximoRepasse ? new Date(resumo.proximoRepasse).toLocaleDateString("pt-BR") : "—"}</p>
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
                {["Doador","Instituição","Tipo","Valor","Data","Método","Status"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((d, i) => {
                const tipo = d.instituicao?.tipo || "";
                const tc = tipo === "Refeicao" ? { c: C.green, bg: C.greenL } : tipo === "Banho" ? { c: C.blue, bg: C.blueL } : { c: C.amber, bg: C.amberL };
                const isCartao = d.metodoPagamento === "cartao";
                const isPix    = d.metodoPagamento === "pix" || (!d.metodoPagamento && d.mpPaymentId);
                return (
                  <tr key={d.id} style={{ borderTop: `1px solid ${C.stone}`, background: i % 2 === 0 ? C.white : "rgba(250,247,242,0.5)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.dark + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: C.dark, flexShrink: 0 }}>
                          {(d.doadorNome || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: C.ink, whiteSpace: "nowrap" }}>{d.doadorNome}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.muted, whiteSpace: "nowrap" }}>{d.instituicao?.nome || "—"}</td>
                    <td style={{ padding: "12px 16px" }}><Badge color={tc.c} bg={tc.bg}>{d.instituicao?.tipo || "—"}</Badge></td>
                    <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 14, fontWeight: 700, color: C.green, fontFamily: "'Playfair Display',serif", whiteSpace: "nowrap" }}>R$ {d.valorTotal}</span></td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.muted, whiteSpace: "nowrap" }}>{new Date(d.dataCriacao).toLocaleDateString("pt-BR")}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {isCartao
                        ? <Badge color="#7c3aed" bg="#f3e8ff">💳 Cartão</Badge>
                        : isPix
                          ? <Badge color="#0284c7" bg="#e0f2fe">🪙 PIX</Badge>
                          : <span style={{ fontSize: 12, color: C.muted }}>—</span>
                      }
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        {(d as any).cancelado
                          ? <Badge color="#9ca3af" bg="#f3f4f6">Cancelado</Badge>
                          : d.pago
                            ? <><Icon d={Icons.check} size={13} color={C.green} /><Badge color={C.green} bg={C.greenL}>Confirmado</Badge></>
                            : <Badge color={C.amber} bg={C.amberL}>Pendente</Badge>
                        }
                      </div>
                    </td>
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
            { label: "Doadores",   value: ranking.length,                                          color: C.gold   },
            { label: "Top pontos", value: ranking[0]?.pontos.toLocaleString("pt-BR") ?? "0",  color: C.orange },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center", background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "12px 20px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Playfair Display',serif" }}>{stat.value}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(Object.entries(NIVEL_COLOR) as [string, { cor: string; bg: string; glow: string; emoji: string; nome: string }][]).map(([nivel, { cor, bg, emoji, nome }]) => (
          <span key={nivel} style={{ background: bg, color: cor, fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 99, border: `1px solid ${cor}33` }}>
            {emoji} {nome}
          </span>
        ))}
      </div>
      {ranking.length === 0 && !loadingData && <p style={{ textAlign: "center", color: C.muted, padding: "40px 0" }}>Nenhum doador no ranking ainda.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ranking.map((doador, i) => <RankingCard key={doador.id} doador={doador} posicao={i + 1} />)}
      </div>
      {/* ── VOLUNTÁRIOS DONOR ── */}
      {(() => {
        const API2 = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
        const tok  = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';

        async function buscarDoador() {
          if (!buscarVoluntario.trim()) return;
          setBuscandoVol(true);
          try {
            const r = await fetch(`${API2}/api/missoes/buscar?q=${encodeURIComponent(buscarVoluntario.trim())}`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
            const d = await r.json();
            setResultadosBusca(Array.isArray(d) ? d : []);
          } catch { setResultadosBusca([]); } finally { setBuscandoVol(false); }
        }

        async function designarVoluntario(doadorId: number, ativo: boolean) {
          setSalvandoVol(s => ({ ...s, [doadorId]: true }));
          try {
            await fetch(`${API2}/api/admin/ranking/${doadorId}/voluntario`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tok}`, 'ngrok-skip-browser-warning': 'true' },
              body: JSON.stringify({ isVoluntario: ativo, servicoVoluntario: ativo ? servicoVol : null }),
            });
            // recarregar lista
            const r2 = await fetch(`${API2}/api/admin/ranking/voluntarios`, { headers: { 'Authorization': `Bearer ${tok}`, 'ngrok-skip-browser-warning': 'true' } });
            setVoluntarios(await r2.json());
            setResultadosBusca([]);
            setBuscarVoluntario('');
            setServicoVol('');
          } catch { alert('Erro.'); } finally { setSalvandoVol(s => ({ ...s, [doadorId]: false })); }
        }

        return (
          <div style={{ background: 'linear-gradient(135deg,#4a1a7a,#6b2fa0)', borderRadius: 18, padding: '20px 24px', border: '1px solid rgba(168,85,247,0.3)' }}>
            <p style={{ fontSize: 11, color: '#c084fc', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Insígnia Especial</p>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>🎖️ Voluntários DONOR</h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>O DONOR é concedido pelo admin a quem colabora com serviço voluntário — não por doações financeiras.</p>

            {/* lista atual */}
            {voluntarios.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {voluntarios.map((v: any) => (
                  <div key={v.id} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{v.avatar}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{v.nome}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0 }}>{v.servicoVoluntario || 'Voluntário'} · {v.email}</p>
                    </div>
                    <button
                      onClick={() => designarVoluntario(v.id, false)}
                      disabled={salvandoVol[v.id]}
                      style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: '#fca5a5', cursor: 'pointer' }}>
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
            {voluntarios.length === 0 && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>Nenhum voluntário designado ainda.</p>}

            {/* adicionar voluntário */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 14 }}>
              <p style={{ fontSize: 11, color: '#c084fc', fontWeight: 700, marginBottom: 8 }}>+ Designar novo voluntário</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  value={buscarVoluntario}
                  onChange={e => setBuscarVoluntario(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && buscarDoador()}
                  placeholder="Buscar por nome, email ou telefone..."
                  style={{ flex: 1, border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '9px 13px', fontSize: 13, background: 'rgba(255,255,255,0.08)', color: '#fff', outline: 'none' }}
                />
                <button onClick={buscarDoador} disabled={buscandoVol}
                  style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {buscandoVol ? '...' : 'Buscar'}
                </button>
              </div>
              <input
                value={servicoVol}
                onChange={e => setServicoVol(e.target.value)}
                placeholder="Descreva o serviço voluntário (ex: apoio audiovisual)"
                style={{ width: '100%', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '9px 13px', fontSize: 13, background: 'rgba(255,255,255,0.08)', color: '#fff', outline: 'none', boxSizing: 'border-box', marginBottom: resultadosBusca.length > 0 ? 10 : 0 }}
              />
              {resultadosBusca.map((d: any) => (
                <div key={d.id} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{d.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>{d.nome}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{d.email} · {d.totalDoacoes} doações</p>
                  </div>
                  <button
                    onClick={() => designarVoluntario(d.id, true)}
                    disabled={salvandoVol[d.id]}
                    style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {salvandoVol[d.id] ? '...' : 'Designar DONOR'}
                  </button>
                </div>
              ))}
              {resultadosBusca.length === 0 && buscarVoluntario && !buscandoVol && (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>Nenhum doador encontrado.</p>
              )}
            </div>
          </div>
        );
      })()}

      <div style={{ background: C.goldL, borderRadius: 16, padding: "16px 20px", border: `1px solid ${C.gold}28` }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.amber, marginBottom: 8 }}>📋 Como funciona a pontuação?</p>
        {["R$ 1 doado = 10 pontos base", "Missões concluídas garantem pontos bônus", "Níveis por doações: NICE (20+) · COOL (50+) · TOUGH (100+) · RULER (200+) · F★★ (500+) · TOP-NOTCH (1000+) · G.O.A.T (2000+) · KILLER (5000+)", "Top 3 recebem homenagem especial no ranking público!"].map((r, i) => (
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
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, margin: 0 }}>Códigos para o Evento</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Exiba no telão ou imprima para distribuir no evento</p>
        </div>
      </div>
      {qrEventos.length === 0 && !loadingData && (
        <div style={{ textAlign: "center", color: C.muted, padding: "40px 0" }}>
          <p style={{ fontSize: 14, marginBottom: 8 }}>Nenhum QR Code gerado ainda.</p>
          <p style={{ fontSize: 12 }}>Crie um evento no painel para gerar QR Codes automaticamente.</p>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
        {qrEventos.map((qr, i) => {
          const inst = qr.instituicao;
          const cor  = inst?.tipo === "Refeicao" ? C.green : inst?.tipo === "Banho" ? C.blue : C.amber;
          const bg   = inst?.tipo === "Refeicao" ? C.greenL : inst?.tipo === "Banho" ? C.blueL : C.amberL;
          const evento = eventos.find(e => e.id === qr.eventoId);
          return (
            <div key={i} style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 4px 16px rgba(28,26,22,0.07)" }}>
              <div style={{ background: `linear-gradient(90deg, ${cor}18, ${cor}28)`, borderBottom: `1px solid ${cor}22`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{inst?.emoji ?? "🏛️"}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: cor }}>{inst?.nome ?? "Instituição"}</p>
                  <p style={{ fontSize: 10, color: C.muted }}>{evento?.nome ?? "Evento"} · {evento ? new Date(evento.dataEvento).toLocaleDateString("pt-BR") : ""}</p>
                </div>
              </div>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ padding: 12, background: "#fafafa", borderRadius: 12, border: `1px solid ${C.border}` }}>
                  {/* QR real do banco ou visual fallback */}
                  {qr.qrCodeBase64 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qr.qrCodeBase64} alt="QR Code" width={110} height={110} style={{ borderRadius: 4 }} />
                  ) : (
                    <QRCodeVisual value={qr.urlDoacao} size={110} color={cor} />
                  )}
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: cor, fontFamily: "'Playfair Display',serif" }}>R$ {qr.valor}</p>
                  <p style={{ fontSize: 11, color: C.muted }}>por pessoa</p>
                </div>
                <div style={{ background: bg, borderRadius: 10, padding: "8px 14px", width: "100%", textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: cor, fontWeight: 600, letterSpacing: 0.5, marginBottom: 2 }}>URL DO QR</p>
                  <p style={{ fontSize: 10, color: cor, wordBreak: "break-all", lineHeight: 1.4 }}>{qr.urlDoacao}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ background: C.goldL, borderRadius: 14, padding: "14px 18px", border: `1px solid ${C.gold}28`, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <p style={{ fontSize: 12, color: C.amber, lineHeight: 1.7 }}>
          <strong>Dica:</strong> Use Ctrl+P para imprimir esta página e distribuir os QR Codes nos pontos de doação. Cada código direciona direto para a chave Pix da instituição!
        </p>
      </div>
    </div>
  );

  // ── HOMENAGENS ───────────────────────────────────────────────────────────
  const renderHomenagens = () => {
    const todos = ranking;

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

        {/* ── HEADER HOMENAGENS ── */}
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
              Essas conquistas ficam expostas publicamente para todos verem! 🏆
            </p>
            {/* linha giz decorativa */}
            <div style={{ marginTop: 16, height: 2, background: "rgba(245,240,224,0.18)", borderRadius: 1 }}/>
            <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Ranking visível aos doadores", "Atualizado a cada evento", "Reconhecimento público"].map((tag, i) => (
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

        {/* ── LISTA COMPLETA RANKING ── */}
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
            Entregues pessoalmente pela equipe ao fim do evento — reconhecimento real para quem faz a diferença!
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 12 }}>
            {[
              { icon: "🎤", titulo: "Fala no Evento",     desc: "Top 1 compartilha sua motivação", cor: "#FF4E00", quem: "1º lugar" },
              { icon: "📜", titulo: "Diploma de Papel",  desc: "Certificado impresso pela equipe", cor: "#cd7f32", quem: "Top 3" },
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
    const API2 = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';

    const toggleDestaque = async (missao: Missao & { destaque?: boolean; periodoDestaque?: string }, periodo: string) => {
      const jaAtivo = (missao as any).destaque && (missao as any).periodoDestaque === periodo;
      await fetch(`${API2}/api/admin/missoes/${missao.id}/destaque`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ destaque: !jaAtivo, periodoDestaque: periodo }),
      });
      getMissoes().then(setMissoes).catch(() => {});
    };

    const abrirEditar = (missao: Missao) => {
      setMissaoForm({ emoji: missao.emoji, titulo: missao.titulo, descricao: missao.descricao, pontos: String(missao.pontos) });
      setMissaoEditId(missao.id);
      setMissaoFormOpen(true);
    };

    const fecharForm = () => {
      setMissaoFormOpen(false);
      setMissaoEditId(null);
      setMissaoForm(missaoFormBlank);
    };

    const salvarMissao = async () => {
      if (!missaoForm.titulo.trim() || !missaoForm.descricao.trim() || !missaoForm.pontos) return;
      setMissaoSaving(true);
      try {
        const body = {
          titulo: missaoForm.titulo.trim(),
          descricao: missaoForm.descricao.trim(),
          pontos: Number(missaoForm.pontos),
          emoji: missaoForm.emoji,
          tipo: 'CUSTOM',
        };
        if (missaoEditId !== null) {
          await fetch(`${API2}/api/admin/missoes/${missaoEditId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body),
          });
        } else {
          await fetch(`${API2}/api/admin/missoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body),
          });
        }
        await getMissoes().then(setMissoes);
        fecharForm();
      } catch { alert('Erro ao salvar missão.'); }
      finally { setMissaoSaving(false); }
    };

    const desativarMissao = async (id: number) => {
      if (!confirm('Desativar essa missão? Ela não aparecerá mais para os doadores.')) return;
      await fetch(`${API2}/api/admin/missoes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      getMissoes().then(setMissoes).catch(() => {});
    };

    const EMOJIS_SUGERIDOS = ['🎯','🏆','❤️','🤝','🌟','🚀','💪','🎁','🔥','👏','🌈','🦁','🐻','✅','🎖️','🙏','🌍','💡'];

    const maxPontos = missoes.reduce((s: number, m: Missao) => s + m.pontos, 0);
    const selectedDoador = selectedDoadorIdMissao !== null ? doadoresMissoes.find((d: any) => d.id === selectedDoadorIdMissao) : null;
    const totalPontos = selectedDoador
      ? (selectedDoador.missoesCompletas ?? []).reduce((s: number, m: any) => s + (m.pontos ?? 0), 0)
      : 0;
    const pct = maxPontos > 0 ? Math.round((totalPontos / maxPontos) * 100) : 0;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: "linear-gradient(135deg, #0e0e0e, #1a1a1a)", borderRadius: 22, padding: "28px", position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
          <div style={{ position: "absolute", right: -30, bottom: -30, opacity: 0.07 }}><UrsinhoSVG size={220} /></div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            <UrsinhoSVG size={80} />
            <div style={{ flex: 1, minWidth: 200, position: "relative", zIndex: 1 }}>
              <p style={{ fontSize: 10, color: C.orange, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>🎮 GAME MODE</p>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(20px,3.5vw,30px)", fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>Missão do Ursinho</h2>
              {selectedDoador
                ? <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>Progresso de <span style={{ color: C.orange, fontWeight: 700 }}>{selectedDoador.nome}</span></p>
                : <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>Clique em um doador abaixo para ver seu progresso</p>
              }
              <div style={{ marginTop: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Progresso das Missões</p>
                  <p style={{ fontSize: 11, color: C.gold, fontWeight: 600 }}>{totalPontos} / {maxPontos} pts</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 10, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.orange}, ${C.gold})`, height: "100%", borderRadius: 99, transition: "width 0.8s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{pct}% completo</p>
                  {selectedDoador && (
                    <button onClick={() => setSelectedDoadorIdMissao(null)}
                      style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                      ✕ limpar seleção
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ── FORMULÁRIO NOVA / EDITAR MISSÃO ── */}
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: missaoFormOpen ? `1px solid ${C.border}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>
              {missaoFormOpen ? (missaoEditId ? "✏️ Editar missão" : "➕ Nova missão") : "🎮 Missões personalizadas"}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {missaoFormOpen && (
                <button onClick={fecharForm}
                  style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.offWhite, color: C.muted, cursor: "pointer", fontWeight: 600 }}>
                  Cancelar
                </button>
              )}
              <button onClick={() => { if (missaoFormOpen && !missaoEditId) fecharForm(); else { setMissaoEditId(null); setMissaoForm(missaoFormBlank); setMissaoFormOpen(true); } }}
                style={{ fontSize: 12, padding: "6px 16px", borderRadius: 8, border: "none", background: missaoFormOpen && !missaoEditId ? C.muted : C.black, color: C.white, cursor: "pointer", fontWeight: 700 }}>
                {missaoFormOpen && !missaoEditId ? "✕ Fechar" : "+ Nova missão"}
              </button>
            </div>
          </div>
          {missaoFormOpen && (
            <div style={{ padding: "20px" }}>
              {/* emoji picker */}
              <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Emoji</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                {EMOJIS_SUGERIDOS.map(e => (
                  <button key={e} onClick={() => setMissaoForm(f => ({ ...f, emoji: e }))}
                    style={{ width: 36, height: 36, fontSize: 20, borderRadius: 8, border: `2px solid ${missaoForm.emoji === e ? C.orange : C.border}`, background: missaoForm.emoji === e ? C.orangeL : C.offWhite, cursor: "pointer" }}>
                    {e}
                  </button>
                ))}
                <input value={missaoForm.emoji} onChange={e => setMissaoForm(f => ({ ...f, emoji: e.target.value }))}
                  maxLength={2} placeholder="✍️"
                  style={{ width: 36, height: 36, fontSize: 18, textAlign: "center", border: `1px solid ${C.border}`, borderRadius: 8, outline: "none" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10, marginBottom: 10 }}>
                <input placeholder="Título da missão *" value={missaoForm.titulo}
                  onChange={e => setMissaoForm(f => ({ ...f, titulo: e.target.value }))}
                  style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none" }} />
                <div style={{ position: "relative" }}>
                  <input type="number" min="10" max="9999" placeholder="Pontos *" value={missaoForm.pontos}
                    onChange={e => setMissaoForm(f => ({ ...f, pontos: e.target.value }))}
                    style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: C.muted, pointerEvents: "none" }}>pts</span>
                </div>
              </div>
              <textarea placeholder="Descrição da missão *" value={missaoForm.descricao}
                onChange={e => setMissaoForm(f => ({ ...f, descricao: e.target.value }))}
                rows={2}
                style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 14, fontFamily: "inherit" }} />
              {/* preview */}
              {missaoForm.titulo && (
                <div style={{ background: C.stone, borderRadius: 12, padding: "12px 14px", display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                  <span style={{ fontSize: 24 }}>{missaoForm.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{missaoForm.titulo}</p>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: C.goldL, color: C.amber }}>+{missaoForm.pontos || 0} pts</span>
                    </div>
                    {missaoForm.descricao && <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{missaoForm.descricao}</p>}
                  </div>
                </div>
              )}
              <button onClick={salvarMissao}
                disabled={missaoSaving || !missaoForm.titulo.trim() || !missaoForm.descricao.trim() || !missaoForm.pontos}
                style={{ background: C.black, color: C.white, border: "none", borderRadius: 10, padding: "11px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: (!missaoForm.titulo.trim() || !missaoForm.descricao.trim() || !missaoForm.pontos) ? 0.4 : 1 }}>
                {missaoSaving ? "Salvando..." : missaoEditId ? "Salvar alterações" : "Criar missão"}
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
          {missoes.map((missao: Missao) => {
            const m = missao as any;
            const isSemana = m.destaque && m.periodoDestaque === 'semana';
            const isMes = m.destaque && m.periodoDestaque === 'mes';
            return (
            <div key={missao.id} style={{ background: C.white, borderRadius: 16, border: `1px solid ${(isSemana || isMes) ? C.orange : C.border}`, padding: "16px 18px", boxShadow: (isSemana || isMes) ? `0 2px 12px ${C.orange}22` : "0 1px 6px rgba(28,26,22,0.04)", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: C.stone, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {missao.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{missao.titulo}</p>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: C.goldL, color: C.amber }}>+{missao.pontos} pts</span>
                  </div>
                  <p style={{ fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{missao.descricao}</p>
                  {(m.totalCompletas ?? 0) > 0 && (
                    <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>✅ {m.totalCompletas} conclusões</p>
                  )}
                </div>
              </div>
              {/* destaque buttons */}
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => toggleDestaque(missao as any, 'semana')}
                  style={{ flex: 1, fontSize: 11, fontWeight: 600, padding: "5px 8px", borderRadius: 8, cursor: "pointer", border: `1.5px solid ${isSemana ? C.orange : C.border}`, background: isSemana ? C.orangeL : C.offWhite, color: isSemana ? C.orange : C.muted, transition: "all 0.15s" }}>
                  📌 {isSemana ? '✓ Semana' : 'Destaque Semana'}
                </button>
                <button onClick={() => toggleDestaque(missao as any, 'mes')}
                  style={{ flex: 1, fontSize: 11, fontWeight: 600, padding: "5px 8px", borderRadius: 8, cursor: "pointer", border: `1.5px solid ${isMes ? C.orange : C.border}`, background: isMes ? C.orangeL : C.offWhite, color: isMes ? C.orange : C.muted, transition: "all 0.15s" }}>
                  📌 {isMes ? '✓ Mês' : 'Destaque Mês'}
                </button>
              </div>
              {/* editar / desativar */}
              <div style={{ display: "flex", gap: 6, borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 2 }}>
                <button onClick={() => abrirEditar(missao)}
                  style={{ flex: 1, fontSize: 11, fontWeight: 600, padding: "5px 8px", borderRadius: 8, cursor: "pointer", border: `1px solid ${C.border}`, background: C.offWhite, color: C.ink }}>
                  ✏️ Editar
                </button>
                <button onClick={() => desativarMissao(missao.id)}
                  style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 8, cursor: "pointer", border: "1px solid #fecaca", background: "#fff5f5", color: "#ef4444" }}>
                  🗑
                </button>
              </div>
            </div>
            );
          })}
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

        {/* tabela de doadores com missões */}
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          {(() => {
            const comMissoes = doadoresMissoes.filter((d: any) => d.missoesCompletas?.length > 0);
            return (<>
          <div style={{ padding: "18px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>👥 Doadores com Missões</p>
            <span style={{ fontSize: 12, color: C.muted }}>{comMissoes.length} doadores</span>
          </div>
          {comMissoes.length === 0
            ? <p style={{ textAlign: "center", color: C.muted, padding: "32px 0", fontSize: 13 }}>Nenhum doador com missões concluídas ainda.</p>
            : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.stone }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: C.muted, fontSize: 11 }}>NOME</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: C.muted, fontSize: 11 }}>NÚMERO</th>
                    <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 600, color: C.muted, fontSize: 11 }}>NÍVEL</th>
                    <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 600, color: C.muted, fontSize: 11 }}>PONTOS</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: C.muted, fontSize: 11 }}>MISSÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {comMissoes.map((d: any) => {
                    const isSelected = selectedDoadorIdMissao === d.id;
                    return (
                    <tr key={d.id} onClick={() => setSelectedDoadorIdMissao(isSelected ? null : d.id)}
                      style={{ borderTop: `1px solid ${C.border}`, cursor: "pointer", background: isSelected ? C.orangeL : "transparent", transition: "background 0.15s" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: isSelected ? C.orange : C.ink }}>{d.nome}{isSelected && <span style={{ marginLeft: 6, fontSize: 10, color: C.orange }}>◀ selecionado</span>}</td>
                      <td style={{ padding: "12px 16px", color: C.muted, fontFamily: "monospace", fontSize: 12 }}>#{d.numero}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 99, background: C.stone, textTransform: "capitalize", fontWeight: 600 }}>{d.nivel}</span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: C.amber }}>{d.pontos}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {d.missoesCompletas.map((m: any, i: number) => (
                            <span key={i} title={m.titulo} style={{ fontSize: 18 }}>{m.emoji}</span>
                          ))}
                          {d.missoesCompletas.length === 0 && <span style={{ color: C.muted, fontSize: 12 }}>Nenhuma</span>}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
          }
          </>); })()}
        </div>
      </div>
    );
  };

  // ── GASTOS ───────────────────────────────────────────────────────────────
  const renderGastos = () => {
    const instSel = gastosInsts.find(i => i.id === gastosInstId);
    const totalGasto = gastosLista.reduce((s, g) => s + g.valor, 0);

    const handleSalvarGasto = async () => {
      if (!gastoForm.desc || !gastoForm.valor || !gastosInstId) return;
      setGastoSaving(true);
      try {
        const salvo = await postGasto({
          instituicaoId: gastosInstId,
          desc: gastoForm.desc,
          valor: parseFloat(gastoForm.valor),
          data: new Date(gastoForm.data).toISOString(),
          comprovante: gastoForm.comprovante,
        });
        setGastosLista(prev => [salvo, ...prev]);
        setGastoForm({ desc: "", valor: "", data: new Date().toISOString().slice(0,10), comprovante: false });
      } catch { alert("Erro ao salvar gasto."); }
      finally { setGastoSaving(false); }
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* header */}
        <div style={{ background: C.black, borderRadius: 18, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 48, height: 48, background: "rgba(255,255,255,0.08)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={Icons.receipt} size={22} color={C.gold} />
          </div>
          <div>
            <p style={{ fontSize: 11, color: C.gold, letterSpacing: 3, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Prestação de Contas</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.white, margin: 0 }}>Registro de Gastos</h2>
          </div>
        </div>

        {/* seletor de instituição */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "18px 20px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Instituição</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {gastosInsts.map(inst => (
              <button key={inst.id} onClick={() => setGastosInstId(inst.id)}
                style={{ padding: "8px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `2px solid ${gastosInstId === inst.id ? C.blue : C.border}`, background: gastosInstId === inst.id ? C.blueL : C.offWhite, color: gastosInstId === inst.id ? C.blue : C.muted, transition: "all 0.15s" }}>
                {inst.emoji} {inst.nome}
              </button>
            ))}
          </div>
        </div>

        {/* formulário */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "20px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 16 }}>Novo registro de gasto</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginBottom: 12 }}>
            <input placeholder="Descrição do gasto" value={gastoForm.desc}
              onChange={e => setGastoForm(f => ({ ...f, desc: e.target.value }))}
              style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", gridColumn: "1/-1" }} />
            <input type="number" placeholder="R$ Valor" value={gastoForm.valor}
              onChange={e => setGastoForm(f => ({ ...f, valor: e.target.value }))}
              style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none" }} />
            <input type="date" value={gastoForm.data}
              onChange={e => setGastoForm(f => ({ ...f, data: e.target.value }))}
              style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none" }} />
          </div>
          <button onClick={() => setGastoForm(f => ({ ...f, comprovante: !f.comprovante }))}
            style={{ display: "flex", alignItems: "center", gap: 8, background: gastoForm.comprovante ? C.greenL : C.offWhite, border: `1px solid ${gastoForm.comprovante ? C.green : C.border}`, borderRadius: 10, padding: "8px 14px", cursor: "pointer", marginBottom: 14, fontSize: 13, color: gastoForm.comprovante ? C.green : C.muted }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${gastoForm.comprovante ? C.green : C.border}`, background: gastoForm.comprovante ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {gastoForm.comprovante && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
            </div>
            Tem comprovante fiscal
          </button>
          <button onClick={handleSalvarGasto} disabled={gastoSaving || !gastoForm.desc || !gastoForm.valor}
            style={{ background: C.black, color: C.white, border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: !gastoForm.desc || !gastoForm.valor ? 0.4 : 1 }}>
            {gastoSaving ? "Salvando..." : "Salvar gasto"}
          </button>
        </div>

        {/* lista */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{instSel?.nome ?? "Instituição"} — Histórico</p>
              <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{gastosLista.length} registros · Total: R$ {totalGasto.toFixed(2)}</p>
            </div>
          </div>
          {gastosLoading && <p style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: "20px 0" }}>Carregando...</p>}
          {!gastosLoading && gastosLista.length === 0 && (
            <p style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: "30px 0" }}>Nenhum gasto registrado para esta instituição.</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {gastosLista.map((g, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: C.offWhite, borderRadius: 12, gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{g.desc}</p>
                  <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                    {new Date(g.data).toLocaleDateString("pt-BR")} ·{" "}
                    {g.comprovante
                      ? <span style={{ color: C.green, fontWeight: 600 }}>✓ Com comprovante</span>
                      : <span style={{ color: C.amber }}>Sem comprovante</span>}
                  </p>
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#A32D2D", fontFamily: "'Playfair Display',serif", whiteSpace: "nowrap" }}>− R$ {g.valor.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── INSTITUIÇÕES CRUD ────────────────────────────────────────────────────
  const renderInstituicoes = () => {
    const isNew = instAdminEditing === "new";
    const editInst = typeof instAdminEditing === "number"
      ? instAdminList.find(i => i.id === instAdminEditing) ?? null
      : null;

    const handleOpenNew = () => {
      setInstAdminForm(instFormBlank);
      setInstAdminEditing("new");
    };
    const handleOpenEdit = (inst: import("@/lib/data").Instituicao) => {
      setInstAdminForm({ nome: inst.nome, tipo: inst.tipo, valor: String(inst.valor), pixKey: inst.pixKey, emoji: inst.emoji, cor: inst.cor, bg: inst.bg, site: inst.site || "" });
      setInstAdminEditing(inst.id);
    };
    const handleTipoChange = (tipo: "Refeicao"|"Banho"|"Cobertor") => {
      const d = TIPO_DEFAULTS[tipo];
      setInstAdminForm(f => ({ ...f, tipo, emoji: d.emoji, cor: d.cor, bg: d.bg }));
    };
    const handleSalvar = async () => {
      if (!instAdminForm.nome || !instAdminForm.pixKey || !instAdminForm.valor) return;
      setInstAdminSaving(true);
      try {
        const body = { nome: instAdminForm.nome, tipo: instAdminForm.tipo, valor: parseFloat(instAdminForm.valor), pixKey: instAdminForm.pixKey, emoji: instAdminForm.emoji, cor: instAdminForm.cor, bg: instAdminForm.bg, site: instAdminForm.site.trim() || null };
        if (isNew) {
          const nova = await postInstituicao(body);
          setInstAdminList(l => [...l, nova]);
        } else if (typeof instAdminEditing === "number") {
          const atualizada = await putInstituicao(instAdminEditing, body);
          setInstAdminList(l => l.map(i => i.id === instAdminEditing ? atualizada : i));
        }
        setInstAdminEditing(null);
      } catch { alert("Erro ao salvar instituição."); }
      finally { setInstAdminSaving(false); }
    };
    const handleToggleAtivo = async (inst: import("@/lib/data").Instituicao) => {
      try {
        const atualizada = await putInstituicao(inst.id, { ativo: !inst.ativo });
        setInstAdminList(l => l.map(i => i.id === inst.id ? atualizada : i));
      } catch { alert("Erro ao atualizar status."); }
    };
    const handleToggleHomologada = async (inst: import("@/lib/data").Instituicao) => {
      try {
        const atualizada = await putInstituicao(inst.id, { homologada: !inst.homologada });
        setInstAdminList(l => l.map(i => i.id === inst.id ? atualizada : i));
      } catch { alert("Erro ao atualizar homologação."); }
    };
    // Links sempre apontam pro domínio público — evita IP:porta no link.
    const baseUrl = "https://humanitybearers.tech";
    const getLinkMp     = (inst: import("@/lib/data").Instituicao) => inst.mpSetupToken ? `${baseUrl}/configurar-mp?token=${inst.mpSetupToken}` : null;
    const getLinkGastos = (inst: import("@/lib/data").Instituicao) => inst.gastosToken  ? `${baseUrl}/gastos-instituicao?token=${inst.gastosToken}` : null;

    const handleGerarLink = async (inst: import("@/lib/data").Instituicao) => {
      try {
        const { linkMp, linkGastos } = await gerarLinksInstituicao(inst.id);
        // Extrai os novos tokens das URLs e atualiza a lista local
        const novoMpToken     = new URL(linkMp).searchParams.get("token");
        const novoGastosToken = new URL(linkGastos).searchParams.get("token");
        setInstAdminList(l => l.map(i => i.id === inst.id
          ? { ...i, mpSetupToken: novoMpToken, gastosToken: novoGastosToken }
          : i
        ));
      } catch { alert("Erro ao regenerar links. Verifique se o backend está rodando."); }
    };
    const handleCopiarLink = (instId: number, link: string) => {
      navigator.clipboard.writeText(link);
      setInstLinkCopiado(m => ({ ...m, [instId]: true }));
      setTimeout(() => setInstLinkCopiado(m => ({ ...m, [instId]: false })), 2000);
    };
    const handleCopiarLinkGastos = (instId: number, link: string) => {
      navigator.clipboard.writeText(link);
      setInstLinkGastosCopiado(m => ({ ...m, [instId]: true }));
      setTimeout(() => setInstLinkGastosCopiado(m => ({ ...m, [instId]: false })), 2000);
    };
    const handleDeletarInstituicao = async (inst: import("@/lib/data").Instituicao) => {
      if (!confirm(`Tem certeza que deseja apagar "${inst.nome}"? Esta ação não pode ser desfeita.`)) return;
      try {
        await deleteInstituicao(inst.id);
        setInstAdminList(l => l.filter(i => i.id !== inst.id));
      } catch { alert("Erro ao apagar instituição."); }
    };

    const renderForm = () => (
      <div ref={instEditFormRef} style={{ background: C.white, borderRadius: 18, border: `2px solid ${C.blue}`, padding: "24px" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 20 }}>
          {isNew ? "➕ Nova instituição" : `✏️ Editar — ${editInst?.nome}`}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 16 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Nome da instituição *</label>
            <input value={instAdminForm.nome} onChange={e => setInstAdminForm(f => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Sopão do Amor" style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Tipo *</label>
            <select value={instAdminForm.tipo} onChange={e => handleTipoChange(e.target.value as any)}
              style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", background: C.white, cursor: "pointer" }}>
              <option value="Refeicao">🍽 Pessoas (Refeição + Banho)</option>
              <option value="Banho">🐾 Animais (Cão e Gato)</option>
              <option value="Cobertor">🌳 Árvores (Regeneração)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Valor por pessoa (R$) *</label>
            <input type="number" min="0" step="0.50" value={instAdminForm.valor}
              onChange={e => setInstAdminForm(f => ({ ...f, valor: e.target.value }))}
              placeholder="Ex: 15.00" style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Chave Pix *</label>
            <input value={instAdminForm.pixKey} onChange={e => setInstAdminForm(f => ({ ...f, pixKey: e.target.value }))}
              placeholder="CPF, CNPJ, email, telefone ou chave aleatória" style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
              Site / Instagram / Linktree <span style={{ fontWeight: 400, textTransform: "none", color: C.muted }}>(opcional)</span>
            </label>
            <input value={instAdminForm.site} onChange={e => setInstAdminForm(f => ({ ...f, site: e.target.value }))}
              placeholder="https://instagram.com/suainstituicao" style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none" }} />
            <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              Aparece no final da doação como &ldquo;saber mais sobre essa instituição&rdquo;.
            </p>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Emoji</label>
            <input value={instAdminForm.emoji} onChange={e => setInstAdminForm(f => ({ ...f, emoji: e.target.value }))}
              maxLength={4} placeholder="🍽" style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 22, outline: "none", textAlign: "center" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Cor</label>
              <input type="color" value={instAdminForm.cor} onChange={e => setInstAdminForm(f => ({ ...f, cor: e.target.value }))}
                style={{ width: "100%", height: 42, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 2, cursor: "pointer" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Fundo</label>
              <input type="color" value={instAdminForm.bg} onChange={e => setInstAdminForm(f => ({ ...f, bg: e.target.value }))}
                style={{ width: "100%", height: 42, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 2, cursor: "pointer" }} />
            </div>
          </div>
        </div>
        {/* preview */}
        <div style={{ background: C.offWhite, borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: instAdminForm.bg, border: `1.5px solid ${instAdminForm.cor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
            {instAdminForm.emoji}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{instAdminForm.nome || "Nome da instituição"}</p>
            <p style={{ fontSize: 12, color: instAdminForm.cor, fontWeight: 600 }}>R$ {instAdminForm.valor || "0"}/pessoa · {instAdminForm.tipo}</p>
          </div>
          <div style={{ marginLeft: "auto", background: instAdminForm.cor, color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 99 }}>Preview</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={handleSalvar} disabled={instAdminSaving || !instAdminForm.nome || !instAdminForm.pixKey || !instAdminForm.valor}
            style={{ background: C.black, color: C.white, border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: !instAdminForm.nome || !instAdminForm.pixKey || !instAdminForm.valor ? 0.4 : 1 }}>
            {instAdminSaving ? "Salvando..." : isNew ? "Criar instituição" : "Salvar alterações"}
          </button>
          <button onClick={() => setInstAdminEditing(null)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 16px", fontSize: 13, color: C.muted, cursor: "pointer" }}>Cancelar</button>
        </div>
      </div>
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* header */}
        <div style={{ background: C.black, borderRadius: 18, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, background: "rgba(255,255,255,0.08)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={Icons.users} size={22} color={C.gold} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: C.gold, letterSpacing: 3, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Gerenciamento</p>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.white, margin: 0 }}>Instituições</h2>
            </div>
          </div>
          <button onClick={handleOpenNew} style={{ background: C.orange, color: C.white, border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon d={Icons.send} size={14} color={C.white} />
            Nova instituição
          </button>
        </div>

        {/* form */}
        {instAdminEditing !== null && renderForm()}

        {/* lista */}
        {instAdminList.length === 0 && instAdminEditing === null && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: C.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>🏛️</div>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Nenhuma instituição cadastrada</p>
            <p style={{ fontSize: 13 }}>Clique em "Nova instituição" para começar.</p>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {instAdminList.map(inst => {
            const linkMp     = getLinkMp(inst);
            const linkGastos = getLinkGastos(inst);
            return (
            <div key={inst.id} style={{ background: C.white, borderRadius: 16, border: `1px solid ${inst.ativo === false ? C.border : inst.cor + "33"}`, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12, opacity: inst.ativo === false ? 0.6 : 1 }}>
              {/* linha principal */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, background: inst.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{inst.emoji}</div>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{inst.nome}</p>
                    {inst.ativo === false && <span style={{ fontSize: 10, background: C.stone, color: C.muted, padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>Inativa</span>}
                    {inst.mercadoPagoToken && <span style={{ fontSize: 10, background: C.greenL, color: C.green, padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>✓ MP vinculado</span>}
                    {inst.homologada
                      ? <span style={{ fontSize: 10, background: "#e6f7ee", color: "#00a650", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>✓ Homologada</span>
                      : <span style={{ fontSize: 10, background: "#fff4e5", color: "#e67e00", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>⏳ Pendente homologação</span>
                    }
                  </div>
                  <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{inst.tipo} · R$ {inst.valor}/pessoa · Pix: <span style={{ fontWeight: 600 }}>{inst.pixKey}</span></p>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                  <button onClick={() => handleOpenEdit(inst)} style={{ background: C.blueL, color: C.blue, border: "none", borderRadius: 9, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>✏️ Editar</button>
                  <button onClick={() => handleToggleAtivo(inst)} style={{ background: inst.ativo === false ? C.greenL : C.stone, color: inst.ativo === false ? C.green : C.muted, border: "none", borderRadius: 9, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {inst.ativo === false ? "✓ Ativar" : "⊘ Desativar"}
                  </button>
                  <button onClick={() => handleToggleHomologada(inst)}
                    title="Marca/desmarca homologada manualmente. Instituições não homologadas não aparecem no site público."
                    style={{ background: inst.homologada ? "#fff4e5" : "#e6f7ee", color: inst.homologada ? "#e67e00" : "#00a650", border: "none", borderRadius: 9, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {inst.homologada ? "⏳ Des-homologar" : "✓ Homologar"}
                  </button>
                  <button onClick={() => handleGerarLink(inst)} style={{ background: "#f0f4ff", color: "#009EE3", border: "1px solid #009EE344", borderRadius: 9, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>🔄 Regenerar links</button>
                  <button onClick={() => handleDeletarInstituicao(inst)} style={{ background: "#fff0f0", color: "#e53e3e", border: "none", borderRadius: 9, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>🗑️ Apagar</button>
                </div>
              </div>

              {/* links — sempre visíveis */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                {/* link MP */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, width: 22, textAlign: "center" }}>🔗</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 10, color: "#009EE3", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
                      {inst.mercadoPagoToken ? "Link MP (reconectar)" : "Link MP — vincular Mercado Pago"}
                    </p>
                    {linkMp
                      ? <p style={{ fontSize: 11, color: "#444", wordBreak: "break-all", fontFamily: "monospace", background: "#f5fafd", borderRadius: 6, padding: "4px 8px" }}>{linkMp}</p>
                      : <p style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>Clique em "Regenerar links" para gerar</p>
                    }
                  </div>
                  {linkMp && (
                    <button onClick={() => handleCopiarLink(inst.id, linkMp)} style={{ background: instLinkCopiado[inst.id] ? C.green : "#009EE3", color: C.white, border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {instLinkCopiado[inst.id] ? "✓ Copiado" : "Copiar"}
                    </button>
                  )}
                </div>
                {/* link gastos */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, width: 22, textAlign: "center" }}>📊</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Link de Gastos — registrar despesas</p>
                    {linkGastos
                      ? <p style={{ fontSize: 11, color: "#444", wordBreak: "break-all", fontFamily: "monospace", background: "#f5fdf7", borderRadius: 6, padding: "4px 8px" }}>{linkGastos}</p>
                      : <p style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>Clique em "Regenerar links" para gerar</p>
                    }
                  </div>
                  {linkGastos && (
                    <button onClick={() => handleCopiarLinkGastos(inst.id, linkGastos)} style={{ background: instLinkGastosCopiado[inst.id] ? C.green : "#22c55e", color: C.white, border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {instLinkGastosCopiado[inst.id] ? "✓ Copiado" : "Copiar"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── PRESTAÇÃO DE CONTAS ───────────────────────────────────────────────────
  const renderPrestacao = () => {
    const instSel = prestInsts.find(i => i.id === prestInstId) ?? null;
    const utilizado = prestGastos.reduce((s, g) => s + g.valor, 0);
    const semComp = prestGastos.filter(g => !g.comprovante).length;

    // cores por tipo
    const instCor = (inst: import("@/lib/data").Instituicao) =>
      inst.tipo === "Refeicao" ? { cor: "#000DFF", bg: "#e0e4ff" }
        : inst.tipo === "Banho" ? { cor: "#2A5FA5", bg: "#E6EEF8" }
          : { cor: "#FF4E00", bg: "#fff0eb" };

    const { cor, bg } = instSel ? instCor(instSel) : { cor: C.blue, bg: C.blueL };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* header */}
        <div style={{ background: C.black, borderRadius: 18, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 48, height: 48, background: "rgba(255,255,255,0.08)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={Icons.wallet} size={22} color={C.gold} />
          </div>
          <div>
            <p style={{ fontSize: 11, color: C.gold, letterSpacing: 3, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Transparência</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.white, margin: 0 }}>Prestação de Contas</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Gastos por instituição — registre no campo Gastos</p>
          </div>
        </div>

        {/* seletor instituição */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "18px 20px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Selecionar instituição</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {prestInsts.map(inst => {
              const { cor: c } = instCor(inst);
              const ativa = prestInstId === inst.id;
              return (
                <button key={inst.id} onClick={() => { setPrestInstId(inst.id); setPrestGastos([]); }}
                  style={{ padding: "8px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `2px solid ${ativa ? c : C.border}`, background: ativa ? c + "18" : C.offWhite, color: ativa ? c : C.muted }}>
                  {inst.emoji} {inst.nome}
                </button>
              );
            })}
          </div>
        </div>

        {instSel && (
          <>
            {/* header instituição */}
            <div style={{ background: `linear-gradient(135deg,${C.dark},${C.dark2})`, borderRadius: 18, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: "50%", border: `1px solid ${cor}`, opacity: 0.15 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  {instSel.tipo === "Refeicao" ? "🍽" : instSel.tipo === "Banho" ? "🚿" : "🧣"}
                </div>
                <div>
                  <p style={{ fontSize: 10, letterSpacing: 3, color: cor, textTransform: "uppercase", fontWeight: 600, marginBottom: 3 }}>{instSel.tipo}</p>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: C.white }}>{instSel.nome}</p>
                </div>
              </div>
              {semComp > 0 && (
                <div style={{ background: "#fff0eb", border: `1px solid ${C.amber}40`, borderRadius: 10, padding: "7px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: C.amber, fontWeight: 500 }}>⚠ {semComp} sem comprovante</span>
                </div>
              )}
            </div>

            {/* métricas */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
              {[
                { label: "Utilizado", value: `R$ ${utilizado.toFixed(2)}`, sub: `${prestGastos.length} gastos`, color: "#A32D2D", icon: Icons.receipt },
                { label: "Com comprovante", value: `${prestGastos.filter(g => g.comprovante).length}`, sub: `de ${prestGastos.length} registros`, color: cor, icon: Icons.check },
                { label: "Sem comprovante", value: `${semComp}`, sub: semComp > 0 ? "Atenção necessária" : "Tudo certo", color: semComp > 0 ? C.amber : cor, icon: Icons.filter },
              ].map((m, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "18px 20px", boxShadow: "0 2px 8px rgba(28,26,22,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <p style={{ fontSize: 11, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600 }}>{m.label}</p>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: m.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon d={m.icon} size={15} color={m.color} />
                    </div>
                  </div>
                  <p style={{ fontSize: 26, fontWeight: 700, color: m.color, fontFamily: "'Playfair Display',serif", lineHeight: 1, marginBottom: 4 }}>{m.value}</p>
                  <p style={{ fontSize: 12, color: C.muted }}>{m.sub}</p>
                </div>
              ))}
            </div>

            {/* timeline de gastos */}
            <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "20px", boxShadow: "0 2px 8px rgba(28,26,22,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Histórico de gastos</p>
                  <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{prestGastos.length} registros · {prestGastos.filter(g => g.comprovante).length} com comprovante</p>
                </div>
                <span style={{ background: bg, color: cor, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>Total: R$ {utilizado.toFixed(2)}</span>
              </div>
              {prestLoading && <p style={{ textAlign: "center", color: C.muted, padding: "20px 0", fontSize: 13 }}>Carregando...</p>}
              {!prestLoading && prestGastos.length === 0 && (
                <div style={{ textAlign: "center", padding: "36px 20px", color: C.muted }}>
                  <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.3 }}>📋</div>
                  <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Nenhum gasto registrado</p>
                  <p style={{ fontSize: 12 }}>Registre gastos na aba Gastos.</p>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {prestGastos.map((g, i) => (
                  <div key={i} style={{ display: "flex", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: g.comprovante ? bg : C.stone, border: `2px solid ${g.comprovante ? cor : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon d={g.comprovante ? Icons.check : Icons.receipt} size={13} color={g.comprovante ? cor : C.muted} />
                      </div>
                      {i < prestGastos.length - 1 && <div style={{ width: 1.5, flex: 1, background: C.border, minHeight: 16, marginTop: 4 }} />}
                    </div>
                    <div style={{ flex: 1, background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 4 }}>{g.desc}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, color: C.muted }}>{new Date(g.data).toLocaleDateString("pt-BR")}</span>
                          {g.comprovante
                            ? <span style={{ fontSize: 10, background: bg, color: cor, padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>✓ Comprovante</span>
                            : <span style={{ fontSize: 10, background: C.amberL, color: C.amber, padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>⚠ Sem comprovante</span>
                          }
                        </div>
                      </div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "#A32D2D", fontFamily: "'Playfair Display',serif", whiteSpace: "nowrap" }}>− R$ {g.valor.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // ── CONFIGURAÇÕES ────────────────────────────────────────────────────────
  const renderConfig = () => {
    const API2 = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

    const handleSalvar = async () => {
      setConfigSaving(true);
      try {
        await fetch(`${API2}/api/admin/config`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}`, 'ngrok-skip-browser-warning': 'true' },
          body: JSON.stringify(siteConfig),
        });
        setConfigSaved(true);
        setTimeout(() => setConfigSaved(false), 2500);
      } catch { alert('Erro ao salvar.'); }
      finally { setConfigSaving(false); }
    };

    const field = (label: string, key: string, placeholder: string, type: 'text' | 'password' | 'email' | 'tel' = 'text') => (
      <div key={key}>
        <p style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
        <input
          type={type}
          placeholder={placeholder}
          value={siteConfig[key] ?? ''}
          onChange={e => setSiteConfig(c => ({ ...c, [key]: e.target.value }))}
          style={{ width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, outline: 'none', fontFamily: type === 'password' ? 'monospace' : 'inherit', boxSizing: 'border-box', background: C.white }}
        />
      </div>
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* header */}
        <div style={{ background: C.black, borderRadius: 18, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, background: "rgba(255,255,255,0.08)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={Icons.settings} size={22} color={C.gold} />
          </div>
          <div>
            <p style={{ fontSize: 11, color: C.gold, letterSpacing: 3, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Painel</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.white, margin: 0 }}>Configurações do Site</h2>
          </div>
        </div>

        {/* Dados gerais */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0 }}>🏢 Dados da organização</p>
          {field('Nome da organização', 'nomeOrganizacao', 'Humanity Bearers')}
          {field('Email de contato', 'emailContato', 'contato@exemplo.com', 'email')}
          {field('WhatsApp', 'whatsapp', '(11) 99999-9999', 'tel')}
          {field('Chave Pix (admin)', 'pixChaveAdmin', 'CPF, email, telefone ou chave aleatória')}
        </div>

        {/* Mercado Pago */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0 }}>💳 Mercado Pago</p>
          <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Encontre em <strong>mercadopago.com.br/developers</strong> → sua conta → Credenciais de produção.</p>
          {field('Access Token', 'mpAccessToken', 'APP_USR-xxxx...', 'password')}
          {field('Public Key', 'mpPublicKey', 'APP_USR-xxxx...')}
          <div style={{ marginTop: 4 }}>
            <p style={{ fontSize: 11, color: C.muted, marginBottom: 8, fontWeight: 600 }}>🎬 TUTORIAL EM VÍDEO</p>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}` }}>
              <iframe
                src="https://www.youtube.com/embed/lGuGNXmCAf8"
                title="Como obter credenciais no Mercado Pago"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Botão salvar */}
        <button
          onClick={handleSalvar}
          disabled={configSaving}
          style={{ background: configSaved ? '#22c55e' : C.black, color: C.white, border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: configSaving ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
          {configSaving ? 'Salvando...' : configSaved ? '✓ Salvo!' : 'Salvar configurações'}
        </button>
      </div>
    );
  };

  // ── PEDIDOS DE PATCH ─────────────────────────────────────────────────────
  const renderPedidos = () => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
    const statusOpcoes = ['pendente', 'produzindo', 'enviado', 'entregue'];
    const statusCor: Record<string, { bg: string; cor: string }> = {
      pendente:   { bg: '#fff7ed', cor: '#f59e0b' },
      produzindo: { bg: '#eff6ff', cor: '#3b82f6' },
      enviado:    { bg: '#f0fdf4', cor: '#22c55e' },
      entregue:   { bg: '#f3f4f6', cor: '#6b7280' },
    };
    async function atualizarStatus(id: number, status: string) {
      const token = localStorage.getItem('admin_token');
      setPedidosSaving(s => ({ ...s, [id]: true }));
      try {
        await fetch(`${API}/api/pedidos/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
          body: JSON.stringify({ status }),
        });
        setPedidos(ps => ps.map(p => p.id === id ? { ...p, status } : p));
      } catch { alert('Erro ao atualizar status') }
      finally { setPedidosSaving(s => ({ ...s, [id]: false })) }
    }
    const total = pedidos.length;
    const pendentes = pedidos.filter(p => p.status === 'pendente').length;
    const producao  = pedidos.filter(p => p.status === 'produzindo').length;
    const enviados  = pedidos.filter(p => p.status === 'enviado').length;
    const entregues = pedidos.filter(p => p.status === 'entregue').length;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 18, padding: '20px 24px', color: 'white' }}>
          <p style={{ fontSize: 11, color: '#d4a017', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600 }}>🎖️ Gestão de Pedidos</p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, margin: '4px 0 8px' }}>Patches Físicos</h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Gerencie os pedidos das insígnias desenhadas</p>
        </div>

        {/* métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {[
            { label: 'Total', value: total, emoji: '📦', cor: '#111' },
            { label: 'Pendentes', value: pendentes, emoji: '⏳', cor: '#f59e0b' },
            { label: 'Produzindo', value: producao, emoji: '🔨', cor: '#3b82f6' },
            { label: 'Entregues', value: entregues, emoji: '✅', cor: '#22c55e' },
          ].map(m => (
            <div key={m.label} style={{ background: '#fff', borderRadius: 14, padding: '14px 12px', textAlign: 'center', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 20 }}>{m.emoji}</div>
              <p style={{ fontSize: 18, fontWeight: 800, color: m.cor, margin: '4px 0 2px' }}>{m.value}</p>
              <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{m.label}</p>
            </div>
          ))}
        </div>

        {pedidosLoading && <p style={{ textAlign: 'center', color: C.muted }}>Carregando pedidos...</p>}
        {!pedidosLoading && pedidos.length === 0 && (
          <div style={{ background: C.white, borderRadius: 16, padding: '40px', textAlign: 'center', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎖️</div>
            <p style={{ fontWeight: 600, color: C.ink }}>Nenhum pedido ainda</p>
            <p style={{ fontSize: 13, color: C.muted }}>Os pedidos aparecerão aqui quando os doadores solicitarem patches</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pedidos.map(p => {
            const sc = statusCor[p.status] || statusCor.pendente;
            return (
              <div key={p.id} style={{ background: C.white, borderRadius: 16, padding: '18px 20px', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: 0 }}>{p.doadorNome}</p>
                      <span style={{ fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.cor, padding: '2px 10px', borderRadius: 99 }}>{p.status}</span>
                    </div>
                    <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>{p.doadorEmail}{p.doadorTel ? ` · ${p.doadorTel}` : ''}</p>
                    <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>📍 {p.endereco}, {p.cidade} — {p.cep}</p>
                    {p.observacoes && <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0', fontStyle: 'italic' }}>💬 {p.observacoes}</p>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#d4a017', margin: 0 }}>{p.nivel.toUpperCase()}</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: '2px 0 0' }}>R$ {Number(p.preco).toFixed(2)}</p>
                    <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0' }}>#{p.id} · {new Date(p.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {statusOpcoes.map(s => (
                    <button key={s} onClick={() => atualizarStatus(p.id, s)} disabled={p.status === s || pedidosSaving[p.id]}
                      style={{ padding: '6px 14px', borderRadius: 99, border: 'none', fontSize: 11, fontWeight: 600, cursor: p.status === s ? 'default' : 'pointer', background: p.status === s ? sc.bg : '#f3f4f6', color: p.status === s ? sc.cor : C.muted, opacity: pedidosSaving[p.id] ? 0.5 : 1, transition: 'all 0.15s' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── TAGS ─────────────────────────────────────────────────────────────────
  const renderTags = () => {
    const API2 = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
    const handleGerar = async () => {
      const token = localStorage.getItem('admin_token');
      setGerandoTags(true);
      setTagsGeradas(null);
      try {
        const res = await fetch(`${API2}/api/tags/gerar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
          body: JSON.stringify({ quantidade: Number(gerarQtd), campanha: gerarCampanha, ano: Number(gerarAno) }),
        });
        const data = await res.json();
        if (data.ok) {
          setTagsGeradas(data);
          // Recarrega lista
          const r2 = await fetch(`${API2}/api/tags`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
          const d2 = await r2.json();
          if (Array.isArray(d2)) setTags(d2);
        }
      } catch { /* ignore */ }
      finally { setGerandoTags(false); }
    };

    const livres = tags.filter(t => !t.vinculada).length;
    const vinculadas = tags.filter(t => t.vinculada).length;

    return (
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 4px' }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 800, color: C.ink, marginBottom: 4 }}>Tags</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Gere e gerencie os seriais no formato <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>GS-HB26-FSCIVP-247-59KJ</span></p>

        {/* Gerar lote */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 16 }}>Gerar novo lote</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Campanha</p>
              <input value={gerarCampanha}
                onChange={e => setGerarCampanha(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="D26001" maxLength={6}
                style={{ border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, width: 110, fontFamily: 'monospace', fontWeight: 700 }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Ano (2 dígitos)</p>
              <input value={gerarAno} onChange={e => setGerarAno(e.target.value)} type="number"
                placeholder="26" maxLength={2}
                style={{ border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, width: 80, fontFamily: 'monospace', fontWeight: 700 }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Quantidade</p>
              <input value={gerarQtd} onChange={e => setGerarQtd(e.target.value)} type="number"
                placeholder="10" min={1} max={500}
                style={{ border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, width: 90 }} />
            </div>
            <button onClick={handleGerar} disabled={gerandoTags}
              style={{ padding: '9px 20px', borderRadius: 10, background: C.dark, color: C.gold, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: gerandoTags ? 0.6 : 1 }}>
              {gerandoTags ? 'Gerando...' : '+ Gerar'}
            </button>
          </div>
          {tagsGeradas && (() => {
            const tot = tagsGeradas.geradas;
            const padLen = String(tot).length;
            const primeiroNum = String(1).padStart(padLen, '0');
            const ultimoNum   = String(tot).padStart(padLen, '0');
            return (
              <div style={{ marginTop: 14, background: '#e6f7ee', border: '1px solid #00a65033', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: '#00a650', fontWeight: 700, marginBottom: 8 }}>✓ {tot} tags geradas</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ background: C.orange, color: C.white, fontWeight: 800, fontSize: 12, padding: '3px 8px', borderRadius: 6, fontFamily: 'monospace' }}>
                    {primeiroNum}/{tot}
                  </span>
                  <span style={{ fontSize: 12, color: '#00a650', fontFamily: 'monospace' }}>{tagsGeradas.primeira}</span>
                  <span style={{ color: '#00a650', fontWeight: 700 }}>→</span>
                  <span style={{ fontSize: 12, color: '#00a650', fontFamily: 'monospace' }}>{tagsGeradas.ultima}</span>
                  <span style={{ background: C.orange, color: C.white, fontWeight: 800, fontSize: 12, padding: '3px 8px', borderRadius: 6, fontFamily: 'monospace' }}>
                    {ultimoNum}/{tot}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Resumo */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total', valor: tags.length, cor: C.ink },
            { label: 'Livres', valor: livres, cor: '#f59e0b' },
            { label: 'Vinculadas', valor: vinculadas, cor: '#10b981' },
          ].map(item => (
            <div key={item.label} style={{ flex: 1, background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '14px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: item.cor }}>{item.valor}</p>
              <p style={{ fontSize: 11, color: C.muted }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <input value={tagsFiltroCampanha} onChange={e => setTagsFiltroCampanha(e.target.value.toUpperCase())}
            placeholder="Filtrar campanha (ex: D26001)"
            style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px', fontSize: 12, fontFamily: 'monospace', width: 180 }} />
          <select value={tagsFiltroStatus} onChange={e => setTagsFiltroStatus(e.target.value)}
            style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px', fontSize: 12 }}>
            <option value="">Todos os status</option>
            <option value="livre">Livres</option>
            <option value="vinculada">Vinculadas</option>
          </select>
        </div>

        {/* Lista — NNN/TOTAL é calculado por chave campanha+ano */}
        {tagsLoading && <p style={{ textAlign: 'center', color: C.muted, padding: 24 }}>Carregando...</p>}

        {/* Agrupa tags em LOTES reais via createdAt (tags geradas na mesma
            transação ficam no mesmo instante; tolerância de 5s pra cobrir
            lotes grandes que demoram a inserir). Isso garante que lote de
            100 mostre N/100 e lote de 300 mostre M/300 mesmo na mesma campanha. */}
        {(() => null)()}
        {tags.length > 0 && (() => {
          // Build batches once via timestamp clustering
          const baixarTodos = async () => {
            if (!confirm(`Baixar ${tags.length} QR Codes? Cada um será salvo individualmente.`)) return;
            for (const tag of tags) {
              const info = loteInfoDe(tag, tags);
              await baixarQRComContador(tag.serial, info.contador);
              await new Promise(r => setTimeout(r, 200));
            }
          };
          return (
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={baixarTodos} style={{ padding: '8px 18px', borderRadius: 8, background: C.dark, color: C.gold, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                ⬇ Baixar todos os QR ({tags.length})
              </button>
            </div>
          );
        })()}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tags.map(tag => {
            const urlDoacao = `https://humanitybearers.tech/doacao?tag=${encodeURIComponent(tag.serial)}`;
            // Lote real = tags com createdAt próximo (mesma transação de geração)
            const lote = loteInfoDe(tag, tags);
            const contadorStr = lote.contador;

            const baixarComSerial = () => baixarQRComContador(tag.serial, contadorStr);

            return (
              <div key={tag.id} style={{
                background: C.white, borderRadius: 12, border: `1px solid ${tag.vinculada ? '#10b98130' : C.border}`,
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {/* Badge da posição no lote em destaque (laranja) */}
                  <span style={{ padding: '4px 10px', borderRadius: 8, background: C.orange, fontFamily: 'monospace', fontWeight: 800, color: C.white, fontSize: 13, letterSpacing: 0.5 }}>
                    {contadorStr}
                  </span>
                  <div>
                    <p style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: C.ink, letterSpacing: 1 }}>{tag.serial}</p>
                    <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Campanha {tag.campanha}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {tag.vinculada ? (
                    <>
                      <span style={{ background: '#10b98118', color: '#10b981', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>Vinculada</span>
                      {tag.doador && <p style={{ fontSize: 12, color: C.muted }}>{tag.doador.nivel?.toUpperCase()} · {tag.doador.pontos}pts</p>}
                    </>
                  ) : (
                    <span style={{ background: '#f59e0b18', color: '#f59e0b', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>Livre</span>
                  )}
                  <p style={{ fontSize: 11, color: C.muted }}>{tag.totalScans} scans</p>
                  <button onClick={() => setTagQrAberto(tagQrAberto === tag.serial ? null : tag.serial)}
                    style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: tagQrAberto === tag.serial ? C.dark : C.white, color: tagQrAberto === tag.serial ? C.gold : C.ink, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    {tagQrAberto === tag.serial ? '▲ QR' : '▼ QR'}
                  </button>
                </div>
                {/* QR expandido */}
                {tagQrAberto === tag.serial && (
                  <div style={{ width: '100%', borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 4, display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Preview com serial — QR gerado localmente via lib qrcode */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
                      <QRPreview url={urlDoacao} size={140} />
                      <p style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: C.ink, letterSpacing: 1 }}>{tag.serial}</p>
                      <p style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 800, color: C.orange }}>{contadorStr}</p>
                      <p style={{ fontSize: 9, color: C.muted, letterSpacing: 1 }}>SCAN · CONNECT · IMPACT</p>
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Link da doação</p>
                      <p style={{ fontFamily: 'monospace', fontSize: 11, color: C.muted, wordBreak: 'break-all', marginBottom: 14, lineHeight: 1.5 }}>{urlDoacao}</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={baixarComSerial}
                          style={{ padding: '7px 16px', borderRadius: 8, background: C.dark, color: C.gold, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          ⬇ Baixar QR ({contadorStr})
                        </button>
                        <button onClick={() => navigator.clipboard.writeText(urlDoacao)}
                          style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.ink, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          📋 Copiar link
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {!tagsLoading && tags.length === 0 && (
          <p style={{ textAlign: 'center', color: C.muted, padding: '40px 0', fontSize: 13 }}>Nenhuma tag encontrada. Gere um lote acima.</p>
        )}
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
            <div style={{ display: "flex", gap: 8 }}>
              {loadingData && <span style={{ fontSize: 12, color: C.muted, alignSelf: "center" }}>Carregando...</span>}
              <button onClick={async () => { await apiLogout(); setAutenticado(false); }}
                style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "6px 14px", fontSize: 12, color: C.muted, cursor: "pointer" }}>
                Sair
              </button>
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
          {tab === "homenagens" && renderHomenagens()}
          {tab === "missao"     && renderMissao()}
          {tab === "prestacao"    && renderPrestacao()}
          {tab === "instituicoes" && renderInstituicoes()}
          {tab === "config"       && renderConfig()}
          {tab === "pedidos"      && renderPedidos()}
          {tab === "tags"         && renderTags()}
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

