"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getMpConnectInfo } from "@/lib/api";

const C = {
  black:   "#000000",
  blue:    "#009EE3", // cor oficial MP
  blueL:   "#e6f6fd",
  orange:  "#FF4E00",
  white:   "#FFFFFF",
  offWhite:"#f8f8f8",
  border:  "#e8e8e8",
  ink:     "#111111",
  muted:   "#777777",
  green:   "#00a650",
  greenL:  "#e6f7ee",
  red:     "#c00",
  redL:    "#fdeaea",
};

function ConectarMPContent() {
  const params = useSearchParams();
  const token   = params.get("token");
  const sucesso  = params.get("sucesso");
  const instName = params.get("inst");
  const erro     = params.get("erro");

  const [info, setInfo]       = useState<{ instituicaoNome: string; instituicaoEmoji: string; authUrl: string; jaConectado: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [erroInfo, setErroInfo] = useState("");

  useEffect(() => {
    if (!token || sucesso || erro) { setLoading(false); return; }
    getMpConnectInfo(token)
      .then(setInfo)
      .catch(e => setErroInfo(e.message || "Link inválido ou expirado"))
      .finally(() => setLoading(false));
  }, [token, sucesso, erro]);

  const ERROS: Record<string, string> = {
    "parametros-invalidos": "Parâmetros inválidos na resposta do Mercado Pago.",
    "link-invalido":        "Este link é inválido ou já foi utilizado.",
    "falha-autorizacao":    "Falha ao autorizar com o Mercado Pago. Tente novamente.",
    "erro-interno":         "Erro interno. Entre em contato com o administrador.",
  };

  // ── Tela de sucesso ────────────────────────────────────────────────────────
  if (sucesso) return (
    <Screen>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>✓</div>
        <span style={{ fontSize: 11, color: C.green, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>Conta vinculada!</span>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: C.ink, margin: "10px 0 12px" }}>
          Tudo pronto, {decodeURIComponent(instName ?? "")}!
        </h2>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 28 }}>
          Sua conta do Mercado Pago foi vinculada com sucesso.<br />
          A partir de agora, as doações via Pix e cartão chegam direto para vocês!
        </p>
        <div style={{ background: C.greenL, border: `1px solid ${C.green}33`, borderRadius: 14, padding: "16px 20px", textAlign: "left" }}>
          {["Doações via Pix chegam na hora", "Pagamentos com cartão em até 2 dias úteis", "Acompanhe tudo no painel Mercado Pago"].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.white, flexShrink: 0 }}>✓</div>
              <p style={{ fontSize: 13, color: C.green, fontWeight: 500 }}>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );

  // ── Tela de erro ──────────────────────────────────────────────────────────
  if (erro) return (
    <Screen>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.redL, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>✕</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: C.ink, margin: "0 0 12px" }}>Ocorreu um erro</h2>
        <p style={{ fontSize: 14, color: C.red, lineHeight: 1.7 }}>{ERROS[erro] ?? "Erro desconhecido. Entre em contato com o administrador."}</p>
      </div>
    </Screen>
  );

  // ── Carregando ─────────────────────────────────────────────────────────────
  if (loading) return (
    <Screen>
      <div style={{ textAlign: "center", color: C.muted, padding: "40px 0" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
        <p>Verificando link...</p>
      </div>
    </Screen>
  );

  // ── Token inválido ─────────────────────────────────────────────────────────
  if (erroInfo || !info) return (
    <Screen>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 10 }}>Link inválido</h2>
        <p style={{ fontSize: 14, color: C.muted }}>{erroInfo || "Este link não existe ou já foi utilizado."}</p>
      </div>
    </Screen>
  );

  // ── Já conectado ──────────────────────────────────────────────────────────
  if (info.jaConectado) return (
    <Screen>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{info.instituicaoEmoji}</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 10 }}>{info.instituicaoNome}</h2>
        <div style={{ background: C.greenL, border: `1px solid ${C.green}33`, borderRadius: 12, padding: "14px 18px", marginTop: 16 }}>
          <p style={{ fontSize: 14, color: C.green, fontWeight: 600 }}>✓ Conta Mercado Pago já vinculada</p>
          <p style={{ fontSize: 12, color: C.green, marginTop: 4, opacity: 0.8 }}>Se precisar reconectar, solicite um novo link ao administrador.</p>
        </div>
      </div>
    </Screen>
  );

  // ── Tela principal: vincular conta ────────────────────────────────────────
  return (
    <Screen>
      {/* logo MP */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{info.instituicaoEmoji}</div>
        <span style={{ fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>Vinculação de conta</span>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.ink, marginTop: 8 }}>{info.instituicaoNome}</h2>
      </div>

      <div style={{ background: C.blueL, border: `1px solid ${C.blue}33`, borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.blue, marginBottom: 8 }}>O que vai acontecer?</p>
        {[
          "Você será redirecionado ao Mercado Pago",
          "Faça login com a conta da sua instituição",
          "Autorize o Humanity Bearers a processar cobranças",
          "As doações chegam direto na sua conta!",
        ].map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < 3 ? 8 : 0 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.blue, color: C.white, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
            <p style={{ fontSize: 13, color: C.blue }}>{step}</p>
          </div>
        ))}
      </div>

      <div style={{ background: C.offWhite, borderRadius: 12, padding: "12px 16px", marginBottom: 24, display: "flex", gap: 10 }}>
        <span style={{ fontSize: 18 }}>🔒</span>
        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
          Seus dados são protegidos pelo Mercado Pago. O Humanity Bearers nunca tem acesso à sua senha nem ao saldo da sua conta.
        </p>
      </div>

      <a href={info.authUrl} style={{ display: "block", width: "100%", background: C.blue, color: C.white, border: "none", borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 700, cursor: "pointer", textDecoration: "none", textAlign: "center", boxShadow: `0 8px 24px ${C.blue}44` }}>
        Conectar minha conta Mercado Pago →
      </a>

      <p style={{ textAlign: "center", fontSize: 11, color: C.muted, marginTop: 14 }}>
        Powered by <strong>Mercado Pago</strong> · Pagamentos seguros
      </p>
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f4", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
      <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #e8e8e8", padding: "36px 32px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}>
        {/* header Humanity Bearers */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ position: "relative", width: 18, height: 18 }}>
            <div style={{ position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)", width: 2.5, height: 18, background: "#FF4E00", borderRadius: 2 }}/>
            <div style={{ position: "absolute", top: "34%", left: 0, width: 18, height: 2.5, background: "#FF4E00", borderRadius: 2 }}/>
          </div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700, color: "#111" }}>Humanity Bearers</span>
          <span style={{ fontSize: 11, color: "#999", marginLeft: 4 }}>× Mercado Pago</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ConectarMP() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Carregando...</div>}>
      <ConectarMPContent />
    </Suspense>
  );
}
