import { describe, it, expect } from "vitest";
import { isValidPixPayload } from "@brazilian-utils/brazilian-utils";
import { gerarPixCopiaECola } from "./pix";

describe("gerarPixCopiaECola", () => {
  it("gera um código válido com o valor da cobrança", () => {
    const codigo = gerarPixCopiaECola({
      chave: "+5511987654321",
      nome: "Carlos Mendes",
      cidade: "São Paulo",
      valor: 110,
      identificador: "pg-ct1-2026-11-26",
    });
    expect(codigo).not.toBeNull();
    expect(isValidPixPayload(codigo!)).toBe(true);
    expect(codigo).toContain("110.00");
  });

  it("limpa acentos, nomes longos e símbolos do identificador", () => {
    const codigo = gerarPixCopiaECola({
      chave: "carlos@email.com",
      nome: "João Ávila da Silva Pereira Santos",
      cidade: "São José dos Campos",
      valor: 95.5,
      identificador: "pg-ct2-2026-06-25",
    });
    expect(codigo).not.toBeNull();
    expect(codigo).toContain("Joao Avila");
  });

  it("devolve nulo para chave Pix inválida", () => {
    expect(
      gerarPixCopiaECola({
        chave: "nao é chave",
        nome: "A",
        cidade: "B",
        valor: 10,
        identificador: "x",
      }),
    ).toBeNull();
  });
});
