// Motoristas do proprietário, montados a partir dos contratos e dos pagamentos registrados.
import type { Contrato, Pagamento, SolicitacaoLocacao } from "./mock-proprietario";

export type MotoristaDoDono = {
  id: string;
  nome: string;
  contratos: Contrato[];
  contratoAtual?: Contrato;
  desde: string;
  avaliacao?: number;
  pagoTotal: number;
  pagosQtd: number;
  atrasadoTotal: number;
  atrasadosQtd: number;
};

export function motoristasDosContratos(
  contratos: Contrato[],
  pagamentos: Pagamento[],
  solicitacoes: SolicitacaoLocacao[],
  notasConhecidas: Record<string, number>,
): MotoristaDoDono[] {
  // Contrato recusado ou ainda sem aceite não torna a pessoa motorista do dono.
  const validos = contratos.filter(
    (c) => c.status !== "recusado" && c.status !== "aguardando_aceite",
  );
  const porId = new Map<string, Contrato[]>();
  for (const c of validos) porId.set(c.motoristaId, [...(porId.get(c.motoristaId) ?? []), c]);

  return [...porId.entries()].map(([id, lista]) => {
    const ordenados = [...lista].sort((a, b) => (a.inicio < b.inicio ? 1 : -1));
    const ids = new Set(lista.map((c) => c.id));
    const pags = pagamentos.filter((p) => ids.has(p.contratoId));
    const pagos = pags.filter((p) => p.status === "pago");
    const atrasados = pags.filter((p) => p.status === "atrasado");
    // Nota: média das avaliações dadas pelo dono ao encerrar; sem isso, a nota do app ou da proposta.
    const notasDono = lista.map((c) => c.avaliacao?.nota).filter((n): n is number => n != null);
    const notaProposta = solicitacoes.find((s) => s.motoristaId === id && s.candidato)?.candidato
      ?.avaliacao;
    const avaliacao = notasDono.length
      ? notasDono.reduce((a, n) => a + n, 0) / notasDono.length
      : (notasConhecidas[id] ?? notaProposta);
    return {
      id,
      nome: ordenados[0].motoristaNome,
      contratos: ordenados,
      contratoAtual: ordenados.find((c) => c.status === "ativo" || c.status === "suspenso"),
      desde: ordenados.at(-1)!.inicio,
      avaliacao,
      pagoTotal: pagos.reduce((a, p) => a + p.valor, 0),
      pagosQtd: pagos.length,
      atrasadoTotal: atrasados.reduce((a, p) => a + p.valor, 0),
      atrasadosQtd: atrasados.length,
    };
  });
}
