export type Instituicao = {
  id: number;
  nome: string;
  tipo: "Refeição" | "Banho" | "Cobertor";
  valor: number;
  cor: string;
  bg: string;
  emoji: string;
  pixKey: string;
};

export type Doacao = {
  id: number;
  doador: string;
  instituicao: string;
  tipo: string;
  valor: number;
  data: string;
  pago: boolean;
};

export type Gasto = {
  desc: string;
  valor: number;
  data: string;
  comprovante: boolean;
};

export type Doador = {
  id: number;
  nome: string;
  apelido: string;
  totalDoado: number;
  pontos: number;
  nivel: "bronze" | "prata" | "ouro" | "diamante" | "lenda";
  avatar: string;
  homenagem?: string;
  badge?: string;
  missaoCompleta?: boolean;
};

export type Missao = {
  id: number;
  titulo: string;
  descricao: string;
  pontos: number;
  completa: boolean;
  emoji: string;
};

export type QRDoacao = {
  instituicaoId: number;
  evento: string;
  dataEvento: string;
  pixKey: string;
  valor: number;
};

export const INSTITUICOES: Instituicao[] = [
  {
    id: 1,
    nome: "Lar São Francisco",
    tipo: "Refeição",
    valor: 15,
    cor: "#1D9E75",
    bg: "#E1F5EE",
    emoji: "🍽",
    pixKey: "doacoes@larsaofrancisco.org",
  },
  {
    id: 2,
    nome: "Abrigo da Paz",
    tipo: "Banho",
    valor: 8,
    cor: "#185FA5",
    bg: "#E6F1FB",
    emoji: "🚿",
    pixKey: "doacoes@abrigodapaz.org",
  },
  {
    id: 3,
    nome: "Casa do Aconchego",
    tipo: "Cobertor",
    valor: 25,
    cor: "#BA7517",
    bg: "#FAEEDA",
    emoji: "🧣",
    pixKey: "doacoes@casadoaconchego.org",
  },
];

export const DOACOES_MOCK: Doacao[] = [
  { id: 1,  doador: "Maria Silva",      instituicao: "Lar São Francisco", tipo: "Refeição", valor: 15,  data: "19/03/2026", pago: true },
  { id: 2,  doador: "João Pereira",     instituicao: "Casa do Aconchego", tipo: "Cobertor", valor: 25,  data: "19/03/2026", pago: true },
  { id: 3,  doador: "Ana Costa",        instituicao: "Abrigo da Paz",     tipo: "Banho",    valor: 8,   data: "18/03/2026", pago: true },
  { id: 4,  doador: "Carlos Mendes",    instituicao: "Lar São Francisco", tipo: "Refeição", valor: 30,  data: "18/03/2026", pago: true },
  { id: 5,  doador: "Lucia Ferreira",   instituicao: "Casa do Aconchego", tipo: "Cobertor", valor: 50,  data: "17/03/2026", pago: true },
  { id: 6,  doador: "Pedro Alves",      instituicao: "Lar São Francisco", tipo: "Refeição", valor: 60,  data: "16/03/2026", pago: true },
  { id: 7,  doador: "Fernanda Lima",    instituicao: "Abrigo da Paz",     tipo: "Banho",    valor: 24,  data: "16/03/2026", pago: true },
  { id: 8,  doador: "Roberto Santos",   instituicao: "Casa do Aconchego", tipo: "Cobertor", valor: 100, data: "15/03/2026", pago: true },
  { id: 9,  doador: "Camila Rocha",     instituicao: "Lar São Francisco", tipo: "Refeição", valor: 45,  data: "15/03/2026", pago: true },
  { id: 10, doador: "Thiago Oliveira",  instituicao: "Casa do Aconchego", tipo: "Cobertor", valor: 75,  data: "14/03/2026", pago: true },
];

export const GASTOS_MOCK: Record<number, Gasto[]> = {
  1: [
    { desc: "Compra de arroz e feijão", valor: 120, data: "18/03/2026", comprovante: true },
    { desc: "Frango para refeições",    valor: 85,  data: "17/03/2026", comprovante: true },
  ],
  2: [
    { desc: "Sabonetes e shampoos", valor: 45, data: "18/03/2026", comprovante: true },
    { desc: "Toalhas novas",        valor: 60, data: "17/03/2026", comprovante: false },
  ],
  3: [
    { desc: "Cobertores térmicos", valor: 200, data: "19/03/2026", comprovante: true },
  ],
};

export const RANKING_MOCK: Doador[] = [
  {
    id: 1,
    nome: "Roberto Santos",
    apelido: "Bob Generoso",
    totalDoado: 250,
    pontos: 2500,
    nivel: "lenda",
    avatar: "RS",
    homenagem: "O coração mais aberto da congregação! Seu exemplo inspira todos nós. 🏆",
    badge: "🏆 Lenda da Missão",
    missaoCompleta: true,
  },
  {
    id: 2,
    nome: "Thiago Oliveira",
    apelido: "Thiago Solidário",
    totalDoado: 175,
    pontos: 1750,
    nivel: "diamante",
    avatar: "TO",
    homenagem: "Um dos maiores apoiadores do nosso projeto social. Deus te abençoe! 💎",
    badge: "💎 Guardião Diamante",
    missaoCompleta: true,
  },
  {
    id: 3,
    nome: "Lucia Ferreira",
    apelido: "Lucia Luz",
    totalDoado: 120,
    pontos: 1200,
    nivel: "ouro",
    avatar: "LF",
    homenagem: "Sua generosidade aquece corações! Obrigado por cada doação. ✨",
    badge: "⭐ Estrela de Ouro",
    missaoCompleta: false,
  },
  {
    id: 4,
    nome: "Pedro Alves",
    apelido: "Pedro Pai",
    totalDoado: 90,
    pontos: 900,
    nivel: "prata",
    avatar: "PA",
    homenagem: "Fiel em cada missão. Sua fé move montanhas! 🌟",
    badge: "🥈 Guerreiro de Prata",
    missaoCompleta: false,
  },
  {
    id: 5,
    nome: "Camila Rocha",
    apelido: "Cami Bênção",
    totalDoado: 60,
    pontos: 600,
    nivel: "prata",
    avatar: "CR",
    homenagem: "Sempre presente, sempre abençoando! 🙏",
    badge: "🥈 Guerreiro de Prata",
    missaoCompleta: false,
  },
  {
    id: 6,
    nome: "Carlos Mendes",
    apelido: "Carlos Fiel",
    totalDoado: 45,
    pontos: 450,
    nivel: "bronze",
    avatar: "CM",
    missaoCompleta: false,
  },
  {
    id: 7,
    nome: "Maria Silva",
    apelido: "Maria Graça",
    totalDoado: 30,
    pontos: 300,
    nivel: "bronze",
    avatar: "MS",
    missaoCompleta: false,
  },
];

export const MISSOES_MOCK: Missao[] = [
  {
    id: 1,
    titulo: "Primeira Doação",
    descricao: "Faça sua primeira doação e entre para o time!",
    pontos: 100,
    completa: true,
    emoji: "🐾",
  },
  {
    id: 2,
    titulo: "Doação em Família",
    descricao: "Traga um familiar para fazer uma doação junto com você.",
    pontos: 200,
    completa: true,
    emoji: "❤️",
  },
  {
    id: 3,
    titulo: "Missão Refeição",
    descricao: "Done para cobrir o jantar de 5 pessoas num único dia.",
    pontos: 300,
    completa: false,
    emoji: "🍽",
  },
  {
    id: 4,
    titulo: "Mês Completo",
    descricao: "Done pelo menos uma vez por semana durante todo o mês.",
    pontos: 500,
    completa: false,
    emoji: "📅",
  },
  {
    id: 5,
    titulo: "Super Herói Social",
    descricao: "Alcance R$ 200 em doações totais.",
    pontos: 1000,
    completa: false,
    emoji: "🦸",
  },
  {
    id: 6,
    titulo: "Convoca a Galera",
    descricao: "Indique 3 amigos que também façam uma doação.",
    pontos: 400,
    completa: false,
    emoji: "📣",
  },
];

export const QR_EVENTOS: QRDoacao[] = [
  { instituicaoId: 1, evento: "Culto de Domingo", dataEvento: "23/03/2026", pixKey: "doacoes@larsaofrancisco.org", valor: 15 },
  { instituicaoId: 2, evento: "Culto de Domingo", dataEvento: "23/03/2026", pixKey: "doacoes@abrigodapaz.org", valor: 8 },
  { instituicaoId: 3, evento: "Culto de Domingo", dataEvento: "23/03/2026", pixKey: "doacoes@casadoaconchego.org", valor: 25 },
  { instituicaoId: 1, evento: "Missão Especial",  dataEvento: "29/03/2026", pixKey: "doacoes@larsaofrancisco.org", valor: 30 },
];
