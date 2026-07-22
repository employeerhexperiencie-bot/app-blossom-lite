// Mock data + tipos para o módulo Proprietário TCHI LÉVA (sem banco)

export type EventoTipo =
  | "cadastro"
  | "locacao"
  | "devolucao"
  | "revisao"
  | "troca-oleo"
  | "troca-pneu"
  | "multa"
  | "acidente"
  | "documento"
  | "km"
  | "custo"
  | "observacao"
  | "outro";

export type CustoCategoria = "lavagem" | "multa" | "estacionamento" | "ipva" | "combustivel" | "outro";


export type EventoVeiculo = {
  id: string;
  carroId: string;
  tipo: EventoTipo;
  titulo: string;
  descricao?: string;
  data: string; // ISO
  km?: number;
  valor?: number;
  origemKm?: "manual" | "corrida" | "foto";
  categoria?: CustoCategoria;
};

export type Lembrete = {
  id: string;
  carroId: string;
  titulo: string;
  descricao?: string;
  dataAlvo: string;
  recorrencia: "nenhuma" | "mensal" | "anual";
  feito: boolean;
  criadoEm: string;
};


export type DocStatus = "ok" | "vencendo" | "vencido";
export type DocumentoVeiculo = {
  id: string;
  carroId: string;
  tipo: "CRLV" | "Seguro" | "Licenciamento" | "IPVA" | "Manual" | "NF";
  vencimento: string; // ISO
  status: DocStatus;
};

export type ItemManutencao = {
  id: string;
  carroId: string;
  item:
    | "Óleo"
    | "Filtro de óleo"
    | "Filtro de ar"
    | "Freios"
    | "Pneus"
    | "Alinhamento"
    | "Balanceamento"
    | "Correia"
    | "Fluídos";
  intervaloKm?: number;
  intervaloMeses?: number;
  ultimoKm: number;
  ultimaData: string;
  proximoKm?: number;
  proximaData?: string;
};

export type Contrato = {
  id: string;
  carroId: string;
  motoristaId: string;
  motoristaNome: string;
  valor: number;
  periodicidade: "diaria" | "semanal" | "mensal";
  caucao: number;
  inicio: string;
  fim?: string;
  status: "ativo" | "encerrado" | "suspenso";
  observacoes?: string;
};

export type Pagamento = {
  id: string;
  contratoId: string;
  valor: number;
  data: string;
  forma: "Pix" | "Dinheiro" | "Cartão" | "Transferência";
  status: "pago" | "pendente" | "atrasado";
};

export type ChecklistItem = {
  km: number;
  combustivel: "vazio" | "1/4" | "1/2" | "3/4" | "cheio";
  pneus: "ok" | "atenção" | "trocar";
  avarias: string;
  observacoes?: string;
  fotos: number;
};

export type Checklist = {
  id: string;
  carroId: string;
  contratoId: string;
  tipo: "entrada" | "devolucao";
  data: string;
  itens: ChecklistItem;
};

export type Notificacao = {
  id: string;
  tipo: "pagamento" | "documento" | "manutencao" | "contrato" | "solicitacao" | "km" | "info";
  titulo: string;
  descricao: string;
  data: string;
  urgencia: "alta" | "media" | "baixa";
  carroId?: string;
  contratoId?: string;
  solicitacaoId?: string;
};

export type AnuncioLocacao = {
  publicado: boolean;
  periodicidade: "diaria" | "mensal";
  valor: number;
  caucao: number;
  requisitos: string;
  observacoes?: string;
  publicadoEm?: string;
};

export type MotoristaCandidato = {
  id: string;
  nome: string;
  avaliacao: number;
  tempoPlataforma: string;
  corridas: number;
  pontualidade: number; // 0-100
  historico: string;
  observacoes?: string;
  foto?: string;
};

export type SolicitacaoLocacao = {
  id: string;
  carroId: string;
  motoristaId: string;
  data: string;
  status: "pendente" | "aceita" | "recusada";
  mensagem?: string;
};

export type ConfigLembretes = {
  vencimentoAluguel: boolean;
  antecedenciaDias: number; // 0/1/3
  fotoPainelMensal: boolean;
  documentacao: boolean;
};

export type AnuncioMarketplace = {
  id: string;
  proprietario: string;
  marca: string;
  modelo: string;
  ano: number;
  cidade: string;
  valor: number;
  periodicidade: "diaria" | "mensal";
  foto: string;
  regras: string;
};

// -------- Seeds ----------

export const eventosMock: EventoVeiculo[] = [
  { id: "e1", carroId: "c1", tipo: "cadastro", titulo: "Veículo cadastrado", data: "2025-06-01", km: 32000 },
  { id: "e2", carroId: "c1", tipo: "locacao", titulo: "Alugado para João Silva", data: "2025-08-15", km: 34500 },
  { id: "e3", carroId: "c1", tipo: "troca-oleo", titulo: "Troca de óleo + filtro", data: "2025-11-04", km: 36500, valor: 180 },
  { id: "e4", carroId: "c1", tipo: "multa", titulo: "Multa leve — Zona Azul", data: "2026-01-12", valor: 130 },
  { id: "e5", carroId: "c1", tipo: "revisao", titulo: "Revisão dos 38 mil", data: "2026-03-22", km: 38000, valor: 420 },

  { id: "e6", carroId: "c2", tipo: "cadastro", titulo: "Veículo cadastrado", data: "2025-09-10", km: 18000 },
  { id: "e7", carroId: "c2", tipo: "troca-pneu", titulo: "Troca de 2 pneus dianteiros", data: "2026-02-14", km: 21000, valor: 780 },
  { id: "e8", carroId: "c2", tipo: "documento", titulo: "Seguro renovado", data: "2026-05-01" },

  { id: "e9", carroId: "c3", tipo: "cadastro", titulo: "Veículo cadastrado", data: "2024-12-01", km: 48000 },
  { id: "e10", carroId: "c3", tipo: "acidente", titulo: "Batida leve traseira", data: "2025-10-04", km: 52000, valor: 1800 },
  { id: "e11", carroId: "c3", tipo: "revisao", titulo: "Revisão completa", data: "2026-02-20", km: 55000, valor: 890 },

  { id: "e12", carroId: "c4", tipo: "cadastro", titulo: "Veículo cadastrado", data: "2025-04-11", km: 30000 },
  { id: "e13", carroId: "c4", tipo: "acidente", titulo: "Colisão frontal — em manutenção", data: "2026-06-30", km: 41000 },

  { id: "e14", carroId: "c5", tipo: "cadastro", titulo: "Veículo cadastrado", data: "2026-02-10", km: 12000 },
  { id: "e15", carroId: "c5", tipo: "troca-oleo", titulo: "Troca de óleo", data: "2026-05-15", km: 17000, valor: 165 },
];

export const documentosMock: DocumentoVeiculo[] = [
  { id: "d1", carroId: "c1", tipo: "CRLV", vencimento: "2026-12-31", status: "ok" },
  { id: "d2", carroId: "c1", tipo: "Seguro", vencimento: "2026-08-10", status: "vencendo" },
  { id: "d3", carroId: "c1", tipo: "IPVA", vencimento: "2026-06-30", status: "vencido" },
  { id: "d4", carroId: "c2", tipo: "CRLV", vencimento: "2027-01-15", status: "ok" },
  { id: "d5", carroId: "c2", tipo: "Seguro", vencimento: "2027-05-01", status: "ok" },
  { id: "d6", carroId: "c3", tipo: "CRLV", vencimento: "2026-08-01", status: "vencendo" },
  { id: "d7", carroId: "c3", tipo: "Licenciamento", vencimento: "2026-09-01", status: "vencendo" },
  { id: "d8", carroId: "c4", tipo: "CRLV", vencimento: "2026-11-01", status: "ok" },
  { id: "d9", carroId: "c5", tipo: "CRLV", vencimento: "2027-02-20", status: "ok" },
];

export const manutencaoMock: ItemManutencao[] = [
  { id: "m1", carroId: "c1", item: "Óleo", intervaloKm: 10000, intervaloMeses: 6, ultimoKm: 36500, ultimaData: "2025-11-04", proximoKm: 46500, proximaData: "2026-05-04" },
  { id: "m2", carroId: "c1", item: "Pneus", intervaloKm: 40000, ultimoKm: 32000, ultimaData: "2025-06-01", proximoKm: 72000 },
  { id: "m3", carroId: "c1", item: "Freios", intervaloKm: 30000, ultimoKm: 32000, ultimaData: "2025-06-01", proximoKm: 62000 },
  { id: "m4", carroId: "c2", item: "Óleo", intervaloKm: 10000, ultimoKm: 18000, ultimaData: "2025-09-10", proximoKm: 28000, proximaData: "2026-03-10" },
  { id: "m5", carroId: "c2", item: "Pneus", ultimoKm: 21000, ultimaData: "2026-02-14", proximoKm: 61000 },
  { id: "m6", carroId: "c3", item: "Óleo", intervaloKm: 10000, ultimoKm: 55000, ultimaData: "2026-02-20", proximoKm: 65000 },
];

export const contratosMock: Contrato[] = [
  {
    id: "ct1", carroId: "c1", motoristaId: "m1", motoristaNome: "João Silva",
    valor: 110, periodicidade: "diaria", caucao: 1500,
    inicio: "2025-08-15", status: "ativo",
    observacoes: "Rodízio livre. Sem restrição de área.",
  },
  {
    id: "ct2", carroId: "c4", motoristaId: "m4", motoristaNome: "Ricardo Alves",
    valor: 95, periodicidade: "diaria", caucao: 1200,
    inicio: "2026-04-01", status: "suspenso",
    observacoes: "Em manutenção pós-colisão.",
  },
  {
    id: "ct3", carroId: "c2", motoristaId: "m2", motoristaNome: "Marcos Lima",
    valor: 2600, periodicidade: "mensal", caucao: 1500,
    inicio: "2025-11-01", fim: "2026-04-30", status: "encerrado",
  },
];

export const pagamentosMock: Pagamento[] = [
  { id: "pg1", contratoId: "ct1", valor: 110, data: "2026-07-19", forma: "Pix", status: "pago" },
  { id: "pg2", contratoId: "ct1", valor: 110, data: "2026-07-18", forma: "Pix", status: "pago" },
  { id: "pg3", contratoId: "ct1", valor: 110, data: "2026-07-20", forma: "Pix", status: "pendente" },
  { id: "pg4", contratoId: "ct2", valor: 95, data: "2026-06-25", forma: "Pix", status: "atrasado" },
  { id: "pg5", contratoId: "ct3", valor: 2600, data: "2026-04-01", forma: "Transferência", status: "pago" },
  { id: "pg6", contratoId: "ct3", valor: 2600, data: "2026-03-01", forma: "Transferência", status: "pago" },
];

export const notificacoesMock: Notificacao[] = [
  { id: "n1", tipo: "pagamento", titulo: "Pagamento atrasado", descricao: "Ricardo Alves — R$ 95 (Kwid)", data: "Hoje", urgencia: "alta", carroId: "c4", contratoId: "ct2" },
  { id: "n2", tipo: "documento", titulo: "IPVA vencido", descricao: "Chevrolet Onix — placa ABC-1D23", data: "Hoje", urgencia: "alta", carroId: "c1" },
  { id: "n3", tipo: "documento", titulo: "Seguro vencendo em 20 dias", descricao: "Chevrolet Onix", data: "Hoje", urgencia: "media", carroId: "c1" },
  { id: "n4", tipo: "manutencao", titulo: "Troca de óleo próxima", descricao: "HB20 — em ~500 km", data: "Ontem", urgencia: "media", carroId: "c2" },
  { id: "n5", tipo: "contrato", titulo: "Contrato encerrando", descricao: "Marcos Lima — HB20 em 15 dias", data: "2 dias", urgencia: "baixa", carroId: "c2", contratoId: "ct3" },
  { id: "n6", tipo: "info", titulo: "Corolla disponível para nova locação", descricao: "Sem contrato ativo há 5 dias", data: "3 dias", urgencia: "baixa", carroId: "c3" },
];

export const motoristasCandidatos: MotoristaCandidato[] = [
  {
    id: "mc1", nome: "Fernanda Rocha", avaliacao: 4.9, tempoPlataforma: "1 ano e 4 meses",
    corridas: 2130, pontualidade: 98,
    historico: "3 aluguéis anteriores concluídos. Sem multas graves. Sempre devolveu limpo.",
    observacoes: "Prefere carros automáticos.",
  },
  {
    id: "mc2", nome: "Diego Nunes", avaliacao: 4.7, tempoPlataforma: "8 meses",
    corridas: 940, pontualidade: 91,
    historico: "1 aluguel anterior, contrato encerrado no prazo. 1 multa leve.",
  },
  {
    id: "mc3", nome: "Alan Ribeiro", avaliacao: 4.4, tempoPlataforma: "3 meses",
    corridas: 210, pontualidade: 82,
    historico: "Motorista novo. Ainda sem histórico de aluguel na plataforma.",
    observacoes: "Solicitou parcelar caução em 2x.",
  },
];

export const marketplaceMock: AnuncioMarketplace[] = [
  {
    id: "mk1", proprietario: "Rafael T.", marca: "Volkswagen", modelo: "Polo", ano: 2023,
    cidade: "São Paulo", valor: 125, periodicidade: "diaria",
    foto: "https://images.unsplash.com/photo-1600661653561-629509216228?w=600&h=400&fit=crop",
    regras: "Sem app de entrega. CNH B há +2 anos.",
  },
  {
    id: "mk2", proprietario: "Marina S.", marca: "Fiat", modelo: "Mobi", ano: 2022,
    cidade: "Guarulhos", valor: 85, periodicidade: "diaria",
    foto: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop",
    regras: "Caução R$ 1.000. Rodagem livre.",
  },
  {
    id: "mk3", proprietario: "Bruno L.", marca: "Nissan", modelo: "Versa", ano: 2024,
    cidade: "São Paulo", valor: 2900, periodicidade: "mensal",
    foto: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&h=400&fit=crop",
    regras: "Motorista com 4.8+ e 6 meses de plataforma.",
  },
];

// Financeiro por veículo (mock)
export const financeiroPorVeiculo: { carroId: string; receita: number; custos: number }[] = [
  { carroId: "c1", receita: 3300, custos: 730 },
  { carroId: "c2", receita: 2600, custos: 780 },
  { carroId: "c3", receita: 0, custos: 890 },
  { carroId: "c4", receita: 800, custos: 1800 },
  { carroId: "c5", receita: 1400, custos: 165 },
];

export const custosMensais = [
  { mes: "Jan", valor: 1200 }, { mes: "Fev", valor: 900 }, { mes: "Mar", valor: 1600 },
  { mes: "Abr", valor: 800 }, { mes: "Mai", valor: 1100 }, { mes: "Jun", valor: 2200 },
];

export const lembretesDefault: ConfigLembretes = {
  vencimentoAluguel: true,
  antecedenciaDias: 1,
  fotoPainelMensal: true,
  documentacao: true,
};

// Helpers
export function eventoIcone(tipo: EventoTipo): string {
  const map: Record<EventoTipo, string> = {
    cadastro: "🚗",
    locacao: "🔑",
    devolucao: "↩️",
    revisao: "🛠️",
    "troca-oleo": "🛢️",
    "troca-pneu": "🛞",
    multa: "🚨",
    acidente: "💥",
    documento: "📄",
    km: "📏",
    custo: "💸",
    observacao: "📝",
    outro: "•",
  };
  return map[tipo];
}


export function fmtData(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function fmtBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
