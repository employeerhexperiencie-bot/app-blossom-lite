import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ordensMock,
  campanhasMock,
  perfilOficinaDefault,
  totalOS,
  type OrdemServico,
  type ItemServico,
  type Peca,
  type AtualizacaoOS,
  type ChecklistEntrada,
  type ConclusaoOS,
  type CampanhaOficina,
  type PerfilOficina,
  type StatusOS,
} from "./mock-oficina";
import { useProprietario } from "./store-proprietario";
import type { ItemManutencao } from "./mock-proprietario";

type State = {
  ordens: OrdemServico[];
  campanhas: CampanhaOficina[];
  perfil: PerfilOficina;

  aceitarSolicitacao: (id: string) => void;
  recusarSolicitacao: (id: string) => void;
  agendar: (id: string, data: string, hora: string) => void;
  iniciarAtendimento: (id: string) => void;
  salvarChecklist: (id: string, c: ChecklistEntrada) => void;
  addServico: (id: string, s: Omit<ItemServico, "id">) => void;
  removerServico: (id: string, servicoId: string) => void;
  addPeca: (id: string, p: Omit<Peca, "id">) => void;
  removerPeca: (id: string, pecaId: string) => void;
  enviarAtualizacao: (id: string, a: Omit<AtualizacaoOS, "id" | "data">) => void;
  concluirOS: (id: string, c: Omit<ConclusaoOS, "data">) => void;
  criarCampanha: (c: Omit<CampanhaOficina, "id" | "ativa">) => void;
  alternarCampanha: (id: string) => void;
  salvarPerfil: (p: Partial<PerfilOficina>) => void;
};

function patch(list: OrdemServico[], id: string, fn: (os: OrdemServico) => OrdemServico) {
  return list.map((o) => (o.id === id ? fn(o) : o));
}

const itemManutencaoPorCategoria: Partial<Record<OrdemServico["categoria"], ItemManutencao["item"]>> = {
  oleo: "Óleo",
  pneus: "Pneus",
  mecanica: "Freios",
};

export const useOficina = create<State>()(
  persist(
    (set, get) => ({
      ordens: ordensMock,
      campanhas: campanhasMock,
      perfil: perfilOficinaDefault,

      aceitarSolicitacao: (id) =>
        set({ ordens: patch(get().ordens, id, (o) => ({ ...o, status: "aceito" as StatusOS })) }),
      recusarSolicitacao: (id) =>
        set({ ordens: patch(get().ordens, id, (o) => ({ ...o, status: "recusado" as StatusOS })) }),
      agendar: (id, data, hora) =>
        set({ ordens: patch(get().ordens, id, (o) => ({ ...o, status: "agendado", dataAgendada: data, hora })) }),
      iniciarAtendimento: (id) =>
        set({ ordens: patch(get().ordens, id, (o) => ({ ...o, status: "em_atendimento" })) }),
      salvarChecklist: (id, c) =>
        set({ ordens: patch(get().ordens, id, (o) => ({ ...o, checklist: c, km: c.km })) }),
      addServico: (id, s) =>
        set({
          ordens: patch(get().ordens, id, (o) => ({
            ...o,
            servicos: [...o.servicos, { ...s, id: `is${Date.now()}` }],
          })),
        }),
      removerServico: (id, servicoId) =>
        set({ ordens: patch(get().ordens, id, (o) => ({ ...o, servicos: o.servicos.filter((s) => s.id !== servicoId) })) }),
      addPeca: (id, p) =>
        set({
          ordens: patch(get().ordens, id, (o) => ({ ...o, pecas: [...o.pecas, { ...p, id: `pc${Date.now()}` }] })),
        }),
      removerPeca: (id, pecaId) =>
        set({ ordens: patch(get().ordens, id, (o) => ({ ...o, pecas: o.pecas.filter((p) => p.id !== pecaId) })) }),
      enviarAtualizacao: (id, a) =>
        set({
          ordens: patch(get().ordens, id, (o) => ({
            ...o,
            atualizacoes: [
              { ...a, id: `at${Date.now()}`, data: new Date().toISOString().slice(0, 10) },
              ...o.atualizacoes,
            ],
          })),
        }),

      concluirOS: (id, c) => {
        const os = get().ordens.find((o) => o.id === id);
        const data = new Date().toISOString().slice(0, 10);
        set({
          ordens: patch(get().ordens, id, (o) => ({
            ...o,
            status: "concluido",
            conclusao: { ...c, data },
          })),
        });
        if (!os) return;

        // Ponte com o módulo Proprietário: histórico, custo e notificações
        const prop = useProprietario.getState();
        const nomesServicos = os.servicos.map((s) => s.nome).join(", ") || os.descricao;

        if (os.carroId) {
          const itemMap = itemManutencaoPorCategoria[os.categoria];
          if (itemMap) {
            prop.registrarManutencao({
              carroId: os.carroId,
              item: itemMap,
              km: os.checklist?.km ?? os.km ?? 0,
              data,
              valor: c.valorTotal,
              observacoes: `${nomesServicos} — ${get().perfil.nome}`,
            });
          } else {
            prop.registrarCustoAvulso({
              carroId: os.carroId,
              descricao: `${nomesServicos} — ${get().perfil.nome}`,
              categoria: "outro",
              valor: c.valorTotal,
              data,
            });
          }
          prop.addNotificacao({
            tipo: "manutencao",
            titulo: `Serviço concluído — ${os.veiculo.split(" ").slice(0, 2).join(" ")}`,
            descricao: `${nomesServicos} concluído em ${get().perfil.nome}. Garantia de ${c.garantiaMeses} meses.`,
            data: "Agora",
            urgencia: "media",
            carroId: os.carroId,
          });
        }
      },

      criarCampanha: (c) =>
        set({ campanhas: [{ ...c, id: `cp${Date.now()}`, ativa: true }, ...get().campanhas] }),
      alternarCampanha: (id) =>
        set({ campanhas: get().campanhas.map((c) => (c.id === id ? { ...c, ativa: !c.ativa } : c)) }),
      salvarPerfil: (p) => set({ perfil: { ...get().perfil, ...p } }),
    }),
    { name: "oficina-state" }
  )
);

// -------- Selectors --------

export function useOrdem(id: string | undefined): OrdemServico | undefined {
  return useOficina((s) => s.ordens.find((o) => o.id === id));
}

export function useResumoHoje() {
  const ordens = useOficina((s) => s.ordens);
  const hoje = new Date().toISOString().slice(0, 10);
  const doDia = ordens.filter((o) => o.dataAgendada === hoje && o.status !== "recusado" && o.status !== "cancelado");
  const agendados = doDia.filter((o) => o.status === "agendado" || o.status === "aceito");
  const emAndamento = ordens.filter((o) => o.status === "em_atendimento");
  const aguardando = ordens.filter((o) => o.status === "aguardando_aprovacao");
  const novas = ordens.filter((o) => o.status === "solicitado");
  const previsao = doDia.reduce((a, o) => a + (totalOS(o) || o.valorEstimado || 0), 0);
  const proximo = [...agendados].sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? ""))[0];
  return { doDia, agendados, emAndamento, aguardando, novas, previsao, proximo };
}
