"use client";
import { useRouter } from "next/navigation";

const C = {
  black:   "#000000",
  blue:    "#000DFF",
  orange:  "#FF4E00",
  white:   "#FFFFFF",
  ink:     "#111111",
  muted:   "#555555",
};

export default function NossaHistoriaPage() {
  const router = useRouter();

  return (
    <>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            {/* Ursinho no lugar do logo - quebrado, riscado */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ursinho-rosto.png" alt="" style={{ width: 32, height: 32, objectFit: "contain", filter: "invert(1)", opacity: 0.9 }} />
            <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, fontWeight: 700, color: C.white }}>Humanity Bearers</span>
          </a>
          <button onClick={() => router.push("/doacao")} style={{ background: C.orange, color: C.white, border: "none", borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            JÁ É →
          </button>
        </div>
      </nav>

      {/* ── CONTEÚDO ── */}
      <section style={{ background: C.white, padding: "64px 24px 80px", minHeight: "80vh" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 13, color: C.orange, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>
              Nossa história
            </p>
            <h1 style={{ fontFamily: "var(--font-spray), 'Permanent Marker', cursive", fontSize: "clamp(42px,7vw,78px)", fontWeight: 400, color: C.blue, lineHeight: 1.05, letterSpacing: 2 }}>
              Qual é o rolê aqui?
            </h1>
          </div>

          {/* 2 colunas em desktop, 1 coluna em mobile */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40 }}>
            <div style={{ color: C.muted, fontSize: 16, lineHeight: 1.9 }}>
              <p style={{ marginBottom: 18 }}>
                Somos um movimento criado para <strong style={{ color: C.ink }}>transformar intenção em ação</strong>
                &nbsp;e ação em humanidade real — daquelas que chegam, impactam e mudam o dia de alguém.
              </p>
              <p style={{ marginBottom: 18 }}>
                Aqui, humanidade não é conceito bonito nem discurso inspirador.<br/>
                <strong style={{ color: C.ink }}>Humanidade é prática. É escolha. É atitude.</strong>
              </p>
              <p style={{ marginBottom: 18 }}>
                Acreditamos que intenção sem ação não gera humanidade.<br/>
                Por isso, criamos um sistema direto, transparente e sem ruído entre quem quer fazer acontecer e quem precisa agora.
              </p>
            </div>

            <div style={{ color: C.muted, fontSize: 16, lineHeight: 1.9 }}>
              <p style={{ marginBottom: 18 }}>
                <strong style={{ color: C.ink }}>Humanity Bearers</strong> nasce com um propósito claro:
                colocar a humanidade em movimento — sem intermediários, sem burocracia e sem desculpas.
              </p>
              <p style={{ marginBottom: 18 }}>
                Cada ação aqui não só acontece — ela fica registrada.<br/>
                Cada gesto vira impacto real.<br/>
                Cada decisão gera humanidade visível, rastreável e comprovada.
              </p>
              <p style={{ marginBottom: 18 }}>
                No fim, é simples:
              </p>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.ink, lineHeight: 1.4 }}>
                Ou você gera humanidade…<br/>
                ou só observa o mundo do mesmo jeito.
              </p>
            </div>
          </div>

          {/* Fundada em */}
          <div style={{ marginTop: 64, display: "flex", justifyContent: "center" }}>
            <div style={{ background: "#f6f6f6", borderRadius: 12, padding: "16px 24px", border: "1px solid #e8e8e8", textAlign: "center" }}>
              <p style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>Fundada em</p>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 800, color: C.ink, marginTop: 6 }}>2026</p>
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: 56, textAlign: "center" }}>
            <button onClick={() => router.push("/doacao")} style={{ background: C.orange, color: C.white, border: "none", borderRadius: 14, padding: "18px 48px", fontSize: 18, fontWeight: 900, cursor: "pointer", letterSpacing: 1, boxShadow: `0 12px 32px ${C.orange}55` }}>
              DEMORÔ →
            </button>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer style={{ background: "#050505", padding: "30px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>© 2026 Humanity Bearers</p>
      </footer>
    </>
  );
}
