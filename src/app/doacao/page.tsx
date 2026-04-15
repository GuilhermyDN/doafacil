"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { type Instituicao } from "@/lib/data";
import { getInstituicoes, postDoacao, criarPixMp, type PostDoacaoResponse, type MpPixResponse } from "@/lib/api";

type Etapa = "escolha" | "pagamento" | "pixqr" | "cartaobrick" | "confirmado";

// ── BRAND COLORS ─────────────────────────────────────────────────────────────
const C = {
  black:   "#000000",
  blue:    "#000DFF",
  blueL:   "#e0e4ff",
  orange:  "#FF4E00",
  orangeL: "#fff0eb",
  white:   "#FFFFFF",
  offWhite:"#f8f8f8",
  border:  "#e2e2e2",
  muted:   "#777777",
  ink:     "#111111",
  card:    "#ffffff",
  green:   "#000DFF",
  greenL:  "#e0e4ff",
  amber:   "#FF4E00",
  amberL:  "#fff0eb",
};

const instColor = (inst: Instituicao) =>
  inst.tipo === "Refeicao" ? { cor: C.blue,   bg: C.blueL   }
  : inst.tipo === "Banho"  ? { cor: C.orange,  bg: C.orangeL }
  :                          { cor: "#6600cc", bg: "#f0e8ff" };

// ── BACKGROUND ───────────────────────────────────────────────────────────────
function PageBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", background: C.black }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/ursinho.png" alt="" style={{
        position: "absolute", right: "-5%", bottom: "-8%",
        width: "55vmin", maxWidth: 480, opacity: 0.07,
        filter: "grayscale(100%) contrast(1.4)",
        userSelect: "none", pointerEvents: "none",
      }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/ursinho.png" alt="" style={{
        position: "absolute", left: "-4%", top: "-6%",
        width: "28vmin", maxWidth: 240, opacity: 0.045,
        filter: "grayscale(100%) contrast(1.4)",
        userSelect: "none", pointerEvents: "none",
      }} />
      <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: C.blue, opacity: 0.06, filter: "blur(80px)" }}/>
      <div style={{ position: "absolute", top: "15%", left: "5%", width: 320, height: 320, borderRadius: "50%", background: C.orange, opacity: 0.08, filter: "blur(80px)" }}/>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/ursinho.png" alt="" style={{
        position: "absolute", top: 40, right: 60,
        width: 40, height: 40, opacity: 0.18,
        filter: "grayscale(100%) contrast(1.4)",
        userSelect: "none", pointerEvents: "none",
      }} />
      <svg style={{ position: "absolute", bottom: 60, left: 50, opacity: 0.12 }} width={44} height={44} viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="none" stroke={C.blue} strokeWidth="4" strokeDasharray="8 5"/>
      </svg>
    </div>
  );
}

// ── TELA ESCOLHA ──────────────────────────────────────────────────────────────
function TelaEscolha({ onEscolher }: { onEscolher: (i: Instituicao) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    getInstituicoes()
      .then(setInstituicoes)
      .catch(() => setErro("Não foi possível carregar as instituições."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", position: "relative" }}>
      <PageBg />
      <div style={{
        position: "relative", zIndex: 1, width: "100%", maxWidth: 480,
        background: C.white, borderRadius: 24, border: `1.5px solid ${C.border}`,
        boxShadow: "0 40px 100px rgba(0,0,0,0.45), 0 8px 24px rgba(0,13,255,0.12)", overflow: "hidden",
      }}>
        <div style={{ background: C.black, padding: "24px 28px 20px", position: "relative", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ursinho.png" alt="" style={{ position: "absolute", right: -10, top: -10, width: 90, opacity: 0.12, filter: "grayscale(100%)", pointerEvents: "none" }}/>
          <div style={{ display: "flex", gap: 0, marginBottom: 18, height: 4 }}>
            <div style={{ flex: 1, background: C.blue, borderRadius: "2px 0 0 2px" }}/>
            <div style={{ flex: 1, background: C.orange }}/>
            <div style={{ flex: 1, background: C.white, borderRadius: "0 2px 2px 0", opacity: 0.2 }}/>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
            <div style={{ position: "relative", width: 26, height: 26, flexShrink: 0 }}>
              <div style={{ position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)", width: 3, height: 26, background: C.orange, borderRadius: 2 }}/>
              <div style={{ position: "absolute", top: "34%", left: 0, width: 26, height: 3, background: C.orange, borderRadius: 2 }}/>
            </div>
            <div>
              <p style={{ fontSize: 10, letterSpacing: 3.5, color: C.orange, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Faça uma doação</p>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: C.white, margin: 0, lineHeight: 1.2 }}>Escolha como ajudar</h1>
            </div>
          </div>
        </div>

        <div style={{ padding: "22px 26px 28px" }}>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 18, lineHeight: 1.7 }}>
            Cada doação vai direto para a instituição, sem intermediários. 100% transparente.
          </p>

          {loading && <p style={{ textAlign: "center", color: C.muted, padding: "20px 0" }}>Carregando instituições...</p>}
          {erro && <p style={{ textAlign: "center", color: C.orange, padding: "20px 0" }}>{erro}</p>}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {instituicoes.map((inst) => {
              const { cor, bg } = instColor(inst);
              const isHov = hovered === inst.id;
              return (
                <button key={inst.id} onClick={() => onEscolher(inst)}
                  onMouseEnter={() => setHovered(inst.id)} onMouseLeave={() => setHovered(null)}
                  style={{
                    background: isHov ? cor : C.offWhite, border: `2px solid ${isHov ? cor : C.border}`,
                    borderRadius: 14, padding: "14px 16px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 13, textAlign: "left",
                    transition: "all 0.15s ease",
                    transform: isHov ? "translateX(5px)" : "none",
                    boxShadow: isHov ? `0 6px 20px ${cor}33` : "none",
                  }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: isHov ? "rgba(255,255,255,0.15)" : bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    {inst.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: isHov ? C.white : C.ink, marginBottom: 2, fontFamily: "'Playfair Display', serif" }}>{inst.nome}</p>
                    <p style={{ fontSize: 12, color: isHov ? "rgba(255,255,255,0.7)" : C.muted }}>{inst.tipo}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: isHov ? C.white : cor, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>R$ {inst.valor}</p>
                    <p style={{ fontSize: 10, color: isHov ? "rgba(255,255,255,0.6)" : C.muted, marginTop: 2 }}>por pessoa</p>
                  </div>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: isHov ? "rgba(255,255,255,0.2)" : cor + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: isHov ? C.white : cor, flexShrink: 0 }}>→</div>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 14px" }}>
            <div style={{ flex: 1, height: 1, background: C.border }}/>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.orange }}/>
            <div style={{ flex: 1, height: 1, background: C.border }}/>
          </div>
          <p style={{ textAlign: "center", fontSize: 11, color: C.muted, lineHeight: 1.8 }}>
            🔒 Pagamento via Pix · Direto para a instituição
          </p>
        </div>
      </div>
      <p style={{ position: "relative", zIndex: 1, marginTop: 20, fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: 2, textTransform: "uppercase" }}>Humanity Bearers</p>
    </div>
  );
}

// ── TELA PAGAMENTO ────────────────────────────────────────────────────────────
function TelaPagamento({ inst, tagSerial, autoSerial, onConfirmar, onVoltar }: {
  inst: Instituicao;
  tagSerial?: string;    // veio pelo QR code físico
  autoSerial?: string;   // gerado automaticamente ao entrar sem QR
  onConfirmar: (qtd: number, nome: string, email: string, telefone: string, metodo: "pix" | "cartao") => void;
  onVoltar: () => void;
}) {
  const [qtd, setQtd] = useState(1);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [anonimo, setAnonimo] = useState(false);
  const [serialCopiado, setSerialCopiado] = useState(false);
  const { cor, bg } = instColor(inst);
  const total = inst.valor * qtd;
  const podeConfirmarPix = anonimo || (nome.trim().length > 0 && email.trim().length > 0 && telefone.trim().length > 0);
  // Cartão exige cadastro: o antifraude do MP rejeita pagamentos sem payer.email real.
  const podeConfirmarCartao = !anonimo && nome.trim().length > 0 && email.trim().length > 0 && telefone.trim().length > 0;

  const BASE = typeof window !== "undefined" ? window.location.origin : "https://humanitybearers.com.br";
  const qrUrl = autoSerial ? `${BASE}/doacao?tag=${autoSerial}` : null;
  const qrImgUrl = qrUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrUrl)}&bgcolor=ffffff&color=000000&margin=6` : null;

  const copiarSerial = () => {
    if (autoSerial) { navigator.clipboard.writeText(autoSerial).catch(() => {}); setSerialCopiado(true); setTimeout(() => setSerialCopiado(false), 2000); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px", position: "relative" }}>
      <PageBg />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480, background: C.white, borderRadius: 24, border: `1.5px solid ${C.border}`, boxShadow: "0 40px 100px rgba(0,0,0,0.45), 0 8px 24px rgba(0,13,255,0.12)", overflow: "hidden" }}>
        <div style={{ background: C.black, padding: "18px 22px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onVoltar} style={{ background: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 9, width: 32, height: 32, cursor: "pointer", color: C.white, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>←</button>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{inst.emoji}</div>
          <div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 1 }}>Doando para</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: C.white }}>{inst.nome}</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            <div style={{ width: 8, height: 28, borderRadius: 4, background: cor, opacity: 0.8 }}/>
            <div style={{ width: 4, height: 28, borderRadius: 4, background: cor, opacity: 0.4 }}/>
          </div>
        </div>

        <div style={{ padding: "26px 28px" }}>
          {/* Badge da tag vinculada via QR físico */}
          {tagSerial && (
            <div style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 14,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 16 }}>🏷️</span>
              <div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>Tag vinculada</p>
                <p style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>{tagSerial}</p>
              </div>
            </div>
          )}

          {/* Card de serial auto-gerado (sem QR físico) */}
          {autoSerial && !tagSerial && (
            <div style={{
              background: "linear-gradient(135deg, #0e0e0e, #1a1000)",
              border: "1px solid rgba(255,78,0,0.25)",
              borderRadius: 14, padding: "16px", marginBottom: 16,
            }}>
              <p style={{ fontSize: 9, color: C.orange, letterSpacing: 2.5, textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>
                🎯 Seu serial exclusivo
              </p>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                {/* QR Code */}
                {qrImgUrl && (
                  <div style={{ flexShrink: 0, background: "#fff", borderRadius: 8, padding: 4 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrImgUrl} alt="QR Code do seu serial" width={72} height={72} style={{ display: "block", borderRadius: 4 }} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: 0.5, marginBottom: 6, wordBreak: "break-all" }}>
                    {autoSerial}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: 8 }}>
                    Guarde esse QR Code para acumular pontos, participar das missões.
                  </p>
                  <button onClick={copiarSerial}
                    style={{ fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 7, border: "1px solid rgba(255,78,0,0.3)", background: serialCopiado ? "rgba(255,78,0,0.15)" : "transparent", color: serialCopiado ? C.orange : "rgba(255,255,255,0.45)", cursor: "pointer", transition: "all 0.2s" }}>
                    {serialCopiado ? "✓ Copiado!" : "📋 Copiar serial"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* anônimo toggle */}
          <button
            onClick={() => { setAnonimo(a => !a); setNome(""); setEmail(""); setTelefone(""); }}
            style={{
              width: "100%", marginBottom: 12, padding: "10px 14px", borderRadius: 12,
              border: `1.5px solid ${anonimo ? cor : C.border}`,
              background: anonimo ? cor + "12" : C.offWhite,
              display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
              transition: "all 0.15s",
            }}>
            <div style={{
              width: 18, height: 18, borderRadius: 4, border: `2px solid ${anonimo ? cor : C.border}`,
              background: anonimo ? cor : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {anonimo && <span style={{ color: C.white, fontSize: 11, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: anonimo ? cor : C.muted, fontWeight: anonimo ? 600 : 400 }}>
              Quero doar anonimamente
            </span>
          </button>

          {/* nome e email */}
          {!anonimo && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              <input
                placeholder="Seu nome *"
                value={nome}
                onChange={e => setNome(e.target.value)}
                style={{ border: `1.5px solid ${nome ? cor : C.border}`, borderRadius: 12, padding: "11px 14px", fontSize: 13, color: C.ink, outline: "none", transition: "border 0.15s" }}
              />
              <input
                placeholder="Email *"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ border: `1.5px solid ${email ? cor : C.border}`, borderRadius: 12, padding: "11px 14px", fontSize: 13, color: C.ink, outline: "none", transition: "border 0.15s" }}
              />
              <input
                placeholder="Telefone *"
                value={telefone}
                inputMode="tel"
                maxLength={15}
                onChange={e => {
                  const d = e.target.value.replace(/\D/g, "").slice(0, 11);
                  let out = d;
                  if (d.length > 0) out = "(" + d.slice(0, 2);
                  if (d.length >= 3) out += ") " + (d.length > 10 ? d.slice(2, 7) : d.slice(2, 6));
                  if (d.length >= 7) out += "-" + (d.length > 10 ? d.slice(7) : d.slice(6));
                  setTelefone(out);
                }}
                style={{ border: `1.5px solid ${telefone ? cor : C.border}`, borderRadius: 12, padding: "11px 14px", fontSize: 13, color: C.ink, outline: "none", transition: "border 0.15s" }}
              />
            </div>
          )}
          {anonimo && <div style={{ marginBottom: 22 }} />}

          <p style={{ fontSize: 13, color: C.muted, textAlign: "center", marginBottom: 20 }}>Quantas pessoas você quer ajudar?</p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, marginBottom: 26 }}>
            <button onClick={() => setQtd(q => Math.max(1, q - 1))} style={{ width: 46, height: 46, borderRadius: 12, border: `2px solid ${C.border}`, background: C.offWhite, fontSize: 22, cursor: "pointer", color: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            <div style={{ textAlign: "center", minWidth: 60 }}>
              <div style={{ fontSize: 52, fontWeight: 800, color: C.ink, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{qtd}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{qtd === 1 ? "pessoa" : "pessoas"}</div>
            </div>
            <button onClick={() => setQtd(q => q + 1)} style={{ width: 46, height: 46, borderRadius: 12, border: `2px solid ${cor}`, background: bg, fontSize: 22, cursor: "pointer", color: cor, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>

          <div style={{ background: C.black, borderRadius: 14, padding: "16px 20px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.35)", paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 10 }}>
              <span>{qtd}x {inst.tipo}</span><span>R$ {inst.valor}/pessoa</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Total</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 800, color: cor }}>R$ {total.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>

          <div style={{ background: bg, border: `1px solid ${cor}30`, borderRadius: 12, padding: "11px 15px", marginBottom: 22, display: "flex", gap: 9, alignItems: "flex-start" }}>
            <span style={{ fontSize: 15 }}>🏦</span>
            <p style={{ fontSize: 12, color: cor, lineHeight: 1.6 }}>A chave Pix aparece na próxima tela. O valor vai direto para a instituição.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => podeConfirmarPix && onConfirmar(qtd, anonimo ? "Anônimo" : nome.trim(), anonimo ? "" : email.trim(), anonimo ? "" : telefone.trim(), "pix")}
              disabled={!podeConfirmarPix}
              style={{
                width: "100%", padding: "15px", borderRadius: 14,
                background: podeConfirmarPix ? "#32BCAD" : C.border,
                color: C.white, border: "none", fontSize: 14, fontWeight: 700,
                cursor: podeConfirmarPix ? "pointer" : "not-allowed",
                boxShadow: podeConfirmarPix ? "0 8px 24px #32BCAD44" : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              <span style={{ fontSize: 18 }}>⚡</span> Pagar com Pix · R$ {total.toFixed(2).replace(".", ",")}
            </button>
            <button
              onClick={() => podeConfirmarCartao && onConfirmar(qtd, nome.trim(), email.trim(), telefone.trim(), "cartao")}
              disabled={!podeConfirmarCartao}
              title={anonimo ? "Para pagar com cartão é necessário preencher nome, e-mail e telefone" : undefined}
              style={{
                width: "100%", padding: "15px", borderRadius: 14,
                background: podeConfirmarCartao ? cor : C.border,
                color: C.white, border: "none", fontSize: 14, fontWeight: 700,
                cursor: podeConfirmarCartao ? "pointer" : "not-allowed",
                boxShadow: podeConfirmarCartao ? `0 8px 24px ${cor}44` : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              <span style={{ fontSize: 18 }}>💳</span> Pagar com Cartão · R$ {total.toFixed(2).replace(".", ",")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TELA CARTÃO — CHECKOUT TRANSPARENTE + 3DS ────────────────────────────────
function TelaCartaoBrick({ inst, qtd, doacaoId, valorTotal, onSucesso, onVoltar }: {
  inst: Instituicao; qtd: number; doacaoId: number; valorTotal: number;
  onSucesso: () => void; onVoltar: () => void;
}) {
  const { cor } = instColor(inst);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

  const [tipoCartao, setTipo]   = useState<"credito" | "debito" | null>(null);
  const [numero, setNumero]     = useState("");
  const [nome, setNome]         = useState("");
  const [validade, setValidade] = useState("");
  const [cvv, setCvv]           = useState("");
  const [cpf, setCpf]           = useState("");
  const [brand, setBrand]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [mp, setMp]             = useState<any>(null);
  const [erro, setErro]         = useState("");

  // 3DS
  const [challenge, setChallenge] = useState<{ external_resource_url: string; creq: string } | null>(null);
  const [polling, setPolling]     = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Carrega SDK do MP com a public key da INSTITUIÇÃO (vem do banco, setada via OAuth)
  useEffect(() => {
    const loadSdk = async () => {
      // Busca a public key correta da instituição (que bate com o mercadoPagoToken dela)
      let publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || "";
      try {
        const r = await fetch(`${API}/api/mp/chave-publica?doacaoId=${doacaoId}`, { headers: { "ngrok-skip-browser-warning": "true" } });
        const d = await r.json();
        if (d.publicKey) publicKey = d.publicKey;
      } catch {}

      const init = () => {
        const instance = new (window as any).MercadoPago(publicKey, { locale: "pt-BR" });
        setMp(instance);
        setSdkReady(true);
      };
      if ((window as any).MercadoPago) { init(); return; }
      const s = document.createElement("script");
      s.src = "https://sdk.mercadopago.com/js/v2";
      s.async = true;
      s.onload = init;
      document.head.appendChild(s);
    };
    loadSdk();
  }, [doacaoId, API]);

  // Detecta bandeira pelo BIN
  useEffect(() => {
    const bin = numero.replace(/\s/g, "").slice(0, 6);
    if (bin.length < 6 || !mp) { setBrand(null); return; }
    mp.getPaymentMethods({ bin })
      .then((r: any) => setBrand(r?.results?.[0]?.id || null))
      .catch(() => setBrand(null));
  }, [numero, mp]);

  // Submete o form 3DS assim que ele aparece
  useEffect(() => {
    if (challenge && formRef.current) { formRef.current.submit(); }
  }, [challenge]);

  // Polling de status durante 3DS
  useEffect(() => {
    if (!challenge) return;
    setPolling(true);
    const iv = setInterval(async () => {
      try {
        const r = await fetch(`${API}/api/mp/status-doacao?doacaoId=${doacaoId}`, { headers: { "ngrok-skip-browser-warning": "true" } });
        const d = await r.json();
        if (d.pago) { clearInterval(iv); setPolling(false); onSucesso(); }
      } catch {}
    }, 3000);
    const tout = setTimeout(() => {
      clearInterval(iv); setPolling(false); setChallenge(null);
      setErro("Tempo esgotado. Tente novamente.");
    }, 5 * 60 * 1000);
    return () => { clearInterval(iv); clearTimeout(tout); };
  }, [challenge, doacaoId, onSucesso, API]);

  const fmtNumero = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const fmtValidade = (v: string) =>
    v.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");

  const fmtCpf = (v: string) =>
    v.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4")
     .replace(/(\d{3})(\d{3})(\d{1,3})$/, "$1.$2.$3")
     .replace(/(\d{3})(\d{1,3})$/, "$1.$2");

  const handlePagar = async () => {
    if (!tipoCartao || !numero || !nome || !validade || !cvv || !cpf || !sdkReady || loading) return;
    setLoading(true); setErro("");
    try {
      const partes = validade.split("/");
      const month = partes[0]?.padStart(2, "0") || "";
      const year  = (partes[1]?.length === 2 ? "20" : "") + (partes[1] || "");
      const cpfNum = cpf.replace(/\D/g, "");

      const tokenResult = await mp.createCardToken({
        cardNumber: numero.replace(/\s/g, ""),
        cardholderName: nome,
        cardExpirationMonth: month,
        cardExpirationYear: year,
        securityCode: cvv,
        identificationType: "CPF",
        identificationNumber: cpfNum,
      });
      if (!tokenResult?.id) throw new Error("Erro ao processar dados do cartão.");

      const bin = numero.replace(/\s/g, "").slice(0, 6);
      let issuerId: string | undefined;
      try {
        const issuers = await mp.getIssuers({ paymentMethodId: brand || tokenResult.payment_method_id, bin });
        issuerId = issuers?.[0]?.id;
      } catch {}

      const res = await fetch(`${API}/api/mp/cartao-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({
          doacaoId,
          token: tokenResult.id,
          installments: 1,
          paymentMethodId: brand || tokenResult.payment_method_id,
          issuerId,
          bin,                              // permite backend buscar issuer_id se faltar
          tipoCartao,
          payerIdentification: { type: "CPF", number: cpfNum },
          cardholderName: nome,             // nome no cartão — usado como fallback se doação foi anônima
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao processar pagamento.");

      if (data.status === "approved") { onSucesso(); return; }

      if (data.statusDetail === "pending_challenge" && data.threeDsInfo) {
        setChallenge(data.threeDsInfo); return;
      }

      // in_process / pending_review_manual → MP mandou o pagamento para
      // análise manual. Não é recusa: o webhook vai confirmar ou recusar
      // depois. Mostramos uma tela de "em análise" em vez de erro.
      if (data.status === "in_process" || data.statusDetail === "pending_review_manual" || data.statusDetail === "pending_contingency") {
        onSucesso(); // reaproveita a tela final; TelaConfirmado fica como "registrado, aguardando confirmação"
        return;
      }

      const MSGS: Record<string, string> = {
        cc_rejected_high_risk:              "Transação recusada pela análise de segurança do banco. Tente outro cartão ou pague via Pix.",
        cc_rejected_bad_filled_security_code:"Código de segurança (CVV) incorreto.",
        cc_rejected_bad_filled_date:        "Data de vencimento inválida.",
        cc_rejected_bad_filled_card_number: "Número do cartão inválido.",
        cc_rejected_insufficient_amount:    "Saldo insuficiente.",
        cc_rejected_call_for_authorize:     "Ligue para o banco para autorizar a transação.",
        cc_rejected_card_disabled:          "Cartão desabilitado. Contate o banco.",
      };
      setErro(MSGS[data.statusDetail] || `Pagamento recusado (${data.statusDetail || data.status}). Tente outro cartão.`);
    } catch (e: any) {
      setErro(e.message || "Erro ao processar cartão.");
    } finally {
      setLoading(false);
    }
  };

  // ── Tela de desafio 3DS ────────────────────────────────────────────────────
  if (challenge) return (
    <div style={{ minHeight: "100vh", background: C.black, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative" }}>
      <PageBg />
      <div style={{ position: "relative", zIndex: 1, background: C.white, borderRadius: 24, padding: "28px 24px", width: "100%", maxWidth: 480, boxShadow: "0 40px 100px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔐</div>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: C.ink, margin: "0 0 8px" }}>Confirme com seu banco</h3>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>Seu banco está pedindo uma confirmação de segurança. Autorize pelo app ou insira o código enviado.</p>
        </div>
        <iframe name="mp-3ds-frame" title="Autenticação 3DS" style={{ width: "100%", height: 420, border: `1px solid ${C.border}`, borderRadius: 14, display: "block" }} />
        <form ref={formRef} action={challenge.external_resource_url} method="post" target="mp-3ds-frame" style={{ display: "none" }}>
          <input type="hidden" name="creq" value={challenge.creq} />
        </form>
        {polling && <p style={{ textAlign: "center", fontSize: 12, color: C.muted, marginTop: 14 }}>⏳ Aguardando confirmação do banco...</p>}
        <button onClick={() => { setChallenge(null); setErro(""); }} style={{ width: "100%", marginTop: 14, padding: "12px", background: "none", border: `1px solid ${C.border}`, borderRadius: 12, color: C.muted, cursor: "pointer", fontSize: 13 }}>
          Cancelar
        </button>
      </div>
    </div>
  );

  // ── Formulário de cartão ───────────────────────────────────────────────────
  const inp: React.CSSProperties = { width: "100%", padding: "13px 14px", border: `1.5px solid ${C.border}`, borderRadius: 11, fontSize: 15, color: C.ink, outline: "none", background: C.white, boxSizing: "border-box" };
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px", position: "relative" }}>
      <PageBg />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440, background: C.white, borderRadius: 24, border: `1.5px solid ${C.border}`, boxShadow: "0 40px 100px rgba(0,0,0,0.45)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: C.black, padding: "18px 22px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onVoltar} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9, width: 32, height: 32, cursor: "pointer", color: C.white, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: instColor(inst).bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{inst.emoji}</div>
          <div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 1 }}>Pagamento com cartão</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: C.white }}>{inst.nome}</p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: cor }}>R$ {valorTotal.toFixed(2).replace(".", ",")}</p>
          </div>
        </div>

        <div style={{ padding: "24px 24px 28px" }}>

          {/* Crédito / Débito */}
          <p style={lbl}>Tipo do cartão</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
            {(["credito", "debito"] as const).map(tipo => {
              const ativo = tipoCartao === tipo;
              return (
                <button key={tipo} onClick={() => { setTipo(tipo); setErro(""); }}
                  style={{ flex: 1, padding: "14px 10px", borderRadius: 12, cursor: "pointer",
                    border: `2px solid ${ativo ? C.blue : C.border}`,
                    background: ativo ? C.blueL : C.offWhite, transition: "all 0.15s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 24 }}>{tipo === "credito" ? "💳" : "🏧"}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: ativo ? C.blue : C.ink }}>
                    {tipo === "credito" ? "Crédito" : "Débito"}
                  </span>
                </button>
              );
            })}
          </div>

          {tipoCartao && (<>
            {/* Número do cartão */}
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Número do cartão {brand && <span style={{ fontSize: 10, background: C.blueL, color: C.blue, padding: "2px 8px", borderRadius: 6, marginLeft: 6, fontWeight: 700, letterSpacing: 1 }}>{brand.toUpperCase()}</span>}</label>
              <input style={inp} placeholder="0000 0000 0000 0000" inputMode="numeric" value={numero}
                onChange={e => setNumero(fmtNumero(e.target.value))} maxLength={19} />
            </div>

            {/* Nome no cartão */}
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Nome igual no cartão</label>
              <input style={inp} placeholder="NOME SOBRENOME" value={nome}
                onChange={e => setNome(e.target.value.toUpperCase())} />
            </div>

            {/* Validade + CVV */}
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={lbl}>Validade</label>
                <input style={inp} placeholder="MM/AA" inputMode="numeric" value={validade}
                  onChange={e => setValidade(fmtValidade(e.target.value))} maxLength={5} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={lbl}>CVV</label>
                <input style={inp} placeholder="123" inputMode="numeric" value={cvv}
                  onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} maxLength={4} type="password" />
              </div>
            </div>

            {/* CPF do titular */}
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>CPF do titular do cartão</label>
              <input style={inp} placeholder="000.000.000-00" inputMode="numeric" value={cpf}
                onChange={e => setCpf(fmtCpf(e.target.value))} maxLength={14} />
            </div>

            {/* Aviso 3DS */}
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "11px 14px", marginBottom: 18, display: "flex", gap: 10 }}>
              <span style={{ fontSize: 16 }}>🔐</span>
              <p style={{ fontSize: 12, color: "#15803d", lineHeight: 1.5 }}>Se seu banco pedir confirmação, um código ou notificação será enviado para você autorizar.</p>
            </div>
          </>)}

          {erro && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 14px", marginBottom: 16, color: "#dc2626", fontSize: 13 }}>
              ⚠️ {erro}
            </div>
          )}

          <button onClick={handlePagar}
            disabled={!tipoCartao || !numero || !nome || !validade || !cvv || !cpf || loading || !sdkReady}
            style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none",
              cursor: "pointer", fontSize: 15, fontWeight: 700, color: C.white,
              background: (!tipoCartao || !numero || !nome || !validade || !cvv || !cpf || loading || !sdkReady) ? C.muted : C.black }}>
            {!sdkReady ? "Carregando..." : loading ? "⏳ Processando..." : tipoCartao ? "Pagar agora →" : "Selecione o tipo do cartão"}
          </button>

          <p style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
            {qtd} {qtd === 1 ? "pessoa" : "pessoas"} · {inst.tipo} via {inst.nome}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── TELA PIX QR CODE ─────────────────────────────────────────────────────────
function TelaPixQrCode({ inst, qtd, doacaoId, pixData, onPago, onNova }: {
  inst: Instituicao; qtd: number; doacaoId: number; pixData: MpPixResponse;
  onPago: () => void; onNova: () => void;
}) {
  const { cor, bg } = instColor(inst);
  const [copiado, setCopiado] = useState(false);
  const [pago, setPago]       = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

  // Polling — verifica a cada 5s se o pagamento foi confirmado
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/doacoes/${doacaoId}/status`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const data = await res.json();
        if (data.pago) {
          setPago(true);
          clearInterval(interval);
          setTimeout(onPago, 2000); // aguarda 2s na tela de sucesso antes de redirecionar
        }
      } catch { /* ignora erros de rede */ }
    }, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doacaoId]);

  const copiar = () => {
    navigator.clipboard.writeText(pixData.pixCopiaECola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px", position: "relative" }}>
      <PageBg />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440, background: C.white, borderRadius: 24, border: `1.5px solid ${C.border}`, boxShadow: "0 40px 100px rgba(0,0,0,0.45)", padding: "32px 28px", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, display: "flex" }}>
          <div style={{ flex: 1, background: "#32BCAD" }}/><div style={{ flex: 1, background: C.orange }}/><div style={{ flex: 1, background: C.black }}/>
        </div>

        <div style={{ textAlign: "center", marginBottom: 24, marginTop: 8 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#32BCAD18", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 28 }}>⚡</div>
          <p style={{ fontSize: 10, letterSpacing: 3, color: "#32BCAD", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Pix gerado</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Escaneie o QR Code</h2>
          <p style={{ fontSize: 13, color: C.muted }}>ou copie o código abaixo</p>
        </div>

        {/* QR Code */}
        {pixData.qrCodeBase64 ? (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pixData.qrCodeBase64} alt="QR Code Pix" width={200} height={200} style={{ borderRadius: 12, border: `2px solid ${C.border}` }} />
          </div>
        ) : (
          <div style={{ width: 200, height: 200, margin: "0 auto 20px", background: C.offWhite, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>📷</div>
        )}

        {/* Valor */}
        <div style={{ background: C.black, borderRadius: 12, padding: "12px 16px", marginBottom: 14, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>Valor da doação</p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 800, color: cor }}>R$ {pixData.valorTotal.toFixed(2).replace(".", ",")}</p>
        </div>

        {/* Copia e cola */}
        <div style={{ background: bg, border: `1.5px solid ${cor}30`, borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
          <p style={{ fontSize: 10, color: cor, fontWeight: 700, marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>Pix Copia e Cola</p>
          <p style={{ fontSize: 11, color: C.ink, wordBreak: "break-all", lineHeight: 1.5, marginBottom: 10, fontFamily: "monospace" }}>
            {pixData.pixCopiaECola.slice(0, 80)}...
          </p>
          <button onClick={copiar} style={{
            width: "100%", padding: "10px", borderRadius: 10,
            background: copiado ? "#32BCAD" : C.white,
            border: `1.5px solid ${copiado ? "#32BCAD" : cor}`,
            color: copiado ? C.white : cor, fontSize: 13, fontWeight: 700, cursor: "pointer",
            transition: "all 0.2s",
          }}>
            {copiado ? "✓ Copiado!" : "📋 Copiar código Pix"}
          </button>
        </div>

        <p style={{ fontSize: 12, color: C.muted, textAlign: "center", marginBottom: 16, lineHeight: 1.6 }}>
          Após o pagamento, a confirmação é automática.<br/>
          <strong>{qtd} {qtd === 1 ? "pessoa" : "pessoas"}</strong> com {inst.tipo} via <strong>{inst.nome}</strong>
        </p>

        <button onClick={onNova} style={{ width: "100%", padding: "13px", borderRadius: 12, background: "none", border: `2px solid ${C.border}`, color: C.ink, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Fazer outra doação
        </button>
      </div>
    </div>
  );
}

// ── TELA CONFIRMADO ───────────────────────────────────────────────────────────
function TelaConfirmado({ inst, qtd, pixData, viaMp, onNova }: {
  inst: Instituicao | null; qtd: number; pixData: PostDoacaoResponse | null; viaMp?: boolean; onNova: () => void;
}) {
  const cor  = inst ? instColor(inst).cor : C.blue;
  const bg   = inst ? instColor(inst).bg  : C.blueL;
  const [copiado, setCopiado] = useState(false);

  const copiar = () => {
    navigator.clipboard.writeText(pixData?.pixKey ?? "");
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px", position: "relative" }}>
      <PageBg />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440, background: C.white, borderRadius: 24, border: `1.5px solid ${C.border}`, boxShadow: "0 40px 100px rgba(0,0,0,0.45), 0 8px 24px rgba(0,13,255,0.12)", padding: "36px 30px", textAlign: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, display: "flex" }}>
          <div style={{ flex: 1, background: C.blue }}/><div style={{ flex: 1, background: C.orange }}/><div style={{ flex: 1, background: C.black }}/>
        </div>
        <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.black, display: "flex", alignItems: "center", justifyContent: "center", margin: "10px auto 22px", fontSize: 28, boxShadow: `0 12px 32px rgba(0,0,0,0.35)` }}>✓</div>
        <p style={{ fontSize: 10, letterSpacing: 3, color: C.orange, textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>
          {viaMp ? "Pagamento aprovado!" : "Doação registrada"}
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 700, color: C.ink, lineHeight: 1.25, marginBottom: 10 }}>
          Que Deus abençoe<br />sua generosidade!
        </h2>
        {inst && (
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 24, lineHeight: 1.8 }}>
            <strong style={{ color: C.ink }}>{qtd} {qtd === 1 ? "pessoa" : "pessoas"}</strong> com{" "}
            <strong style={{ color: C.ink }}>{inst.tipo}</strong> via{" "}
            <strong style={{ color: C.ink }}>{inst.nome}</strong>
          </p>
        )}

        {pixData && (
          <>
            <div style={{ background: C.black, borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Valor da doação</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 800, color: cor }}>
                R$ {pixData.valorTotal.toFixed(2).replace(".", ",")}
              </p>
            </div>

          </>
        )}

        {viaMp && (
          <div style={{ background: "#e6f7ee", border: "1px solid #00a65033", borderRadius: 14, padding: "14px 18px", marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: "#00a650", fontWeight: 600 }}>✓ Pagamento confirmado pelo Mercado Pago</p>
            <p style={{ fontSize: 12, color: "#00a650", marginTop: 4, opacity: 0.8 }}>O dinheiro chegará diretamente à instituição.</p>
          </div>
        )}

        <button onClick={onNova} style={{ width: "100%", padding: "14px", borderRadius: 12, background: "none", border: `2px solid ${C.border}`, color: C.ink, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Fazer outra doação
        </button>
      </div>
    </div>
  );
}

// ── ROOT (inner — precisa de Suspense por causa do useSearchParams) ───────────
function DoacaoPageInner() {
  const params = useSearchParams();
  const statusMp  = params.get("status");
  const idMpStr   = params.get("id");
  const tagSerial = params.get("tag") || undefined;  // serial da tag GS-HB25-... (via QR)

  const [etapa, setEtapa]         = useState<Etapa>(
    statusMp === "sucesso" || statusMp === "pendente" ? "confirmado" : "escolha"
  );
  const [escolhida, setEscolhida] = useState<Instituicao | null>(null);
  const [qtd, setQtd]             = useState(1);
  const [pixData, setPixData]     = useState<PostDoacaoResponse | null>(null);
  const [pixMpData, setPixMpData]   = useState<MpPixResponse | null>(null);
  const [cartaoDoacaoId, setCartaoDoacaoId] = useState<number | null>(null);
  const [cartaoValor, setCartaoValor]       = useState(0);
  const [loading, setLoading]     = useState(false);
  const [erro, setErro]           = useState(statusMp === "falha" ? "O pagamento foi cancelado ou falhou. Tente novamente." : "");
  // serial auto-gerado quando não veio pela URL
  const [autoSerial, setAutoSerial] = useState<string | undefined>(undefined);
  const viaMp = statusMp === "sucesso";

  // Ao entrar na tela de pagamento sem tag na URL → gera serial automaticamente
  useEffect(() => {
    if (tagSerial || etapa !== "pagamento" || autoSerial) return;
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
    fetch(`${API}/api/tags/gerar-unico`, { method: "POST", headers: { "ngrok-skip-browser-warning": "true" } })
      .then(r => r.json())
      .then(d => { if (d.serial) setAutoSerial(d.serial); })
      .catch(() => {}); // falha silenciosa — serial é opcional
  }, [etapa, tagSerial, autoSerial]);

  // serial efetivo: o do QR tem prioridade, senão usa o auto-gerado
  const serialEfetivo = tagSerial || autoSerial;

  const [erroCodigo, setErroCodigo] = useState<string | null>(null);

  const handleConfirmar = async (quantidade: number, nome: string, email: string, telefone: string, metodo: "pix" | "cartao") => {
    if (!escolhida) return;
    setLoading(true);
    setErro("");
    setErroCodigo(null);
    try {
      const data = await postDoacao({
        doadorNome: nome,
        doadorEmail: email || undefined,
        doadorTel: telefone || undefined,
        tagSerial: serialEfetivo,
        instituicaoId: escolhida.id,
        quantidade,
      });
      setQtd(quantidade);
      setPixData(data);

      if (metodo === "pix") {
        const pix = await criarPixMp(data.doacaoId);
        setPixMpData(pix);
        setEtapa("pixqr");
      } else {
        // Cartão: abre o Checkout Transparente (TelaCartaoBrick). Desde que
        // a gente corrigiu issuer_id, additional_info.items completo, payer
        // com email/nome reais e passou a chamar /v1/payments via fetch
        // direto (o SDK strippava additional_info), o fluxo deve aguentar.
        setCartaoDoacaoId(data.doacaoId);
        setCartaoValor(data.valorTotal);
        setEtapa("cartaobrick");
      }
    } catch (e: any) {
      setErroCodigo(e.codigo || null);
      setErro(e.message || "Erro ao registrar doação");
    } finally {
      setLoading(false);
    }
  };

  const resetar = () => {
    setEtapa("escolha"); setEscolhida(null); setQtd(1); setPixData(null); setPixMpData(null); setCartaoDoacaoId(null); setErro("");
    window.history.replaceState({}, "", "/doacao");
  };

  if (etapa === "cartaobrick" && escolhida && cartaoDoacaoId)
    return <TelaCartaoBrick inst={escolhida} qtd={qtd} doacaoId={cartaoDoacaoId} valorTotal={cartaoValor} onSucesso={() => setEtapa("confirmado")} onVoltar={() => setEtapa("pagamento")} />;

  if (etapa === "pixqr" && escolhida && pixMpData && pixData)
    return <TelaPixQrCode inst={escolhida} qtd={qtd} doacaoId={pixData.doacaoId} pixData={pixMpData} onPago={() => setEtapa("confirmado")} onNova={resetar} />;

  if (etapa === "confirmado")
    return <TelaConfirmado inst={escolhida} qtd={qtd} pixData={pixData} viaMp={viaMp} onNova={resetar} />;

  if (etapa === "pagamento" && escolhida)
    return (
      <>
        {/* Modal: conta sem chave PIX */}
        {erroCodigo === "SEM_CHAVE_PIX" && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 10 }}>PIX não disponível nesta instituição</h2>
              <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 20 }}>
                A conta do Mercado Pago desta instituição ainda não tem uma <strong>chave PIX cadastrada</strong>.
                O responsável precisa acessar o Mercado Pago e ativar o PIX antes de aceitar doações.
              </p>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 24 }}>
                Caminho: mercadopago.com.br → Configurações → Meios de pagamento → PIX
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button onClick={() => { setErroCodigo(null); setErro(""); }}
                  style={{ background: C.blue, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Tentar cartão
                </button>
                <button onClick={() => { setErroCodigo(null); setErro(""); setEtapa("escolha"); }}
                  style={{ background: "#f0f0f0", color: "#333", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  Voltar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Toast erro genérico */}
        {erro && erroCodigo !== "SEM_CHAVE_PIX" && (
          <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#ff4444", color: "#fff", padding: "10px 20px", borderRadius: 10, zIndex: 999, fontSize: 13 }}>{erro}</div>
        )}
        {loading && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 998, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, border: "4px solid rgba(255,255,255,0.15)", borderTop: `4px solid ${C.blue}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
            <p style={{ color: "#fff", fontSize: 14 }}>Gerando pagamento...</p>
          </div>
        )}
        <TelaPagamento inst={escolhida} tagSerial={tagSerial} autoSerial={autoSerial} onConfirmar={handleConfirmar} onVoltar={() => setEtapa("escolha")} />
      </>
    );

  return <TelaEscolha onEscolher={(i) => { setEscolhida(i); setEtapa("pagamento"); }} />;
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function DoacaoPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>Carregando...</div>}>
      <DoacaoPageInner />
    </Suspense>
  );
}
