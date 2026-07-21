import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  contratosMock,
  pagamentosMock,
  notificacoesMock,
  eventosMock,
  type Contrato,
  type Pagamento,
  type Notificacao,
  type EventoVeiculo,
} from "./mock-proprietario";

type State = {
  contratos: Contrato[];
  pagamentos: Pagamento[];
  notificacoes: Notificacao[];
  notificacoesLidas: string[];
  eventosExtras: EventoVeiculo[];

  registrarPagamento: (id: string) => void;
  encerrarContrato: (id: string) => void;
  suspenderContrato: (id: string) => void;
  criarContrato: (c: Omit<Contrato, "id" | "status">) => string;
  marcarLida: (id: string) => void;
  marcarTodasLidas: () => void;
  addEvento: (e: Omit<EventoVeiculo, "id">) => void;
};

export const useProprietario = create<State>()(
  persist(
    (set, get) => ({
      contratos: contratosMock,
      pagamentos: pagamentosMock,
      notificacoes: notificacoesMock,
      notificacoesLidas: [],
      eventosExtras: [],

      registrarPagamento: (id) =>
        set({
          pagamentos: get().pagamentos.map((p) =>
            p.id === id ? { ...p, status: "pago" } : p
          ),
        }),
      encerrarContrato: (id) =>
        set({
          contratos: get().contratos.map((c) =>
            c.id === id ? { ...c, status: "encerrado", fim: new Date().toISOString().slice(0, 10) } : c
          ),
        }),
      suspenderContrato: (id) =>
        set({
          contratos: get().contratos.map((c) =>
            c.id === id ? { ...c, status: "suspenso" } : c
          ),
        }),
      criarContrato: (c) => {
        const id = `ct${Date.now()}`;
        set({ contratos: [{ ...c, id, status: "ativo" }, ...get().contratos] });
        return id;
      },
      marcarLida: (id) => {
        const lidas = get().notificacoesLidas;
        if (!lidas.includes(id)) set({ notificacoesLidas: [...lidas, id] });
      },
      marcarTodasLidas: () => set({ notificacoesLidas: get().notificacoes.map((n) => n.id) }),
      addEvento: (e) => {
        const id = `ex${Date.now()}`;
        set({ eventosExtras: [{ ...e, id }, ...get().eventosExtras] });
      },
    }),
    { name: "proprietario-state" }
  )
);

export function todosEventosDoCarro(carroId: string, extras: EventoVeiculo[]): EventoVeiculo[] {
  const base = eventosMock.filter((e) => e.carroId === carroId);
  const ex = extras.filter((e) => e.carroId === carroId);
  return [...ex, ...base].sort((a, b) => (a.data < b.data ? 1 : -1));
}
