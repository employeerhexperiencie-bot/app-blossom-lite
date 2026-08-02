import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProfileKey } from "./mock-data";

export type CheckinStatus = {
  data: string; // YYYY-MM-DD
  selfie: boolean;
  fotoFrontal: boolean;
  fotoTraseira: boolean;
  fotoInterna: boolean;
  iaStatus: "pendente" | "analisando" | "aprovado" | "reprovado";
};

export type StatusOperacao = "offline" | "online" | "em_corrida" | "fim_do_dia";

type ConectState = {
  perfilAtivo: ProfileKey | null;
  nomeUsuario: string;
  // motorista
  checkin: CheckinStatus | null;
  corridaAtivaId: string | null;
  corridasFeitasHoje: string[];
  orcamentosEnviados: { id: string; servico: string; data: string }[];
  statusOperacao: StatusOperacao;
  onlineDesde: number | null;
  minutosOnlineHoje: number;

  setPerfil: (p: ProfileKey) => void;
  setNome: (n: string) => void;
  logout: () => void;

  iniciarCheckin: () => void;
  marcarFoto: (campo: keyof Omit<CheckinStatus, "data" | "iaStatus">) => void;
  finalizarCheckin: () => void;
  resetCheckin: () => void;

  aceitarCorrida: (id: string) => void;
  finalizarCorrida: (id: string) => void;
  cancelarCorrida: () => void;

  ficarOnline: () => void;
  ficarOffline: () => void;
  encerrarDia: () => void;
  reabrirDia: () => void;

  enviarOrcamento: (servico: string) => void;
};

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

function checkinVazio(): CheckinStatus {
  return {
    data: hoje(),
    selfie: false,
    fotoFrontal: false,
    fotoTraseira: false,
    fotoInterna: false,
    iaStatus: "pendente",
  };
}

export const useConect = create<ConectState>()(
  persist(
    (set, get) => ({
      perfilAtivo: null,
      nomeUsuario: "",
      checkin: null,
      corridaAtivaId: null,
      corridasFeitasHoje: [],
      orcamentosEnviados: [],
      statusOperacao: "offline",
      onlineDesde: null,
      minutosOnlineHoje: 0,

      setPerfil: (p) => set({ perfilAtivo: p }),
      setNome: (n) => set({ nomeUsuario: n }),
      logout: () => set({ perfilAtivo: null, nomeUsuario: "" }),

      iniciarCheckin: () => {
        const c = get().checkin;
        if (!c || c.data !== hoje()) set({ checkin: checkinVazio() });
      },
      marcarFoto: (campo) => {
        const c = get().checkin ?? checkinVazio();
        set({ checkin: { ...c, [campo]: true } });
      },
      finalizarCheckin: () => {
        const c = get().checkin ?? checkinVazio();
        set({ checkin: { ...c, iaStatus: "analisando" } });
        setTimeout(() => {
          const cur = get().checkin;
          if (cur) set({ checkin: { ...cur, iaStatus: "aprovado" } });
        }, 1500);
      },
      resetCheckin: () => set({ checkin: null }),

      aceitarCorrida: (id) => set({ corridaAtivaId: id, statusOperacao: "em_corrida" }),
      finalizarCorrida: (id) => {
        const feitas = get().corridasFeitasHoje;
        set({ corridaAtivaId: null, corridasFeitasHoje: [...feitas, id], statusOperacao: "online" });
      },
      cancelarCorrida: () => set({ corridaAtivaId: null, statusOperacao: "online" }),

      ficarOnline: () => set({ statusOperacao: "online", onlineDesde: Date.now() }),
      ficarOffline: () => {
        const desde = get().onlineDesde;
        const extra = desde ? Math.round((Date.now() - desde) / 60000) : 0;
        set({
          statusOperacao: "offline",
          onlineDesde: null,
          minutosOnlineHoje: get().minutosOnlineHoje + extra,
        });
      },
      encerrarDia: () => set({ statusOperacao: "fim_do_dia", onlineDesde: null }),
      reabrirDia: () => set({ statusOperacao: "offline" }),


      enviarOrcamento: (servico) => {
        const enviados = get().orcamentosEnviados;
        set({
          orcamentosEnviados: [
            { id: `or${Date.now()}`, servico, data: "Agora" },
            ...enviados,
          ],
        });
      },
    }),
    { name: "conect-state" }
  )
);

export function checkinValido(c: CheckinStatus | null): boolean {
  if (!c) return false;
  if (c.data !== hoje()) return false;
  return c.iaStatus === "aprovado";
}

export function checkinCompleto(c: CheckinStatus | null): boolean {
  if (!c) return false;
  return c.selfie && c.fotoFrontal && c.fotoTraseira && c.fotoInterna;
}
