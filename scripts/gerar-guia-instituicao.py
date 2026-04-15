"""
Gera o PDF 'Como receber doações no Humanity Bearers' que o admin envia
para a instituição parceira junto com o link de setup /configurar-mp?token=X.

Saída: public/guia-instituicao.pdf
Executar: python scripts/gerar-guia-instituicao.py
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, KeepTogether,
)

# Paleta — mesma do site
BLUE   = HexColor("#000DFF")
ORANGE = HexColor("#FF4E00")
BLACK  = HexColor("#000000")
INK    = HexColor("#111111")
MUTED  = HexColor("#555555")
GREY   = HexColor("#888888")
LIGHT  = HexColor("#f5f5f5")
AMBERBG = HexColor("#fffbeb")
AMBERTXT = HexColor("#78350f")
AMBER  = HexColor("#fde68a")
BLUEBG = HexColor("#eff6ff")
BLUETX = HexColor("#1e40af")
GREEN  = HexColor("#16a34a")
GREENBG= HexColor("#e6f7ee")

out_path = "public/guia-instituicao.pdf"

doc = SimpleDocTemplate(
    out_path,
    pagesize=A4,
    leftMargin=2*cm, rightMargin=2*cm,
    topMargin=2*cm, bottomMargin=2*cm,
    title="Humanity Bearers — Guia de configuração",
    author="Humanity Bearers",
    subject="Passo a passo para conectar sua conta Mercado Pago",
)

base = getSampleStyleSheet()

# Estilos
st_title = ParagraphStyle(
    "title", parent=base["Title"],
    fontName="Helvetica-Bold", fontSize=26, leading=32,
    textColor=INK, alignment=TA_LEFT, spaceAfter=10,
)
st_subtitle = ParagraphStyle(
    "subtitle", parent=base["Normal"],
    fontName="Helvetica", fontSize=13, leading=18,
    textColor=MUTED, alignment=TA_LEFT, spaceAfter=18,
)
st_h1 = ParagraphStyle(
    "h1", parent=base["Heading1"],
    fontName="Helvetica-Bold", fontSize=18, leading=24,
    textColor=BLUE, spaceBefore=18, spaceAfter=10,
)
st_h2 = ParagraphStyle(
    "h2", parent=base["Heading2"],
    fontName="Helvetica-Bold", fontSize=14, leading=20,
    textColor=INK, spaceBefore=12, spaceAfter=6,
)
st_body = ParagraphStyle(
    "body", parent=base["BodyText"],
    fontName="Helvetica", fontSize=11, leading=16,
    textColor=INK, spaceAfter=8,
)
st_li = ParagraphStyle(
    "li", parent=st_body, leftIndent=14, bulletIndent=0, spaceAfter=4,
)
st_caption = ParagraphStyle(
    "caption", parent=base["Normal"],
    fontName="Helvetica-Oblique", fontSize=9, leading=13,
    textColor=GREY, spaceAfter=4,
)
st_step_num = ParagraphStyle(
    "stepnum", parent=base["Normal"],
    fontName="Helvetica-Bold", fontSize=10, leading=14,
    textColor=ORANGE, alignment=TA_LEFT, spaceAfter=2,
)
st_note = ParagraphStyle(
    "note", parent=base["BodyText"],
    fontName="Helvetica", fontSize=10, leading=14,
    textColor=AMBERTXT, spaceAfter=6,
)
st_info = ParagraphStyle(
    "info", parent=base["BodyText"],
    fontName="Helvetica", fontSize=10, leading=14,
    textColor=BLUETX, spaceAfter=6,
)
st_mono = ParagraphStyle(
    "mono", parent=base["Code"],
    fontName="Courier", fontSize=9, leading=12,
    textColor=INK, spaceAfter=4,
)
st_cover_label = ParagraphStyle(
    "coverlabel", parent=base["Normal"],
    fontName="Helvetica-Bold", fontSize=10, leading=14,
    textColor=ORANGE, spaceAfter=6, alignment=TA_CENTER,
)
st_cover_title = ParagraphStyle(
    "covertitle", parent=base["Title"],
    fontName="Helvetica-Bold", fontSize=34, leading=40,
    textColor=INK, alignment=TA_CENTER, spaceAfter=12,
)
st_cover_sub = ParagraphStyle(
    "coversub", parent=base["Normal"],
    fontName="Helvetica", fontSize=14, leading=20,
    textColor=MUTED, alignment=TA_CENTER, spaceAfter=30,
)

# ─── Helpers ──────────────────────────────────────────────────────────

def callout(label: str, body: str, bg=AMBERBG, border=AMBER, textColor=AMBERTXT):
    """Caixinha destacada tipo 'atenção' ou 'info'."""
    p_label = Paragraph(f"<b>{label}</b>", ParagraphStyle("clabel", fontName="Helvetica-Bold", fontSize=10, textColor=textColor, leading=14))
    p_body = Paragraph(body, ParagraphStyle("cbody", fontName="Helvetica", fontSize=10, textColor=textColor, leading=14))
    t = Table([[p_label], [p_body]], colWidths=[17*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), bg),
        ("BOX", (0,0), (-1,-1), 0.8, border),
        ("LEFTPADDING", (0,0), (-1,-1), 14),
        ("RIGHTPADDING", (0,0), (-1,-1), 14),
        ("TOPPADDING", (0,0), (0,0), 10),
        ("BOTTOMPADDING", (0,-1), (-1,-1), 10),
        ("TOPPADDING", (0,1), (-1,1), 2),
    ]))
    return t

def step_header(num: int, title: str):
    return [
        Paragraph(f"PASSO {num} DE 3", st_step_num),
        Paragraph(title, st_h1),
    ]

def li(txt):
    return Paragraph(f"•&nbsp;&nbsp;{txt}", st_li)

def numli(n, txt):
    return Paragraph(f"<b>{n}.</b>&nbsp;&nbsp;{txt}", st_li)

# ─── Conteúdo ─────────────────────────────────────────────────────────

story = []

# ═══ CAPA ═══
story.append(Spacer(1, 5*cm))
story.append(Paragraph("GUIA DE CONFIGURAÇÃO", st_cover_label))
story.append(Paragraph("Como receber doações<br/>no Humanity Bearers", st_cover_title))
story.append(Paragraph("Passo a passo para conectar a sua conta<br/>do Mercado Pago e começar a receber.", st_cover_sub))
story.append(Spacer(1, 2*cm))

# Tabela-resumo dos 3 passos na capa
resumo = [
    ["1", "Credenciais", "Copie suas chaves de produção do Mercado Pago"],
    ["2", "Pagamento de teste", "Faça 1 pagamento para subir o score da integração"],
    ["3", "Score da integração", "Confira o valor no painel MP e digite aqui (mínimo 43)"],
]
tbl = Table(resumo, colWidths=[1.2*cm, 5.2*cm, 10.8*cm])
tbl.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (0,-1), BLUE),
    ("TEXTCOLOR", (0,0), (0,-1), white),
    ("FONTNAME", (0,0), (0,-1), "Helvetica-Bold"),
    ("FONTSIZE", (0,0), (0,-1), 16),
    ("ALIGN", (0,0), (0,-1), "CENTER"),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("FONTNAME", (1,0), (1,-1), "Helvetica-Bold"),
    ("FONTSIZE", (1,0), (1,-1), 11),
    ("FONTNAME", (2,0), (2,-1), "Helvetica"),
    ("FONTSIZE", (2,0), (2,-1), 10),
    ("TEXTCOLOR", (1,0), (-1,-1), INK),
    ("LEFTPADDING", (0,0), (-1,-1), 12),
    ("RIGHTPADDING", (0,0), (-1,-1), 12),
    ("TOPPADDING", (0,0), (-1,-1), 12),
    ("BOTTOMPADDING", (0,0), (-1,-1), 12),
    ("GRID", (0,0), (-1,-1), 0.5, HexColor("#e5e7eb")),
    ("BACKGROUND", (1,0), (-1,-1), white),
]))
story.append(tbl)

story.append(PageBreak())

# ═══ APRESENTAÇÃO ═══
story.append(Paragraph("Olá! Bem-vinda ao Humanity Bearers", st_h1))
story.append(Paragraph(
    "O Humanity Bearers é uma plataforma que conecta doadores a instituições que trabalham para "
    "reduzir o sofrimento de pessoas em situação de rua — oferecendo refeições, banhos, cobertores "
    "e outros cuidados básicos.",
    st_body,
))
story.append(Paragraph(
    "Para sua instituição receber doações pela plataforma, você precisa <b>conectar a sua própria conta "
    "do Mercado Pago</b>. O dinheiro vai <b>direto para você</b> — o Humanity Bearers nunca toca no saldo "
    "e não cobra taxa da doação.",
    st_body,
))
story.append(Paragraph(
    "Este guia explica os 3 passos que você vai seguir no link de configuração que o Humanity Bearers "
    "te enviou (algo como <font name='Courier'>humanitybearers.tech/configurar-mp?token=...</font>).",
    st_body,
))

story.append(Spacer(1, 0.5*cm))
story.append(callout(
    "⚠️ Pré-requisitos",
    "Você precisa de uma conta no Mercado Pago <b>já existente</b>, "
    "preferencialmente com CNPJ da instituição (ou CPF verificado do responsável), "
    "com endereço completo e atividade econômica cadastrada. "
    "Contas novas sem esses dados vão funcionar para receber PIX, mas o cartão de crédito "
    "pode ser rejeitado pelo antifraude do Mercado Pago até a conta amadurecer.",
))

story.append(Spacer(1, 0.5*cm))
story.append(callout(
    "🔒 Sobre privacidade",
    "Suas credenciais do Mercado Pago ficam guardadas apenas no banco de dados do Humanity Bearers "
    "e são usadas <b>somente</b> para processar as doações que chegam para a sua instituição. "
    "Ninguém da equipe tem acesso ao saldo da sua conta do Mercado Pago.",
    bg=BLUEBG, border=HexColor("#bfdbfe"), textColor=BLUETX,
))

story.append(PageBreak())

# ═══ PASSO 1 ═══
for el in step_header(1, "Credenciais do Mercado Pago"):
    story.append(el)

story.append(Paragraph(
    "O primeiro passo é copiar as credenciais de <b>produção</b> da sua conta do Mercado Pago e colar "
    "no link de configuração. Siga:",
    st_body,
))
story.append(numli(1, "Entre em <font name='Courier'>mercadopago.com.br/developers/panel/app</font>"))
story.append(numli(2, "Faça login com a conta do Mercado Pago da <b>sua instituição</b> (não uma conta pessoal sua)."))
story.append(numli(3, "No painel, clique em <b>Suas integrações</b> &gt;<b>Criar aplicação</b>."))
story.append(numli(4, "Dê um nome à aplicação (ex: 'Doações Humanity Bearers'), escolha 'CheckoutPro' quando o painel perguntar sobre produto a integrar, e clique em 'Criar aplicação'."))
story.append(numli(5, "Na aplicação recém-criada, no menu lateral, vá em <b>Credenciais de produção</b>."))
story.append(numli(6, "Copie os dois valores que começam com <font name='Courier'>APP_USR-</font>:"))
story.append(li("<b>Public Key</b> (chave pública)"))
story.append(li("<b>Access Token</b> (token de acesso)"))
story.append(numli(7, "Abra o link de configuração que o Humanity Bearers enviou no seu celular/computador."))
story.append(numli(8, "Cole os dois valores nos campos correspondentes e clique em <b>Salvar credenciais</b>."))

story.append(Spacer(1, 0.5*cm))
story.append(callout(
    "⚠️ Importante",
    "Use sempre as credenciais de <b>produção</b>, não as de teste. Se copiar uma credencial de teste "
    "(que começa com <font name='Courier'>TEST-</font>), os pagamentos reais não vão chegar para você. "
    "Se você vir uma chave <font name='Courier'>TEST-</font>, procure pela aba 'Produção' no painel do Mercado Pago.",
))

story.append(PageBreak())

# ═══ PASSO 2 ═══
for el in step_header(2, "Pagamento de teste"):
    story.append(el)

story.append(Paragraph(
    "Depois de salvar as credenciais, o sistema vai te levar automaticamente para o próximo passo: "
    "fazer <b>um</b> pagamento de teste de R$ 1,00 com cartão de crédito.",
    st_body,
))
story.append(Paragraph(
    "Esse passo é <b>obrigatório</b> porque o Mercado Pago exige que pelo menos 1 pagamento real tenha "
    "chegado na sua conta antes de liberar a integração para produção. É o 'checklist de homologação' "
    "que você vai ver no painel de developers deles.",
    st_body,
))
story.append(Paragraph(
    "Basta clicar no botão <b>'Fazer pagamento de teste'</b>. Você será levada para a página de doação, "
    "já com sua instituição pré-selecionada. Preencha nome, e-mail, telefone, e clique em "
    "<b>'Pagar com cartão'</b>. Na tela seguinte digite os dados de um cartão de crédito (pode ser o seu).",
    st_body,
))

story.append(Spacer(1, 0.5*cm))
story.append(callout(
    "🧪 Pode ser recusado — sem problema",
    "É comum que essa primeira transação seja recusada pelo antifraude do Mercado Pago com a mensagem "
    "<b>'cc_rejected_high_risk'</b>. Isso acontece porque a sua conta é nova no sistema, mas "
    "<b>não impede a homologação</b>. O que importa é o pedido ter chegado na sua conta MP com todos "
    "os campos obrigatórios preenchidos.",
    bg=BLUEBG, border=HexColor("#bfdbfe"), textColor=BLUETX,
))

story.append(Spacer(1, 0.3*cm))
story.append(Paragraph(
    "Depois do pagamento de teste (aprovado ou recusado), o sistema te leva automaticamente "
    "para o <b>passo 3</b>, onde você vai conferir o score da sua integração no painel do Mercado Pago.",
    st_body,
))

story.append(PageBreak())

# ═══ PASSO 3 — SCORE ═══
for el in step_header(3, "Score da Qualidade da Integração"):
    story.append(el)

story.append(Paragraph(
    "O Mercado Pago avalia cada integração através de uma pontuação chamada <b>Qualidade da integração</b>. "
    "A pontuação vai de 0 a 100 e sobe conforme você envia pagamentos com os campos obrigatórios corretos. "
    "Quando a pontuação passa de <b>43</b>, a sua aplicação é considerada apta para produção.",
    st_body,
))

story.append(Paragraph("<b>O que fazer:</b>", st_h2))
story.append(numli(1, "Vá em <font name='Courier'>mercadopago.com.br/developers/panel/app</font>"))
story.append(numli(2, "Abra a aplicação que você criou no passo 1"))
story.append(numli(3, "No menu lateral, clique em <b>Avaliação &gt; Qualidade da integração</b>"))
story.append(numli(4, "Olhe o número grande em destaque (aguarde de 15 min a 2h se ainda não atualizou após o pagamento de teste)"))
story.append(numli(5, "Volte ao link do Humanity Bearers, digite o número no campo e clique em <b>Validar e ativar</b>"))

story.append(Spacer(1, 0.5*cm))
story.append(callout(
    "📊 Se o score estiver abaixo de 43",
    "Não tem problema — basta clicar em <b>&ldquo;Fazer outro pagamento de teste&rdquo;</b> na mesma tela "
    "e repetir o passo 2. Cada novo pagamento com os campos completos faz o score subir. "
    "Depois recarregue o painel do Mercado Pago e digite o novo valor.",
    bg=BLUEBG, border=HexColor("#bfdbfe"), textColor=BLUETX,
))

story.append(Spacer(1, 0.3*cm))
story.append(callout(
    "⚡ Aprovação instantânea",
    "O Mercado Pago <b>não tem janela de 48h</b> para homologar. Assim que o score passa de 43, "
    "a aplicação está aprovada. Assim que você digita o valor no campo do Humanity Bearers, "
    "sua instituição é ativada <b>na hora</b> e passa a aparecer no site público.",
    bg=GREENBG, border=HexColor("#bbf7d0"), textColor=GREEN,
))

story.append(Spacer(1, 0.3*cm))
story.append(Paragraph(
    "Pronto! Passando do 43, sua instituição entra no ar:",
    st_body,
))
story.append(li("Ela aparece na <b>página pública de doações</b> do Humanity Bearers."))
story.append(li("Doadores podem escolher a sua instituição e pagar via <b>PIX</b> ou <b>cartão de crédito</b>."))
story.append(li("Todo o dinheiro cai <b>direto na sua conta do Mercado Pago</b>, sem passar por ninguém."))
story.append(li("Você recebe as notificações de pagamento normalmente no app do Mercado Pago."))

story.append(Spacer(1, 0.5*cm))
story.append(callout(
    "🎉 É isso!",
    "Se precisar de ajuda em qualquer passo, fale com a equipe do Humanity Bearers pelo WhatsApp "
    "de atendimento. Você também pode voltar a este link de configuração a qualquer momento — ele "
    "continua funcionando mesmo depois da ativação, caso precise regerar credenciais ou fazer ajustes.",
    bg=GREENBG, border=HexColor("#bbf7d0"), textColor=GREEN,
))

story.append(Spacer(1, 0.8*cm))

# Dúvidas comuns
story.append(Paragraph("Dúvidas frequentes", st_h2))

story.append(Paragraph("<b>Tenho taxas para receber doação?</b>", st_body))
story.append(Paragraph(
    "O Humanity Bearers não cobra nada. As únicas taxas são as do Mercado Pago (as mesmas de qualquer "
    "cobrança que você faria pelo MP para outros fins). A taxa de PIX geralmente é de 0,99% e a de "
    "cartão varia entre 4% e 5% + R$0,40 por transação — consulte o painel do MP para valores atualizados.",
    st_body,
))

story.append(Paragraph("<b>Quando o dinheiro é liberado?</b>", st_body))
story.append(Paragraph(
    "O prazo depende da configuração de 'liberação' da sua conta no Mercado Pago. PIX geralmente libera "
    "imediatamente. Cartão pode liberar em até 30 dias dependendo da configuração. Tudo isso é gerido "
    "pelo Mercado Pago — o Humanity Bearers não interfere.",
    st_body,
))

story.append(Paragraph("<b>Posso mudar as credenciais depois?</b>", st_body))
story.append(Paragraph(
    "Sim. Basta voltar ao mesmo link de configuração e colar novas credenciais. Se perder o link, peça "
    "ao admin do Humanity Bearers para gerar um novo.",
    st_body,
))

story.append(Paragraph("<b>Minha instituição pode receber doação antes de homologar?</b>", st_body))
story.append(Paragraph(
    "Não. Enquanto sua instituição não estiver homologada (completou os 4 passos), ela não aparece no "
    "site público. Isso é intencional, para evitar que doadores tentem pagar com cartão e sejam "
    "recusados pelo antifraude.",
    st_body,
))

# ─── Build ────────────────────────────────────────────────────────────

def footer(canvas, doc_):
    """Rodapé simples em todas as páginas (exceto a capa)."""
    canvas.saveState()
    if doc_.page > 1:
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(GREY)
        canvas.drawString(2*cm, 1.2*cm, "Humanity Bearers — Guia de configuração")
        canvas.drawRightString(A4[0] - 2*cm, 1.2*cm, f"Página {doc_.page}")
    canvas.restoreState()

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(f"PDF gerado: {out_path}")
