// Mock data + tipos para o módulo Parceiro Comercial (Loja / Autopeças) TCHI LÉVA — sem banco

export type TipoItem = "produto" | "servico";

export type CategoriaItem =
  | "oleo-filtros"
  | "pneus"
  | "freios"
  | "bateria"
  | "suspensao"
  | "eletrica"
  | "acessorios"
  | "servico-geral"
  | "alimentacao"
  | "outros";

export const categoriasItem: { key: CategoriaItem; label: string; icone: string }[] = [
  { key: "oleo-filtros", label: "Óleo e filtros", icone: "🛢️" },
  { key: "pneus", label: "Pneus", icone: "🛞" },
  { key: "freios", label: "Freios", icone: "🛑" },
  { key: "bateria", label: "Baterias", icone: "🔋" },
  { key: "suspensao", label: "Suspensão", icone: "🔩" },
  { key: "eletrica", label: "Elétrica", icone: "⚡" },
  { key: "acessorios", label: "Acessórios", icone: "🎛️" },
  { key: "servico-geral", label: "Serviços", icone: "🔧" },
  { key: "alimentacao", label: "Alimentação", icone: "🍽️" },
  { key: "outros", label: "Outros", icone: "📦" },
];

export function labelCategoriaItem(c: CategoriaItem): string {
  return categoriasItem.find((x) => x.key === c)?.label ?? c;
}
export function iconeCategoriaItem(c: CategoriaItem): string {
  return categoriasItem.find((x) => x.key === c)?.icone ?? "📦";
}

export type ItemCatalogo = {
  id: string;
  tipo: TipoItem;
  nome: string;
  categoria: CategoriaItem;
  preco: number;
  ativo: boolean;
  fotos: number;
  visualizacoes: number;
  leads: number;
  // produto
  marca?: string;
  quantidade?: number;
  estoqueMinimo?: number;
  compatibilidade?: string[];
  // serviço
  tempoMin?: number;
  garantiaMeses?: number;
  agendavel?: boolean;
};

export type MovimentoEstoque = {
  id: string;
  itemId: string;
  tipo: "entrada" | "saida";
  quantidade: number;
  motivo: string;
  data: string;
};

export type TipoPedido = "compra" | "orcamento" | "agendamento" | "solicitacao";
export type StatusPedido = "novo" | "aceito" | "em_preparo" | "pronto" | "entregue" | "recusado";

export const statusPedidoInfo: Record<StatusPedido, { label: string; cls: string }> = {
  novo: { label: "Novo", cls: "bg-primary/15 text-primary" },
  aceito: { label: "Aceito", cls: "bg-accent/15 text-accent" },
  em_preparo: { label: "Em preparo", cls: "bg-warning/15 text-warning" },
  pronto: { label: "Pronto", cls: "bg-success/15 text-success" },
  entregue: { label: "Entregue", cls: "bg-muted text-muted-foreground" },
  recusado: { label: "Recusado", cls: "bg-destructive/15 text-destructive" },
};

export const tiposPedido: { key: TipoPedido; label: string; icone: string }[] = [
  { key: "compra", label: "Compra", icone: "🛒" },
  { key: "orcamento", label: "Orçamento", icone: "🧮" },
  { key: "agendamento", label: "Agendamento", icone: "📅" },
  { key: "solicitacao", label: "Solicitação", icone: "📨" },
];

export type LinhaPedido = { nome: string; quantidade: number; valorUnit: number; tipo: TipoItem };

export type Pedido = {
  id: string;
  codigo: string;
  tipo: TipoPedido;
  status: StatusPedido;
  clienteNome: string;
  clientePerfil: "motorista" | "proprietario" | "oficina" | "passageiro";
  veiculo?: string;
  data: string;
  hora: string;
  origem: "marketplace" | "busca" | "campanha" | "oportunidade";
  itens: LinhaPedido[];
  observacoes?: string;
};

export type OportunidadeTipo = "demanda" | "frota" | "recorrencia" | "solicitacao" | "fluxo";

export type Oportunidade = {
  id: string;
  tipo: OportunidadeTipo;
  titulo: string;
  motivo: string;
  alcance: number;
  receitaPotencial: number;
  categoria: CategoriaItem;
  sugestaoCampanha: string;
  descontoSugerido: number;
};

export type Campanha = {
  id: string;
  titulo: string;
  desconto: number;
  categoria: CategoriaItem;
  validade: string;
  alcance: number;
  ativa: boolean;
  origem: "manual" | "oportunidade";
};

export type Plano = "gratuito" | "premium";

export const precoPremium = 149.9;

export const beneficiosPlano: { label: string; gratuito: boolean; premium: boolean }[] = [
  { label: "Cadastro e perfil da loja", gratuito: true, premium: true },
  { label: "Até 10 itens no catálogo", gratuito: true, premium: true },
  { label: "Campanhas básicas", gratuito: true, premium: true },
  { label: "Catálogo ilimitado", gratuito: false, premium: true },
  { label: "Controle de estoque completo", gratuito: false, premium: true },
  { label: "Destaque nas buscas", gratuito: false, premium: true },
  { label: "Relatórios completos", gratuito: false, premium: true },
  { label: "Sugestões automáticas de campanha", gratuito: false, premium: true },
  { label: "Integração futura com ERP", gratuito: false, premium: true },
];

export type Negocio = {
  nome: string;
  categoriaPrincipal: CategoriaItem;
  descricao: string;
  endereco: string;
  regiao: string;
  telefone: string;
  horarios: { dia: string; abre: string; fecha: string; aberto: boolean }[];
  fotos: number;
  equipe: number;
  pagamentos: string[];
  entrega: boolean;
  retirada: boolean;
  plano: Plano;
  rating: number;
};

export const negocioDefault: Negocio = {
  nome: "Auto Peças Grajaú",
  categoriaPrincipal: "oleo-filtros",
  descricao: "Peças, óleos e acessórios para motoristas de app. Atendimento rápido no Grajaú e região.",
  endereco: "Av. Dona Belmira Marin, 1420 — Grajaú, São Paulo",
  regiao: "Grajaú, Parelheiros, Cidade Dutra",
  telefone: "(11) 98877-1200",
  horarios: [
    { dia: "Seg", abre: "08:00", fecha: "18:00", aberto: true },
    { dia: "Ter", abre: "08:00", fecha: "18:00", aberto: true },
    { dia: "Qua", abre: "08:00", fecha: "18:00", aberto: true },
    { dia: "Qui", abre: "08:00", fecha: "18:00", aberto: true },
    { dia: "Sex", abre: "08:00", fecha: "19:00", aberto: true },
    { dia: "Sáb", abre: "08:00", fecha: "14:00", aberto: true },
    { dia: "Dom", abre: "09:00", fecha: "12:00", aberto: false },
  ],
  fotos: 6,
  equipe: 4,
  pagamentos: ["Pix", "Crédito", "Débito", "Dinheiro"],
  entrega: true,
  retirada: true,
  plano: "gratuito",
  rating: 4.8,
};

export const catalogoParceiroMock: ItemCatalogo[] = [
  {
    id: "it1", tipo: "produto", nome: "Óleo 5W30 Sintético 1L", categoria: "oleo-filtros", preco: 46.9,
    ativo: true, fotos: 3, visualizacoes: 412, leads: 38, marca: "Lubrax", quantidade: 42, estoqueMinimo: 20,
    compatibilidade: ["Onix", "HB20", "Kwid", "Corolla"],
  },
  {
    id: "it2", tipo: "produto", nome: "Filtro de óleo universal", categoria: "oleo-filtros", preco: 32,
    ativo: true, fotos: 2, visualizacoes: 288, leads: 24, marca: "Tecfil", quantidade: 8, estoqueMinimo: 15,
    compatibilidade: ["Onix", "HB20", "Mobi"],
  },
  {
    id: "it3", tipo: "produto", nome: "Pastilha de freio dianteira", categoria: "freios", preco: 189,
    ativo: true, fotos: 4, visualizacoes: 331, leads: 41, marca: "Bosch", quantidade: 12, estoqueMinimo: 6,
    compatibilidade: ["Onix", "Prisma", "Versa"],
  },
  {
    id: "it4", tipo: "produto", nome: "Pneu 185/65 R15", categoria: "pneus", preco: 349,
    ativo: true, fotos: 3, visualizacoes: 520, leads: 63, marca: "Pirelli", quantidade: 16, estoqueMinimo: 8,
    compatibilidade: ["Onix", "HB20", "Polo"],
  },
  {
    id: "it5", tipo: "produto", nome: "Bateria 60Ah", categoria: "bateria", preco: 429,
    ativo: true, fotos: 2, visualizacoes: 197, leads: 19, marca: "Moura", quantidade: 3, estoqueMinimo: 5,
    compatibilidade: ["Onix", "HB20", "Corolla", "Kwid"],
  },
  {
    id: "it6", tipo: "servico", nome: "Troca de óleo + filtro", categoria: "servico-geral", preco: 180,
    ativo: true, fotos: 1, visualizacoes: 604, leads: 88, tempoMin: 45, garantiaMeses: 3, agendavel: true,
  },
  {
    id: "it7", tipo: "servico", nome: "Alinhamento e balanceamento", categoria: "servico-geral", preco: 120,
    ativo: true, fotos: 1, visualizacoes: 372, leads: 44, tempoMin: 60, garantiaMeses: 1, agendavel: true,
  },
  {
    id: "it8", tipo: "servico", nome: "Instalação de acessórios", categoria: "acessorios", preco: 90,
    ativo: false, fotos: 0, visualizacoes: 61, leads: 4, tempoMin: 40, garantiaMeses: 1, agendavel: false,
  },
];

export const movimentosMock: MovimentoEstoque[] = [
  { id: "mv1", itemId: "it1", tipo: "entrada", quantidade: 30, motivo: "Compra fornecedor Ipiranga", data: "2026-07-28" },
  { id: "mv2", itemId: "it1", tipo: "saida", quantidade: 6, motivo: "Pedido #1042", data: "2026-07-30" },
  { id: "mv3", itemId: "it2", tipo: "saida", quantidade: 9, motivo: "Oficina Centro Sul", data: "2026-07-30" },
  { id: "mv4", itemId: "it4", tipo: "entrada", quantidade: 8, motivo: "Compra fornecedor Pirelli", data: "2026-07-25" },
  { id: "mv5", itemId: "it5", tipo: "saida", quantidade: 2, motivo: "Pedido #1039", data: "2026-07-31" },
];

export const pedidosMock: Pedido[] = [
  {
    id: "pd1", codigo: "#1044", tipo: "compra", status: "novo", clienteNome: "Oficina Centro Sul",
    clientePerfil: "oficina", data: "2026-08-01", hora: "08:40", origem: "marketplace",
    itens: [
      { nome: "Filtro de óleo universal", quantidade: 6, valorUnit: 32, tipo: "produto" },
      { nome: "Óleo 5W30 Sintético 1L", quantidade: 12, valorUnit: 46.9, tipo: "produto" },
    ],
    observacoes: "Retirada hoje até as 12h.",
  },
  {
    id: "pd2", codigo: "#1043", tipo: "agendamento", status: "aceito", clienteNome: "João Silva",
    clientePerfil: "motorista", veiculo: "Chevrolet Onix 2022 · ABC-1D23", data: "2026-08-01", hora: "10:30",
    origem: "oportunidade",
    itens: [{ nome: "Troca de óleo + filtro", quantidade: 1, valorUnit: 180, tipo: "servico" }],
    observacoes: "Veículo com 46.200 km — alerta de troca gerado pelo app.",
  },
  {
    id: "pd3", codigo: "#1042", tipo: "compra", status: "em_preparo", clienteNome: "Marcos Lima",
    clientePerfil: "motorista", veiculo: "Hyundai HB20 2023", data: "2026-08-01", hora: "09:15",
    origem: "busca",
    itens: [{ nome: "Óleo 5W30 Sintético 1L", quantidade: 6, valorUnit: 46.9, tipo: "produto" }],
  },
  {
    id: "pd4", codigo: "#1041", tipo: "orcamento", status: "novo", clienteNome: "Patrícia Souza",
    clientePerfil: "proprietario", veiculo: "Toyota Corolla 2021", data: "2026-08-01", hora: "07:55",
    origem: "marketplace",
    itens: [{ nome: "Pastilha de freio dianteira", quantidade: 2, valorUnit: 189, tipo: "produto" }],
    observacoes: "Quer instalação inclusa.",
  },
  {
    id: "pd5", codigo: "#1040", tipo: "compra", status: "pronto", clienteNome: "Ricardo Alves",
    clientePerfil: "motorista", data: "2026-07-31", hora: "16:20", origem: "campanha",
    itens: [{ nome: "Pneu 185/65 R15", quantidade: 2, valorUnit: 349, tipo: "produto" }],
  },
  {
    id: "pd6", codigo: "#1039", tipo: "compra", status: "entregue", clienteNome: "Diego Nunes",
    clientePerfil: "motorista", data: "2026-07-31", hora: "11:05", origem: "busca",
    itens: [{ nome: "Bateria 60Ah", quantidade: 2, valorUnit: 429, tipo: "produto" }],
  },
  {
    id: "pd7", codigo: "#1038", tipo: "solicitacao", status: "recusado", clienteNome: "Alan Ribeiro",
    clientePerfil: "motorista", data: "2026-07-30", hora: "18:40", origem: "marketplace",
    itens: [{ nome: "Instalação de acessórios", quantidade: 1, valorUnit: 90, tipo: "servico" }],
  },
];

export const campanhasParceiroMock: Campanha[] = [
  {
    id: "cp1", titulo: "Troca de óleo com 15% OFF", desconto: 15, categoria: "oleo-filtros",
    validade: "31/08/2026", alcance: 320, ativa: true, origem: "manual",
  },
  {
    id: "cp2", titulo: "Par de pneus com preço fechado", desconto: 10, categoria: "pneus",
    validade: "15/08/2026", alcance: 180, ativa: false, origem: "manual",
  },
];

export const clientesNovosSemana = [
  { dia: "Seg", clientes: 4, vendas: 1180 },
  { dia: "Ter", clientes: 7, vendas: 1620 },
  { dia: "Qua", clientes: 5, vendas: 980 },
  { dia: "Qui", clientes: 11, vendas: 2340 },
  { dia: "Sex", clientes: 14, vendas: 3120 },
  { dia: "Sáb", clientes: 18, vendas: 4250 },
  { dia: "Dom", clientes: 9, vendas: 1470 },
];

export function fmtBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function totalPedido(p: Pedido): number {
  return p.itens.reduce((a, i) => a + i.quantidade * i.valorUnit, 0);
}
