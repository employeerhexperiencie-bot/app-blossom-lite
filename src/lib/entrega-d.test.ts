import { describe, it, expect, beforeEach } from "vitest";
import { atendeRequisitos, descreverRequisitos } from "./requisitos";
import { useOficina } from "./store-oficina";
import { useProprietario } from "./store-proprietario";

describe("requisitos do anúncio", () => {
  const juvenil = { nivel: "Juvenil", avaliacao: 4.82 };

  it("anúncio sem requisitos aceita qualquer motorista", () => {
    expect(atendeRequisitos({}, juvenil)).toEqual({ ok: true, motivos: [] });
    expect(descreverRequisitos({})).toBe("Aberto a todos os níveis");
  });

  it("bloqueia nível abaixo do mínimo e explica por quê", () => {
    const r = atendeRequisitos({ nivelMinimo: "Calça Branca" }, juvenil);
    expect(r.ok).toBe(false);
    expect(r.motivos[0]).toContain("Calça Branca");
    expect(r.motivos[0]).toContain("Juvenil");
  });

  it("nível igual ou acima do mínimo passa", () => {
    expect(atendeRequisitos({ nivelMinimo: "Juvenil" }, juvenil).ok).toBe(true);
    expect(atendeRequisitos({ nivelMinimo: "Juvenil" }, { nivel: "Veinho", avaliacao: 5 }).ok).toBe(
      true,
    );
  });

  it("confere a nota mínima", () => {
    expect(atendeRequisitos({ notaMinima: 4.7 }, juvenil).ok).toBe(true);
    expect(atendeRequisitos({ notaMinima: 4.9 }, juvenil).ok).toBe(false);
    expect(descreverRequisitos({ nivelMinimo: "Bigode", notaMinima: 4.7 })).toBe(
      "nível Bigode+ · nota 4.7+",
    );
  });
});

describe("pedido ao Centro de Serviços", () => {
  const inicial = useOficina.getState();
  beforeEach(() => useOficina.setState(inicial, true));

  it("cria uma ordem de serviço solicitada pelo proprietário, com código novo", () => {
    const id = useOficina.getState().solicitarServico({
      clienteNome: "Carlos Mendes",
      clienteTelefone: "",
      carroId: "c2",
      veiculo: "Hyundai HB20 2023",
      placa: "DEF-4G56",
      categoria: "oleo",
      descricao: "Óleo: manutenção preventiva.",
      km: 22000,
    });
    const os = useOficina.getState().ordens.find((o) => o.id === id)!;
    expect(os.status).toBe("solicitado");
    expect(os.clienteTipo).toBe("proprietario");
    const codigos = inicial.ordens.map((o) => Number(o.codigo.replace(/\D/g, "")));
    expect(Number(os.codigo.replace(/\D/g, ""))).toBe(Math.max(...codigos) + 1);
  });
});

describe("migração v4 dos anúncios", () => {
  it("quem não tinha anúncio recebe os de exemplo; quem tinha mantém os seus", () => {
    const migrate = useProprietario.persist.getOptions().migrate!;
    const vazio = migrate({ anuncios: {}, pagamentos: [], contratos: [] }, 3) as ReturnType<
      typeof useProprietario.getState
    >;
    expect(Object.keys(vazio.anuncios)).toEqual(["c2", "c5"]);
    const proprio = {
      c3: { publicado: true, periodicidade: "diaria", valor: 1, caucao: 1, requisitos: "" },
    };
    const comAnuncio = migrate(
      { anuncios: proprio, pagamentos: [], contratos: [] },
      3,
    ) as ReturnType<typeof useProprietario.getState>;
    expect(Object.keys(comAnuncio.anuncios)).toEqual(["c3"]);
  });
});
