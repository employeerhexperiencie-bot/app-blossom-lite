// Perfil do motorista que está usando o app, no formato que o proprietário vê numa proposta de aluguel.
import { useConect } from "./store";
import { conquistasMock, getNivelByViagens, progressoMock } from "./niveis";
import { MOTORISTA_LOGADO_ID, type MotoristaCandidato } from "./mock-proprietario";

export function useCandidatoMotorista(): MotoristaCandidato {
  const nomeUsuario = useConect((s) => s.nomeUsuario);
  const p = progressoMock;
  const nivel = getNivelByViagens(p.viagensTotais);
  const desde = conquistasMock[0]?.data;
  return {
    id: MOTORISTA_LOGADO_ID,
    nome: nomeUsuario || "Motorista TCHI LÉVA",
    avaliacao: p.mediaEstrelas,
    tempoPlataforma: desde ? `desde ${desde.slice(3)}` : "—",
    corridas: p.viagensTotais,
    nivel: nivel.nome,
    historico: `Nível ${nivel.nome} no Clube TCHI LÉVA. ${p.viagensTotais.toLocaleString("pt-BR")} viagens, média ${p.mediaEstrelas.toFixed(2)} estrelas e ${p.elogiosMes} elogios neste mês.`,
  };
}
