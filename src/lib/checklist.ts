import type { Checklist, ChecklistItem } from "./mock-proprietario";

export const combustivelLabel: Record<ChecklistItem["combustivel"], string> = {
  vazio: "Reserva",
  "1/4": "1/4",
  "1/2": "1/2",
  "3/4": "3/4",
  cheio: "Cheio",
};

// Diferenças entre a entrega e a devolução, para basear o acerto da caução.
export function compararChecklists(entrada?: Checklist, devolucao?: Checklist) {
  if (!entrada || !devolucao) return null;
  const ordem: ChecklistItem["combustivel"][] = ["vazio", "1/4", "1/2", "3/4", "cheio"];
  const a = entrada.itens;
  const b = devolucao.itens;
  return {
    kmRodados: Math.max(0, b.km - a.km),
    combustivelMenor: ordem.indexOf(b.combustivel) < ordem.indexOf(a.combustivel),
    pneusPiores: a.pneus === "ok" && b.pneus !== "ok",
    novasAvarias: b.avarias && b.avarias !== a.avarias ? b.avarias : "",
  };
}
