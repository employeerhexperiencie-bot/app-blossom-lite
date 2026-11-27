// Requisitos do anúncio de aluguel ligados ao Clube TCHI LÉVA: nível mínimo e nota mínima do motorista.
import { NIVEIS } from "./niveis";
import type { AnuncioLocacao, MotoristaCandidato } from "./mock-proprietario";

export const nomesNiveis = NIVEIS.map((n) => n.nome);

function posicaoNivel(nome?: string): number {
  return nome ? NIVEIS.findIndex((n) => n.nome === nome) : -1;
}

/** Diz se o motorista atende aos requisitos do anúncio e, se não, por quê. */
export function atendeRequisitos(
  anuncio: Pick<AnuncioLocacao, "nivelMinimo" | "notaMinima">,
  motorista: Pick<MotoristaCandidato, "nivel" | "avaliacao">,
): { ok: boolean; motivos: string[] } {
  const motivos: string[] = [];
  if (anuncio.nivelMinimo && posicaoNivel(motorista.nivel) < posicaoNivel(anuncio.nivelMinimo)) {
    motivos.push(
      `Exige nível ${anuncio.nivelMinimo} no Clube (você é ${motorista.nivel ?? "sem nível"})`,
    );
  }
  if (anuncio.notaMinima && motorista.avaliacao < anuncio.notaMinima) {
    motivos.push(
      `Exige nota ${anuncio.notaMinima.toFixed(1)} ou mais (a sua é ${motorista.avaliacao.toFixed(2)})`,
    );
  }
  return { ok: motivos.length === 0, motivos };
}

export function descreverRequisitos(
  anuncio: Pick<AnuncioLocacao, "nivelMinimo" | "notaMinima">,
): string {
  const partes: string[] = [];
  if (anuncio.nivelMinimo) partes.push(`nível ${anuncio.nivelMinimo}+`);
  if (anuncio.notaMinima) partes.push(`nota ${anuncio.notaMinima.toFixed(1)}+`);
  return partes.length ? partes.join(" · ") : "Aberto a todos os níveis";
}
