import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Corrida, ProfileKey } from "./mock-data";

// Pedido de corrida feito pelo passageiro no app. Neste protótipo os perfis dividem o mesmo navegador,
// então o pedido aparece na lista do motorista e cada etapa dele volta para o passageiro.
export type StatusPedido = "buscando" | "a_caminho" | "em_viagem" | "finalizada" | "cancelada";
export type PedidoCorrida = Corrida & {
  status: StatusPedido;
  criadoEm: number;
  motoristaNome?: string;
  vistoPeloPassageiro?: boolean;
};

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
  // osId liga o pedido à ordem de serviço criada no Centro de Serviços.
  orcamentosEnviados: { id: string; servico: string; data: string; osId?: string }[];
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

  // Só fica online com o check-in do dia aprovado; devolve false quando falta o check-in.
  ficarOnline: () => boolean;
  ficarOffline: () => void;
  encerrarDia: () => void;
  reabrirDia: () => void;

  enviarOrcamento: (servico: string, osId?: string) => void;

  // passageiro
  pedidos: PedidoCorrida[];
  pedirCorrida: (dados: { origem: string; destino: string; passageiro: string }) => string;
  cancelarPedido: (id: string) => void;
  dispensarPedido: (id: string) => void;
  iniciarViagem: (id: string) => void;
};

// Data local (AAAA-MM-DD). toISOString() usa UTC e, à noite no Brasil, já devolve o dia seguinte.
function hoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Estimativa simulada (sem mapa): distância de 3 a 12 km derivada do texto do destino. */
export function estimarCorrida(origem: string, destino: string) {
  let h = 0;
  for (const ch of `${origem}|${destino}`.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const distanciaKm = Math.round((3 + (h % 90) / 10) * 10) / 10;
  const tempoMin = Math.round(distanciaKm * 2.6 + 4);
  const valor = Math.round((5 + distanciaKm * 2.2) * 100) / 100;
  return { distanciaKm, tempoMin, valor };
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

      aceitarCorrida: (id) =>
        set({
          corridaAtivaId: id,
          statusOperacao: "em_corrida",
          pedidos: get().pedidos.map((p) =>
            p.id === id && p.status === "buscando"
              ? {
                  ...p,
                  status: "a_caminho",
                  motoristaNome: get().nomeUsuario || "Motorista TCHI LÉVA",
                }
              : p,
          ),
        }),
      finalizarCorrida: (id) => {
        const feitas = get().corridasFeitasHoje;
        set({
          corridaAtivaId: null,
          corridasFeitasHoje: [...feitas, id],
          statusOperacao: "online",
          pedidos: get().pedidos.map((p) => (p.id === id ? { ...p, status: "finalizada" } : p)),
        });
      },
      // Se o motorista desiste, o pedido do passageiro volta para a fila.
      cancelarCorrida: () => {
        const id = get().corridaAtivaId;
        set({
          corridaAtivaId: null,
          statusOperacao: "online",
          pedidos: get().pedidos.map((p) =>
            p.id === id && p.status !== "finalizada"
              ? { ...p, status: "buscando", motoristaNome: undefined }
              : p,
          ),
        });
      },
      iniciarViagem: (id) =>
        set({
          pedidos: get().pedidos.map((p) =>
            p.id === id && p.status === "a_caminho" ? { ...p, status: "em_viagem" } : p,
          ),
        }),

      pedidos: [],
      pedirCorrida: ({ origem, destino, passageiro }) => {
        const id = `pd${Date.now()}`;
        const est = estimarCorrida(origem, destino);
        const pedido: PedidoCorrida = {
          id,
          origem,
          destino,
          ...est,
          passageiro,
          passageiroRating: 5,
          formaPagamento: "Pix",
          status: "buscando",
          criadoEm: Date.now(),
        };
        // Um pedido em aberto por vez: o novo substitui o anterior que ainda estava buscando.
        set({ pedidos: [pedido, ...get().pedidos.filter((p) => p.status !== "buscando")] });
        return id;
      },
      cancelarPedido: (id) =>
        set({
          pedidos: get().pedidos.map((p) =>
            p.id === id && p.status === "buscando" ? { ...p, status: "cancelada" } : p,
          ),
        }),
      dispensarPedido: (id) =>
        set({
          pedidos: get().pedidos.map((p) =>
            p.id === id ? { ...p, vistoPeloPassageiro: true } : p,
          ),
        }),

      ficarOnline: () => {
        if (!checkinValido(get().checkin)) return false;
        set({ statusOperacao: "online", onlineDesde: Date.now() });
        return true;
      },
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

      enviarOrcamento: (servico, osId) => {
        const enviados = get().orcamentosEnviados;
        set({
          orcamentosEnviados: [
            { id: `or${Date.now()}`, servico, data: "Agora", osId },
            ...enviados,
          ],
        });
      },
    }),
    { name: "conect-state" },
  ),
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

/** Corridas que o motorista vê: pedidos de passageiros do app primeiro, depois as de exemplo. */
export function corridasParaMotorista(
  pedidos: PedidoCorrida[],
  exemplos: Corrida[],
  feitas: string[],
): Corrida[] {
  const doApp = pedidos.filter((p) => p.status === "buscando");
  return [...doApp, ...exemplos.filter((c) => !feitas.includes(c.id))];
}
