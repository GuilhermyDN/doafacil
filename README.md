# DoaFácil – MVP

Sistema de gestão de doações para instituições beneficentes.

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## Telas

| Rota | Descrição |
|------|-----------|
| `/doacao` | Página de doação via QR Code |
| `/admin` | Painel da Igreja |
| `/instituicao` | Prestação de contas das instituições |

## Estrutura

```
src/
├── app/
│   ├── doacao/page.tsx       # Tela do doador
│   ├── admin/page.tsx        # Painel admin
│   ├── instituicao/page.tsx  # Prestação de contas
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   └── ui.tsx                # Badge, Card, Stat
└── lib/
    └── data.ts               # Tipos e dados mockados
```
