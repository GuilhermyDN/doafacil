from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import cm

output = r"C:\Users\Guilhermy Damasceno\Documents\doacoes-mvp\INSTRUCOES-CLIENTE.pdf"
doc = SimpleDocTemplate(output, pagesize=A4,
    leftMargin=2.5*cm, rightMargin=2.5*cm,
    topMargin=2.5*cm, bottomMargin=2.5*cm)

styles = getSampleStyleSheet()

title_style = ParagraphStyle('Title2', parent=styles['Title'],
    fontSize=20, textColor=colors.HexColor('#000DFF'), spaceAfter=6)
h1_style = ParagraphStyle('H1', parent=styles['Heading1'],
    fontSize=13, textColor=colors.HexColor('#FF4E00'), spaceAfter=4, spaceBefore=14)
h2_style = ParagraphStyle('H2', parent=styles['Heading2'],
    fontSize=11, textColor=colors.black, spaceAfter=4, spaceBefore=10)
body_style = ParagraphStyle('Body2', parent=styles['Normal'],
    fontSize=10, leading=16, spaceAfter=4)
note_style = ParagraphStyle('Note', parent=styles['Normal'],
    fontSize=9, leading=14, textColor=colors.HexColor('#555555'))
link_style = ParagraphStyle('Link', parent=styles['Normal'],
    fontSize=10, leading=14, textColor=colors.HexColor('#000DFF'))
warn_style = ParagraphStyle('Warn', parent=styles['Normal'],
    fontSize=10, leading=16, textColor=colors.HexColor('#cc0000'))

story = []

story.append(Paragraph("Instruções para Integração", title_style))
story.append(Paragraph("Humanity Bearers", ParagraphStyle('Sub', parent=styles['Normal'],
    fontSize=13, textColor=colors.HexColor('#FF4E00'), spaceAfter=16)))
story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#000DFF')))
story.append(Spacer(1, 16))

# PARTE 1
story.append(Paragraph("PARTE 1 — Servidor VPS (obrigatório)", h1_style))
story.append(Paragraph(
    "Para hospedar o sistema Humanity Bearers com estabilidade 24/7, contrate um servidor VPS pelo link abaixo:",
    body_style))
story.append(Paragraph(
    "https://www.hostinger.com/br?REFERRALCODE=B33GUYDAM6S6",
    link_style))
story.append(Spacer(1, 4))
story.append(Paragraph("• Plano recomendado: VPS 2 (2 vCPU, 8GB RAM) ou superior", body_style))
story.append(Paragraph("• Sistema operacional: Ubuntu 22.04", body_style))
story.append(Paragraph("• Apos contratar, siga os passos abaixo para me adicionar como colaborador:", body_style))
story.append(Spacer(1, 4))
story.append(Paragraph("Como adicionar colaborador na Hostinger:", h2_style))
story.append(Paragraph("1. Acesse hpanel.hostinger.com e faca login", body_style))
story.append(Paragraph("2. No menu lateral clique em \"Conta\" → \"Colaboradores\"", body_style))
story.append(Paragraph("3. Clique em \"Convidar colaborador\"", body_style))
story.append(Paragraph("4. Insira o email: guydamasceno21@gmail.com", body_style))
story.append(Paragraph("5. Permissoes: marque \"Administrador\" ou \"Acesso total ao VPS\"", body_style))
story.append(Paragraph("6. Clique em \"Enviar convite\"", body_style))
story.append(Spacer(1, 4))
story.append(Paragraph("Apos aceitar o convite, farei toda a configuracao tecnica do servidor para voce.", body_style))

story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e2e2'), spaceAfter=8, spaceBefore=14))

# PARTE 2
story.append(Paragraph("PARTE 2 — Vincular conta Mercado Pago ao Humanity Bearers", h1_style))

story.append(Paragraph("Passo 1 — Criar conta Mercado Pago com CNPJ", h2_style))
story.append(Paragraph("• Acesse: mercadopago.com.br", body_style))
story.append(Paragraph("• Clique em \"Criar conta\" → \"É uma empresa\"", body_style))
story.append(Paragraph("• Preencha com o CNPJ da instituição", body_style))
story.append(Paragraph("• Confirme o email cadastrado", body_style))

story.append(Paragraph("Passo 2 — Cadastrar chave Pix", h2_style))
story.append(Paragraph("• No app ou site do MP → Pix → Minhas chaves", body_style))
story.append(Paragraph("• Cadastre a chave do CNPJ", body_style))
story.append(Paragraph(
    "• Isso é obrigatório para a homologacao inicial junto ao Mercado Pago. "
    "Apos a aprovacao, as doações via Pix serao encaminhadas automaticamente "
    "para a conta de cada instituicao cadastrada na plataforma.",
    body_style))

story.append(Paragraph("Passo 3 — Acessar o painel de desenvolvedores", h2_style))
story.append(Paragraph("• Acesse: mercadopago.com.br/developers", body_style))
story.append(Paragraph("• Faça login com a conta da instituição", body_style))
story.append(Paragraph("• Clique em \"Suas integracoes\" → \"Criar aplicacao\"", body_style))
story.append(Paragraph("• Nome: Humanity Bearers", body_style))
story.append(Paragraph("• Produto: Pagamentos online → Checkout Pro", body_style))
story.append(Paragraph("• Clique em Criar", body_style))

story.append(Paragraph("Passo 4 — Copiar e enviar o Access Token", h2_style))
story.append(Paragraph("• Dentro do app criado → \"Credenciais de producao\"", body_style))
story.append(Paragraph("• Copie o Access Token (comeca com APP_USR-...)", body_style))
story.append(Paragraph("• Envie para: guydamasceno21@gmail.com", body_style))

story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e2e2'), spaceAfter=8, spaceBefore=14))

# URGENCIA
story.append(Paragraph("POR QUE ISSO É URGENTE?", h1_style))
story.append(Paragraph(
    "A plataforma Humanity Bearers está em processo de aprovação junto ao Mercado Pago para ativar "
    "o sistema de repasse automático — onde cada doação vai diretamente para a conta da sua instituição, "
    "sem intermediários.",
    body_style))
story.append(Spacer(1, 6))
story.append(Paragraph(
    "Para que o Mercado Pago aprove esse sistema, precisamos comprovar que as instituições parceiras "
    "já possuem conta ativa com CNPJ e estão prontas para receber. Quanto mais rápido você completar "
    "esses passos, mais rápido sua instituição começa a receber as doações diretamente.",
    body_style))
story.append(Spacer(1, 6))
story.append(Paragraph(
    "Pedimos que conclua o cadastro e envie o Access Token o mais breve possível para: "
    "guydamasceno21@gmail.com",
    ParagraphStyle('Urgente', parent=styles['Normal'],
        fontSize=10, leading=16, textColor=colors.HexColor('#FF4E00'), fontName='Helvetica-Bold')))

story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e2e2'), spaceAfter=8, spaceBefore=14))

story.append(Paragraph("POR QUE USAR A CONTA DA INSTITUICAO E NAO A NOSSA?", h1_style))
story.append(Paragraph(
    "Cada instituicao deve ter sua propria conta Mercado Pago com CNPJ por tres razoes principais:",
    body_style))
story.append(Paragraph(
    "1. As doações vão direto para o dinheiro da instituição — sem passar pela nossa conta, "
    "sem risco de bloqueio e sem confusão contábil.",
    body_style))
story.append(Paragraph(
    "2. Transparência total — os doadores e a instituição podem acompanhar cada centavo recebido "
    "diretamente no painel do Mercado Pago.",
    body_style))
story.append(Paragraph(
    "3. Conformidade fiscal — o dinheiro entra na conta jurídica correta da instituição, "
    "facilitando a prestação de contas e evitando problemas com a Receita Federal.",
    body_style))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e2e2'), spaceAfter=8, spaceBefore=14))

story.append(Paragraph("Importante", h1_style))
story.append(Paragraph("• Nunca compartilhe sua senha do Mercado Pago", warn_style))
story.append(Paragraph("• O Access Token e seguro — ele so permite receber pagamentos", body_style))
story.append(Paragraph("• O Humanity Bearers nunca tem acesso ao saldo da sua conta", body_style))

doc.build(story)
print("PDF gerado:", output)
