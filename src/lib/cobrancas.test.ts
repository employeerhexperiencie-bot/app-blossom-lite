import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  somarPeriodos,
  vencimentosEntre,
  proximoVencimento,
  serieMensal,
  financeiroDoCarro,
  caucaoPorNivel,
  ultimosMeses,
} from "./cobrancas";
import { useProprietario } from "./store-proprietario";
import type { Contrato, EventoVeiculo, Pagamento } from "./mock-proprietario";

describe("vencimentos", () => {
  it("soma dias, semanas e meses", () => {
    expect(somarPeriodos("2026-11-26", "diaria", 1)).toBe("2026-11-27");
    expect(somarPeriodos("2026-11-26", "semanal", 2)).toBe("2026-12-10");
    expect(somarPeriodos("2026-11-26", "mensal", 2)).toBe("2027-01-26");
  });

  it("no mensal, dia 31 vira o último dia do mês curto", () => {
    expect(somarPeriodos("2026-01-31", "mensal", 1)).toBe("2026-02-28");
    expect(somarPeriodos("2026-01-31", "mensal", 2)).toBe("2026-03-31");
  });

  it("lista os vencimentos até a data, inclusive", () => {
    expect(vencimentosEntre("2026-11-20", "2026-11-26", "semanal")).toEqual(["2026-11-20"]);
    expect(vencimentosEntre("2026-11-24", "2026-11-26", "diaria")).toEqual([
      "2026-11-24",
      "2026-11-25",
      "2026-11-26",
    ]);
  });

  it("limita aos vencimentos mais recentes", () => {
    const datas = vencimentosEntre("2026-01-01", "2026-11-26", "diaria", 10);
    expect(datas).toHaveLength(10);
    expect(datas.at(-1)).toBe("2026-11-26");
  });

  it("calcula o próximo vencimento depois de hoje", () => {
    expect(proximoVencimento("2026-11-01", "mensal", "2026-11-26")).toBe("2026-12-01");
  });

  it("gera os últimos meses na ordem", () => {
    expect(ultimosMeses("2026-02-10", 3)).toEqual(["2025-12", "2026-01", "2026-02"]);
  });
});

describe("números financeiros", () => {
  const contratos = [
    { id: "k1", carroId: "cA" },
    { id: "k2", carroId: "cB" },
  ] as Contrato[];
  const pagamentos = [
    {
      id: "a",
      contratoId: "k1",
      valor: 100,
      data: "2026-11-02",
      pagoEm: "2026-11-03",
      status: "pago",
    },
    { id: "b", contratoId: "k1", valor: 100, data: "2026-11-04", status: "atrasado" },
    { id: "c", contratoId: "k2", valor: 50, data: "2026-10-10", status: "pago" },
  ] as Pagamento[];
  const eventos = [
    { id: "e1", carroId: "cA", tipo: "revisao", titulo: "", data: "2026-11-05", valor: 30 },
    { id: "e2", carroId: "cA", tipo: "observacao", titulo: "", data: "2026-11-05", valor: 999 },
  ] as EventoVeiculo[];

  it("receita só conta pagamentos pagos; custos só eventos de custo", () => {
    expect(financeiroDoCarro("cA", contratos, pagamentos, eventos)).toEqual({
      carroId: "cA",
      receita: 100,
      custos: 30,
    });
    expect(financeiroDoCarro("cB", contratos, pagamentos, eventos)).toEqual({
      carroId: "cB",
      receita: 50,
      custos: 0,
    });
  });

  it("série mensal agrupa pelo mês do recebimento", () => {
    const serie = serieMensal(pagamentos, eventos, ["2026-10", "2026-11"]);
    expect(serie).toEqual([
      { mes: "Out/26", receita: 50, custos: 0 },
      { mes: "Nov/26", receita: 100, custos: 30 },
    ]);
  });
});

describe("caução pelo nível", () => {
  it("Veinho paga metade, Bigode 25% a menos, os demais o valor cheio", () => {
    expect(caucaoPorNivel(1500, "Veinho")).toEqual({ valor: 750, desconto: 0.5 });
    expect(caucaoPorNivel(1500, "Bigode")).toEqual({ valor: 1125, desconto: 0.25 });
    expect(caucaoPorNivel(1500, "Juvenil")).toEqual({ valor: 1500, desconto: 0 });
    expect(caucaoPorNivel(1500)).toEqual({ valor: 1500, desconto: 0 });
  });
});

describe("cobranças automáticas na store", () => {
  const estadoInicial = useProprietario.getState();
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 26, 10, 0, 0)); // 26/11/2026, 10h
    useProprietario.setState(estadoInicial, true);
  });
  afterEach(() => vi.useRealTimers());

  function contratoAtivo(periodicidade: Contrato["periodicidade"] = "diaria") {
    useProprietario.setState({
      contratos: [
        {
          id: "kx",
          carroId: "c5",
          motoristaId: "m9",
          motoristaNome: "Teste",
          valor: 130,
          periodicidade,
          caucao: 1500,
          inicio: "2026-11-24",
          status: "ativo",
          cobrancaDesde: "2026-11-24",
        },
      ],
      pagamentos: [],
      notificacoes: [],
    });
  }

  it("cria as cobranças vencidas como atrasadas e a de hoje como pendente", () => {
    contratoAtivo();
    useProprietario.getState().sincronizarCobrancas();
    const lista = useProprietario.getState().pagamentos.filter((p) => p.contratoId === "kx");
    const porData = Object.fromEntries(lista.map((p) => [p.vencimento, p.status]));
    expect(porData).toEqual({
      "2026-11-24": "atrasado",
      "2026-11-25": "atrasado",
      "2026-11-26": "pendente",
    });
  });

  it("avisa o proprietário sobre os atrasos, uma notificação por contrato", () => {
    contratoAtivo();
    useProprietario.getState().sincronizarCobrancas();
    const avisos = useProprietario.getState().notificacoes.filter((n) => n.contratoId === "kx");
    expect(avisos).toHaveLength(1);
    expect(avisos[0].titulo).toBe("2 pagamentos atrasados");
  });

  it("rodar de novo no mesmo dia não duplica cobranças nem avisos", () => {
    contratoAtivo();
    useProprietario.getState().sincronizarCobrancas();
    useProprietario.getState().sincronizarCobrancas();
    const st = useProprietario.getState();
    expect(st.pagamentos.filter((p) => p.contratoId === "kx")).toHaveLength(3);
    expect(st.notificacoes.filter((n) => n.contratoId === "kx")).toHaveLength(1);
  });

  it("no dia seguinte, a pendente vira atrasada e nasce a cobrança do dia", () => {
    contratoAtivo();
    useProprietario.getState().sincronizarCobrancas();
    vi.setSystemTime(new Date(2026, 10, 27, 10, 0, 0));
    useProprietario.getState().sincronizarCobrancas();
    const porData = Object.fromEntries(
      useProprietario.getState().pagamentos.map((p) => [p.vencimento, p.status]),
    );
    expect(porData["2026-11-26"]).toBe("atrasado");
    expect(porData["2026-11-27"]).toBe("pendente");
  });

  it("registrar um pagamento quita a cobrança em aberto mais antiga", () => {
    contratoAtivo();
    useProprietario.getState().sincronizarCobrancas();
    useProprietario
      .getState()
      .registrarPagamentoDetalhado("kx", { valor: 130, data: "2026-11-26", forma: "Pix" });
    const porData = Object.fromEntries(
      useProprietario.getState().pagamentos.map((p) => [p.vencimento, p.status]),
    );
    expect(porData["2026-11-24"]).toBe("pago");
    expect(porData["2026-11-25"]).toBe("atrasado");
  });

  it("contratos suspensos ou encerrados não geram cobranças", () => {
    contratoAtivo();
    useProprietario.setState({
      contratos: useProprietario.getState().contratos.map((c) => ({ ...c, status: "suspenso" })),
    });
    useProprietario.getState().sincronizarCobrancas();
    expect(useProprietario.getState().pagamentos).toHaveLength(0);
  });
});
