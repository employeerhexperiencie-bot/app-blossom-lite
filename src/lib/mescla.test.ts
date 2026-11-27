// Testes do que a mesclagem com o PR #1 juntou: cobrança manual + automática, chave Pix migrada
// para o Perfil e os dois geradores de Pix.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { isValidPixPayload } from "@brazilian-utils/brazilian-utils";
import { useProprietario } from "./store-proprietario";
import { gerarPixCopiaECola, montarCobrancaPix } from "./pix";

const estadoInicial = useProprietario.getState();

describe("cobrança manual junto com a automática", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 26, 10, 0, 0));
    useProprietario.setState(estadoInicial, true);
    useProprietario.setState({
      contratos: [
        {
          id: "kx",
          carroId: "c5",
          motoristaId: "m9",
          motoristaNome: "Teste",
          valor: 130,
          periodicidade: "diaria",
          caucao: 1500,
          inicio: "2026-11-26",
          status: "ativo",
          cobrancaDesde: "2026-11-27",
        },
      ],
      pagamentos: [],
      notificacoes: [],
    });
  });
  afterEach(() => vi.useRealTimers());

  it("a cobrança gerada à mão guarda o vencimento e o txid do Pix", () => {
    const id = useProprietario
      .getState()
      .gerarCobranca("kx", { valor: 130, vencimento: "2026-11-27" });
    const p = useProprietario.getState().pagamentos.find((x) => x.id === id)!;
    expect(p.vencimento).toBe("2026-11-27");
    expect(p.status).toBe("pendente");
    expect(p.txid).toMatch(/^[A-Za-z0-9]{1,25}$/);
  });

  it("a cobrança automática do mesmo dia não duplica a gerada à mão", () => {
    useProprietario.getState().gerarCobranca("kx", { valor: 130, vencimento: "2026-11-27" });
    vi.setSystemTime(new Date(2026, 10, 27, 10, 0, 0));
    useProprietario.getState().sincronizarCobrancas();
    const doDia = useProprietario
      .getState()
      .pagamentos.filter((p) => p.vencimento === "2026-11-27");
    expect(doDia).toHaveLength(1);
  });

  it("marcar a cobrança como enviada registra a data", () => {
    const id = useProprietario
      .getState()
      .gerarCobranca("kx", { valor: 130, vencimento: "2026-11-27" });
    useProprietario.getState().marcarCobrancaEnviada(id);
    expect(useProprietario.getState().pagamentos.find((p) => p.id === id)?.cobradoEm).toBe(
      "2026-11-26",
    );
  });
});

describe("migração da chave Pix antiga para o Perfil", () => {
  it("quem tinha a chave na tela antiga não perde ao atualizar", () => {
    const migrate = useProprietario.persist.getOptions().migrate!;
    const antigo = {
      contratos: [],
      pagamentos: [],
      recebimento: { nome: "Carlos Mendes", cidade: "Campinas", chavePix: "carlos@exemplo.com" },
    };
    const novo = migrate(antigo, 0) as ReturnType<typeof useProprietario.getState>;
    expect(novo.perfil.chavePix).toBe("carlos@exemplo.com");
    expect(novo.perfil.nome).toBe("Carlos Mendes");
    expect(novo.perfil.cidade).toBe("Campinas");
  });
});

describe("os dois geradores de Pix produzem códigos válidos", () => {
  const dados = {
    chave: "carlos@exemplo.com",
    nome: "Carlos Mendes",
    cidade: "São Paulo",
    valor: 110,
  };

  it("gerador da tela do motorista", () => {
    const codigo = gerarPixCopiaECola({ ...dados, identificador: "pgct120261126" });
    expect(codigo && isValidPixPayload(codigo)).toBe(true);
  });

  it("gerador das cobranças do proprietário", async () => {
    const { brCode } = await montarCobrancaPix({
      recebimento: { nome: dados.nome, cidade: dados.cidade, chavePix: dados.chave },
      valor: dados.valor,
      txid: "TLct1abc",
    });
    expect(isValidPixPayload(brCode)).toBe(true);
  });
});
