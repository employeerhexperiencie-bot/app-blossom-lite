// Datas relativas a hoje para os dados de exemplo, para o protótipo não "envelhecer".
// Sempre no fuso local: toISOString() usa UTC e, à noite no Brasil, já cai no dia seguinte.

function deslocar(dias: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + dias);
  return d;
}

/** AAAA-MM-DD, `dias` a partir de hoje (negativo = passado). */
export function isoRelativo(dias: number): string {
  const d = deslocar(dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** DD/MM/AAAA, `dias` a partir de hoje. */
export function dataBRRelativa(dias: number): string {
  const [a, m, d] = isoRelativo(dias).split("-");
  return `${d}/${m}/${a}`;
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** "Hoje", "Ontem" ou o dia da semana abreviado. */
export function rotuloDia(diasAtras: number): string {
  if (diasAtras === 0) return "Hoje";
  if (diasAtras === 1) return "Ontem";
  return DIAS_SEMANA[deslocar(-diasAtras).getDay()];
}

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/** Abreviação dos últimos `n` meses fechados, do mais antigo ao mais recente. */
export function mesesAnteriores(n: number): string[] {
  const hoje = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (n - i), 1);
    return MESES[d.getMonth()];
  });
}
