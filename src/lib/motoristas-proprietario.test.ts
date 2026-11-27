import { describe, it, expect } from "vitest";
import { motoristasDosContratos } from "./motoristas-proprietario";
import type { Contrato, Pagamento } from "./mock-proprietario";

const c = (o: Partial<Contrato>): Contrato =>
  ({
    carroId: "c1",
    valor: 100,
    periodicidade: "diaria",
    caucao: 1000,
    inicio: "2026-01-01",
    ...o,
  }) as Contrato;

describe("motoristasDosContratos", () => {
  const contratos = [
    c({
      id: "k1",
      motoristaId: "a",
      motoristaNome: "Ana",
      status: "encerrado",
      inicio: "2026-01-01",
      avaliacao: { nota: 4 },
    }),
    c({ id: "k2", motoristaId: "a", motoristaNome: "Ana", status: "ativo", inicio: "2026-06-01" }),
    c({ id: "k3", motoristaId: "b", motoristaNome: "Bia", status: "aguardando_aceite" }),
    c({ id: "k4", motoristaId: "d", motoristaNome: "Davi", status: "recusado" }),
  ];
  const pagamentos = [
    { id: "p1", contratoId: "k1", valor: 100, data: "2026-01-01", status: "pago" },
    { id: "p2", contratoId: "k2", valor: 100, data: "2026-06-01", status: "atrasado" },
  ] as Pagamento[];

  it("agrupa por motorista e ignora contratos sem aceite ou recusados", () => {
    const lista = motoristasDosContratos(contratos, pagamentos, [], {});
    expect(lista.map((m) => m.nome)).toEqual(["Ana"]);
  });

  it("soma pagos e atrasados e aponta o contrato atual", () => {
    const [ana] = motoristasDosContratos(contratos, pagamentos, [], {});
    expect(ana.pagoTotal).toBe(100);
    expect(ana.atrasadosQtd).toBe(1);
    expect(ana.contratoAtual?.id).toBe("k2");
    expect(ana.desde).toBe("2026-01-01");
  });

  it("a nota dada pelo dono tem prioridade sobre a nota conhecida do app", () => {
    const [ana] = motoristasDosContratos(contratos, pagamentos, [], { a: 4.9 });
    expect(ana.avaliacao).toBe(4);
  });
});
