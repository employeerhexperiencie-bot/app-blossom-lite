// Mock data + tipos para o módulo Proprietário TCHI LÉVA (sem banco)
import { somarPeriodos, vencimentosEntre } from "./cobrancas";

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
  | "checklist"
  | "vistoria"
  | "outro";

export type CustoCategoria =
  | "lavagem"
  | "multa"
  | "estacionamento"
  | "ipva"
  | "combustivel"
  | "outro";

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
  status: StatusContrato;
  observacoes?: string;
  solicitacaoId?: string;
  // A partir desta data o app gera as cobranças do aluguel automaticamente.
  cobrancaDesde?: string;
  acerto?: AcertoCaucao;
  avaliacao?: AvaliacaoMotorista;
  // Contrato anterior com o mesmo motorista, quando é uma renovação.
  renovacaoDe?: string;
};

// aguardando_aceite: o proprietário enviou o contrato e falta o motorista aceitar no app dele.
export type StatusContrato = "aguardando_aceite" | "ativo" | "suspenso" | "encerrado" | "recusado";

export type AcertoCaucao = { caucao: number; desconto: number; devolvido: number; motivo?: string };
export type AvaliacaoMotorista = { nota: number; comentario?: string };

export const statusContratoLabel: Record<StatusContrato, string> = {
  aguardando_aceite: "Aguardando aceite",
  ativo: "Ativo",
  suspenso: "Suspenso",
  encerrado: "Encerrado",
  recusado: "Recusado",
};

export const statusContratoClasse: Record<StatusContrato, string> = {
  aguardando_aceite: "bg-primary/15 text-primary",
  ativo: "bg-success/15 text-success",
  suspenso: "bg-warning/20 text-warning-foreground",
  encerrado: "bg-muted text-muted-foreground",
  recusado: "bg-destructive/15 text-destructive",
};

export type Pagamento = {
  id: string;
  contratoId: string;
  valor: number;
  data: string;
  forma: "Pix" | "Dinheiro" | "Cartão" | "Transferência";
  status: "pago" | "pendente" | "atrasado";
  vencimento?: string; // data em que a cobrança vence
  pagoEm?: string; // data em que foi paga
  /** Identificador da cobrança Pix (txid), quando gerada pelo app */
  txid?: string;
  /** Data em que a cobrança foi enviada ao motorista */
  cobradoEm?: string;
};

/** Dados que o proprietário usa para receber via Pix */
export type DadosRecebimento = {
  nome: string;
  cidade: string;
  chavePix: string;
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
  // Requisitos ligados ao Clube TCHI LÉVA
  nivelMinimo?: string; // nome do nível (ex.: "Calça Branca")
  notaMinima?: number;
  // Anúncio em destaque no marketplace até esta data (AAAA-MM-DD), pago pelo dono.
  destaqueAte?: string;
};

// Anúncios de exemplo: o HB20 aberto a todos e o Cronos só para motoristas Calça Branca com nota 4,7+.
// O Corolla fica sem anúncio, para a Início mostrar um carro parado.
export const anunciosMock: Record<string, AnuncioLocacao> = {
  c2: {
    publicado: true,
    periodicidade: "diaria",
    valor: 120,
    caucao: 1500,
    requisitos: "CNH B há mais de 2 anos.",
    publicadoEm: "2026-11-10",
  },
  c5: {
    publicado: true,
    periodicidade: "diaria",
    valor: 130,
    caucao: 1500,
    requisitos: "CNH B há mais de 2 anos, sem multas graves.",
    publicadoEm: "2026-11-18",
    nivelMinimo: "Calça Branca",
    notaMinima: 4.7,
  },
};

export type MotoristaCandidato = {
  id: string;
  nome: string;
  avaliacao: number;
  tempoPlataforma: string;
  corridas: number;
  pontualidade?: number; // 0-100
  nivel?: string; // nome do nível no Clube TCHI LÉVA
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
  // Dados enviados pelo motorista junto com a proposta
  candidato?: MotoristaCandidato;
  valorProposto?: number;
  periodicidade?: Contrato["periodicidade"];
  duracao?: string;
};

// Dados do proprietário usados no contrato e na cobrança por Pix.
export type PerfilDono = {
  nome: string;
  documento: string; // CPF ou CNPJ
  telefone: string;
  cidade: string;
  chavePix: string;
};

// Documentos do próprio dono (não do carro), com vencimento quando houver.
export type DocumentoDono = {
  id: string;
  tipo: "CNH" | "Comprovante de residência" | "Contrato social" | "Procuração" | "Outro";
  numero?: string;
  vencimento?: string; // AAAA-MM-DD
};

/** Status de um documento pela data de vencimento: vencido, vencendo em até 30 dias ou em dia. */
export function statusDocumento(vencimento: string, hoje: string): DocStatus {
  if (vencimento < hoje) return "vencido";
  const [a, m, d] = hoje.split("-").map(Number);
  const limite = new Date(a, m - 1, d + 30, 12);
  const lim = `${limite.getFullYear()}-${String(limite.getMonth() + 1).padStart(2, "0")}-${String(limite.getDate()).padStart(2, "0")}`;
  return vencimento <= lim ? "vencendo" : "ok";
}

export const perfilDonoVazio: PerfilDono = {
  nome: "",
  documento: "",
  telefone: "",
  cidade: "São Paulo",
  chavePix: "",
};

// Motorista que está usando o app neste aparelho (protótipo sem login real)
export const MOTORISTA_LOGADO_ID = "eu";

export type ConfigLembretes = {
  vencimentoAluguel: boolean;
  antecedenciaDias: number; // 0/1/3
  fotoPainelMensal: boolean;
  documentacao: boolean;
};

// -------- Seeds ----------

export const eventosMock: EventoVeiculo[] = [
  {
    id: "e1",
    carroId: "c1",
    tipo: "cadastro",
    titulo: "Veículo cadastrado",
    data: "2025-06-01",
    km: 32000,
  },
  {
    id: "e2",
    carroId: "c1",
    tipo: "locacao",
    titulo: "Alugado para João Silva",
    data: "2025-08-15",
    km: 34500,
  },
  {
    id: "e3",
    carroId: "c1",
    tipo: "troca-oleo",
    titulo: "Troca de óleo + filtro",
    data: "2025-11-04",
    km: 36500,
    valor: 180,
  },
  {
    id: "e4",
    carroId: "c1",
    tipo: "multa",
    titulo: "Multa leve — Zona Azul",
    data: "2026-01-12",
    valor: 130,
  },
  {
    id: "e5",
    carroId: "c1",
    tipo: "revisao",
    titulo: "Revisão dos 38 mil",
    data: "2026-03-22",
    km: 38000,
    valor: 420,
  },

  {
    id: "e6",
    carroId: "c2",
    tipo: "cadastro",
    titulo: "Veículo cadastrado",
    data: "2025-09-10",
    km: 18000,
  },
  {
    id: "e7",
    carroId: "c2",
    tipo: "troca-pneu",
    titulo: "Troca de 2 pneus dianteiros",
    data: "2026-02-14",
    km: 21000,
    valor: 780,
  },
  { id: "e8", carroId: "c2", tipo: "documento", titulo: "Seguro renovado", data: "2026-05-01" },

  {
    id: "e9",
    carroId: "c3",
    tipo: "cadastro",
    titulo: "Veículo cadastrado",
    data: "2024-12-01",
    km: 48000,
  },
  {
    id: "e10",
    carroId: "c3",
    tipo: "acidente",
    titulo: "Batida leve traseira",
    data: "2025-10-04",
    km: 52000,
    valor: 1800,
  },
  {
    id: "e11",
    carroId: "c3",
    tipo: "revisao",
    titulo: "Revisão completa",
    data: "2026-02-20",
    km: 55000,
    valor: 890,
  },

  {
    id: "e12",
    carroId: "c4",
    tipo: "cadastro",
    titulo: "Veículo cadastrado",
    data: "2025-04-11",
    km: 30000,
  },
  {
    id: "e13",
    carroId: "c4",
    tipo: "acidente",
    titulo: "Colisão frontal — em manutenção",
    data: "2026-06-30",
    km: 41000,
  },

  {
    id: "e14",
    carroId: "c5",
    tipo: "cadastro",
    titulo: "Veículo cadastrado",
    data: "2026-02-10",
    km: 12000,
  },
  {
    id: "e15",
    carroId: "c5",
    tipo: "troca-oleo",
    titulo: "Troca de óleo",
    data: "2026-05-15",
    km: 17000,
    valor: 165,
  },
  // Custos recentes, com datas relativas a hoje, para o Financeiro mostrar o mês corrente.
  {
    id: "e16",
    carroId: "c1",
    tipo: "troca-oleo",
    titulo: "Troca de óleo + filtro",
    data: somarPeriodos(hojeISO(), "diaria", -40),
    valor: 185,
  },
  {
    id: "e17",
    carroId: "c1",
    tipo: "custo",
    titulo: "Lavagem completa",
    data: somarPeriodos(hojeISO(), "diaria", -12),
    valor: 60,
    categoria: "lavagem",
  },
  {
    id: "e18",
    carroId: "c5",
    tipo: "revisao",
    titulo: "Revisão periódica",
    data: somarPeriodos(hojeISO(), "diaria", -25),
    valor: 390,
  },
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
  {
    id: "m1",
    carroId: "c1",
    item: "Óleo",
    intervaloKm: 10000,
    intervaloMeses: 6,
    ultimoKm: 36500,
    ultimaData: "2025-11-04",
    proximoKm: 46500,
    proximaData: "2026-05-04",
  },
  {
    id: "m2",
    carroId: "c1",
    item: "Pneus",
    intervaloKm: 40000,
    ultimoKm: 32000,
    ultimaData: "2025-06-01",
    proximoKm: 72000,
  },
  {
    id: "m3",
    carroId: "c1",
    item: "Freios",
    intervaloKm: 30000,
    ultimoKm: 32000,
    ultimaData: "2025-06-01",
    proximoKm: 62000,
  },
  {
    id: "m4",
    carroId: "c2",
    item: "Óleo",
    intervaloKm: 10000,
    ultimoKm: 18000,
    ultimaData: "2025-09-10",
    proximoKm: 28000,
    proximaData: "2026-03-10",
  },
  {
    id: "m5",
    carroId: "c2",
    item: "Pneus",
    ultimoKm: 21000,
    ultimaData: "2026-02-14",
    proximoKm: 61000,
  },
  {
    id: "m6",
    carroId: "c3",
    item: "Óleo",
    intervaloKm: 10000,
    ultimoKm: 55000,
    ultimaData: "2026-02-20",
    proximoKm: 65000,
  },
];

export const contratosMock: Contrato[] = [
  {
    id: "ct1",
    cobrancaDesde: hojeISO(),
    carroId: "c1",
    motoristaId: "m1",
    motoristaNome: "João Silva",
    valor: 110,
    periodicidade: "diaria",
    caucao: 1500,
    inicio: "2025-08-15",
    status: "ativo",
    observacoes: "Rodízio livre. Sem restrição de área.",
  },
  {
    id: "ct2",
    carroId: "c4",
    motoristaId: "m4",
    motoristaNome: "Ricardo Alves",
    valor: 95,
    periodicidade: "diaria",
    caucao: 1200,
    inicio: "2026-04-01",
    status: "suspenso",
    observacoes: "Em manutenção pós-colisão.",
  },
  {
    id: "ct3",
    carroId: "c2",
    motoristaId: "m2",
    motoristaNome: "Marcos Lima",
    valor: 2600,
    periodicidade: "mensal",
    caucao: 1500,
    inicio: "2025-11-01",
    fim: "2026-04-30",
    status: "encerrado",
  },
];

// Histórico de pagamentos gerado a partir dos contratos simulados.
// ct1: diária paga por Pix desde o início do contrato, com dois atrasos recentes; a cobrança automática segue a partir de hoje.
// ct2: diária paga até a colisão de junho/2026, com o último pagamento atrasado.
// ct3: mensal paga de nov/2025 a abr/2026.
function historicoPagamentos(): Pagamento[] {
  const lista: Pagamento[] = [];
  const hoje = hojeISO();
  const ontem = somarPeriodos(hoje, "diaria", -1);
  const diariasCt1 = vencimentosEntre("2025-08-15", ontem, "diaria", 1000);
  diariasCt1.forEach((data, i) => {
    const diasAtras = diariasCt1.length - i;
    const atrasado = diasAtras === 3 || diasAtras === 41;
    lista.push({
      id: `pg-ct1-${data}`,
      contratoId: "ct1",
      valor: 110,
      data,
      vencimento: data,
      pagoEm: atrasado ? undefined : data,
      forma: "Pix",
      status: atrasado ? "atrasado" : "pago",
    });
  });
  for (const data of vencimentosEntre("2026-04-01", "2026-06-25", "diaria", 200)) {
    const atrasado = data === "2026-06-25";
    lista.push({
      id: `pg-ct2-${data}`,
      contratoId: "ct2",
      valor: 95,
      data,
      vencimento: data,
      pagoEm: atrasado ? undefined : data,
      forma: "Pix",
      status: atrasado ? "atrasado" : "pago",
    });
  }
  for (const data of vencimentosEntre("2025-11-01", "2026-04-01", "mensal")) {
    lista.push({
      id: `pg-ct3-${data}`,
      contratoId: "ct3",
      valor: 2600,
      data,
      vencimento: data,
      pagoEm: data,
      forma: "Transferência",
      status: "pago",
    });
  }
  return lista.reverse();
}

export const pagamentosMock: Pagamento[] = historicoPagamentos();

export const notificacoesMock: Notificacao[] = [
  {
    id: "n1",
    tipo: "pagamento",
    titulo: "Pagamento atrasado",
    descricao: "Ricardo Alves — R$ 95 (Kwid)",
    data: "Hoje",
    urgencia: "alta",
    carroId: "c4",
    contratoId: "ct2",
  },
  {
    id: "n2",
    tipo: "documento",
    titulo: "IPVA vencido",
    descricao: "Chevrolet Onix — placa ABC-1D23",
    data: "Hoje",
    urgencia: "alta",
    carroId: "c1",
  },
  {
    id: "n3",
    tipo: "documento",
    titulo: "Seguro vencendo em 20 dias",
    descricao: "Chevrolet Onix",
    data: "Hoje",
    urgencia: "media",
    carroId: "c1",
  },
  {
    id: "n4",
    tipo: "manutencao",
    titulo: "Troca de óleo próxima",
    descricao: "HB20 — em ~500 km",
    data: "Ontem",
    urgencia: "media",
    carroId: "c2",
  },
  {
    id: "n5",
    tipo: "contrato",
    titulo: "Contrato encerrando",
    descricao: "Marcos Lima — HB20 em 15 dias",
    data: "2 dias",
    urgencia: "baixa",
    carroId: "c2",
    contratoId: "ct3",
  },
  {
    id: "n6",
    tipo: "info",
    titulo: "Corolla disponível para nova locação",
    descricao: "Sem contrato ativo há 5 dias",
    data: "3 dias",
    urgencia: "baixa",
    carroId: "c3",
  },
];

export const motoristasCandidatos: MotoristaCandidato[] = [
  {
    id: "mc1",
    nome: "Fernanda Rocha",
    avaliacao: 4.9,
    tempoPlataforma: "1 ano e 4 meses",
    corridas: 2130,
    pontualidade: 98,
    historico: "3 aluguéis anteriores concluídos. Sem multas graves. Sempre devolveu limpo.",
    observacoes: "Prefere carros automáticos.",
  },
  {
    id: "mc2",
    nome: "Diego Nunes",
    avaliacao: 4.7,
    tempoPlataforma: "8 meses",
    corridas: 940,
    pontualidade: 91,
    historico: "1 aluguel anterior, contrato encerrado no prazo. 1 multa leve.",
  },
  {
    id: "mc3",
    nome: "Alan Ribeiro",
    avaliacao: 4.4,
    tempoPlataforma: "3 meses",
    corridas: 210,
    pontualidade: 82,
    historico: "Motorista novo. Ainda sem histórico de aluguel na plataforma.",
    observacoes: "Solicitou parcelar caução em 2x.",
  },
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
    checklist: "📋",
    vistoria: "📸",
    outro: "•",
  };
  return map[tipo];
}

// Data de hoje no fuso local, no formato AAAA-MM-DD. toISOString() usa UTC e, à noite no Brasil, já devolve o dia seguinte.
export function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const periodicidadeLabel: Record<Contrato["periodicidade"], string> = {
  diaria: "diária",
  semanal: "semanal",
  mensal: "mensal",
};

export function fmtData(iso: string): string {
  try {
    // "AAAA-MM-DD" sozinho é lido como meia-noite UTC, que no Brasil cai no dia anterior; lemos no fuso local.
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function fmtBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
