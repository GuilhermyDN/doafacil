"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type Instituicao } from "@/lib/data";
import { getInstituicoes } from "@/lib/api";

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
    { n: "01", titulo: "Escolha a causa", desc: "Selecione entre Refeição, Banho ou Cobertor — cada uma vai para uma instituição parceira real.", emoji: "🎯", cor: C.blue },
    { n: "02", titulo: "Defina o impacto", desc: "Escolha quantas pessoas quer ajudar e veja o valor em tempo real. Sem surpresas.", emoji: "🤝", cor: C.orange },
    { n: "03", titulo: "Pague pelo Pix", desc: "Receba a chave Pix diretamente. O valor vai 100% para a instituição, sem intermediários.", emoji: "⚡", cor: "#6600cc" },
  ];

  const VALORES = [
    { icon: I.shield, titulo: "100% Transparente", desc: "Toda doação é registrada e você pode acompanhar o repasse no painel público de prestação de contas.", cor: C.blue },
    { icon: I.heart,  titulo: "Impacto Real",       desc: "Trabalhamos com instituições verificadas que atendem pessoas em situação de rua na cidade.", cor: C.orange },
    { icon: I.trophy, titulo: "Gamificação",        desc: "Ganhe pontos, complete missões e suba no ranking dos doadores. Sua generosidade tem reconhecimento!", cor: "#6600cc" },
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
            <div style={{ position: "relative", width: 22, height: 22, flexShrink: 0 }}>
              <div style={{ position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)", width: 3, height: 22, background: C.orange, borderRadius: 2 }}/>
              <div style={{ position: "absolute", top: "34%", left: 0, width: 22, height: 3, background: C.orange, borderRadius: 2 }}/>
            </div>
            <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, fontWeight: 700, color: C.white }}>Humanity Bearers</span>
          </div>
          {/* links desktop */}
          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a href="#quem-somos" className="nav-link">Quem somos</a>
            <a href="#como-funciona" className="nav-link">Como funciona</a>
            <a href="#instituicoes" className="nav-link">Instituições</a>
            <a href="/missoes" className="nav-link">🎯 Missões</a>
            <a href="/pedido-patch" className="nav-link">🎖️ Meu Perfil</a>
            <a href="/admin" className="nav-link">Admin</a>
          </div>
          {/* CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => router.push("/doacao")} style={{ background: C.orange, color: C.white, border: "none", borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
              Fazer doação →
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ursinho.png" alt="" className="float" style={{ position: "absolute", right: "-2%", bottom: "-5%", width: "42vmin", maxWidth: 400, opacity: 0.07, filter: "grayscale(100%) contrast(1.5)", userSelect: "none" }}/>
          <div style={{ position: "absolute", top: "20%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: C.blue, opacity: 0.07, filter: "blur(80px)" }}/>
          <div style={{ position: "absolute", bottom: "15%", right: "15%", width: 280, height: 280, borderRadius: "50%", background: C.orange, opacity: 0.08, filter: "blur(80px)" }}/>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, display: "flex" }}>
            <div style={{ flex: 1, background: C.blue }}/><div style={{ flex: 1, background: C.orange }}/><div style={{ flex: 1, background: "rgba(255,255,255,0.15)" }}/>
          </div>
        </div>

        <div className="hero-grid" style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", position: "relative", zIndex: 1 }}>
          {/* text */}
          <div className="fade-up">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,78,0,0.12)", border: "1px solid rgba(255,78,0,0.25)", borderRadius: 99, padding: "5px 14px", marginBottom: 24 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.orange }}/>
              <span style={{ fontSize: 11, color: C.orange, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Igreja Missão Humanidade</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(32px,5vw,62px)", fontWeight: 700, color: C.white, lineHeight: 1.1, marginBottom: 20 }}>
              Juntos,<br />
              <span style={{ color: C.orange }}>transformamos</span><br />
              vidas
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 36, maxWidth: 420 }}>
              Uma plataforma de doação direta e transparente para quem está em situação de vulnerabilidade. Cada real vai direto para quem precisa — sem burocracia.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => router.push("/doacao")} style={{ background: C.orange, color: C.white, border: "none", borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: `0 12px 32px ${C.orange}44` }}>
                Quero doar agora <Icon d={I.arrow} size={16} color={C.white}/>
              </button>
              <a href="#quem-somos" style={{ background: "rgba(255,255,255,0.06)", color: C.white, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 500, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center" }}>
                Saiba mais
              </a>
            </div>
            {/* trust badges */}
            <div style={{ display: "flex", gap: 20, marginTop: 36, flexWrap: "wrap" }}>
              {[["✓ Pix direto","para a instituição"],["🔒 100% transparente","prestação pública"],["🏆 Ranking","de doadores"]].map(([t, s], i) => (
                <div key={i}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.white }}>{t}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* cards float */}
          <div className="hide-mobile" style={{ position: "relative", height: 420 }}>
            {instituicoes.slice(0, 3).map((inst, i) => {
              const { cor, bg } = instColor(inst.tipo);
              const offsets = [
                { top: 0,    left: 20,   rotate: "-4deg" },
                { top: 100,  left: 100,  rotate: "2deg"  },
                { top: 200,  left: 10,   rotate: "-1deg" },
              ];
              const o = offsets[i] ?? offsets[0];
              return (
                <div key={inst.id} className="float" style={{ position: "absolute", top: o.top, left: o.left, background: C.white, borderRadius: 20, padding: "18px 20px", width: 240, boxShadow: "0 20px 60px rgba(0,0,0,0.4)", transform: `rotate(${o.rotate})`, animationDelay: `${i * 0.8}s`, border: `2px solid ${cor}22` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{inst.emoji}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{inst.nome}</p>
                      <p style={{ fontSize: 22, fontWeight: 800, color: cor, fontFamily: "'Playfair Display',serif", lineHeight: 1, marginTop: 2 }}>R$ {inst.valor}</p>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, background: bg, borderRadius: 8, padding: "6px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon d={I.check} size={12} color={cor}/>
                    <span style={{ fontSize: 11, color: cor, fontWeight: 600 }}>Pix disponível</span>
                  </div>
                </div>
              );
            })}
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

      {/* ── QUEM SOMOS ── */}
      <section id="quem-somos" style={{ background: C.white, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ fontSize: 11, color: C.orange, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>Nossa história</span>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 700, color: C.ink, marginTop: 10, lineHeight: 1.2 }}>Quem somos</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 40, alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.9, marginBottom: 20 }}>
                Somos uma Igreja comprometida com o amor ao próximo. Nossa missão vai além dos cultos — acreditamos que fé sem obras é vazia, e por isso transformamos doações em impacto real na vida de pessoas em situação de vulnerabilidade.
              </p>
              <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.9, marginBottom: 28 }}>
                O <strong style={{ color: C.ink }}>Humanity Bearers</strong> nasceu da necessidade de criar um canal direto, transparente e gamificado entre quem quer ajudar e quem precisa de ajuda. Cada doação é rastreada, reportada e celebrada.
              </p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[["Fundada em","2026"],["Pessoas atendidas","todo mês"],["Cidades","alcançadas"]].map(([l, v], i) => (
                  <div key={i} style={{ background: C.offWhite, borderRadius: 12, padding: "14px 18px", border: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</p>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.ink, marginTop: 4 }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* graphic */}
            <div style={{ background: C.black, borderRadius: 24, padding: "32px", display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ursinho.png" alt="Ursinho mascote Humanity Bearers" style={{ position: "absolute", right: -10, bottom: -10, width: 130, opacity: 0.1, filter: "grayscale(100%)", pointerEvents: "none" }}/>
              <p style={{ fontSize: 11, color: C.orange, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>Nossa missão</p>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.white, lineHeight: 1.4 }}>
                "Que nenhuma pessoa durma com fome, sem abrigo ou sem dignidade."
              </p>
              <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }}/>
              {[
                "Refeições quentinhas para moradores de rua",
                "Banho e higiene para quem não tem onde",
                "Cobertores nos dias frios do inverno",
                "Amor e acolhida sem julgamento",
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
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" style={{ background: C.offWhite, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>Simples assim</span>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(26px,4vw,42px)", fontWeight: 700, color: C.ink, marginTop: 10 }}>Como funciona</h2>
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

      {/* ── VALORES ── */}
      <section style={{ background: C.white, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 11, color: C.orange, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>Por que escolher</span>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(26px,4vw,42px)", fontWeight: 700, color: C.ink, marginTop: 10 }}>Nossos valores</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {VALORES.map((v, i) => (
              <div key={i} style={{ border: `2px solid ${v.cor}22`, borderRadius: 20, padding: "28px", background: v.cor + "06" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: v.cor + "18", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Icon d={v.icon} size={22} color={v.cor}/>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 10, fontFamily: "'Playfair Display',serif" }}>{v.titulo}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{v.desc}</p>
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
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(26px,4vw,42px)", fontWeight: 700, color: C.white, marginTop: 10 }}>Instituições parceiras</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginTop: 10, maxWidth: 500, margin: "10px auto 0" }}>Cada instituição é verificada pela liderança da Igreja antes de entrar na plataforma.</p>
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
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(26px,4vw,42px)", fontWeight: 700, color: C.white, lineHeight: 1.25, marginBottom: 16 }}>
            Pronto para fazer<br />a diferença?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", marginBottom: 36, lineHeight: 1.7 }}>
            Sua doação chega em minutos. Nenhuma burocracia, nenhum intermediário. Só você e quem precisa.
          </p>
          <button onClick={() => router.push("/doacao")} style={{ background: C.orange, color: C.white, border: "none", borderRadius: 14, padding: "16px 40px", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: `0 12px 40px rgba(0,0,0,0.3)`, display: "inline-flex", alignItems: "center", gap: 10 }}>
            Fazer minha doação agora <Icon d={I.arrow} size={18} color={C.white}/>
          </button>
        </div>
      </section>

      {/* ── MISSÕES DESTAQUE ── */}
      <section style={{ background: "#0a0a0a", padding: "80px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 48 }}>
            <div>
              <p style={{ fontSize: 11, color: C.orange, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>🎮 GAME MODE</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, color: C.white, margin: 0 }}>
                Missões em Destaque
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 10, maxWidth: 440 }}>
                Complete missões, acumule pontos e ajude mais pessoas. A comunidade escolhe as missões da semana e do mês.
              </p>
            </div>
            <a href="/missoes" style={{ background: C.orange, color: C.white, fontWeight: 700, fontSize: 14, padding: "12px 24px", borderRadius: 12, textDecoration: "none", whiteSpace: "nowrap" }}>
              Ver todas as missões →
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {[
              { emoji: "🤝", titulo: "Primeira Doação", descricao: "Faça sua primeira doação e entre para a comunidade Humanity Bearers.", pontos: 200, periodo: "semana" },
              { emoji: "👨‍👩‍👧", titulo: "Missão Família", descricao: "Convide um familiar para se juntar ao movimento e multiplicar o impacto.", pontos: 300, periodo: "semana" },
              { emoji: "🌟", titulo: "Mês Completo", descricao: "Doe todos os meses durante um ano inteiro e torne-se um herói permanente.", pontos: 500, periodo: "mes" },
            ].map((m, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
                    {m.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: C.white, margin: 0 }}>{m.titulo}</p>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "2px 8px", borderRadius: 99, background: m.periodo === "semana" ? "rgba(255,78,0,0.15)" : "rgba(0,13,255,0.15)", color: m.periodo === "semana" ? C.orange : "#4f9ef8", border: `1px solid ${m.periodo === "semana" ? "rgba(255,78,0,0.3)" : "rgba(79,158,248,0.3)"}` }}>
                        📌 {m.periodo === "semana" ? "Semana" : "Mês"}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, margin: 0 }}>{m.descricao}</p>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: C.orange }}>+{m.pontos} pts</span>
                  <a href="/doacao" style={{ fontSize: 12, fontWeight: 700, color: C.orange, textDecoration: "none", border: `1px solid rgba(255,78,0,0.3)`, padding: "6px 14px", borderRadius: 8 }}>
                    Participar →
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
            <div style={{ position: "relative", width: 18, height: 18 }}>
              <div style={{ position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)", width: 2.5, height: 18, background: C.orange, borderRadius: 2 }}/>
              <div style={{ position: "absolute", top: "34%", left: 0, width: 18, height: 2.5, background: C.orange, borderRadius: 2 }}/>
            </div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: C.white }}>Humanity Bearers</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>— Igreja Missão Humanidade</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[["Doar","/doacao"],["Missões","/missoes"],["Insígnias","/pedido-patch"],["Meu Progresso","/meu-desempenho"],["Admin","/admin"]].map(([l, h]) => (
              <a key={l} href={h} style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>© 2026 Humanity Bearers · Feito com ❤️</p>
        </div>
      </footer>
    </>
  );
}
