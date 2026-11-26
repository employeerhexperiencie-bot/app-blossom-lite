// Cálculo de vencimentos e números financeiros do proprietário, a partir dos dados registrados.
// Funções puras: recebem os dados e a data de hoje, para poderem ser testadas.
import type { Contrato, EventoVeiculo, Pagamento } from "./mock-proprietario";

const DIA = 86_400_000;

function paraData(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function paraIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function somarPeriodos(
  iso: string,
  periodicidade: Contrato["periodicidade"],
  n: number,
): string {
  const d = paraData(iso);
  if (periodicidade === "diaria") return paraIso(new Date(d.getTime() + n * DIA));
  if (periodicidade === "semanal") return paraIso(new Date(d.getTime() + n * 7 * DIA));
  // Mensal: mesmo dia do mês; se o mês não tiver esse dia (ex.: 31), usa o último dia.
  const alvo = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  const ultimoDia = new Date(
    Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0),
  ).getUTCDate();
  alvo.setUTCDate(Math.min(d.getUTCDate(), ultimoDia));
  return paraIso(alvo);
}

/** Vencimentos de `desde` até `ate`, inclusive, limitados aos `limite` mais recentes. */
export function vencimentosEntre(
  desde: string,
  ate: string,
  periodicidade: Contrato["periodicidade"],
  limite = 60,
): string[] {
  const datas: string[] = [];
  for (let n = 0; ; n++) {
    const v = somarPeriodos(desde, periodicidade, n);
    if (v > ate) break;
    datas.push(v);
    if (datas.length > limite) datas.shift();
  }
  return datas;
}

export function proximoVencimento(
  desde: string,
  periodicidade: Contrato["periodicidade"],
  hoje: string,
): string {
  for (let n = 0; ; n++) {
    const v = somarPeriodos(desde, periodicidade, n);
    if (v > hoje) return v;
  }
}

export function diasEntre(de: string, ate: string): number {
  return Math.round((paraData(ate).getTime() - paraData(de).getTime()) / DIA);
}

// -------- Números financeiros --------

const TIPOS_CUSTO: EventoVeiculo["tipo"][] = [
  "custo",
  "troca-oleo",
  "troca-pneu",
  "revisao",
  "multa",
  "acidente",
];

export function ehCusto(e: EventoVeiculo): boolean {
  return TIPOS_CUSTO.includes(e.tipo) && (e.valor ?? 0) > 0;
}

export function dataRecebimento(p: Pagamento): string {
  return p.pagoEm ?? p.data;
}

export function emAberto(p: Pagamento): boolean {
  return p.status === "pendente" || p.status === "atrasado";
}

/** Últimos `meses` meses até o mês de `hoje`, no formato AAAA-MM. */
export function ultimosMeses(hoje: string, meses: number): string[] {
  const d = paraData(hoje);
  const lista: string[] = [];
  for (let i = meses - 1; i >= 0; i--) {
    const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1));
    lista.push(paraIso(m).slice(0, 7));
  }
  return lista;
}

const NOMES_MES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function rotuloMes(anoMes: string): string {
  const [ano, mes] = anoMes.split("-").map(Number);
  return `${NOMES_MES[mes - 1]}/${String(ano).slice(2)}`;
}

export function serieMensal(pagamentos: Pagamento[], eventos: EventoVeiculo[], meses: string[]) {
  return meses.map((m) => ({
    mes: rotuloMes(m),
    receita: pagamentos
      .filter((p) => p.status === "pago" && dataRecebimento(p).startsWith(m))
      .reduce((a, p) => a + p.valor, 0),
    custos: eventos
      .filter((e) => ehCusto(e) && e.data.startsWith(m))
      .reduce((a, e) => a + (e.valor ?? 0), 0),
  }));
}

export function financeiroDoCarro(
  carroId: string,
  contratos: Contrato[],
  pagamentos: Pagamento[],
  eventos: EventoVeiculo[],
  periodo?: { de: string; ate: string },
) {
  const dentro = (iso: string) => !periodo || (iso >= periodo.de && iso <= periodo.ate);
  const idsContratos = new Set(contratos.filter((c) => c.carroId === carroId).map((c) => c.id));
  const receita = pagamentos
    .filter(
      (p) => idsContratos.has(p.contratoId) && p.status === "pago" && dentro(dataRecebimento(p)),
    )
    .reduce((a, p) => a + p.valor, 0);
  const custos = eventos
    .filter((e) => e.carroId === carroId && ehCusto(e) && dentro(e.data))
    .reduce((a, e) => a + (e.valor ?? 0), 0);
  return { carroId, receita, custos };
}

// -------- Caução pelo nível do motorista no Clube --------

// Benefícios definidos em niveis.ts: Bigode tem "caução reduzida" e Veinho "caução −50%".
// O percentual do Bigode não estava definido; usamos 25% como proposta.
const DESCONTO_CAUCAO: Record<string, number> = { Bigode: 0.25, Veinho: 0.5 };

export function caucaoPorNivel(
  caucaoBase: number,
  nivel?: string,
): { valor: number; desconto: number } {
  const desconto = (nivel && DESCONTO_CAUCAO[nivel]) || 0;
  return { valor: Math.round(caucaoBase * (1 - desconto)), desconto };
}
