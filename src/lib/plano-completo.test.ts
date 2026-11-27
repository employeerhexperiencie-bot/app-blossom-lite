// Funcionalidades do plano do proprietário (sem banco): oficina, vistorias, vida útil, renovação,
// documentos, destaque, Plano Frota e loja parceira.
import { describe, it, expect, beforeEach } from "vitest";
import { useProprietario, kmDoCarro } from "./store-proprietario";
import { useOficina } from "./store-oficina";
import { useParceiro } from "./store-parceiro";
import { vidaUtilDoCarro, kmPorDia } from "./plano-manutencao";
import { validarKm, situacaoVistoria, limitarFotos, type Vistoria } from "./vistorias";
import { mensalidadePlanoFrota, somarDias, diasDesde } from "./regras-proprietario";
import { comissaoOS } from "./monetizacao";
import { acoesDoDia } from "./acoes-proprietario";
import { hojeISO, statusDocumento } from "./mock-proprietario";
import { ofertaParaItem } from "@/components/proprietario/VidaUtilPecas";

const inicialProp = useProprietario.getState();
const inicialOficina = useOficina.getState();
const inicialParceiro = useParceiro.getState();

beforeEach(() => {
  useProprietario.setState(inicialProp, true);
  useOficina.setState(inicialOficina, true);
  useParceiro.setState(inicialParceiro, true);
});

describe("regras", () => {
  it("Plano Frota: grátis até 2 carros, R$ 19,90 por carro a partir do 3º", () => {
    expect(mensalidadePlanoFrota(2)).toBe(0);
    expect(mensalidadePlanoFrota(5)).toBe(59.7);
  });
  it("datas locais", () => {
    expect(somarDias("2026-01-30", 3)).toBe("2026-02-02");
    expect(diasDesde("2026-01-30", "2026-02-02")).toBe(3);
  });
  it("status do documento pelo vencimento", () => {
    expect(statusDocumento("2026-01-01", "2026-02-01")).toBe("vencido");
    expect(statusDocumento("2026-02-20", "2026-02-01")).toBe("vencendo");
    expect(statusDocumento("2026-06-01", "2026-02-01")).toBe("ok");
  });
});

describe("vida útil das peças", () => {
  const base = { modelo: "Onix", hoje: "2026-11-27" };
  it("óleo a 80% do intervalo severo (5.000 km) vira alerta", () => {
    const [oleo] = vidaUtilDoCarro({
      ...base,
      kmAtual: 14000,
      manutencao: [{ item: "Óleo", ultimoKm: 10000, ultimaData: "2026-11-01" }],
    });
    expect(oleo.item).toBe("Óleo");
    expect(oleo.status).toBe("atencao");
    expect(oleo.faltamKm).toBe(1000);
  });
  it("o tempo também vence a peça, mesmo rodando pouco", () => {
    const [oleo] = vidaUtilDoCarro({
      ...base,
      kmAtual: 10100,
      manutencao: [{ item: "Óleo", ultimoKm: 10000, ultimaData: "2026-01-01" }],
    });
    expect(oleo.status).toBe("vencido");
  });
  it("sem registro de troca, o item pede o registro", () => {
    const itens = vidaUtilDoCarro({ ...base, kmAtual: 20000, manutencao: [] });
    expect(itens.every((i) => i.status === "sem_registro")).toBe(true);
  });
  it("previsão pelo ritmo de KM quando ele vence antes do tempo", () => {
    const [oleo] = vidaUtilDoCarro({
      ...base,
      kmAtual: 12000,
      kmPorDia: 200,
      manutencao: [{ item: "Óleo", ultimoKm: 10000, ultimaData: "2026-11-20" }],
    });
    expect(oleo.previsao).toBe(somarDias("2026-11-27", 15));
  });
  it("ritmo de KM pelas leituras", () => {
    expect(
      kmPorDia([
        { data: "2026-11-01", km: 10000 },
        { data: "2026-11-11", km: 12000 },
      ]),
    ).toBe(200);
    expect(kmPorDia([{ data: "2026-11-01", km: 10000 }])).toBeUndefined();
  });
});

describe("vistorias", () => {
  it("KM nunca volta e salto grande vira alerta", () => {
    expect(validarKm(900, { km: 1000, data: "2026-11-20" }, "2026-11-27").ok).toBe(false);
    const r = validarKm(10000, { km: 1000, data: "2026-11-26" }, "2026-11-27");
    expect(r.ok && r.alerta).toBeTruthy();
    expect(validarKm(1300, { km: 1000, data: "2026-11-26" }, "2026-11-27")).toEqual({ ok: true });
  });
  it("pendente após 7 dias ou 1.000 km", () => {
    expect(situacaoVistoria(undefined, 1000, "2026-11-27").pendente).toBe(true);
    expect(situacaoVistoria({ km: 1000, data: "2026-11-25" }, 1200, "2026-11-27").pendente).toBe(
      false,
    );
    expect(situacaoVistoria({ km: 1000, data: "2026-11-25" }, 2100, "2026-11-27").pendente).toBe(
      true,
    );
    expect(
      situacaoVistoria({ km: 1000, data: "2026-11-10" }, 1100, "2026-11-27").atrasadaDias,
    ).toBe(10);
  });
  it("guarda as fotos só das vistorias mais recentes de cada carro", () => {
    const v = (i: number): Vistoria => ({
      id: `v${i}`,
      carroId: "c1",
      enviadaEm: `2026-11-${String(i).padStart(2, "0")}T10:00:00.000Z`,
      km: 1000 + i,
      fotos: { painel: "x" },
      qtdFotos: 3,
      luzAcesa: false,
      enviadaPor: "motorista",
    });
    const lista = limitarFotos([1, 2, 3, 4].map(v), 2);
    expect(lista.filter((x) => Object.keys(x.fotos).length > 0).map((x) => x.id)).toEqual([
      "v4",
      "v3",
    ]);
    expect(lista.every((x) => x.qtdFotos === 3)).toBe(true);
  });
  it("registrar vistoria atualiza o KM do carro e o histórico", () => {
    const km = kmDoCarro(useProprietario.getState(), "c1");
    const res = useProprietario.getState().registrarVistoria({
      carroId: "c1",
      km: km + 300,
      fotos: { painel: "data:x" },
      qtdFotos: 3,
      luzAcesa: true,
      enviadaPor: "motorista",
    });
    expect(res.ok).toBe(true);
    const s = useProprietario.getState();
    expect(kmDoCarro(s, "c1")).toBe(km + 300);
    expect(s.eventosExtras[0].tipo).toBe("vistoria");
    expect(s.notificacoes[0].titulo).toBe("Vistoria com pontos de atenção");
  });
  it("recusa vistoria com KM menor que o do carro", () => {
    const km = kmDoCarro(useProprietario.getState(), "c1");
    const res = useProprietario.getState().registrarVistoria({
      carroId: "c1",
      km: km - 1,
      fotos: {},
      qtdFotos: 3,
      luzAcesa: false,
      enviadaPor: "motorista",
    });
    expect(res.ok).toBe(false);
  });
});

describe("orçamento da oficina com aprovação do dono", () => {
  function osComOrcamento() {
    const of = useOficina.getState();
    const id = of.solicitarServico({
      clienteNome: "Dono",
      clienteTelefone: "",
      carroId: "c1",
      veiculo: "Chevrolet Onix 2022",
      placa: "ABC1D23",
      categoria: "oleo",
      descricao: "Troca de óleo",
      km: 38000,
    });
    of.aceitarSolicitacao(id);
    of.iniciarAtendimento(id);
    of.addServico(id, { nome: "Troca de óleo", valor: 100, tempoMin: 30 });
    of.addPeca(id, { produto: "Filtro", quantidade: 2, valorUnit: 50, fornecedor: "Loja" });
    return id;
  }

  it("enviar, aprovar e concluir lança o custo no carro", () => {
    const id = osComOrcamento();
    useOficina.getState().enviarOrcamento(id);
    expect(useOficina.getState().ordens.find((o) => o.id === id)!.status).toBe(
      "aguardando_aprovacao",
    );
    expect(useProprietario.getState().notificacoes[0].titulo).toContain("Orçamento da oficina");
    useOficina.getState().aprovarOrcamento(id);
    const os = useOficina.getState().ordens.find((o) => o.id === id)!;
    expect(os.status).toBe("em_atendimento");
    expect(os.orcamentoAprovadoEm).toBe(hojeISO());
    expect(comissaoOS(os)).toBe(18); // 10% de 100 + 8% de 100
  });

  it("recusar fecha a OS com o motivo", () => {
    const id = osComOrcamento();
    useOficina.getState().enviarOrcamento(id);
    useOficina.getState().recusarOrcamento(id, "Caro");
    const os = useOficina.getState().ordens.find((o) => o.id === id)!;
    expect(os.status).toBe("recusado");
    expect(os.orcamentoRecusadoMotivo).toBe("Caro");
  });

  it("orçamento vazio não é enviado", () => {
    const of = useOficina.getState();
    const id = of.solicitarServico({
      clienteNome: "Dono",
      clienteTelefone: "",
      carroId: "c1",
      veiculo: "Onix",
      placa: "X",
      categoria: "oleo",
      descricao: "x",
      km: 1,
    });
    of.enviarOrcamento(id);
    expect(useOficina.getState().ordens.find((o) => o.id === id)!.status).toBe("solicitado");
  });

  it("vira ação do dia para o dono", () => {
    const acoes = acoesDoDia({
      hoje: "2026-11-27",
      carros: [],
      contratos: [],
      pagamentos: [],
      solicitacoes: [],
      checklists: [],
      documentos: [],
      manutencao: [],
      anuncios: {},
      orcamentos: [{ id: "o1", carroId: "c1", codigo: "OS-1", total: 200 }],
      vistoriasPendentes: [{ carroId: "c1", motivo: "x", atrasadaDias: 5 }],
    });
    expect(acoes.map((a) => a.tipo)).toEqual(["orcamento", "vistoria"]);
  });
});

describe("contrato, anúncio e plano", () => {
  it("renova um contrato encerrado com o mesmo motorista", () => {
    const s = useProprietario.getState();
    const ativo = s.contratos.find((c) => c.status === "ativo")!;
    s.finalizarContrato(ativo.id, { desconto: 0, nota: 5 });
    const novo = useProprietario.getState().renovarContrato(ativo.id, { valor: 999 })!;
    const c = useProprietario.getState().contratos.find((x) => x.id === novo)!;
    expect(c.status).toBe("aguardando_aceite");
    expect(c.motoristaNome).toBe(ativo.motoristaNome);
    expect(c.valor).toBe(999);
    expect(c.renovacaoDe).toBe(ativo.id);
    // Com a renovação pendente, não dá para renovar de novo.
    expect(useProprietario.getState().renovarContrato(ativo.id)).toBeUndefined();
  });

  it("destaque só em anúncio publicado, com custo no carro e receita na plataforma", () => {
    const s = useProprietario.getState();
    const publicado = Object.entries(s.anuncios).find(([, a]) => a.publicado)![0];
    expect(s.destacarAnuncio(publicado)).toBe(true);
    const depois = useProprietario.getState();
    expect(depois.anuncios[publicado].destaqueAte).toBe(somarDias(hojeISO(), 7));
    expect(depois.lancamentosPlataforma[0].tipo).toBe("destaque");
    expect(depois.eventosExtras[0].valor).toBe(9.9);
  });

  it("documentos: cadastrar e renovar a data", () => {
    const s = useProprietario.getState();
    s.salvarDocumento({ carroId: "c1", tipo: "Seguro", vencimento: "2099-01-01" });
    const doc = useProprietario.getState().documentos[0];
    expect(doc.status).toBe("ok");
    useProprietario.getState().salvarDocumento({ ...doc, vencimento: "2000-01-01" });
    expect(useProprietario.getState().documentos[0].status).toBe("vencido");
  });

  it("Plano Frota registra a primeira mensalidade", () => {
    useProprietario.getState().assinarPlanoFrota(4);
    const s = useProprietario.getState();
    expect(s.planoFrota.ativo).toBe(true);
    expect(s.lancamentosPlataforma[0].valor).toBe(39.8);
  });
});

describe("loja parceira no alerta de manutenção", () => {
  it("acha a oferta compatível mais barata e cria o pedido na loja", () => {
    const catalogo = useParceiro.getState().catalogo;
    const oferta = ofertaParaItem("Freios", "Onix", catalogo)!;
    expect(oferta.categoria).toBe("freios");
    expect(ofertaParaItem("Freios", "Kwid", catalogo)).toBeUndefined();
    const id = useParceiro.getState().pedirDaFrota({
      itemId: oferta.id,
      quantidade: 1,
      clienteNome: "Dono",
      veiculo: "Onix",
    })!;
    const pedido = useParceiro.getState().pedidos.find((p) => p.id === id)!;
    expect(pedido.clientePerfil).toBe("proprietario");
    expect(pedido.status).toBe("novo");
    expect(useParceiro.getState().catalogo.find((i) => i.id === oferta.id)!.leads).toBe(
      oferta.leads + 1,
    );
  });
});
