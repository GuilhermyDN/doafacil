"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type Instituicao } from "@/lib/data";
import { getInstituicoes } from "@/lib/api";

function UrsinhoSVG({ size = 22 }: { size?: number }) {
  return (
    <img src="/ursinho.png" alt="Ursinho Humanity Bearers" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />
  );
}

const C = {
  black:   "#000000",
  blue:    "#000DFF",
  blueL:   "#e0e4ff",
  orange:  "#FF4E00",
  orangeL: "#fff0eb",
  white:   "#FFFFFF",
  offWhite:"#f6f6f6",
  border:  "#e8e8e8",
  ink:     "#111111",
  muted:   "#777777",
};

const instColor = (tipo: string) =>
  tipo === "Refeicao" ? { cor: C.blue,   bg: C.blueL   }
  : tipo === "Banho"  ? { cor: C.orange,  bg: C.orangeL }
  :                     { cor: "#6600cc", bg: "#f0e8ff" };

function Icon({ d, size = 20, color = "currentColor" }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// Card compacto usado na composição "Humanity Bearer" do hero. Usado
// para o ecossistema "Pessoas" (sem imagem própria ainda — usa emoji).
function EcoCard({ label, subtitle, emoji, cor }: { label: string; subtitle: string; emoji: string; cor: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "14px 10px", width: 110, textAlign: "center", boxShadow: "0 10px 28px rgba(0,0,0,0.3)" }}>
      <div style={{ fontSize: 56, height: 64, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>{emoji}</div>
      <p style={{ fontSize: 11, fontWeight: 800, color: cor, textTransform: "uppercase", letterSpacing: 1 }}>{label}</p>
      <p style={{ fontSize: 10, color: "#777", marginTop: 2 }}>{subtitle}</p>
    </div>
  );
}

const I = {
  arrow:  "M5 12h14M12 5l7 7-7 7",
  check:  "M20 6L9 17l-5-5",
  heart:  "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  star:   "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  users:  "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  pix:    "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  trophy: "M8 21h8M12 17v4M7 4H4a1 1 0 00-1 1v3c0 3.31 2.69 6 6 6s6-2.69 6-6V5a1 1 0 00-1-1h-3M17 4h3a1 1 0 011 1v3c0 3.31-2.69 6-6 6",
};

export default function HomePage() {
  const router = useRouter();
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [hoveredInst, setHoveredInst] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getInstituicoes().then(setInstituicoes).catch(() => {});
  }, []);

  const COMO_FUNCIONA = [
    { n: "01", titulo: "Escolha onde sua humanidade vai bater", desc: "Refeição e banho a pessoas, cuidado animal, plantar árvores. Ou bate geral.", emoji: "🎯", cor: C.blue },
    { n: "02", titulo: "Defina o peso da sua humanidade", desc: "Quantas vidas você vai impactar hoje? Aqui você decide o nível.", emoji: "🤝", cor: C.orange },
    { n: "03", titulo: "Ative sua humanidade", desc: "Pix instantâneo. Impacto direto. Sem desculpa. Papo reto.", emoji: "⚡", cor: "#6600cc" },
  ];

  // "POR QUE ISSO É DIFERENTE?" — 6 pilares da plataforma. POSICIONAMENTO
  // abre a seção com o manifesto; os outros 5 são atributos.
  const VALORES = [
    { icon: I.trophy, titulo: "POSICIONAMENTO", sub: "Humanidade como atitude", desc: "Isso não é sobre doar. É sobre se posicionar. Ou você escolhe gerar humanidade… ou continua só assistindo.", cor: "#6600cc" },
    { icon: I.pix,    titulo: "DIRETO AO PONTO (PIX)", sub: "Humanidade sem intermediário", desc: "O caminho é simples: você e quem precisa. Sem sistema no meio, sem ninguém lucrando com a humanidade. Pix direto. Impacto imediato. Do seu gesto até o destino final.", cor: C.blue },
    { icon: I.users,  titulo: "COMUNIDADE", sub: "Humanidade em movimento", desc: "Você não está sozinho. Está dentro de um movimento de pessoas que decidiram agir. Quando mais gente entra, mais a humanidade se multiplica. Isso aqui cresce em rede.", cor: C.orange },
    { icon: I.shield, titulo: "TRANSPARÊNCIA", sub: "Humanidade transparente", desc: "Aqui, tudo que você faz vira registro. Sem maquiagem, sem narrativa forçada. Cada ação gera humanidade visível, rastreável e comprovada. Você vê, acompanha e sabe exatamente onde sua humanidade chegou.", cor: C.blue },
    { icon: I.heart,  titulo: "IMPACTO", sub: "Humanidade real", desc: "Nada de promessa bonita ou intenção vazia. Aqui, humanidade vira impacto direto na vida de alguém. Você age — e a humanidade acontece. Sem intermediário, sem desvio, sem delay.", cor: C.orange },
    { icon: I.star,   titulo: "GAMIFICAÇÃO", sub: "Humanidade que evolui", desc: "Aqui, fazer o bem não passa despercebido. Sua humanidade ganha forma, nível e reconhecimento. Cada ação soma. Cada impacto conta. Você evolui enquanto gera humanidade no mundo.", cor: "#6600cc" },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .float { animation: float 4s ease-in-out infinite; }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .inst-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,13,255,0.15) !important; }
        .inst-card { transition: all 0.2s ease; }
        .nav-link { color: rgba(255,255,255,0.55); text-decoration: none; font-size: 13px; font-weight: 500; transition: color 0.15s; }
        .nav-link:hover { color: white; }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .show-mobile { display: flex !important; }
          .hide-mobile { display: none !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <UrsinhoSVG size={28} />
            <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, fontWeight: 700, color: C.white }}>Humanity Bearers</span>
          </div>
          {/* links desktop */}
          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a href="/nossa-historia" className="nav-link">Nossa história</a>
            <a href="#como-funciona" className="nav-link">Como funciona</a>
            <a href="#instituicoes" className="nav-link">Instituições</a>
            <a href="/missoes" className="nav-link">🎯 Missões</a>
            <a href="/pedido-patch" className="nav-link">🎖️ Meu Perfil</a>
            <a href="/admin" className="nav-link">Admin</a>
          </div>
          {/* CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => router.push("/doacao")} style={{ background: C.orange, color: C.white, border: "none", borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
              JÁ É →
            </button>
            <button onClick={() => setMenuOpen(o => !o)} className="show-mobile" style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, width: 36, height: 36, cursor: "pointer", color: C.white, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
        {/* mobile menu */}
        {menuOpen && (
          <div className="show-mobile" style={{ flexDirection: "column", background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px", gap: 16 }}>
            {["#quem-somos","#como-funciona","#instituicoes"].map((h, i) => (
              <a key={i} href={h} onClick={() => setMenuOpen(false)} style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
                {["Quem somos","Como funciona","Instituições"][i]}
              </a>
            ))}
            <a href="/missoes" onClick={() => setMenuOpen(false)} style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>🎯 Missões</a>
            <a href="/pedido-patch" onClick={() => setMenuOpen(false)} style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>🎖️ Meu Perfil</a>
            <a href="/admin" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none" }}>Admin</a>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: C.black, minHeight: "92vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "60px 24px" }}>
        {/* bg decoration */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {/* Watermark GRANDE do rosto do ursinho — só metade aparece (canto inf. direito) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ursinho-rosto.jpg" alt="" style={{
            position: "absolute",
            right: "-18%",
            bottom: "-22%",
            width: "min(95vmin, 720px)",
            opacity: 0.08,
            mixBlendMode: "screen",
            userSelect: "none",
          }}/>
          <div style={{ position: "absolute", top: "20%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: C.blue, opacity: 0.07, filter: "blur(80px)" }}/>
          <div style={{ position: "absolute", bottom: "15%", right: "15%", width: 280, height: 280, borderRadius: "50%", background: C.orange, opacity: 0.08, filter: "blur(80px)" }}/>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, display: "flex" }}>
            <div style={{ flex: 1, background: C.blue }}/><div style={{ flex: 1, background: C.orange }}/><div style={{ flex: 1, background: "rgba(255,255,255,0.15)" }}/>
          </div>
        </div>

        <div className="hero-grid" style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 60, alignItems: "center", position: "relative", zIndex: 1 }}>
          {/* text */}
          <div className="fade-up">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,78,0,0.12)", border: "1px solid rgba(255,78,0,0.25)", borderRadius: 99, padding: "5px 14px", marginBottom: 24 }}>
              <span style={{ fontSize: 12, color: C.orange, fontWeight: 700, letterSpacing: 2, textTransform: "lowercase", fontFamily: "monospace" }}>scan•connect•impact</span>
            </div>

            <h1 style={{ fontFamily: "var(--font-spray), 'Permanent Marker', cursive", fontWeight: 400, lineHeight: 1, marginBottom: 28, letterSpacing: 2 }}>
              <span style={{ fontSize: "clamp(42px,7vw,82px)", color: C.white, display: "block" }}>A HUMANIDADE</span>
              <span style={{ fontSize: "clamp(30px,5vw,58px)", color: C.orange, display: "block", fontFamily: "var(--font-marker), cursive" }}>não é discurso</span>
              <span style={{ fontSize: "clamp(42px,7vw,82px)", color: C.white, display: "block" }}>é AÇÃO</span>
            </h1>

            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.62)", lineHeight: 1.8, marginBottom: 32, maxWidth: 480 }}>
              Que nenhuma vida seja ignorada — nem nas ruas, nem na natureza, nem no silêncio dos que
              não têm voz. Aqui, a gente age com <strong style={{ color: C.white }}>humanidade</strong>:
              transformando intenção em impacto real — dignidade pra pessoas, cuidado com animais e
              regeneração das árvores. Tudo é um só sistema, onde tudo pulsa, tudo vive. Não é só
              ajudar — é <strong style={{ color: C.orange }}>ativar a humanidade</strong>.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => router.push("/doacao")} style={{ background: C.orange, color: C.white, border: "none", borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: `0 12px 32px ${C.orange}44` }}>
                Gera humanidade agora <Icon d={I.arrow} size={16} color={C.white}/>
              </button>
              <a href="#quem-somos" style={{ background: "rgba(255,255,255,0.06)", color: C.white, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 500, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center" }}>
                Pega a visão
              </a>
            </div>
            {/* trust badges */}
            <div style={{ display: "flex", gap: 20, marginTop: 36, flexWrap: "wrap" }}>
              {[["✓ Pix direto","para a humanidade"],["🔒 100% transparente","prestação pública"],["🏆 Ranking","de Bearers"]].map(([t, s], i) => (
                <div key={i}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.white }}>{t}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Composição Humanity Bearer — o ursinho "mascote" com os
              ecossistemas que ele carrega (pessoas, animais, árvores).
              Esconde no mobile porque o layout do hero vira coluna e a
              composição fica grande demais. */}
          <div className="hide-mobile" style={{ position: "relative", minHeight: 460, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
            {/* rosto ursinho grande no topo */}
            <div style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ursinho-rosto.jpg" alt="Humanity Bearer" className="float" style={{
                width: 220, height: 220, objectFit: "contain",
                background: "#fff", borderRadius: 24,
                boxShadow: `0 20px 60px ${C.orange}55`,
                border: `3px solid ${C.orange}44`,
              }}/>
              <span style={{
                position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)",
                background: C.white, color: C.black,
                fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 800, fontSize: 16,
                padding: "6px 16px", borderRadius: 99, whiteSpace: "nowrap",
                boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
              }}>
                Humanity Bearer<sup style={{ fontSize: 9 }}>™</sup>
              </span>
            </div>

            {/* 3 ecossistemas: pessoas (bowl), animais, árvores */}
            <div style={{ display: "flex", gap: 12, marginTop: 18, alignItems: "flex-end" }}>
              <EcoCard
                label="Pessoas"
                subtitle="Refeição + Banho"
                emoji="🍲"
                cor={C.blue}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "14px 10px", width: 110, textAlign: "center", boxShadow: "0 10px 28px rgba(0,0,0,0.3)" }}>
                <img src="/hb-animais.jpg" alt="Animais" style={{ width: "100%", height: 64, objectFit: "contain", marginBottom: 6 }} />
                <p style={{ fontSize: 11, fontWeight: 800, color: C.orange, textTransform: "uppercase", letterSpacing: 1 }}>Animais</p>
                <p style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Abandonados</p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "14px 10px", width: 110, textAlign: "center", boxShadow: "0 10px 28px rgba(0,0,0,0.3)" }}>
                <img src="/hb-arvore.jpg" alt="Árvores" style={{ width: "100%", height: 64, objectFit: "contain", marginBottom: 6 }} />
                <p style={{ fontSize: 11, fontWeight: 800, color: "#22c55e", textTransform: "uppercase", letterSpacing: 1 }}>Árvores</p>
                <p style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Regeneração</p>
              </div>
            </div>

            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 3, fontFamily: "monospace", textTransform: "uppercase", marginTop: 8 }}>
              SCAN • CONNECT • IMPACT
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: C.blue, padding: "20px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "center", gap: "clamp(24px,5vw,80px)", flexWrap: "wrap" }}>
          {[
            { v: `${instituicoes.length}`, label: "Instituições ativas" },
            { v: "100%", label: "Transparência" },
            { v: "Pix", label: "Pagamento direto" },
            { v: "0%", label: "Taxa de intermediação" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(22px,3vw,32px)", fontWeight: 800, color: C.white }}>{s.v}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", letterSpacing: 1, textTransform: "uppercase", fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUEM SOMOS ── "Isso aqui não é uma ONG" + ONE HEALTH */}
      <section id="quem-somos" style={{ background: C.white, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ fontSize: 11, color: C.orange, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>Nossa história</span>
            <h2 style={{ fontFamily: "var(--font-spray), 'Permanent Marker', cursive", fontSize: "clamp(34px,5.5vw,64px)", fontWeight: 400, color: C.ink, marginTop: 10, lineHeight: 1.1, letterSpacing: 1 }}>
              Isso aqui não é uma ONG
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 40, alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.9, marginBottom: 18 }}>
                É um novo comportamento.<br/>Um novo tipo de pessoa.
              </p>
              <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.9, marginBottom: 18 }}>
                Gente que não fala sobre humanidade — <strong style={{ color: C.ink }}>pratica</strong>.<br/>
                Gente que não assiste — <strong style={{ color: C.ink }}>entra no jogo</strong>.
              </p>
              <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.9, marginBottom: 28 }}>
                <strong style={{ color: C.ink }}>Humanity Bearers</strong> é para quem decidiu carregar humanidade como a segunda pele.
              </p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ background: C.offWhite, borderRadius: 12, padding: "14px 18px", border: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>Fundada em</p>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.ink, marginTop: 4 }}>2026</p>
                </div>
                <a href="/nossa-historia" style={{ fontSize: 13, fontWeight: 700, color: C.orange, textDecoration: "none", border: `2px solid ${C.orange}`, padding: "12px 18px", borderRadius: 12 }}>
                  Qual é o rolê aqui? →
                </a>
              </div>
            </div>
            {/* graphic — ONE HEALTH */}
            <div style={{ background: C.black, borderRadius: 24, padding: "32px", display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ursinho-rosto.jpg" alt="" style={{ position: "absolute", right: -20, bottom: -20, width: 180, opacity: 0.12, filter: "grayscale(100%)", pointerEvents: "none", mixBlendMode: "screen" }}/>
              <p style={{ fontSize: 11, color: C.orange, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>Qual é o movimento?</p>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.white, lineHeight: 1.4 }}>
                "Que nenhuma vida seja ignorada — nem nas ruas, nem na natureza."
              </p>
              <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }}/>
              {[
                "Refeições quentinhas para moradores de rua",
                "Banho e higiene para quem não tem onde",
                "Cuidados com animais abandonados",
                "Biofilantropia",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon d={I.check} size={11} color={C.white}/>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ONE HEALTH banner */}
          <div style={{ marginTop: 72, textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--font-spray), 'Permanent Marker', cursive", fontSize: "clamp(42px,7vw,88px)", fontWeight: 400, color: C.blue, letterSpacing: 2, marginBottom: 16 }}>
              ONE HEALTH
            </h2>
            <p style={{ fontFamily: "var(--font-marker), cursive", fontSize: "clamp(32px,5vw,54px)", fontWeight: 400, color: C.ink, lineHeight: 1.1, letterSpacing: 1 }}>
              Simples.<br/>Direto.<br/>Brutal.
            </p>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" style={{ background: C.offWhite, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>Simples assim</span>
            <h2 style={{ fontFamily: "var(--font-spray), 'Permanent Marker', cursive", fontSize: "clamp(32px,5vw,56px)", fontWeight: 400, color: C.ink, marginTop: 10, letterSpacing: 1 }}>Como funciona</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {COMO_FUNCIONA.map((step, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 20, padding: "28px 26px", border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 16, right: 18, fontFamily: "'Playfair Display',serif", fontSize: 52, fontWeight: 800, color: step.cor, opacity: 0.07, lineHeight: 1 }}>{step.n}</div>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: step.cor + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 18 }}>{step.emoji}</div>
                <div style={{ display: "inline-block", background: step.cor, color: C.white, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, letterSpacing: 1, marginBottom: 12 }}>PASSO {step.n}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 10, fontFamily: "'Playfair Display',serif" }}>{step.titulo}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUE ISSO É DIFERENTE? ── */}
      <section style={{ background: C.white, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Título diagonal estilo rabisco laranja */}
          <div style={{ marginBottom: 48, textAlign: "center" }}>
            <h2 style={{
              fontFamily: "var(--font-spray), 'Permanent Marker', cursive",
              fontSize: "clamp(38px, 7vw, 76px)",
              fontWeight: 400,
              color: C.orange,
              letterSpacing: 1,
              display: "inline-block",
              lineHeight: 1,
            }}>
              POR QUE ISSO É<br/>DIFERENTE ?
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {VALORES.map((v, i) => (
              <div key={i} style={{ border: `2px solid ${v.cor}22`, borderRadius: 20, padding: "28px", background: v.cor + "06", display: "flex", gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: v.cor + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon d={v.icon} size={28} color={v.cor}/>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: C.ink, letterSpacing: 1, marginBottom: 8 }}>{v.titulo}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: v.cor, marginBottom: 10 }}>{v.sub}</p>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, whiteSpace: "pre-line" }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTITUIÇÕES ── */}
      <section id="instituicoes" style={{ background: C.black, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 11, color: C.orange, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>Parceiros verificados</span>
            <h2 style={{ fontFamily: "var(--font-spray), 'Permanent Marker', cursive", fontSize: "clamp(32px,5vw,56px)", fontWeight: 400, color: C.white, marginTop: 10, letterSpacing: 1 }}>Instituições parceiras</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginTop: 10, maxWidth: 500, margin: "10px auto 0" }}>Cada instituição é verificada pela Humanity Bearers antes de entrar na plataforma.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>
            {instituicoes.map((inst) => {
              const { cor, bg } = instColor(inst.tipo);
              const isHov = hoveredInst === inst.id;
              return (
                <div key={inst.id} className="inst-card"
                  onMouseEnter={() => setHoveredInst(inst.id)} onMouseLeave={() => setHoveredInst(null)}
                  style={{ background: isHov ? cor : "rgba(255,255,255,0.04)", borderRadius: 20, border: `1.5px solid ${isHov ? cor : "rgba(255,255,255,0.08)"}`, padding: "24px", cursor: "pointer" }}
                  onClick={() => router.push("/doacao")}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 54, height: 54, borderRadius: 16, background: isHov ? "rgba(255,255,255,0.2)" : bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{inst.emoji}</div>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: isHov ? C.white : C.white, fontFamily: "'Playfair Display',serif" }}>{inst.nome}</p>
                      <p style={{ fontSize: 12, color: isHov ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)", marginTop: 2 }}>{inst.tipo}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <p style={{ fontSize: 28, fontWeight: 800, color: isHov ? C.white : cor, fontFamily: "'Playfair Display',serif" }}>R$ {inst.valor}</p>
                    <p style={{ fontSize: 12, color: isHov ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)" }}>por pessoa</p>
                  </div>
                  <div style={{ marginTop: 14, background: isHov ? "rgba(255,255,255,0.15)" : bg + "33", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon d={I.check} size={12} color={isHov ? C.white : cor}/>
                    <span style={{ fontSize: 12, color: isHov ? C.white : cor, fontWeight: 600 }}>Chave Pix disponível · Doar agora</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background: `linear-gradient(135deg, ${C.blue}, #0008cc)`, padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ursinho.png" alt="" className="float" style={{ width: 80, margin: "0 auto 20px", display: "block", filter: "brightness(10)", opacity: 0.85 }}/>
          <h2 style={{ fontFamily: "var(--font-spray), 'Permanent Marker', cursive", fontSize: "clamp(32px,5.5vw,56px)", fontWeight: 400, color: C.white, lineHeight: 1.1, marginBottom: 20, letterSpacing: 1 }}>
            Pronto para carregar<br />humanidade?
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", marginBottom: 36, lineHeight: 1.8 }}>
            Em minutos, sua ação muda uma realidade.<br/>Sem burocracia. Sem teatro.<br/>Só humanidade em movimento.
          </p>
          <button onClick={() => router.push("/doacao")} style={{ background: C.orange, color: C.white, border: "none", borderRadius: 14, padding: "18px 56px", fontSize: 22, fontWeight: 900, cursor: "pointer", boxShadow: `0 12px 40px rgba(0,0,0,0.3)`, display: "inline-flex", alignItems: "center", gap: 14, letterSpacing: 1 }}>
            DEMORÔ <Icon d={I.arrow} size={22} color={C.white}/>
          </button>
        </div>
      </section>

      {/* ── MISSÕES DESTAQUE ── */}
      <section style={{ background: "#0a0a0a", padding: "80px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 48 }}>
            <div>
              <p style={{ fontSize: 11, color: C.orange, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>🎮 GAME MODE</p>
              <h2 style={{ fontFamily: "var(--font-spray), 'Permanent Marker', cursive", fontSize: "clamp(34px,5vw,54px)", fontWeight: 400, color: C.white, margin: 0, letterSpacing: 2 }}>
                Missões Bearer
              </h2>
              <div style={{ display: "inline-block", background: C.orange, color: C.white, fontSize: 12, fontWeight: 800, letterSpacing: 2, padding: "6px 16px", borderRadius: 99, marginTop: 14, fontFamily: "monospace" }}>
                SCAN•CONNECT•IMPACT
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 14, maxWidth: 440 }}>
                Complete ações, acumule pontos e evolua no ranking de humanidade.
              </p>
            </div>
            <a href="/missoes" style={{ background: C.orange, color: C.white, fontWeight: 700, fontSize: 14, padding: "12px 24px", borderRadius: 12, textDecoration: "none", whiteSpace: "nowrap" }}>
              Ver todas as missões →
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {[
              { emoji: "🤝", titulo: "Primeira humanidade",  desc: "Já não ficou só observando. Você pode mais e sabe disso.",       recompensa: "+ acesso ao ranking",            periodo: "semana", nMissao: 1 },
              { emoji: "👨‍👩‍👧", titulo: "Humanidade contínua", desc: "Humanidade não é modinha. Frio, fome, sede dá todo dia. Mínimo de 10 impactos no mês.",      recompensa: "+ acesso a drop exclusivo",      periodo: "mes",    nMissao: 2 },
              { emoji: "🦾", titulo: "Voluntariado",         desc: "Trabalhou 1 dia em uma das instituições.",                          recompensa: "+ acesso à coleção antecipada",  periodo: "mes",    nMissao: 3 },
              { emoji: "🌟", titulo: "Mentoria",             desc: "Chamou alguém? Então pegou a visão.",                               recompensa: "+ acesso à coleção exclusiva",   periodo: "mes",    nMissao: 4 },
              { emoji: "💜", titulo: "Desapego",             desc: "Foi capaz de doar uma peça rankeada? Isso foi realmente duka.",     recompensa: "+ tier Benefector + purple patch", periodo: "mes",  nMissao: 5 },
            ].map((m, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
                    {m.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Missão {m.nMissao}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 4, marginBottom: 6 }}>
                      <p style={{ fontSize: 16, fontWeight: 800, color: C.white, margin: 0 }}>{m.titulo}</p>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "2px 8px", borderRadius: 99, background: m.periodo === "semana" ? "rgba(255,78,0,0.15)" : "rgba(0,13,255,0.15)", color: m.periodo === "semana" ? C.orange : "#4f9ef8", border: `1px solid ${m.periodo === "semana" ? "rgba(255,78,0,0.3)" : "rgba(79,158,248,0.3)"}` }}>
                        📌 {m.periodo === "semana" ? "Semana" : "Mês"}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: C.orange, lineHeight: 1.6, margin: 0 }}>{m.desc}</p>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12, gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.orange }}>{m.recompensa}</span>
                  <a href="/doacao" style={{ fontSize: 13, fontWeight: 800, color: C.orange, textDecoration: "none", border: `1.5px solid ${C.orange}`, padding: "6px 14px", borderRadius: 8 }}>
                    mete marcha
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <a href="/missoes" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
              Acompanhar progresso e missões completas →
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#050505", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <UrsinhoSVG size={22} />
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: C.white }}>Humanity Bearers</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>— Humanity Bearers</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[["Doar","/doacao"],["Missões","/missoes"],["Insígnias","/pedido-patch"],["Meu Progresso","/meu-desempenho"],["Admin","/admin"]].map(([l, h]) => (
              <a key={l} href={h} style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>© 2026 Humanity Bearers</p>
        </div>
      </footer>
    </>
  );
}
