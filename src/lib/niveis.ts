import peregrinoImg from "@/assets/nivel-peregrino.png";
import bigodeImg from "@/assets/nivel-bigode.png";
import veinhoImg from "@/assets/nivel-veinho.png";

export type NivelKey = "peregrino" | "bigode" | "veinho";

export type NivelInfo = {
  key: NivelKey;
  nome: string;
  frase: string;
  min: number;
  max: number;
  cor: string;
  gradient: string;
  ilustracao: string;
  beneficios: string[];
  cashbackBonus: number;
};

export const NIVEIS: NivelInfo[] = [
  {
    key: "peregrino",
    nome: "Peregrino",
    frase: "Em jornada",
    min: 0,
    max: 200,
    cor: "var(--nivel-peregrino)",
    gradient: "var(--gradient-peregrino)",
    ilustracao: peregrinoImg,
    cashbackBonus: 0,
    beneficios: [
      "Acesso ao Clube do Motorista",
      "5% de cashback base em parceiros",
      "Descontos exclusivos em oficinas",
    ],
  },
  {
    key: "bigode",
    nome: "Bigode",
    frase: "Na estrada há tempo",
    min: 200,
    max: 1000,
    cor: "var(--nivel-bigode)",
    gradient: "var(--gradient-bigode)",
    ilustracao: bigodeImg,
    cashbackBonus: 5,
    beneficios: [
      "+5% de cashback bônus",
      "Prioridade em aluguéis de veículos",
      "Descontos extras em oficinas parceiras",
      "Selo Bigode no perfil",
    ],
  },
  {
    key: "veinho",
    nome: "Veinho",
    frase: "Lenda da pista",
    min: 1000,
    max: Infinity,
    cor: "var(--nivel-veinho)",
    gradient: "var(--gradient-veinho)",
    ilustracao: veinhoImg,
    cashbackBonus: 15,
    beneficios: [
      "+15% de cashback bônus",
      "Atendimento VIP",
      "Caução -50% em aluguéis",
      "Selo dourado no perfil",
      "Acesso antecipado a novos parceiros",
    ],
  },
];

export function getNivelByCorridas(corridas: number): NivelInfo {
  return NIVEIS.find((n) => corridas >= n.min && corridas < n.max) ?? NIVEIS[0];
}

export function getProximoNivel(atual: NivelKey): NivelInfo | null {
  const i = NIVEIS.findIndex((n) => n.key === atual);
  return i >= 0 && i < NIVEIS.length - 1 ? NIVEIS[i + 1] : null;
}

export function getNivel(key: NivelKey): NivelInfo {
  return NIVEIS.find((n) => n.key === key) ?? NIVEIS[0];
}

export type Missao = {
  id: string;
  titulo: string;
  descricao: string;
  progresso: number;
  meta: number;
  xp: number;
};

export type Conquista = {
  id: string;
  titulo: string;
  data: string;
  nivel: NivelKey;
};

export const missoesMock: Missao[] = [
  { id: "ms1", titulo: "Maratona semanal", descricao: "Complete 20 corridas esta semana", progresso: 14, meta: 20, xp: 50 },
  { id: "ms2", titulo: "Cuidando do carro", descricao: "Visite 1 oficina parceira", progresso: 0, meta: 1, xp: 30 },
  { id: "ms3", titulo: "Indique um parceiro", descricao: "Convide 1 motorista para o Conect", progresso: 0, meta: 1, xp: 100 },
  { id: "ms4", titulo: "Cashback em dia", descricao: "Use cashback em 3 lojas locais", progresso: 1, meta: 3, xp: 40 },
];

export const conquistasMock: Conquista[] = [
  { id: "cq1", titulo: "Primeira corrida", data: "12/03/2025", nivel: "peregrino" },
  { id: "cq2", titulo: "50 corridas em uma semana", data: "08/05/2025", nivel: "peregrino" },
  { id: "cq3", titulo: "Subiu para Bigode", data: "21/07/2025", nivel: "bigode" },
  { id: "cq4", titulo: "Primeira oficina parceira", data: "02/09/2025", nivel: "bigode" },
];

export const progressoMock = {
  corridas: 412,
  xpTotal: 1240,
};
