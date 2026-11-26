import { describe, it, expect } from "vitest";
import { acoesDoDia, ocupacaoDaFrota } from "./acoes-proprietario";
import type { Carro } from "./mock-data";
import type { Contrato, Pagamento } from "./mock-proprietario";

const carro = (o: Partial<Carro>): Carro =>
  ({ marca: "Fiat", modelo: "Argo", km: 10000, status: "disponivel", ...o }) as Carro;

const base = {
  hoje: "2026-11-26",
  carros: [
    carro({ id: "c1", status: "alugado" }),
    carro({ id: "c2" }),
    carro({ id: "c3", status: "manutencao" }),
  ],
  contratos: [] as Contrato[],
  pagamentos: [] as Pagamento[],
  solicitacoes: [],
  checklists: [],
  documentos: [],
  manutencao: [],
  anuncios: {},
};

describe("acoesDoDia", () => {
  it("coloca o atraso antes de tudo e agrupa por contrato", () => {
    const acoes = acoesDoDia({
      ...base,
      contratos: [{ id: "k1", carroId: "c1", motoristaNome: "Ana", status: "ativo" } as Contrato],
      pagamentos: [
        { id: "p1", contratoId: "k1", valor: 100, data: "2026-11-24", status: "atrasado" },
        { id: "p2", contratoId: "k1", valor: 100, data: "2026-11-25", status: "atrasado" },
      ] as Pagamento[],
      documentos: [
        { id: "d1", carroId: "c1", tipo: "IPVA", vencimento: "2026-11-01", status: "vencido" },
      ],
    });
    expect(acoes[0].tipo).toBe("atraso");
    expect(acoes.filter((a) => a.tipo === "atraso")).toHaveLength(1);
    expect(acoes[0].titulo).toContain("200");
  });

  it("documento: vencido é urgente, vencendo em 30 dias é médio, depois disso não aparece", () => {
    const acoes = acoesDoDia({
      ...base,
      documentos: [
        { id: "d1", carroId: "c1", tipo: "IPVA", vencimento: "2026-11-01", status: "ok" },
        { id: "d2", carroId: "c1", tipo: "Seguro", vencimento: "2026-12-10", status: "ok" },
        { id: "d3", carroId: "c1", tipo: "CRLV", vencimento: "2027-03-01", status: "ok" },
      ],
    });
    const docs = acoes.filter((a) => a.tipo === "documento");
    expect(docs.map((a) => a.urgencia)).toEqual(["alta", "media"]);
    expect(docs[1].titulo).toBe("Seguro vence em 14 dias");
  });

  it("manutenção entra quando faltam até 1.000 km", () => {
    const acoes = acoesDoDia({
      ...base,
      manutencao: [
        { id: "m1", carroId: "c1", item: "Óleo", ultimoKm: 0, ultimaData: "", proximoKm: 10600 },
        { id: "m2", carroId: "c1", item: "Pneus", ultimoKm: 0, ultimaData: "", proximoKm: 40000 },
      ],
    });
    const manut = acoes.filter((a) => a.tipo === "manutencao");
    expect(manut).toHaveLength(1);
    expect(manut[0].descricao).toContain("600 km");
  });

  it("carro livre sem anúncio aparece como parado; com anúncio publicado, não", () => {
    expect(acoesDoDia(base).some((a) => a.id === "parado-c2")).toBe(true);
    const comAnuncio = acoesDoDia({
      ...base,
      anuncios: {
        c2: { publicado: true, periodicidade: "diaria", valor: 100, caucao: 1000, requisitos: "" },
      },
    });
    expect(comAnuncio.some((a) => a.id === "parado-c2")).toBe(false);
  });
});

describe("ocupacaoDaFrota", () => {
  it("ignora os carros em manutenção", () => {
    expect(ocupacaoDaFrota(base.carros)).toEqual({ alugados: 1, rodaveis: 2, percentual: 50 });
  });
});
