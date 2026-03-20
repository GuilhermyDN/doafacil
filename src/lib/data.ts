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
  { id: 1, doador: "Maria Silva",    instituicao: "Lar São Francisco", tipo: "Refeição", valor: 15, data: "19/03/2026", pago: true },
  { id: 2, doador: "João Pereira",   instituicao: "Casa do Aconchego", tipo: "Cobertor", valor: 25, data: "19/03/2026", pago: true },
  { id: 3, doador: "Ana Costa",      instituicao: "Abrigo da Paz",     tipo: "Banho",    valor: 8,  data: "18/03/2026", pago: true },
  { id: 4, doador: "Carlos Mendes",  instituicao: "Lar São Francisco", tipo: "Refeição", valor: 30, data: "18/03/2026", pago: true },
  { id: 5, doador: "Lucia Ferreira", instituicao: "Casa do Aconchego", tipo: "Cobertor", valor: 50, data: "17/03/2026", pago: true },
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
