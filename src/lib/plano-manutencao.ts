// Plano de manutenção por peça e cálculo da vida útil de cada item do carro.
//
// IMPORTANTE: os intervalos abaixo são uma REFERÊNCIA INICIAL do protótipo, não o manual oficial.
// O plano real de cada modelo deve ser cadastrado a partir do manual do proprietário (e validado
// pelas oficinas parceiras). Quando um modelo tiver o plano conferido, ele entra em `planosPorModelo`
// com `conferido: true` e passa a valer no lugar da referência.
import type { ItemManutencao } from "./mock-proprietario";
import { ALERTA_VIDA_UTIL, diasDesde, somarDias } from "./regras-proprietario";

export type ItemPlano = ItemManutencao["item"];
export type Intervalo = { km: number; meses: number };
export type LinhaPlano = { item: ItemPlano; normal: Intervalo; severo: Intervalo };
export type PlanoModelo = { conferido: boolean; fonte: string; linhas: LinhaPlano[] };

/** Referência genérica para carros flex compactos. Uso severo = rodar por aplicativo, trânsito urbano. */
export const planoReferencia: PlanoModelo = {
  conferido: false,
  fonte: "Referência TCHI LÉVA para compactos flex (confirmar no manual do modelo)",
  linhas: [
    { item: "Óleo", normal: { km: 10000, meses: 12 }, severo: { km: 5000, meses: 6 } },
    { item: "Filtro de óleo", normal: { km: 10000, meses: 12 }, severo: { km: 5000, meses: 6 } },
    { item: "Filtro de ar", normal: { km: 20000, meses: 24 }, severo: { km: 10000, meses: 12 } },
    { item: "Freios", normal: { km: 30000, meses: 24 }, severo: { km: 20000, meses: 12 } },
    { item: "Alinhamento", normal: { km: 10000, meses: 12 }, severo: { km: 10000, meses: 6 } },
    { item: "Balanceamento", normal: { km: 10000, meses: 12 }, severo: { km: 10000, meses: 6 } },
    { item: "Pneus", normal: { km: 45000, meses: 60 }, severo: { km: 35000, meses: 48 } },
    { item: "Correia", normal: { km: 60000, meses: 48 }, severo: { km: 50000, meses: 48 } },
    { item: "Fluídos", normal: { km: 40000, meses: 24 }, severo: { km: 30000, meses: 24 } },
  ],
};

/**
 * Planos conferidos no manual, por modelo (chave = modelo em minúsculas, ex.: "onix").
 * Vazio por enquanto: cada entrada nova precisa vir do manual do proprietário daquele modelo.
 */
export const planosPorModelo: Record<string, PlanoModelo> = {};

export function planoDoModelo(modelo: string): PlanoModelo {
  const chave = modelo.toLowerCase().split(" ")[0];
  return planosPorModelo[chave] ?? planoReferencia;
}

export type StatusVida = "ok" | "atencao" | "vencido" | "sem_registro";

export type VidaUtilItem = {
  item: ItemPlano;
  intervalo: Intervalo;
  status: StatusVida;
  /** O que mais consumiu a vida útil: os km rodados ou o tempo desde a troca. */
  motivo?: "km" | "tempo";
  /** 0 a 1+ (1 = vida útil inteira consumida). Ausente sem registro de troca. */
  uso?: number;
  ultimoKm?: number;
  ultimaData?: string;
  faltamKm?: number;
  /** Data prevista da troca, pelo que vencer primeiro: km (no ritmo atual) ou tempo. */
  previsao?: string;
};

/**
 * Vida útil de cada item do plano para um carro.
 * `kmPorDia` vem das últimas leituras de KM (vistorias); sem ele a previsão usa só o tempo.
 */
export function vidaUtilDoCarro(d: {
  modelo: string;
  kmAtual: number;
  hoje: string;
  manutencao: Pick<
    ItemManutencao,
    "item" | "ultimoKm" | "ultimaData" | "intervaloKm" | "intervaloMeses"
  >[];
  kmPorDia?: number;
  severo?: boolean;
}): VidaUtilItem[] {
  const plano = planoDoModelo(d.modelo);
  const severo = d.severo ?? true;
  return plano.linhas.map((linha) => {
    const doPlano = severo ? linha.severo : linha.normal;
    const registro = d.manutencao
      .filter((m) => m.item === linha.item)
      .sort((a, b) => b.ultimoKm - a.ultimoKm)[0];
    if (!registro) return { item: linha.item, intervalo: doPlano, status: "sem_registro" as const };
    // O intervalo cadastrado pelo dono no item (vindo do manual dele) vale sobre a referência.
    const intervalo = {
      km: registro.intervaloKm ?? doPlano.km,
      meses: registro.intervaloMeses ?? doPlano.meses,
    };

    const rodado = Math.max(0, d.kmAtual - registro.ultimoKm);
    const usoKm = rodado / intervalo.km;
    const dias = Math.max(0, diasDesde(registro.ultimaData, d.hoje));
    const usoTempo = dias / (intervalo.meses * 30.4);
    const uso = Math.max(usoKm, usoTempo);
    const faltamKm = intervalo.km - rodado;

    const limiteTempo = somarDias(registro.ultimaData, Math.round(intervalo.meses * 30.4));
    const limiteKm =
      d.kmPorDia && d.kmPorDia > 0
        ? somarDias(d.hoje, Math.max(0, Math.floor(faltamKm / d.kmPorDia)))
        : undefined;
    const previsao = limiteKm && limiteKm < limiteTempo ? limiteKm : limiteTempo;

    const status: StatusVida = uso >= 1 ? "vencido" : uso >= ALERTA_VIDA_UTIL ? "atencao" : "ok";
    return {
      item: linha.item,
      intervalo,
      status,
      motivo: usoTempo > usoKm ? ("tempo" as const) : ("km" as const),
      uso,
      ultimoKm: registro.ultimoKm,
      ultimaData: registro.ultimaData,
      faltamKm,
      previsao,
    };
  });
}

/** KM médio por dia entre a leitura mais antiga e a mais recente (precisa de pelo menos 2 leituras). */
export function kmPorDia(leituras: { data: string; km: number }[]): number | undefined {
  if (leituras.length < 2) return undefined;
  const ord = [...leituras].sort((a, b) => a.data.localeCompare(b.data));
  const primeira = ord[0];
  const ultima = ord[ord.length - 1];
  const dias = diasDesde(primeira.data, ultima.data);
  if (dias <= 0 || ultima.km <= primeira.km) return undefined;
  return (ultima.km - primeira.km) / dias;
}
