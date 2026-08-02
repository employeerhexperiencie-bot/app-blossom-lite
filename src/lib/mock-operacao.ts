// Operação do motorista — dados mock derivados do ecossistema TCHI LÉVA
import { carros, ganhosDoDia, lojas, parceiros } from "./mock-data";
import { contratosMock, pagamentosMock, manutencaoMock, documentosMock, fmtData } from "./mock-proprietario";
import { saudePadrao } from "./mock-oficina";
import { economiaMes, gastoMesEmTaxas, getNivelByViagens, progressoMock } from "./niveis";

export const MOTORISTA_ID = "m1";
export const MOTORISTA_NOME = "João Silva";

export function fmtBRL(v: number): string {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

/* ---------- Meta e dia ---------- */

export const metaDiaria = { ganhos: 300, corridas: 15 };

export const resumoDia = {
  ganhosBrutos: ganhosDoDia.bruto,
  ganhosLiquidos: ganhosDoDia.liquido,
  corridas: ganhosDoDia.corridas,
  horasOnline: ganhosDoDia.horas,
  cashback: ganhosDoDia.cashback,
  aluguelDoDia: ganhosDoDia.aluguelDoDia,
  kmRodados: 168,
  combustivel: 62.4,
  alimentacao: 24,
};

/* ---------- Operação (custos x lucro) ---------- */

export type LinhaCusto = { label: string; valor: number; cor: string };

export function custosDoDia(): LinhaCusto[] {
  const nivel = getNivelByViagens(progressoMock.viagensTotais);
  return [
    { label: "Aluguel do veículo", valor: resumoDia.aluguelDoDia, cor: "var(--nivel-bigode)" },
    { label: "Combustível", valor: resumoDia.combustivel, cor: "var(--nivel-juvenil)" },
    { label: "Taxas TCHI LÉVA", valor: nivel.taxaFixa * resumoDia.corridas, cor: "var(--nivel-peregrino)" },
    { label: "Alimentação", valor: resumoDia.alimentacao, cor: "var(--nivel-calca-branca)" },
  ];
}

export function operacaoDia() {
  const nivel = getNivelByViagens(progressoMock.viagensTotais);
  const custos = custosDoDia().reduce((s, c) => s + c.valor, 0);
  const lucro = resumoDia.ganhosBrutos - custos + resumoDia.cashback;
  const economiaTaxa = (4 - nivel.taxaFixa) * resumoDia.corridas;
  return {
    nivel,
    receita: resumoDia.ganhosBrutos,
    custos,
    lucro,
    cashback: resumoDia.cashback,
    economiaTaxa,
    margem: resumoDia.ganhosBrutos > 0 ? lucro / resumoDia.ganhosBrutos : 0,
    custoPorKm: custos / resumoDia.kmRodados,
    lucroPorHora: lucro / resumoDia.horasOnline,
    lucroPorKm: lucro / resumoDia.kmRodados,
  };
}

export function operacaoMes() {
  const nivel = getNivelByViagens(progressoMock.viagensTotais);
  const viagens = progressoMock.viagensMes;
  const receita = viagens * 24.6;
  const taxas = gastoMesEmTaxas(viagens, nivel.taxaFixa);
  const aluguel = 110 * 26;
  const combustivel = 1420;
  const manutencao = 380;
  const outros = 260;
  const custos = taxas + aluguel + combustivel + manutencao + outros;
  const cashback = 214.8;
  const lucro = receita - custos + cashback;
  const km = 2680;
  return {
    nivel,
    viagens,
    receita,
    custos,
    lucro,
    cashback,
    km,
    economiaTaxa: economiaMes(viagens, nivel.taxaFixa),
    margem: lucro / receita,
    custoPorKm: custos / km,
    linhas: [
      { label: "Taxas TCHI LÉVA", valor: taxas, cor: "var(--nivel-peregrino)" },
      { label: "Aluguel do veículo", valor: aluguel, cor: "var(--nivel-bigode)" },
      { label: "Combustível", valor: combustivel, cor: "var(--nivel-juvenil)" },
      { label: "Manutenção", valor: manutencao, cor: "var(--nivel-calca-branca)" },
      { label: "Outros", valor: outros, cor: "var(--nivel-veinho)" },
    ] as LinhaCusto[],
  };
}

export type HistoricoDia = { data: string; label: string; receita: number; custos: number; corridas: number };

export const historicoFinanceiro: HistoricoDia[] = [
  { data: "2026-08-02", label: "Hoje", receita: 287.5, custos: 205.4, corridas: 12 },
  { data: "2026-08-01", label: "Ontem", receita: 342.1, custos: 218.9, corridas: 15 },
  { data: "2026-07-31", label: "Sex", receita: 398.7, custos: 241.2, corridas: 18 },
  { data: "2026-07-30", label: "Qui", receita: 264.3, custos: 196.5, corridas: 11 },
  { data: "2026-07-29", label: "Qua", receita: 311.9, custos: 208.7, corridas: 14 },
  { data: "2026-07-28", label: "Ter", receita: 205.4, custos: 178.2, corridas: 9 },
  { data: "2026-07-27", label: "Seg", receita: 356.8, custos: 226.4, corridas: 16 },
  { data: "2026-07-26", label: "Dom", receita: 421.5, custos: 249.8, corridas: 19 },
];

/* ---------- Veículo do motorista (alugado via módulo Proprietário) ---------- */

export type VeiculoMotorista = ReturnType<typeof veiculoDoMotorista>;

export function veiculoDoMotorista() {
  const contrato = contratosMock.find((c) => c.motoristaId === MOTORISTA_ID && c.status === "ativo");
  const carro = carros.find((c) => c.id === (contrato?.carroId ?? "c1"))!;
  const pagamentos = pagamentosMock.filter((p) => p.contratoId === contrato?.id);
  const proximoPagamento = pagamentos.find((p) => p.status !== "pago") ?? pagamentos[0];
  const manutencoes = manutencaoMock
    .filter((m) => m.carroId === carro.id)
    .sort((a, b) => (a.proximoKm ?? 0) - (b.proximoKm ?? 0));
  const proximaManutencao = manutencoes[0];
  const documentos = documentosMock.filter((d) => d.carroId === carro.id);
  const pendencias = documentos.filter((d) => d.status !== "ok");
  const saude = saudePadrao(carro.km);
  return {
    alugado: !!contrato,
    carro,
    contrato,
    proximoPagamento,
    proximaManutencao,
    kmParaManutencao: proximaManutencao?.proximoKm ? Math.max(0, proximaManutencao.proximoKm - carro.km) : null,
    documentos,
    pendencias,
    saude,
    proprietario: carro.proprietario,
    mensagens: 2,
    proximaDataManutencao: proximaManutencao?.proximaData ? fmtData(proximaManutencao.proximaData) : null,
  };
}

/* ---------- Oportunidades do ecossistema ---------- */

export type OportunidadeMotorista = {
  id: string;
  tipo: "demanda" | "cashback" | "oficina" | "parceiro";
  titulo: string;
  descricao: string;
  destaque: string;
  to: string;
};

export function oportunidadesMotorista(): OportunidadeMotorista[] {
  const posto = lojas.find((l) => l.categoria === "Posto");
  const restaurante = lojas.find((l) => l.categoria === "Restaurante");
  const oficina = [...parceiros].sort((a, b) => b.desconto - a.desconto)[0];
  const perto = [...parceiros].sort((a, b) => a.distanciaKm - b.distanciaKm)[0];

  return [
    {
      id: "op-demanda",
      tipo: "demanda",
      titulo: "Alta demanda no Grajaú",
      descricao: "Terminal Grajaú e Parque Residencial com pico agora",
      destaque: "+38% corridas",
      to: "/motorista/rodar",
    },
    {
      id: "op-posto",
      tipo: "cashback",
      titulo: posto ? posto.nome : "Posto parceiro",
      descricao: `Cashback no abastecimento · ${posto?.distanciaKm ?? 0.3} km`,
      destaque: `${posto?.cashback ?? 3}% de volta`,
      to: "/motorista/clube",
    },
    {
      id: "op-oficina",
      tipo: "oficina",
      titulo: oficina.nome,
      descricao: `${oficina.categoria} · ${oficina.distanciaKm} km · promoção da semana`,
      destaque: `-${oficina.desconto}%`,
      to: "/motorista/beneficios",
    },
    {
      id: "op-parceiro",
      tipo: "parceiro",
      titulo: restaurante ? restaurante.nome : perto.nome,
      descricao: restaurante
        ? `Almoço com cashback · ${restaurante.distanciaKm} km`
        : `${perto.categoria} · ${perto.distanciaKm} km`,
      destaque: restaurante ? `${restaurante.cashback}% cashback` : `-${perto.desconto}%`,
      to: "/motorista/clube",
    },
  ];
}

/* ---------- Áreas de demanda (mapa) ---------- */

export const areasDemanda = [
  { id: "ad1", nome: "Terminal Grajaú", nivel: "alta" as const, x: 28, y: 34, multiplicador: 1.4 },
  { id: "ad2", nome: "Parque Residencial", nivel: "media" as const, x: 62, y: 25, multiplicador: 1.2 },
  { id: "ad3", nome: "Av. Dona Belmira", nivel: "alta" as const, x: 70, y: 62, multiplicador: 1.5 },
  { id: "ad4", nome: "Interlagos", nivel: "media" as const, x: 36, y: 72, multiplicador: 1.15 },
];

/* ---------- Ranking do Clube ---------- */

export const rankingMock = [
  { pos: 1, nome: "Marcos L.", viagens: 218, nivel: "bigode" as const },
  { pos: 2, nome: "Patrícia S.", viagens: 201, nivel: "calca-branca" as const },
  { pos: 3, nome: "João Silva", viagens: 184, nivel: "juvenil" as const, voce: true },
  { pos: 4, nome: "Ricardo A.", viagens: 176, nivel: "juvenil" as const },
  { pos: 5, nome: "Célia M.", viagens: 168, nivel: "peregrino" as const },
];
