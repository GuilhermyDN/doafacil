import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade — Humanity Bearers",
  description: "Como o Humanity Bearers coleta, usa e protege os dados dos usuários, em conformidade com a LGPD.",
};

export default function PoliticaPrivacidadePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2", padding: "40px 20px", color: "#1c1a16" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", background: "#fff", borderRadius: 20, boxShadow: "0 2px 20px rgba(0,0,0,0.06)", padding: "48px 42px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Link href="/" style={{ fontSize: 12, color: "#777", textDecoration: "none" }}>← Voltar</Link>
          <Link href="/termos-uso" style={{ fontSize: 12, color: "#000DFF", textDecoration: "none" }}>Termos de Uso →</Link>
        </div>

        <p style={{ fontSize: 11, letterSpacing: 2.5, color: "#FF4E00", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
          Humanity Bearers™
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 10 }}>
          Política de Privacidade
        </h1>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 36 }}>
          Atualizada em 16 de abril de 2026
        </p>

        <Section titulo="1. Introdução">
          <P>
            A presente Política de Privacidade tem por finalidade estabelecer as regras sobre coleta, uso, armazenamento,
            tratamento e proteção de dados pessoais no âmbito do sistema <b>Humanity Bearers™</b>, plataforma que conecta
            pessoas a iniciativas que promovem a humanidade por meio de ações sociais, ambientais e de proteção à vida.
          </P>
          <P>
            O tratamento de dados é realizado em conformidade com a Lei Geral de Proteção de Dados
            (Lei nº 13.709/2018) e demais normas aplicáveis.
          </P>
        </Section>

        <Section titulo="2. Definições">
          <P>Para fins desta Política:</P>
          <Ul>
            <Li><b>Usuário</b>: pessoa física que interage com a plataforma</Li>
            <Li><b>Instituição</b>: entidade cadastrada que recebe doações diretamente</Li>
            <Li><b>Plataforma</b>: sistema digital Humanity Bearers™</Li>
            <Li><b>Controlador</b>: [RAZÃO SOCIAL / NOME RESPONSÁVEL]</Li>
            <Li><b>Operador</b>: terceiros que tratam dados em nome do controlador</Li>
            <Li><b>Dados Pessoais</b>: informações que identifiquem ou possam identificar o usuário</Li>
          </Ul>
        </Section>

        <Section titulo="3. Natureza da Plataforma">
          <P>O Humanity Bearers™ atua exclusivamente como plataforma de conexão entre usuários e instituições, não sendo:</P>
          <Ul>
            <Li>intermediador financeiro</Li>
            <Li>custodiante de valores</Li>
            <Li>responsável pela execução das ações das instituições</Li>
          </Ul>
          <P>
            As doações são realizadas diretamente entre usuário e instituição, sem qualquer ingerência financeira da plataforma.
          </P>
        </Section>

        <Section titulo="4. Dados Coletados">
          <H3>4.1 Dados fornecidos pelo usuário</H3>
          <Ul>
            <Li>Nome (quando aplicável)</Li>
            <Li>E-mail e/ou telefone</Li>
            <Li>Preferências de impacto</Li>
          </Ul>

          <H3>4.2 Dados coletados automaticamente</H3>
          <Ul>
            <Li>Endereço IP</Li>
            <Li>Dados de navegação</Li>
            <Li>Identificação de dispositivo</Li>
            <Li>Geolocalização aproximada</Li>
            <Li>Dados vinculados ao QR Code / serial do produto</Li>
          </Ul>

          <H3>4.3 Dados sensíveis</H3>
          <P>A plataforma não coleta dados sensíveis, salvo mediante consentimento específico e necessidade justificada.</P>
        </Section>

        <Section titulo="5. Finalidade do Tratamento">
          <P>Os dados são utilizados para:</P>
          <Ul>
            <Li>viabilizar a conexão entre usuários e instituições</Li>
            <Li>registrar ações de impacto</Li>
            <Li>garantir autenticidade e rastreabilidade dos produtos</Li>
            <Li>gerar métricas e evolução de reputação</Li>
            <Li>aprimorar a experiência do usuário</Li>
          </Ul>
        </Section>

        <Section titulo="6. Base Legal">
          <P>O tratamento poderá ocorrer com base em:</P>
          <Ul>
            <Li>Consentimento</Li>
            <Li>Execução de contrato</Li>
            <Li>Legítimo interesse</Li>
            <Li>Cumprimento de obrigação legal</Li>
          </Ul>
        </Section>

        <Section titulo="7. Compartilhamento de Dados">
          <P>Os dados poderão ser compartilhados com:</P>
          <Ul>
            <Li>Instituições escolhidas pelo usuário</Li>
            <Li>Prestadores de serviços tecnológicos</Li>
            <Li>Autoridades legais</Li>
          </Ul>
          <P>A plataforma <b>não comercializa dados pessoais</b>.</P>
        </Section>

        <Section titulo="8. Responsabilidade das Instituições">
          <P>Cada instituição é integralmente responsável:</P>
          <Ul>
            <Li>pelo tratamento dos dados recebidos</Li>
            <Li>pela execução das ações divulgadas</Li>
            <Li>pela veracidade das informações apresentadas</Li>
          </Ul>
          <P>A plataforma não se responsabiliza por condutas de terceiros.</P>
        </Section>

        <Section titulo="9. Segurança da Informação">
          <P>São adotadas medidas técnicas e administrativas adequadas, incluindo:</P>
          <Ul>
            <Li>criptografia</Li>
            <Li>controle de acesso</Li>
            <Li>monitoramento e auditoria</Li>
          </Ul>
        </Section>

        <Section titulo="10. Retenção de Dados">
          <P>Os dados serão armazenados pelo tempo necessário ao cumprimento das finalidades ou conforme exigido por lei.</P>
        </Section>

        <Section titulo="11. Direitos do Titular">
          <P>O usuário poderá:</P>
          <Ul>
            <Li>acessar seus dados</Li>
            <Li>corrigir dados</Li>
            <Li>solicitar exclusão</Li>
            <Li>revogar consentimento</Li>
          </Ul>
          <P>Solicitações devem ser feitas pelo canal oficial (ver seção 16).</P>
        </Section>

        <Section titulo="12. Cookies">
          <P>A plataforma utiliza cookies para funcionamento e melhoria de desempenho. O usuário pode gerenciar preferências no navegador.</P>
        </Section>

        <Section titulo="13. Transferência Internacional">
          <P>Os dados poderão ser armazenados fora do Brasil, respeitando padrões adequados de proteção.</P>
        </Section>

        <Section titulo="14. Limitação de Responsabilidade">
          <P>A plataforma não se responsabiliza por:</P>
          <Ul>
            <Li>falhas de terceiros</Li>
            <Li>indisponibilidade do sistema</Li>
            <Li>decisões tomadas pelo usuário</Li>
            <Li>danos indiretos ou lucros cessantes</Li>
          </Ul>
        </Section>

        <Section titulo="15. Alterações">
          <P>Esta política pode ser atualizada a qualquer momento. A versão vigente estará sempre disponível nesta página.</P>
        </Section>

        <Section titulo="16. Contato">
          <P>
            E-mail: <a href="mailto:porphiriomensagens@gmail.com" style={{ color: "#000DFF" }}>porphiriomensagens@gmail.com</a>
          </P>
          <P>Encarregado (DPO): <b>Porphirio Kempe Cavalcante Junior</b></P>
        </Section>

      </div>
    </div>
  );
}

// ── Componentes internos para reaproveitar estilo ──

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

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 14, fontWeight: 700, marginTop: 14, marginBottom: 6, color: "#1c1a16" }}>
      {children}
    </h3>
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
