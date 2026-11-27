// Correções vindas do mapa de UX do app publicado.
import { describe, it, expect, beforeEach } from "vitest";
import { useConect, corridasParaMotorista, estimarCorrida } from "./store";
import { corridasDisponiveis } from "./mock-data";
import { saudeDoCarro } from "./mock-oficina";
import { manutencaoMock } from "./mock-proprietario";
import { isoRelativo, dataBRRelativa, mesesAnteriores } from "./datas";
import { cashbackHistorico } from "./mock-data";

const inicial = useConect.getState();

describe("pedido de corrida do passageiro até o motorista", () => {
  beforeEach(() => useConect.setState({ ...inicial, pedidos: [], corridaAtivaId: null }, true));

  function pedir() {
    return useConect
      .getState()
      .pedirCorrida({ origem: "Minha localização", destino: "Terminal Grajaú", passageiro: "Ana" });
  }

  it("o pedido aparece primeiro na lista do motorista", () => {
    const id = pedir();
    const lista = corridasParaMotorista(useConect.getState().pedidos, corridasDisponiveis, []);
    expect(lista[0].id).toBe(id);
    expect(lista[0].passageiro).toBe("Ana");
  });

  it("cada etapa do motorista muda o que o passageiro vê", () => {
    const id = pedir();
    const status = () => useConect.getState().pedidos.find((p) => p.id === id)!.status;
    useConect.getState().aceitarCorrida(id);
    expect(status()).toBe("a_caminho");
    useConect.getState().iniciarViagem(id);
    expect(status()).toBe("em_viagem");
    useConect.getState().finalizarCorrida(id);
    expect(status()).toBe("finalizada");
  });

  it("aceito, o pedido sai da lista de disponíveis", () => {
    const id = pedir();
    useConect.getState().aceitarCorrida(id);
    const lista = corridasParaMotorista(useConect.getState().pedidos, corridasDisponiveis, []);
    expect(lista.some((c) => c.id === id)).toBe(false);
  });

  it("se o motorista cancela, o pedido volta para a fila", () => {
    const id = pedir();
    useConect.getState().aceitarCorrida(id);
    useConect.getState().cancelarCorrida();
    const p = useConect.getState().pedidos.find((x) => x.id === id)!;
    expect(p.status).toBe("buscando");
    expect(p.motoristaNome).toBeUndefined();
  });

  it("o passageiro pode cancelar enquanto procura motorista", () => {
    const id = pedir();
    useConect.getState().cancelarPedido(id);
    expect(useConect.getState().pedidos.find((p) => p.id === id)!.status).toBe("cancelada");
  });

  it("a estimativa é sempre a mesma para o mesmo trajeto e fica numa faixa razoável", () => {
    const a = estimarCorrida("Casa", "Terminal Grajaú");
    expect(estimarCorrida("Casa", "Terminal Grajaú")).toEqual(a);
    expect(a.distanciaKm).toBeGreaterThanOrEqual(3);
    expect(a.distanciaKm).toBeLessThanOrEqual(12);
    expect(a.valor).toBeGreaterThan(5);
  });
});

describe("saúde do veículo igual para oficina e motorista", () => {
  it("usa o histórico real: o Onix (38.000 km) tem óleo previsto para 46.500 km", () => {
    const saude = saudeDoCarro(
      38000,
      manutencaoMock.filter((m) => m.carroId === "c1"),
    );
    expect(saude.itens.find((i) => i.nome === "Óleo")?.detalhe).toBe("Faltam 8.500 km");
  });

  it("sem histórico, cai na estimativa padrão", () => {
    const saude = saudeDoCarro(10000, []);
    expect(saude.itens).toHaveLength(5);
  });
});

describe("dados de exemplo", () => {
  it("o saldo de cashback do passageiro não fica negativo", () => {
    expect(cashbackHistorico.reduce((a, h) => a + h.valor, 0)).toBeGreaterThan(0);
  });

  it("datas relativas a hoje", () => {
    expect(isoRelativo(0)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(isoRelativo(-1) < isoRelativo(0)).toBe(true);
    expect(dataBRRelativa(0)).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(mesesAnteriores(6)).toHaveLength(6);
  });
});
