export type Instituicao = {
  id: number;
  nome: string;
  tipo: "Refeicao" | "Banho" | "Cobertor";
  valor: number;
  cor: string;
  bg: string;
  emoji: string;
  pixKey: string;
  ativo?: boolean;
  mercadoPagoToken?: string | null;
  mpSetupToken?: string | null;
  gastosToken?: string | null;
};

export type Doacao = {
  id: number;
  doadorNome: string;
  doadorEmail?: string;
  doadorId?: number;
  instituicaoId: number;
  eventoId?: number;
  quantidade: number;
  valorTotal: number;
  pago: boolean;
  cancelado?: boolean;
  metodoPagamento?: string | null;
  dataCriacao: string;
  dataPagamento?: string;
  observacao?: string;
  instituicao?: Instituicao;
};

export type Gasto = {
  id?: number;
  instituicaoId?: number;
  desc: string;
  valor: number;
  data: string;
  comprovante: boolean;
  arquivoUrl?: string;
};

export type Doador = {
  id: number;
  nome: string;
  apelido?: string;
  email?: string;
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
  completa?: boolean;
  emoji: string;
  tipo?: string;
  ativa?: boolean;
  destaque?: boolean;
  periodoDestaque?: string | null;
  inicioDestaque?: string | null;
  fimDestaque?: string | null;
  totalCompletas?: number;
};

export type QRDoacao = {
  instituicaoId: number;
  evento: string;
  dataEvento: string;
  pixKey: string;
  valor: number;
};
