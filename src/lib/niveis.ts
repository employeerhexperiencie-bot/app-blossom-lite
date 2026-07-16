import peregrinoAsset from "@/assets/nivel-peregrino.png.asset.json";
import juvenilAsset from "@/assets/nivel-juvenil.png.asset.json";
import calcaBrancaAsset from "@/assets/nivel-calca-branca.png.asset.json";
import bigodeAsset from "@/assets/nivel-bigode.png.asset.json";
import veinhoAsset from "@/assets/nivel-veinho.png.asset.json";

const peregrinoImg = peregrinoAsset.url;
const juvenilImg = juvenilAsset.url;
const calcaBrancaImg = calcaBrancaAsset.url;
const bigodeImg = bigodeAsset.url;
const veinhoImg = veinhoAsset.url;

export type NivelKey =
  | "peregrino"
  | "juvenil"
  | "calca-branca"
  | "bigode"
  | "veinho";

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
  taxaFixa: number;
};

const STEP = 1000;

export const NIVEIS: NivelInfo[] = [
  {
    key: "peregrino",
    nome: "Peregrino",
    frase: "Começo da jornada",
    min: 0,
    max: STEP,
    cor: "var(--nivel-peregrino)",
    gradient: "var(--gradient-peregrino)",
    ilustracao: peregrinoImg,
    taxaFixa: 4,
    beneficios: [
      "Taxa TCHI LÉVA R$ 4,00 por viagem",
      "Acesso ao Clube do Motorista",
      "Descontos base em oficinas parceiras",
    ],
  },
  {
    key: "juvenil",
    nome: "Juvenil",
    frase: "Pegando o ritmo",
    min: STEP,
    max: STEP * 2,
    cor: "var(--nivel-juvenil)",
    gradient: "var(--gradient-juvenil)",
    ilustracao: juvenilImg,
    taxaFixa: 3.75,
    beneficios: [
      "Taxa TCHI LÉVA R$ 3,75 por viagem",
      "R$ 0,25 a menos que o Peregrino",
      "Selo Juvenil no perfil",
    ],
  },
  {
    key: "calca-branca",
    nome: "Calça Branca",
    frase: "Bom de praça",
    min: STEP * 2,
    max: STEP * 3,
    cor: "var(--nivel-calca-branca)",
    gradient: "var(--gradient-calca-branca)",
    ilustracao: calcaBrancaImg,
    taxaFixa: 3.5,
    beneficios: [
      "Taxa TCHI LÉVA R$ 3,50 por viagem",
      "Prioridade em aluguéis de veículos",
      "Descontos extras em oficinas",
    ],
  },
  {
    key: "bigode",
    nome: "Bigode",
    frase: "Na estrada há tempo",
    min: STEP * 3,
    max: STEP * 4,
    cor: "var(--nivel-bigode)",
    gradient: "var(--gradient-bigode)",
    ilustracao: bigodeImg,
    taxaFixa: 3.25,
    beneficios: [
      "Taxa TCHI LÉVA R$ 3,25 por viagem",
      "Caução reduzida em aluguéis",
      "Selo Bigode no perfil",
    ],
  },
  {
    key: "veinho",
    nome: "Veinho",
    frase: "Lenda da pista",
    min: STEP * 4,
    max: Infinity,
    cor: "var(--nivel-veinho)",
    gradient: "var(--gradient-veinho)",
    ilustracao: veinhoImg,
    taxaFixa: 3,
    beneficios: [
      "Taxa TCHI LÉVA R$ 3,00 por viagem",
      "Caução -50% em aluguéis",
      "Atendimento VIP e prioridade total",
      "Acesso antecipado a novos parceiros",
      "Selo dourado no perfil",
    ],
  },
];

export function getNivelByViagens(viagens: number): NivelInfo {
  return NIVEIS.find((n) => viagens >= n.min && viagens < n.max) ?? NIVEIS[0];
}

export function getProximoNivel(atual: NivelKey): NivelInfo | null {
  const i = NIVEIS.findIndex((n) => n.key === atual);
  return i >= 0 && i < NIVEIS.length - 1 ? NIVEIS[i + 1] : null;
}

export function getNivel(key: NivelKey): NivelInfo {
  return NIVEIS.find((n) => n.key === key) ?? NIVEIS[0];
}

export function progressoNivel(viagens: number) {
  const nivel = getNivelByViagens(viagens);
  if (nivel.max === Infinity) return { pct: 1, feito: STEP, total: STEP, restante: 0, nivel };
  const total = nivel.max - nivel.min;
  const feito = viagens - nivel.min;
  const restante = Math.max(0, nivel.max - viagens);
  return { pct: Math.min(1, feito / total), feito, total, restante, nivel };
}

export const REGRAS = { caronasMin: 3, rejeicoesMax: 100, estrelasMin: 4.7 };

export type ProgressoMotorista = {
  viagensTotais: number;
  viagensMes: number;
  caronasMes: number;
  rejeicoesMes: number;
  mediaEstrelas: number;
  elogiosMes: number;
  diasRestantesMes: number;
  viagensPorSemana: number[];
  historicoMeses: { mes: string; nivel: NivelKey; status: "promovido" | "mantido" | "rebaixado" }[];
};

export const progressoMock: ProgressoMotorista = {
  viagensTotais: 1247,
  viagensMes: 184,
  caronasMes: 2,
  rejeicoesMes: 38,
  mediaEstrelas: 4.82,
  elogiosMes: 12,
  diasRestantesMes: 9,
  viagensPorSemana: [62, 48, 51, 23],
  historicoMeses: [
    { mes: "Jan", nivel: "peregrino", status: "mantido" },
    { mes: "Fev", nivel: "peregrino", status: "mantido" },
    { mes: "Mar", nivel: "peregrino", status: "mantido" },
    { mes: "Abr", nivel: "juvenil", status: "promovido" },
    { mes: "Mai", nivel: "juvenil", status: "mantido" },
    { mes: "Jun", nivel: "juvenil", status: "mantido" },
  ],
};

export type RegraStatus = "ok" | "atencao" | "risco";

export function statusRegra(valor: number, limite: number, tipo: "min" | "max"): RegraStatus {
  if (tipo === "min") {
    if (valor >= limite) return "ok";
    if (valor >= limite * 0.5) return "atencao";
    return "risco";
  }
  if (valor >= limite) return "risco";
  if (valor >= limite * 0.75) return "atencao";
  return "ok";
}

export function regrasManutencao(p: ProgressoMotorista) {
  const caronas = statusRegra(p.caronasMes, REGRAS.caronasMin, "min");
  const rejeicoes = statusRegra(p.rejeicoesMes, REGRAS.rejeicoesMax, "max");
  const estrelas: RegraStatus =
    p.mediaEstrelas >= REGRAS.estrelasMin ? "ok" : p.mediaEstrelas >= REGRAS.estrelasMin - 0.2 ? "atencao" : "risco";
  const arr = [caronas, rejeicoes, estrelas];
  const geral: RegraStatus = arr.includes("risco") ? "risco" : arr.includes("atencao") ? "atencao" : "ok";
  return { caronas, rejeicoes, estrelas, geral };
}

export function economiaMes(viagensMes: number, taxaAtual: number) {
  const taxaBase = NIVEIS[0].taxaFixa;
  return Math.max(0, (taxaBase - taxaAtual) * viagensMes);
}

export function gastoMesEmTaxas(viagensMes: number, taxaAtual: number) {
  return viagensMes * taxaAtual;
}

export function simularProximoNivel(p: ProgressoMotorista, extra: number) {
  const nivel = getNivelByViagens(p.viagensTotais);
  const proximo = getProximoNivel(nivel.key);
  const novoTotal = p.viagensTotais + extra;
  const novoNivel = getNivelByViagens(novoTotal);
  const economiaTotal = economiaMes(p.viagensMes + extra, novoNivel.taxaFixa);
  const faltam = proximo ? Math.max(0, proximo.min - novoTotal) : 0;
  return { novoNivel, economiaTotal, faltam, atingiuProximo: !!proximo && novoTotal >= proximo.min };
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
  { id: "ms1", titulo: "Caronas solidárias", descricao: "Dê 3 caronas grátis este mês", progresso: 2, meta: 3, xp: 80 },
  { id: "ms2", titulo: "Mantenha as rejeições", descricao: "Fique abaixo de 100 rejeições no mês", progresso: 38, meta: 100, xp: 60 },
  { id: "ms3", titulo: "Ritmo da semana", descricao: "Complete 40 viagens nesta semana", progresso: 23, meta: 40, xp: 50 },
  { id: "ms4", titulo: "Elogios", descricao: "Receba 15 elogios além das 5 estrelas", progresso: 12, meta: 15, xp: 70 },
];

export const conquistasMock: Conquista[] = [
  { id: "cq1", titulo: "Primeira corrida", data: "12/03/2025", nivel: "peregrino" },
  { id: "cq2", titulo: "Subiu para Juvenil", data: "21/04/2025", nivel: "juvenil" },
  { id: "cq3", titulo: "Mês perfeito sem rejeições", data: "30/05/2025", nivel: "juvenil" },
  { id: "cq4", titulo: "10 caronas solidárias", data: "15/06/2025", nivel: "juvenil" },
];

export const getNivelByCorridas = getNivelByViagens;
