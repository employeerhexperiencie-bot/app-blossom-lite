import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProprietario, usePagamentosDoContrato } from "./store-proprietario";

const estadoInicial = useProprietario.getState();

beforeEach(() => {
  useProprietario.setState(estadoInicial, true);
});

describe("usePagamentosDoContrato", () => {
  it("devolve só os pagamentos do contrato", () => {
    const { result } = renderHook(() => usePagamentosDoContrato("ct1"));
    expect(result.current.length).toBeGreaterThan(0);
    expect(result.current.every((p) => p.contratoId === "ct1")).toBe(true);
  });

  it("não entra em laço de renderização e mantém a mesma lista entre renders", () => {
    let renders = 0;
    const { result, rerender } = renderHook(() => {
      renders++;
      return usePagamentosDoContrato("ct1");
    });
    const primeira = result.current;
    rerender();
    expect(result.current).toBe(primeira);
    expect(renders).toBeLessThan(5);
  });

  it("atualiza quando um pagamento do contrato é registrado", () => {
    const { result } = renderHook(() => usePagamentosDoContrato("ct1"));
    const antes = result.current.length;
    act(() => {
      useProprietario
        .getState()
        .registrarPagamentoDetalhado("ct1", { valor: 110, data: "2026-11-26", forma: "Pix" });
    });
    expect(result.current.length).toBe(antes + 1);
  });
});

describe("ciclo do contrato", () => {
  it("criar contrato marca o carro como alugado e encerrar libera o carro", () => {
    const s = useProprietario.getState();
    const id = s.criarContrato({
      carroId: "c3",
      motoristaId: "m9",
      motoristaNome: "Teste",
      valor: 100,
      periodicidade: "diaria",
      caucao: 1000,
      inicio: "2026-11-26",
    });
    expect(useProprietario.getState().carrosOverrides.c3?.status).toBe("alugado");
    useProprietario.getState().encerrarContrato(id);
    const depois = useProprietario.getState();
    expect(depois.contratos.find((c) => c.id === id)?.status).toBe("encerrado");
    expect(depois.carrosOverrides.c3?.status).toBe("disponivel");
  });

  it("aceitar uma solicitação cria um contrato ativo", () => {
    const solId = useProprietario.getState().criarSolicitacaoMock("c3");
    const contratoId = useProprietario.getState().aceitarSolicitacao(solId, 120, "diaria");
    const st = useProprietario.getState();
    expect(st.solicitacoes.find((s) => s.id === solId)?.status).toBe("aceita");
    expect(st.contratos.find((c) => c.id === contratoId)?.status).toBe("ativo");
  });
});
