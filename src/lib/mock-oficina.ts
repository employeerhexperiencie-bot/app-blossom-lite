// Mock data + tipos para o módulo Centro de Serviços (Oficina) TCHI LÉVA — sem banco

export type CategoriaServico =
  | "mecanica"
  | "oleo"
  | "pneus"
  | "funilaria"
  | "eletrica"
  | "ar"
  | "chaveiro"
  | "guincho"
  | "lava-rapido"
  | "vistoria"
  | "acessorios";

export const categoriasServico: { key: CategoriaServico; label: string; icone: string }[] = [
  { key: "mecanica", label: "Mecânica", icone: "🔧" },
  { key: "oleo", label: "Troca de óleo", icone: "🛢️" },
  { key: "pneus", label: "Pneus", icone: "🛞" },
  { key: "funilaria", label: "Funilaria", icone: "🔨" },
  { key: "eletrica", label: "Elétrica", icone: "⚡" },
  { key: "ar", label: "Ar-condicionado", icone: "❄️" },
  { key: "chaveiro", label: "Chaveiro", icone: "🔑" },
  { key: "guincho", label: "Guincho", icone: "🚛" },
  { key: "lava-rapido", label: "Lava-rápido", icone: "🧼" },
  { key: "vistoria", label: "Vistoria", icone: "📋" },
  { key: "acessorios", label: "Acessórios", icone: "🎛️" },
];

export function labelCategoria(c: CategoriaServico): string {
  return categoriasServico.find((x) => x.key === c)?.label ?? c;
}
export function iconeCategoria(c: CategoriaServico): string {
  return categoriasServico.find((x) => x.key === c)?.icone ?? "🔧";
}

export type StatusOS =
  | "solicitado"
  | "aceito"
  | "agendado"
  | "em_atendimento"
  | "aguardando_aprovacao"
  | "concluido"
  | "recusado"
  | "cancelado";

export const statusOSInfo: Record<StatusOS, { label: string; cls: string }> = {
  solicitado: { label: "Solicitado", cls: "bg-primary/15 text-primary" },
  aceito: { label: "Aceito", cls: "bg-accent/20 text-accent-foreground" },
  agendado: { label: "Agendado", cls: "bg-primary/10 text-primary" },
  em_atendimento: { label: "Em atendimento", cls: "bg-warning/20 text-warning-foreground" },
  aguardando_aprovacao: { label: "Aguardando aprovação", cls: "bg-warning/20 text-warning-foreground" },
  concluido: { label: "Concluído", cls: "bg-success/15 text-success" },
  recusado: { label: "Recusado", cls: "bg-muted text-muted-foreground" },
  cancelado: { label: "Cancelado", cls: "bg-muted text-muted-foreground" },
};

export type ItemServico = { id: string; nome: string; valor: number; tempoMin: number };
export type Peca = { id: string; produto: string; quantidade: number; valorUnit: number; fornecedor: string };
export type AtualizacaoOS = { id: string; data: string; texto: string; midia: "nenhum" | "foto" | "video" };
export type ChecklistEntrada = { km: number; combustivel: string; fotos: number; observacoes: string; feitoEm: string };
export type ConclusaoOS = {
  data: string;
  valorTotal: number;
  garantiaMeses: number;
  observacoes: string;
  fotos: number;
};

export type OrdemServico = {
  id: string;
  codigo: string;
  clienteNome: string;
  clienteTipo: "motorista" | "proprietario";
  clienteTelefone: string;
  carroId?: string;
  veiculo: string;
  placa: string;
  categoria: CategoriaServico;
  descricao: string;
  status: StatusOS;
  criadoEm: string;
  dataAgendada?: string;
  hora?: string;
  origem: "solicitacao" | "marketplace" | "interno";
  distanciaKm?: number;
  valorEstimado?: number;
  km?: number;
  checklist?: ChecklistEntrada;
  servicos: ItemServico[];
  pecas: Peca[];
  atualizacoes: AtualizacaoOS[];
  conclusao?: ConclusaoOS;
};

export type CatalogoServico = { id: string; nome: string; categoria: CategoriaServico; preco: number; tempoMin: number };

export const catalogoMock: CatalogoServico[] = [
  { id: "cs1", nome: "Troca de óleo + filtro", categoria: "oleo", preco: 180, tempoMin: 40 },
  { id: "cs2", nome: "Revisão completa", categoria: "mecanica", preco: 320, tempoMin: 120 },
  { id: "cs3", nome: "Troca de pastilhas de freio", categoria: "mecanica", preco: 240, tempoMin: 90 },
  { id: "cs4", nome: "Alinhamento e balanceamento", categoria: "pneus", preco: 130, tempoMin: 60 },
  { id: "cs5", nome: "Conserto de pneu", categoria: "pneus", preco: 40, tempoMin: 25 },
  { id: "cs6", nome: "Troca de bateria", categoria: "eletrica", preco: 420, tempoMin: 30 },
  { id: "cs7", nome: "Higienização do ar-condicionado", categoria: "ar", preco: 190, tempoMin: 60 },
  { id: "cs8", nome: "Filtro de ar", categoria: "mecanica", preco: 95, tempoMin: 20 },
  { id: "cs9", nome: "Lavagem completa", categoria: "lava-rapido", preco: 60, tempoMin: 45 },
  { id: "cs10", nome: "Vistoria cautelar", categoria: "vistoria", preco: 210, tempoMin: 50 },
];

export type CampanhaOficina = {
  id: string;
  titulo: string;
  categoria: CategoriaServico;
  desconto: number;
  validade: string;
  alvo: string;
  ativa: boolean;
};

export const campanhasMock: CampanhaOficina[] = [
  { id: "cp1", titulo: "Troca de óleo + filtro", categoria: "oleo", desconto: 25, validade: "31/12/2026", alvo: "Veículos próximos da revisão", ativa: true },
  { id: "cp2", titulo: "Revisão dos 30 mil", categoria: "mecanica", desconto: 15, validade: "30/09/2026", alvo: "Frota de proprietários", ativa: true },
  { id: "cp3", titulo: "Lavagem completa", categoria: "lava-rapido", desconto: 30, validade: "20/08/2026", alvo: "Motoristas nível Bigode+", ativa: false },
];

const hoje = new Date().toISOString().slice(0, 10);
const ontem = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
const amanha = new Date(Date.now() + 864e5).toISOString().slice(0, 10);

export const ordensMock: OrdemServico[] = [
  {
    id: "os1", codigo: "OS-1041", clienteNome: "Carlos Mendes", clienteTipo: "proprietario", clienteTelefone: "11999990011",
    carroId: "c2", veiculo: "Hyundai HB20 2023", placa: "DEF-4G56", categoria: "oleo",
    descricao: "Troca de óleo e filtro — 22.000 km.", status: "agendado", criadoEm: ontem,
    dataAgendada: hoje, hora: "09:30", origem: "solicitacao", km: 22000, valorEstimado: 180,
    servicos: [], pecas: [], atualizacoes: [],
  },
  {
    id: "os2", codigo: "OS-1042", clienteNome: "João Silva", clienteTipo: "motorista", clienteTelefone: "11999990012",
    carroId: "c1", veiculo: "Chevrolet Onix 2022", placa: "ABC-1D23", categoria: "mecanica",
    descricao: "Barulho na suspensão dianteira.", status: "em_atendimento", criadoEm: ontem,
    dataAgendada: hoje, hora: "08:30", origem: "solicitacao", km: 38000, valorEstimado: 450,
    checklist: { km: 38210, combustivel: "1/2", fotos: 4, observacoes: "Risco no para-choque dianteiro.", feitoEm: hoje },
    servicos: [{ id: "is1", nome: "Revisão completa", valor: 320, tempoMin: 120 }],
    pecas: [{ id: "pc1", produto: "Bieleta dianteira", quantidade: 2, valorUnit: 85, fornecedor: "Auto Peças Grajaú" }],
    atualizacoes: [{ id: "at1", data: hoje, texto: "Veículo no elevador, iniciando diagnóstico.", midia: "foto" }],
  },
  {
    id: "os3", codigo: "OS-1043", clienteNome: "Patrícia Souza", clienteTipo: "motorista", clienteTelefone: "11999990013",
    carroId: "c3", veiculo: "Toyota Corolla 2021", placa: "GHI-7J89", categoria: "pneus",
    descricao: "Alinhamento e balanceamento.", status: "aguardando_aprovacao", criadoEm: hoje,
    dataAgendada: hoje, hora: "10:00", origem: "interno", km: 55000, valorEstimado: 130,
    servicos: [{ id: "is2", nome: "Alinhamento e balanceamento", valor: 130, tempoMin: 60 }],
    pecas: [], atualizacoes: [],
  },
  {
    id: "os4", codigo: "OS-1044", clienteNome: "Ricardo Alves", clienteTipo: "motorista", clienteTelefone: "11999990014",
    carroId: "c4", veiculo: "Renault Kwid 2022", placa: "JKL-0M12", categoria: "pneus",
    descricao: "Pneu furado, preciso urgente.", status: "solicitado", criadoEm: hoje,
    origem: "marketplace", distanciaKm: 1.8, valorEstimado: 40,
    servicos: [], pecas: [], atualizacoes: [],
  },
  {
    id: "os5", codigo: "OS-1045", clienteNome: "Marcos Lima", clienteTipo: "motorista", clienteTelefone: "11999990015",
    carroId: "c5", veiculo: "Fiat Cronos 2023", placa: "NOP-3Q45", categoria: "eletrica",
    descricao: "Bateria arriando de manhã.", status: "solicitado", criadoEm: hoje,
    origem: "marketplace", distanciaKm: 3.2, valorEstimado: 420,
    servicos: [], pecas: [], atualizacoes: [],
  },
  {
    id: "os6", codigo: "OS-1046", clienteNome: "Ana Pereira", clienteTipo: "proprietario", clienteTelefone: "11999990016",
    carroId: "c5", veiculo: "Fiat Cronos 2023", placa: "NOP-3Q45", categoria: "ar",
    descricao: "Higienização do ar-condicionado.", status: "agendado", criadoEm: hoje,
    dataAgendada: amanha, hora: "11:30", origem: "solicitacao", valorEstimado: 190,
    servicos: [], pecas: [], atualizacoes: [],
  },
  {
    id: "os7", codigo: "OS-1039", clienteNome: "João Silva", clienteTipo: "motorista", clienteTelefone: "11999990012",
    carroId: "c1", veiculo: "Chevrolet Onix 2022", placa: "ABC-1D23", categoria: "oleo",
    descricao: "Troca de óleo.", status: "concluido", criadoEm: ontem,
    dataAgendada: ontem, hora: "14:00", origem: "solicitacao", km: 37500,
    servicos: [{ id: "is3", nome: "Troca de óleo + filtro", valor: 180, tempoMin: 40 }],
    pecas: [{ id: "pc2", produto: "Óleo 5W30 (4L)", quantidade: 1, valorUnit: 120, fornecedor: "Distribuidora Sul" }],
    atualizacoes: [],
    conclusao: { data: ontem, valorTotal: 300, garantiaMeses: 3, observacoes: "Próxima troca em 10.000 km.", fotos: 2 },
  },
];

// ---------- Plano de Saúde do Veículo ----------

export type ItemSaude = { nome: string; status: "ok" | "atencao" | "critico"; detalhe: string };
export type SaudeVeiculo = { score: number; itens: ItemSaude[] };

type BaseSaude = { nome: string; intervaloKm: number; ultimoKm: number };

export function calcularSaude(kmAtual: number, itens: BaseSaude[]): SaudeVeiculo {
  const avaliados: ItemSaude[] = itens.map((i) => {
    const rodado = Math.max(0, kmAtual - i.ultimoKm);
    const uso = i.intervaloKm > 0 ? rodado / i.intervaloKm : 0;
    const restante = Math.max(0, i.intervaloKm - rodado);
    const status: ItemSaude["status"] = uso >= 1 ? "critico" : uso >= 0.8 ? "atencao" : "ok";
    return {
      nome: i.nome,
      status,
      detalhe:
        status === "critico"
          ? `Vencido há ${(rodado - i.intervaloKm).toLocaleString("pt-BR")} km`
          : `Faltam ${restante.toLocaleString("pt-BR")} km`,
    };
  });
  const pesos = { ok: 100, atencao: 65, critico: 25 } as const;
  const score = avaliados.length
    ? Math.round(avaliados.reduce((a, i) => a + pesos[i.status], 0) / avaliados.length)
    : 100;
  return { score, itens: avaliados };
}

export function saudePadrao(kmAtual: number): SaudeVeiculo {
  return calcularSaude(kmAtual, [
    { nome: "Óleo", intervaloKm: 10000, ultimoKm: Math.max(0, kmAtual - 7200) },
    { nome: "Freios", intervaloKm: 30000, ultimoKm: Math.max(0, kmAtual - 12000) },
    { nome: "Pneus", intervaloKm: 40000, ultimoKm: Math.max(0, kmAtual - 34000) },
    { nome: "Bateria", intervaloKm: 50000, ultimoKm: Math.max(0, kmAtual - 46000) },
    { nome: "Filtros", intervaloKm: 20000, ultimoKm: Math.max(0, kmAtual - 9000) },
  ]);
}

export const perfilOficinaDefault = {
  nome: "Auto Center Grajaú",
  cnpj: "12.345.678/0001-90",
  endereco: "Av. Dona Belmira Marin, 1200 — Grajaú, São Paulo",
  telefone: "11999990000",
  horario: "Seg-Sáb 8h-18h",
  categorias: ["mecanica", "oleo", "pneus", "eletrica"] as CategoriaServico[],
  fotos: 3,
  rating: 4.8,
  onboardingConcluido: true,
};
export type PerfilOficina = typeof perfilOficinaDefault;

export function totalOS(os: OrdemServico): number {
  const s = os.servicos.reduce((a, i) => a + i.valor, 0);
  const p = os.pecas.reduce((a, i) => a + i.valorUnit * i.quantidade, 0);
  return s + p;
}

export function fmtBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
