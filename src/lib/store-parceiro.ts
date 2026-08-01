import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  catalogoParceiroMock,
  movimentosMock,
  pedidosMock,
  campanhasParceiroMock,
  negocioDefault,
  totalPedido,
  type Campanha,
  type ItemCatalogo,
  type MovimentoEstoque,
  type Negocio,
  type Pedido,
  type StatusPedido,
} from "./mock-parceiro";
import { comissaoPedido } from "./monetizacao";

const fluxo: StatusPedido[] = ["novo", "aceito", "em_preparo", "pronto", "entregue"];

type State = {
  negocio: Negocio;
  catalogo: ItemCatalogo[];
  movimentos: MovimentoEstoque[];
  pedidos: Pedido[];
  campanhas: Campanha[];

  salvarNegocio: (n: Partial<Negocio>) => void;
  addItem: (i: Omit<ItemCatalogo, "id" | "visualizacoes" | "leads">) => string;
  editarItem: (id: string, i: Partial<ItemCatalogo>) => void;
  alternarItem: (id: string) => void;
  removerItem: (id: string) => void;
  entradaEstoque: (itemId: string, qtd: number, motivo: string) => void;
  saidaEstoque: (itemId: string, qtd: number, motivo: string) => void;
  avancarPedido: (id: string) => void;
  recusarPedido: (id: string) => void;
  criarCampanha: (c: Omit<Campanha, "id" | "ativa">) => void;
  alternarCampanha: (id: string) => void;
  assinarPremium: () => void;
  cancelarPremium: () => void;
};

export const useParceiro = create<State>()(
  persist(
    (set, get) => ({
      negocio: negocioDefault,
      catalogo: catalogoParceiroMock,
      movimentos: movimentosMock,
      pedidos: pedidosMock,
      campanhas: campanhasParceiroMock,

      salvarNegocio: (n) => set({ negocio: { ...get().negocio, ...n } }),

      addItem: (i) => {
        const id = `it${Date.now()}`;
        set({ catalogo: [{ ...i, id, visualizacoes: 0, leads: 0 }, ...get().catalogo] });
        return id;
      },
      editarItem: (id, i) =>
        set({ catalogo: get().catalogo.map((x) => (x.id === id ? { ...x, ...i } : x)) }),
      alternarItem: (id) =>
        set({ catalogo: get().catalogo.map((x) => (x.id === id ? { ...x, ativo: !x.ativo } : x)) }),
      removerItem: (id) => set({ catalogo: get().catalogo.filter((x) => x.id !== id) }),

      entradaEstoque: (itemId, qtd, motivo) =>
        set({
          catalogo: get().catalogo.map((x) =>
            x.id === itemId ? { ...x, quantidade: (x.quantidade ?? 0) + qtd } : x
          ),
          movimentos: [
            { id: `mv${Date.now()}`, itemId, tipo: "entrada", quantidade: qtd, motivo, data: hoje() },
            ...get().movimentos,
          ],
        }),
      saidaEstoque: (itemId, qtd, motivo) =>
        set({
          catalogo: get().catalogo.map((x) =>
            x.id === itemId ? { ...x, quantidade: Math.max(0, (x.quantidade ?? 0) - qtd) } : x
          ),
          movimentos: [
            { id: `mv${Date.now()}`, itemId, tipo: "saida", quantidade: qtd, motivo, data: hoje() },
            ...get().movimentos,
          ],
        }),

      avancarPedido: (id) =>
        set({
          pedidos: get().pedidos.map((p) => {
            if (p.id !== id) return p;
            const idx = fluxo.indexOf(p.status);
            if (idx < 0 || idx === fluxo.length - 1) return p;
            return { ...p, status: fluxo[idx + 1]! };
          }),
        }),
      recusarPedido: (id) =>
        set({ pedidos: get().pedidos.map((p) => (p.id === id ? { ...p, status: "recusado" } : p)) }),

      criarCampanha: (c) => set({ campanhas: [{ ...c, id: `cp${Date.now()}`, ativa: true }, ...get().campanhas] }),
      alternarCampanha: (id) =>
        set({ campanhas: get().campanhas.map((c) => (c.id === id ? { ...c, ativa: !c.ativa } : c)) }),

      assinarPremium: () => set({ negocio: { ...get().negocio, plano: "premium" } }),
      cancelarPremium: () => set({ negocio: { ...get().negocio, plano: "gratuito" } }),
    }),
    { name: "parceiro-state" }
  )
);

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

// -------- Selectors --------

export function useItem(id: string | undefined): ItemCatalogo | undefined {
  return useParceiro((s) => s.catalogo.find((i) => i.id === id));
}

export function usePedido(id: string | undefined): Pedido | undefined {
  return useParceiro((s) => s.pedidos.find((p) => p.id === id));
}

export function useEstoqueBaixo(): ItemCatalogo[] {
  return useParceiro((s) =>
    s.catalogo.filter((i) => i.tipo === "produto" && (i.quantidade ?? 0) <= (i.estoqueMinimo ?? 0))
  );
}

export function useResumoNegocio() {
  const pedidos = useParceiro((s) => s.pedidos);
  const catalogo = useParceiro((s) => s.catalogo);
  const hojeStr = pedidos[0]?.data ?? hoje();

  const doDia = pedidos.filter((p) => p.data === hojeStr && p.status !== "recusado");
  const vendido = doDia.reduce((a, p) => a + totalPedido(p), 0);
  const comissao = doDia.reduce((a, p) => a + comissaoPedido(p).comissao, 0);
  const novos = pedidos.filter((p) => p.status === "novo");
  const abertos = pedidos.filter((p) => !["entregue", "recusado"].includes(p.status));
  const acabando = catalogo.filter(
    (i) => i.tipo === "produto" && (i.quantidade ?? 0) <= (i.estoqueMinimo ?? 0)
  );
  const clientesNovos = new Set(doDia.map((p) => p.clienteNome)).size;

  return { doDia, vendido, comissao, novos, abertos, acabando, clientesNovos };
}
