import Link from "next/link";

export const metadata = {
  title: "Termos de Uso — Humanity Bearers",
  description: "Termos e condições de uso da plataforma Humanity Bearers.",
};

export default function TermosUsoPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2", padding: "40px 20px", color: "#1c1a16" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", background: "#fff", borderRadius: 20, boxShadow: "0 2px 20px rgba(0,0,0,0.06)", padding: "48px 42px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Link href="/" style={{ fontSize: 12, color: "#777", textDecoration: "none" }}>← Voltar</Link>
          <Link href="/politica-privacidade" style={{ fontSize: 12, color: "#000DFF", textDecoration: "none" }}>Política de Privacidade →</Link>
        </div>

        <p style={{ fontSize: 11, letterSpacing: 2.5, color: "#FF4E00", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
          Humanity Bearers™
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 10 }}>
          Termos de Uso
        </h1>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 36 }}>
          Atualizado em 16 de abril de 2026
        </p>

        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "16px 20px", marginBottom: 32 }}>
          <p style={{ fontSize: 13, color: "#78350f", lineHeight: 1.7 }}>
            Ao prosseguir com o uso da plataforma, você declara que leu, compreendeu e concorda com estes <b>Termos de Uso</b> e
            com a <Link href="/politica-privacidade" style={{ color: "#78350f", fontWeight: 700 }}>Política de Privacidade</Link> do
            Humanity Bearers™, autorizando o tratamento de seus dados nos termos da legislação vigente. Caso não concorde,
            recomendamos que não prossiga com a utilização do sistema.
          </p>
        </div>

        <Section titulo="1. Aceitação dos Termos">
          <P>
            Estes Termos de Uso regem o acesso e a utilização da plataforma <b>Humanity Bearers™</b> por qualquer usuário,
            doador ou instituição parceira. O uso da plataforma implica a aceitação integral e incondicional destes Termos
            e da Política de Privacidade.
          </P>
        </Section>

        <Section titulo="2. Definições">
          <Ul>
            <Li><b>Plataforma</b>: sistema digital Humanity Bearers™, incluindo site, aplicativos e serviços relacionados.</Li>
            <Li><b>Usuário</b>: pessoa física que acessa ou utiliza a plataforma, inclusive para realizar doações.</Li>
            <Li><b>Instituição</b>: entidade cadastrada que recebe doações diretamente por meio da plataforma.</Li>
            <Li><b>QR Code / Serial</b>: identificador único vinculado a um produto ou tag física, utilizado para rastrear ações de impacto.</Li>
          </Ul>
        </Section>

        <Section titulo="3. Natureza da Plataforma">
          <P>
            O Humanity Bearers™ atua <b>exclusivamente como plataforma de conexão</b> entre usuários e instituições que promovem
            a humanidade por meio de ações sociais, ambientais e de proteção à vida.
          </P>
          <P>A plataforma <b>não é</b>:</P>
          <Ul>
            <Li>intermediadora financeira;</Li>
            <Li>custodiante de valores;</Li>
            <Li>responsável pela execução das ações das instituições cadastradas.</Li>
          </Ul>
          <P>
            As doações são realizadas <b>diretamente</b> entre o usuário e a instituição escolhida. Os recursos financeiros
            transitam exclusivamente entre as contas de pagamento do usuário e da instituição, sem qualquer ingerência da plataforma.
          </P>
        </Section>

        <Section titulo="4. Cadastro e Uso">
          <P>Ao utilizar a plataforma, o usuário se compromete a:</P>
          <Ul>
            <Li>fornecer informações verdadeiras, precisas e atualizadas;</Li>
            <Li>manter a confidencialidade de eventuais credenciais de acesso;</Li>
            <Li>utilizar a plataforma apenas para finalidades lícitas e em conformidade com estes Termos;</Li>
            <Li>não tentar contornar, fraudar ou prejudicar o funcionamento do sistema.</Li>
          </Ul>
        </Section>

        <Section titulo="5. Doações">
          <P>
            As doações realizadas pela plataforma são voluntárias e direcionadas à instituição escolhida pelo usuário.
            O valor doado é transferido diretamente à conta de pagamento da instituição, sem taxa adicional cobrada pelo
            Humanity Bearers™. Taxas próprias do provedor de pagamento (Mercado Pago ou equivalente) podem incidir e são
            de responsabilidade da instituição recebedora.
          </P>
          <P>
            O Humanity Bearers™ não se responsabiliza pela aplicação efetiva dos recursos pela instituição, nem pelo
            cumprimento de promessas, metas ou campanhas divulgadas por terceiros.
          </P>
        </Section>

        <Section titulo="6. Responsabilidades das Instituições">
          <P>As instituições cadastradas são integralmente responsáveis por:</P>
          <Ul>
            <Li>veracidade e atualidade de suas informações;</Li>
            <Li>execução das ações anunciadas;</Li>
            <Li>cumprimento de obrigações fiscais, trabalhistas e regulatórias;</Li>
            <Li>tratamento adequado dos dados dos doadores recebidos pela plataforma;</Li>
            <Li>manutenção de uma conta de pagamento válida e habilitada a receber transferências.</Li>
          </Ul>
        </Section>

        <Section titulo="7. QR Code, Serial e Produtos">
          <P>
            Produtos ou tags físicas com QR Code / serial vinculado à plataforma servem para identificar doadores e registrar
            ações de impacto. O usuário é responsável pela guarda de seus códigos — a posse do QR Code é considerada prova
            de titularidade para fins de acúmulo de pontos e reputação.
          </P>
        </Section>

        <Section titulo="8. Propriedade Intelectual">
          <P>
            A marca <b>Humanity Bearers™</b>, logotipos, layouts, códigos-fonte, textos e demais elementos da plataforma são
            protegidos por direitos autorais e de propriedade industrial. É vedada sua reprodução, distribuição ou modificação
            sem autorização prévia e expressa.
          </P>
        </Section>

        <Section titulo="9. Limitação de Responsabilidade">
          <P>Na máxima extensão permitida em lei, o Humanity Bearers™ não se responsabiliza por:</P>
          <Ul>
            <Li>falhas, atrasos ou recusas de terceiros (instituições, bancos, processadores de pagamento);</Li>
            <Li>indisponibilidade temporária do sistema;</Li>
            <Li>decisões tomadas pelo usuário a partir de informações divulgadas pelas instituições;</Li>
            <Li>danos indiretos, lucros cessantes ou perdas imateriais.</Li>
          </Ul>
        </Section>

        <Section titulo="10. Suspensão e Encerramento">
          <P>
            A plataforma reserva-se o direito de suspender ou encerrar o acesso de qualquer usuário ou instituição que violar
            estes Termos, a Política de Privacidade ou a legislação vigente, a qualquer tempo e sem aviso prévio, sem
            prejuízo das sanções cabíveis.
          </P>
        </Section>

        <Section titulo="11. Alterações">
          <P>
            Estes Termos podem ser atualizados a qualquer momento para refletir melhorias no serviço ou exigências legais.
            A versão vigente estará sempre disponível nesta página. O uso continuado da plataforma após publicação das
            alterações implica aceitação dos novos termos.
          </P>
        </Section>

        <Section titulo="12. Legislação e Foro">
          <P>
            Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro do domicílio do
            usuário para dirimir quaisquer questões oriundas deste instrumento, salvo disposição legal em contrário.
          </P>
        </Section>

        <Section titulo="13. Contato">
          <P>
            Dúvidas, sugestões ou solicitações relacionadas a estes Termos podem ser enviadas para:
          </P>
          <P>
            E-mail: <a href="mailto:porphiriomensagens@gmail.com" style={{ color: "#000DFF" }}>porphiriomensagens@gmail.com</a>
          </P>
          <P>Responsável: <b>Porphirio Kempe Cavalcante Junior</b></P>
        </Section>

      </div>
    </div>
  );
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, marginBottom: 10, color: "#000DFF" }}>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#333", marginBottom: 10 }}>
      {children}
    </p>
  );
}

function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul style={{ paddingLeft: 22, marginBottom: 10, listStyle: "disc" }}>
      {children}
    </ul>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ fontSize: 14, lineHeight: 1.7, color: "#333", marginBottom: 4 }}>
      {children}
    </li>
  );
}
