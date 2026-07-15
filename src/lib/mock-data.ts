// Mock data for TCHI LÉVA MVP (no database)

export type ProfileKey = "motorista" | "proprietario" | "oficina" | "passageiro" | "loja";

export type Parceiro = {
  id: string;
  nome: string;
  categoria: "Mecânica" | "Borracharia" | "Lava-rápido" | "Troca de óleo" | "Funilaria" | "Elétrica" | "Guincho";
  desconto: number;
  distanciaKm: number;
  endereco: string;
  horario: string;
  whatsapp: string;
  servicos: { nome: string; preco: number }[];
  rating: number;
  foto: string;
};

export type Carro = {
  id: string;
  modelo: string;
  marca: string;
  ano: number;
  placa: string;
  diaria: number;
  mensal: number;
  caucao: number;
  km: number;
  cidade: string;
  seguro: boolean;
  proprietario: string;
  status: "disponivel" | "alugado" | "manutencao";
  foto: string;
  motoristaAtual?: string;
};

export type Solicitacao = {
  id: string;
  motorista: string;
  servico: string;
  veiculo: string;
  status: "novo" | "respondido" | "agendado";
  data: string;
  mensagem: string;
};

export type Promocao = {
  id: string;
  titulo: string;
  desconto: number;
  validade: string;
  servico: string;
  ativa: boolean;
};

export type Loja = {
  id: string;
  nome: string;
  categoria: "Mercado" | "Farmácia" | "Posto" | "Restaurante" | "Conveniência";
  cashback: number;
  distanciaKm: number;
  endereco: string;
};

export type Corrida = {
  id: string;
  origem: string;
  destino: string;
  distanciaKm: number;
  tempoMin: number;
  valor: number;
  passageiro: string;
  passageiroRating: number;
  formaPagamento: "Cartão" | "Pix" | "Dinheiro";
};

export type RespostaOrcamento = {
  oficinaId: string;
  oficinaNome: string;
  valor: number;
  prazo: string;
  rating: number;
};

export type Orcamento = {
  id: string;
  servico: string;
  veiculo: string;
  descricao: string;
  data: string;
  status: "aguardando" | "respondido" | "fechado";
  respostas: RespostaOrcamento[];
};

export const parceiros: Parceiro[] = [
  {
    id: "p1", nome: "Auto Mecânica Silva", categoria: "Mecânica", desconto: 20,
    distanciaKm: 1.2, endereco: "Rua das Flores, 142", horario: "Seg-Sáb 8h-18h",
    whatsapp: "11999990001", rating: 4.8,
    foto: "https://images.unsplash.com/photo-1632823471565-1ecdf5c6da77?w=600&h=400&fit=crop",
    servicos: [
      { nome: "Revisão completa", preco: 280 },
      { nome: "Troca de pastilhas", preco: 220 },
      { nome: "Suspensão", preco: 450 },
    ],
  },
  {
    id: "p2", nome: "Borracharia 24h Express", categoria: "Borracharia", desconto: 15,
    distanciaKm: 0.8, endereco: "Av. Brasil, 2300", horario: "24 horas",
    whatsapp: "11999990002", rating: 4.6,
    foto: "https://images.unsplash.com/photo-1605164599901-db7f68c4b7a8?w=600&h=400&fit=crop",
    servicos: [
      { nome: "Conserto pneu", preco: 35 },
      { nome: "Alinhamento", preco: 80 },
      { nome: "Balanceamento", preco: 60 },
    ],
  },
  {
    id: "p3", nome: "Lava-Rápido Brilho", categoria: "Lava-rápido", desconto: 25,
    distanciaKm: 2.1, endereco: "Rua Augusta, 988", horario: "Seg-Dom 7h-20h",
    whatsapp: "11999990003", rating: 4.9,
    foto: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&h=400&fit=crop",
    servicos: [
      { nome: "Lavagem simples", preco: 25 },
      { nome: "Lavagem completa", preco: 55 },
      { nome: "Enceramento", preco: 90 },
    ],
  },
  {
    id: "p4", nome: "Óleo & Cia", categoria: "Troca de óleo", desconto: 18,
    distanciaKm: 3.4, endereco: "Rua dos Pinheiros, 55", horario: "Seg-Sáb 8h-17h",
    whatsapp: "11999990004", rating: 4.7,
    foto: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&h=400&fit=crop",
    servicos: [
      { nome: "Troca de óleo + filtro", preco: 180 },
      { nome: "Aditivo radiador", preco: 60 },
    ],
  },
  {
    id: "p5", nome: "Funilaria do Beto", categoria: "Funilaria", desconto: 22,
    distanciaKm: 4.0, endereco: "Av. Paulista, 1500", horario: "Seg-Sex 9h-18h",
    whatsapp: "11999990005", rating: 4.5,
    foto: "https://images.unsplash.com/photo-1599256630969-90e8f4abe2c0?w=600&h=400&fit=crop",
    servicos: [
      { nome: "Reparo lateral", preco: 600 },
      { nome: "Pintura completa", preco: 2800 },
    ],
  },
  {
    id: "p6", nome: "Elétrica Auto Master", categoria: "Elétrica", desconto: 15,
    distanciaKm: 2.7, endereco: "Rua Vergueiro, 700", horario: "Seg-Sáb 8h-18h",
    whatsapp: "11999990006", rating: 4.6,
    foto: "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=600&h=400&fit=crop",
    servicos: [
      { nome: "Bateria", preco: 380 },
      { nome: "Alternador", preco: 520 },
    ],
  },
];

export const carros: Carro[] = [
  { id: "c1", modelo: "Onix", marca: "Chevrolet", ano: 2022, placa: "ABC-1D23", diaria: 110, mensal: 2400, caucao: 1500, km: 38000, cidade: "São Paulo", seguro: true, proprietario: "Carlos Mendes", status: "alugado", motoristaAtual: "João Silva", foto: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop" },
  { id: "c2", modelo: "HB20", marca: "Hyundai", ano: 2023, placa: "DEF-4G56", diaria: 120, mensal: 2600, caucao: 1500, km: 22000, cidade: "São Paulo", seguro: true, proprietario: "Carlos Mendes", status: "disponivel", foto: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop" },
  { id: "c3", modelo: "Corolla", marca: "Toyota", ano: 2021, placa: "GHI-7J89", diaria: 180, mensal: 3800, caucao: 2500, km: 55000, cidade: "São Paulo", seguro: true, proprietario: "Carlos Mendes", status: "disponivel", foto: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop" },
  { id: "c4", modelo: "Kwid", marca: "Renault", ano: 2022, placa: "JKL-0M12", diaria: 95, mensal: 2100, caucao: 1200, km: 41000, cidade: "Campinas", seguro: false, proprietario: "Ana Pereira", status: "manutencao", foto: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=400&fit=crop" },
  { id: "c5", modelo: "Cronos", marca: "Fiat", ano: 2023, placa: "NOP-3Q45", diaria: 130, mensal: 2800, caucao: 1500, km: 18000, cidade: "São Paulo", seguro: true, proprietario: "Ana Pereira", status: "disponivel", foto: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop" },
];

export const solicitacoes: Solicitacao[] = [
  { id: "s1", motorista: "João Silva", servico: "Troca de óleo", veiculo: "Onix 2022", status: "novo", data: "Hoje, 14:20", mensagem: "Posso passar amanhã de manhã?" },
  { id: "s2", motorista: "Marcos Lima", servico: "Alinhamento + balanceamento", veiculo: "HB20 2023", status: "respondido", data: "Ontem", mensagem: "Quanto fica o combo?" },
  { id: "s3", motorista: "Patrícia Souza", servico: "Revisão completa", veiculo: "Corolla 2021", status: "agendado", data: "Sex, 10h", mensagem: "Confirmado para sexta às 10h." },
  { id: "s4", motorista: "Ricardo Alves", servico: "Conserto pneu", veiculo: "Kwid 2022", status: "novo", data: "Hoje, 09:00", mensagem: "Pneu furado, preciso urgente." },
];

export const promocoes: Promocao[] = [
  { id: "pr1", titulo: "Troca de óleo + filtro", desconto: 25, validade: "31/12/2026", servico: "Troca de óleo", ativa: true },
  { id: "pr2", titulo: "Revisão dos 30 mil", desconto: 15, validade: "30/06/2026", servico: "Revisão", ativa: true },
  { id: "pr3", titulo: "Lavagem completa", desconto: 30, validade: "20/06/2026", servico: "Lava-rápido", ativa: false },
];

export const lojas: Loja[] = [
  { id: "l1", nome: "Mercado Bom Preço", categoria: "Mercado", cashback: 5, distanciaKm: 0.5, endereco: "Rua A, 100" },
  { id: "l2", nome: "Farmácia Saúde+", categoria: "Farmácia", cashback: 8, distanciaKm: 1.1, endereco: "Av. B, 200" },
  { id: "l3", nome: "Posto Estrela", categoria: "Posto", cashback: 3, distanciaKm: 0.3, endereco: "Av. C, 50" },
  { id: "l4", nome: "Cantina da Esquina", categoria: "Restaurante", cashback: 10, distanciaKm: 0.7, endereco: "Rua D, 88" },
];

export const motoristas = [
  { id: "m1", nome: "João Silva", avaliacao: 4.9, tempoAluguel: "8 meses", status: "ativo", inadimplente: false },
  { id: "m2", nome: "Marcos Lima", avaliacao: 4.7, tempoAluguel: "3 meses", status: "ativo", inadimplente: false },
  { id: "m3", nome: "Patrícia Souza", avaliacao: 4.8, tempoAluguel: "1 ano", status: "ativo", inadimplente: false },
  { id: "m4", nome: "Ricardo Alves", avaliacao: 4.3, tempoAluguel: "2 meses", status: "atrasado", inadimplente: true },
];

export const recebimentosMensais = [
  { mes: "Jan", valor: 6200 }, { mes: "Fev", valor: 7400 }, { mes: "Mar", valor: 8100 },
  { mes: "Abr", valor: 7800 }, { mes: "Mai", valor: 9200 }, { mes: "Jun", valor: 9800 },
];

export const ganhosDoDia = {
  bruto: 287.5, liquido: 218.4, corridas: 12, horas: 7.5, cashback: 34.6, aluguelDoDia: 80,
};

export const cashbackHistorico = [
  { id: "ch1", origem: "Corrida #2841", valor: 4.2, data: "Hoje" },
  { id: "ch2", origem: "Mercado Bom Preço", valor: -12.0, data: "Ontem" },
  { id: "ch3", origem: "Corrida #2820", valor: 3.8, data: "Ontem" },
  { id: "ch4", origem: "Posto Estrela", valor: 2.1, data: "2 dias" },
];

export const corridasDisponiveis: Corrida[] = [
  { id: "co1", origem: "Av. Paulista, 1500", destino: "Aeroporto de Congonhas", distanciaKm: 8.4, tempoMin: 22, valor: 34.5, passageiro: "Marina S.", passageiroRating: 4.9, formaPagamento: "Cartão" },
  { id: "co2", origem: "Shopping Ibirapuera", destino: "Vila Madalena", distanciaKm: 6.1, tempoMin: 18, valor: 24.8, passageiro: "Rafael T.", passageiroRating: 4.7, formaPagamento: "Pix" },
  { id: "co3", origem: "Rua Augusta, 200", destino: "Estação Sé", distanciaKm: 3.2, tempoMin: 12, valor: 14.2, passageiro: "Bianca M.", passageiroRating: 4.8, formaPagamento: "Cartão" },
  { id: "co4", origem: "Mooca Plaza", destino: "Tatuapé", distanciaKm: 4.5, tempoMin: 15, valor: 18.0, passageiro: "Diego R.", passageiroRating: 4.6, formaPagamento: "Dinheiro" },
  { id: "co5", origem: "Av. Brigadeiro, 900", destino: "Brooklin", distanciaKm: 9.8, tempoMin: 28, valor: 41.0, passageiro: "Helena P.", passageiroRating: 5.0, formaPagamento: "Cartão" },
];

export const orcamentosMock: Orcamento[] = [
  {
    id: "or1", servico: "Troca de óleo + filtro", veiculo: "Onix 2022", descricao: "Carro com 38.000 km, óleo trocado pela última vez há 6 meses.",
    data: "Hoje, 11:20", status: "respondido",
    respostas: [
      { oficinaId: "p4", oficinaNome: "Óleo & Cia", valor: 165, prazo: "Mesmo dia", rating: 4.7 },
      { oficinaId: "p1", oficinaNome: "Auto Mecânica Silva", valor: 180, prazo: "Amanhã", rating: 4.8 },
    ],
  },
  {
    id: "or2", servico: "Conserto pneu", veiculo: "Onix 2022", descricao: "Pneu dianteiro direito furou.",
    data: "Ontem", status: "fechado",
    respostas: [
      { oficinaId: "p2", oficinaNome: "Borracharia 24h Express", valor: 35, prazo: "30 min", rating: 4.6 },
    ],
  },
];

export const profileLabels: Record<ProfileKey, { title: string; desc: string; emoji: string }> = {
  motorista: { title: "Motorista", desc: "Ganhe mais, gaste menos com a sua frota.", emoji: "🚖" },
  proprietario: { title: "Proprietário", desc: "Gerencie seus veículos e aluguéis.", emoji: "🔑" },
  oficina: { title: "Oficina / Parceiro", desc: "Receba motoristas e cresça localmente.", emoji: "🔧" },
  passageiro: { title: "Passageiro", desc: "Peça corridas e ganhe cashback em lojas.", emoji: "🧍" },
  loja: { title: "Loja parceira", desc: "Capte clientes locais com cashback.", emoji: "🏪" },
};
