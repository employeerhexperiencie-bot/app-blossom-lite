import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProprietario, usePagamentosDoContrato } from "./store-proprietario";
import { fmtData, MOTORISTA_LOGADO_ID, type MotoristaCandidato } from "./mock-proprietario";

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
});

const candidato: MotoristaCandidato = {
  id: MOTORISTA_LOGADO_ID,
  nome: "Motorista Teste",
  avaliacao: 4.8,
  tempoPlataforma: "desde mar. 2025",
  corridas: 1247,
  historico: "Teste",
  nivel: "Juvenil",
};

function propostaAceita() {
  const st = useProprietario.getState();
  const solId = st.enviarProposta({
    carroId: "c2",
    candidato,
    valor: 120,
    periodicidade: "diaria",
    duracao: "30 dias",
  });
  const contratoId = useProprietario.getState().aceitarSolicitacao(solId, {
    valor: 115,
    periodicidade: "diaria",
    caucao: 1500,
    observacoes: "Sem app de entrega",
  })!;
  return { solId, contratoId };
}

describe("fluxo de aluguel: proposta → contrato → entrega → devolução", () => {
  it("a proposta do motorista cria solicitação e notifica o proprietário", () => {
    const solId = useProprietario
      .getState()
      .enviarProposta({ carroId: "c2", candidato, valor: 120, periodicidade: "diaria" });
    const st = useProprietario.getState();
    const sol = st.solicitacoes.find((s) => s.id === solId);
    expect(sol?.status).toBe("pendente");
    expect(sol?.candidato?.nome).toBe("Motorista Teste");
    expect(st.notificacoes.some((n) => n.solicitacaoId === solId)).toBe(true);
  });

  it("enviar outra proposta para o mesmo carro atualiza a pendente em vez de duplicar", () => {
    const st = useProprietario.getState();
    const a = st.enviarProposta({ carroId: "c2", candidato, valor: 120, periodicidade: "diaria" });
    const b = useProprietario
      .getState()
      .enviarProposta({ carroId: "c2", candidato, valor: 100, periodicidade: "semanal" });
    expect(b).toBe(a);
    const pendentes = useProprietario.getState().solicitacoes.filter((s) => s.carroId === "c2");
    expect(pendentes).toHaveLength(1);
    expect(pendentes[0].valorProposto).toBe(100);
  });

  it("aceitar a solicitação cria contrato aguardando aceite, sem alugar o carro ainda", () => {
    const { solId, contratoId } = propostaAceita();
    const st = useProprietario.getState();
    expect(st.solicitacoes.find((s) => s.id === solId)?.status).toBe("aceita");
    const contrato = st.contratos.find((c) => c.id === contratoId);
    expect(contrato?.status).toBe("aguardando_aceite");
    expect(contrato?.valor).toBe(115);
    expect(st.carrosOverrides.c2?.status).toBeUndefined();
  });

  it("o motorista aceita: contrato ativo e carro alugado", () => {
    const { contratoId } = propostaAceita();
    useProprietario.getState().motoristaAceitarContrato(contratoId);
    const st = useProprietario.getState();
    expect(st.contratos.find((c) => c.id === contratoId)?.status).toBe("ativo");
    expect(st.carrosOverrides.c2?.status).toBe("alugado");
    expect(st.carrosOverrides.c2?.motoristaAtual).toBe("Motorista Teste");
  });

  it("o motorista recusa: contrato recusado e carro continua livre", () => {
    const { contratoId } = propostaAceita();
    useProprietario.getState().motoristaRecusarContrato(contratoId);
    const st = useProprietario.getState();
    expect(st.contratos.find((c) => c.id === contratoId)?.status).toBe("recusado");
    expect(st.carrosOverrides.c2?.status).toBeUndefined();
  });

  it("o checklist fica salvo, aparece na linha do tempo e atualiza o km", () => {
    const { contratoId } = propostaAceita();
    useProprietario.getState().motoristaAceitarContrato(contratoId);
    useProprietario.getState().salvarChecklist({
      contratoId,
      tipo: "entrada",
      itens: { km: 22100, combustivel: "cheio", pneus: "ok", avarias: "", fotos: 4 },
    });
    const st = useProprietario.getState();
    expect(st.checklists.filter((c) => c.contratoId === contratoId)).toHaveLength(1);
    expect(st.eventosExtras.some((e) => e.tipo === "checklist" && e.carroId === "c2")).toBe(true);
    expect(st.carrosOverrides.c2?.km).toBe(22100);
  });

  it("salvar o mesmo checklist de novo substitui o anterior", () => {
    const { contratoId } = propostaAceita();
    const salvar = (km: number) =>
      useProprietario.getState().salvarChecklist({
        contratoId,
        tipo: "entrada",
        itens: { km, combustivel: "cheio", pneus: "ok", avarias: "", fotos: 0 },
      });
    salvar(22100);
    salvar(22150);
    const lista = useProprietario.getState().checklists.filter((c) => c.contratoId === contratoId);
    expect(lista).toHaveLength(1);
    expect(lista[0].itens.km).toBe(22150);
  });

  it("finalizar registra o acerto da caução, a avaliação e libera o carro", () => {
    const { contratoId } = propostaAceita();
    useProprietario.getState().motoristaAceitarContrato(contratoId);
    useProprietario.getState().finalizarContrato(contratoId, {
      desconto: 300,
      motivo: "Risco na porta",
      nota: 4,
      comentario: "Ok",
    });
    const st = useProprietario.getState();
    const contrato = st.contratos.find((c) => c.id === contratoId);
    expect(contrato?.status).toBe("encerrado");
    expect(contrato?.acerto).toEqual({
      caucao: 1500,
      desconto: 300,
      devolvido: 1200,
      motivo: "Risco na porta",
    });
    expect(contrato?.avaliacao?.nota).toBe(4);
    expect(st.carrosOverrides.c2?.status).toBe("disponivel");
  });

  it("o desconto na caução nunca passa do valor da caução", () => {
    const { contratoId } = propostaAceita();
    useProprietario.getState().motoristaAceitarContrato(contratoId);
    useProprietario.getState().finalizarContrato(contratoId, { desconto: 5000, nota: 3 });
    const acerto = useProprietario.getState().contratos.find((c) => c.id === contratoId)?.acerto;
    expect(acerto?.desconto).toBe(1500);
    expect(acerto?.devolvido).toBe(0);
  });

  it("não dá para finalizar um contrato que o motorista ainda não aceitou", () => {
    const { contratoId } = propostaAceita();
    useProprietario.getState().finalizarContrato(contratoId, { desconto: 0, nota: 5 });
    expect(useProprietario.getState().contratos.find((c) => c.id === contratoId)?.status).toBe(
      "aguardando_aceite",
    );
  });
});

describe("correções de data e quilometragem", () => {
  it("fmtData mostra o dia certo para datas AAAA-MM-DD, sem voltar um dia pelo fuso", () => {
    expect(fmtData("2026-11-26")).toContain("26");
  });

  it("o checklist não cria um evento extra de km", () => {
    const { contratoId } = propostaAceita();
    useProprietario.getState().motoristaAceitarContrato(contratoId);
    useProprietario.getState().salvarChecklist({
      contratoId,
      tipo: "entrada",
      itens: { km: 22500, combustivel: "cheio", pneus: "ok", avarias: "", fotos: 0 },
    });
    const eventosKm = useProprietario.getState().eventosExtras.filter((e) => e.tipo === "km");
    expect(eventosKm).toHaveLength(0);
  });

  it("atualizar o km funciona também em carro cadastrado pelo dono", () => {
    const id = useProprietario.getState().criarVeiculo({
      marca: "Fiat",
      modelo: "Argo",
      ano: 2024,
      placa: "XYZ-1A23",
      diaria: 100,
      mensal: 2200,
      caucao: 1000,
      km: 5000,
      cidade: "São Paulo",
      seguro: true,
      proprietario: "Você",
      status: "disponivel",
      foto: "",
    });
    useProprietario.getState().atualizarKm(id, 5800);
    expect(useProprietario.getState().carrosNovos.find((c) => c.id === id)?.km).toBe(5800);
  });
});
