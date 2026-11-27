// Regras de negócio do proprietário que ainda dependem de decisão.
// Os valores abaixo são as propostas do plano; mude aqui e o app todo acompanha.

/** Plano Frota: grátis até `gratisAte` carros; cada carro a partir daí paga `precoPorCarro` por mês. */
export const PLANO_FROTA = { gratisAte: 2, precoPorCarro: 19.9 };

/** Destaque do anúncio no marketplace de aluguel. */
export const DESTAQUE_ANUNCIO = { preco: 9.9, dias: 7 };

/** Vistoria periódica com fotos tiradas na hora pelo motorista. */
export const VISTORIA = {
  /** Uma vistoria a cada X dias... */
  dias: 7,
  /** ...ou a cada X km rodados, o que vier primeiro. */
  km: 1000,
  /** KM rodado por dia acima disto gera alerta ao proprietário. */
  kmPorDiaSuspeito: 450,
  /** Quantas vistorias com fotos guardamos por carro (as fotos ficam no navegador). */
  fotosGuardadasPorCarro: 6,
};

/** Alerta de manutenção quando a peça passa desta fração da vida útil. */
export const ALERTA_VIDA_UTIL = 0.8;

/** Mensalidade do Plano Frota para a quantidade de carros da frota. */
export function mensalidadePlanoFrota(carros: number): number {
  const pagos = Math.max(0, carros - PLANO_FROTA.gratisAte);
  return Math.round(pagos * PLANO_FROTA.precoPorCarro * 100) / 100;
}

/** Soma dias a uma data AAAA-MM-DD, no fuso local. */
export function somarDias(iso: string, dias: number): string {
  const [a, m, d] = iso.split("-").map(Number);
  const dt = new Date(a, m - 1, d + dias, 12);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

/** Diferença em dias entre duas datas AAAA-MM-DD (b - a). */
export function diasDesde(a: string, b: string): number {
  const p = (s: string) => {
    const [y, m, d] = s.slice(0, 10).split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((p(b) - p(a)) / 86400000);
}

export function destaqueAtivo(destaqueAte: string | undefined, hoje: string): boolean {
  return !!destaqueAte && destaqueAte >= hoje;
}

/** Receita da plataforma gerada pelo proprietário (sem banco: registrada no navegador). */
export type LancamentoPlataforma = {
  id: string;
  tipo: "destaque" | "plano_frota" | "lead_loja";
  valor: number;
  data: string; // AAAA-MM-DD
  descricao: string;
  carroId?: string;
};
