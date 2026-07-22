import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  contratosMock,
  pagamentosMock,
  notificacoesMock,
  eventosMock,
  manutencaoMock,
  lembretesDefault,
  motoristasCandidatos,
  financeiroPorVeiculo as financeiroBase,
  type Contrato,
  type Pagamento,
  type Notificacao,
  type EventoVeiculo,
  type AnuncioLocacao,
  type ConfigLembretes,
  type ItemManutencao,
  type SolicitacaoLocacao,
  type Lembrete,
  type CustoCategoria,
} from "./mock-proprietario";
import type { Carro } from "./mock-data";
import { carros as carrosBase } from "./mock-data";

type State = {
  contratos: Contrato[];
  pagamentos: Pagamento[];
  notificacoes: Notificacao[];
  notificacoesLidas: string[];
  eventosExtras: EventoVeiculo[];
  manutencaoExtras: ItemManutencao[];
  manutencaoOverrides: Record<string, Partial<ItemManutencao>>;
  carrosOverrides: Record<string, Partial<Carro>>;
  carrosNovos: Carro[];
  anuncios: Record<string, AnuncioLocacao>;
  lembretes: Record<string, ConfigLembretes>;
  solicitacoes: SolicitacaoLocacao[];
  lembretesVeiculo: Lembrete[];

  registrarPagamento: (id: string) => void;
  registrarPagamentoDetalhado: (contratoId: string, dados: { valor: number; data: string; forma: Pagamento["forma"] }) => void;
  encerrarContrato: (id: string) => void;
  suspenderContrato: (id: string) => void;
  criarContrato: (c: Omit<Contrato, "id" | "status">) => string;
  marcarLida: (id: string) => void;
  marcarTodasLidas: () => void;
  addEvento: (e: Omit<EventoVeiculo, "id">) => void;
  addNotificacao: (n: Omit<Notificacao, "id">) => string;

  publicarVeiculo: (carroId: string, anuncio: AnuncioLocacao) => void;
  despublicarVeiculo: (carroId: string) => void;
  atualizarKm: (carroId: string, km: number, origem?: "manual" | "foto") => void;
  registrarManutencao: (dados: {
    carroId: string;
    item: ItemManutencao["item"];
    km: number;
    data: string;
    valor: number;
    observacoes?: string;
  }) => void;
  registrarCustoAvulso: (dados: {
    carroId: string;
    descricao: string;
    categoria: CustoCategoria;
    valor: number;
    data: string;
  }) => void;
  registrarObservacao: (dados: { carroId: string; texto: string; data: string }) => void;
  salvarLembretes: (contratoId: string, cfg: ConfigLembretes) => void;
  criarVeiculo: (c: Omit<Carro, "id">) => string;

  criarLembrete: (l: Omit<Lembrete, "id" | "feito" | "criadoEm">) => string;
  concluirLembrete: (id: string) => void;
  removerLembrete: (id: string) => void;

  criarSolicitacaoMock: (carroId: string) => string;
  aceitarSolicitacao: (id: string, valor: number, periodicidade: Contrato["periodicidade"]) => string | undefined;
  recusarSolicitacao: (id: string) => void;
};


export const useProprietario = create<State>()(
  persist(
    (set, get) => ({
      contratos: contratosMock,
      pagamentos: pagamentosMock,
      notificacoes: notificacoesMock,
      notificacoesLidas: [],
      eventosExtras: [],
      manutencaoExtras: [],
      manutencaoOverrides: {},
      carrosOverrides: {},
      carrosNovos: [],
      anuncios: {},
      lembretes: {},
      solicitacoes: [],
      lembretesVeiculo: [],


      registrarPagamento: (id) =>
        set({
          pagamentos: get().pagamentos.map((p) =>
            p.id === id ? { ...p, status: "pago" } : p
          ),
        }),
      registrarPagamentoDetalhado: (contratoId, dados) => {
        const id = `pg${Date.now()}`;
        set({
          pagamentos: [
            { id, contratoId, valor: dados.valor, data: dados.data, forma: dados.forma, status: "pago" },
            ...get().pagamentos,
          ],
        });
      },
      encerrarContrato: (id) => {
        const contrato = get().contratos.find((c) => c.id === id);
        set({
          contratos: get().contratos.map((c) =>
            c.id === id ? { ...c, status: "encerrado", fim: new Date().toISOString().slice(0, 10) } : c
          ),
        });
        if (contrato) {
          set({
            carrosOverrides: {
              ...get().carrosOverrides,
              [contrato.carroId]: {
                ...get().carrosOverrides[contrato.carroId],
                status: "disponivel",
                motoristaAtual: undefined,
              },
            },
          });
        }
      },
      suspenderContrato: (id) =>
        set({
          contratos: get().contratos.map((c) =>
            c.id === id ? { ...c, status: "suspenso" } : c
          ),
        }),
      criarContrato: (c) => {
        const id = `ct${Date.now()}`;
        set({ contratos: [{ ...c, id, status: "ativo" }, ...get().contratos] });
        set({
          carrosOverrides: {
            ...get().carrosOverrides,
            [c.carroId]: {
              ...get().carrosOverrides[c.carroId],
              status: "alugado",
              motoristaAtual: c.motoristaNome,
            },
          },
        });
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
      addNotificacao: (n) => {
        const id = `nx${Date.now()}`;
        set({ notificacoes: [{ ...n, id }, ...get().notificacoes] });
        return id;
      },

      publicarVeiculo: (carroId, anuncio) =>
        set({
          anuncios: {
            ...get().anuncios,
            [carroId]: { ...anuncio, publicado: true, publicadoEm: new Date().toISOString().slice(0, 10) },
          },
        }),
      despublicarVeiculo: (carroId) => {
        const atual = get().anuncios[carroId];
        if (!atual) return;
        set({ anuncios: { ...get().anuncios, [carroId]: { ...atual, publicado: false } } });
      },
      atualizarKm: (carroId, km, origem = "manual") => {
        set({
          carrosOverrides: {
            ...get().carrosOverrides,
            [carroId]: { ...get().carrosOverrides[carroId], km },
          },
        });
        // recalc próximas manutenções
        const overrides = { ...get().manutencaoOverrides };
        [...manutencaoMock, ...get().manutencaoExtras]
          .filter((m) => m.carroId === carroId && m.intervaloKm)
          .forEach((m) => {
            const proximo = m.ultimoKm + (m.intervaloKm ?? 0);
            overrides[m.id] = { ...overrides[m.id], proximoKm: proximo };
          });
        set({ manutencaoOverrides: overrides });
        get().addEvento({
          carroId,
          tipo: "km",
          titulo: origem === "foto" ? "KM atualizado via foto do painel" : "KM atualizado manualmente",
          data: new Date().toISOString().slice(0, 10),
          km,
          origemKm: origem,
        });
      },
      registrarManutencao: ({ carroId, item, km, data, valor, observacoes }) => {
        const tipoEvento =
          item === "Óleo" || item === "Filtro de óleo" ? "troca-oleo" :
          item === "Pneus" ? "troca-pneu" : "revisao";
        get().addEvento({
          carroId, tipo: tipoEvento, titulo: `${item}${observacoes ? " — " + observacoes : ""}`,
          data, km, valor,
        });
        // atualizar item
        const existente = [...manutencaoMock, ...get().manutencaoExtras].find((m) => m.carroId === carroId && m.item === item);
        if (existente) {
          const proximoKm = existente.intervaloKm ? km + existente.intervaloKm : existente.proximoKm;
          set({
            manutencaoOverrides: {
              ...get().manutencaoOverrides,
              [existente.id]: {
                ...get().manutencaoOverrides[existente.id],
                ultimoKm: km,
                ultimaData: data,
                proximoKm,
              },
            },
          });
        } else {
          const id = `mx${Date.now()}`;
          set({
            manutencaoExtras: [
              { id, carroId, item, ultimoKm: km, ultimaData: data },
              ...get().manutencaoExtras,
            ],
          });
        }
      },
      salvarLembretes: (contratoId, cfg) =>
        set({ lembretes: { ...get().lembretes, [contratoId]: cfg } }),
      criarVeiculo: (c) => {
        const id = `cx${Date.now()}`;
        set({ carrosNovos: [{ ...c, id }, ...get().carrosNovos] });
        return id;
      },

      registrarCustoAvulso: ({ carroId, descricao, categoria, valor, data }) => {
        get().addEvento({
          carroId,
          tipo: "custo",
          titulo: descricao,
          data,
          valor,
          categoria,
        });
      },
      registrarObservacao: ({ carroId, texto, data }) => {
        get().addEvento({
          carroId,
          tipo: "observacao",
          titulo: texto.slice(0, 60),
          descricao: texto.length > 60 ? texto : undefined,
          data,
        });
      },

      criarLembrete: (l) => {
        const id = `lb${Date.now()}`;
        const novo: Lembrete = { ...l, id, feito: false, criadoEm: new Date().toISOString().slice(0, 10) };
        set({ lembretesVeiculo: [novo, ...get().lembretesVeiculo] });
        return id;
      },
      concluirLembrete: (id) =>
        set({
          lembretesVeiculo: get().lembretesVeiculo.map((l) =>
            l.id === id ? { ...l, feito: true } : l
          ),
        }),
      removerLembrete: (id) =>
        set({ lembretesVeiculo: get().lembretesVeiculo.filter((l) => l.id !== id) }),



      criarSolicitacaoMock: (carroId) => {
        const id = `sl${Date.now()}`;
        const candidatos = motoristasCandidatos;
        const motorista = candidatos[Math.floor(Math.random() * candidatos.length)];
        set({
          solicitacoes: [
            { id, carroId, motoristaId: motorista.id, data: new Date().toISOString().slice(0, 10), status: "pendente", mensagem: "Tenho interesse em alugar. Podemos conversar?" },
            ...get().solicitacoes,
          ],
        });
        get().addNotificacao({
          tipo: "solicitacao",
          titulo: "Nova solicitação de locação",
          descricao: `${motorista.nome} quer alugar seu veículo`,
          data: "Agora",
          urgencia: "alta",
          carroId,
          solicitacaoId: id,
        });
        return id;
      },
      aceitarSolicitacao: (id, valor, periodicidade) => {
        const sol = get().solicitacoes.find((s) => s.id === id);
        if (!sol) return;
        const motorista = motoristasCandidatos.find((m) => m.id === sol.motoristaId);
        if (!motorista) return;
        set({
          solicitacoes: get().solicitacoes.map((s) => (s.id === id ? { ...s, status: "aceita" } : s)),
        });
        return get().criarContrato({
          carroId: sol.carroId,
          motoristaId: motorista.id,
          motoristaNome: motorista.nome,
          valor,
          periodicidade,
          caucao: 1500,
          inicio: new Date().toISOString().slice(0, 10),
          observacoes: "Contrato gerado via aceite de solicitação do marketplace.",
        });
      },
      recusarSolicitacao: (id) =>
        set({
          solicitacoes: get().solicitacoes.map((s) => (s.id === id ? { ...s, status: "recusada" } : s)),
        }),
    }),
    { name: "proprietario-state" }
  )
);

// -------- Selectors / helpers ----------

export function todosEventosDoCarro(carroId: string, extras: EventoVeiculo[]): EventoVeiculo[] {
  const base = eventosMock.filter((e) => e.carroId === carroId);
  const ex = extras.filter((e) => e.carroId === carroId);
  return [...ex, ...base].sort((a, b) => (a.data < b.data ? 1 : -1));
}

export function useFinanceiroPorVeiculo(): { carroId: string; receita: number; custos: number }[] {
  const extras = useProprietario((s) => s.eventosExtras);
  return financeiroBase.map((f) => {
    const custosExtras = extras
      .filter((e) => e.carroId === f.carroId && (e.tipo === "custo" || e.tipo === "troca-oleo" || e.tipo === "troca-pneu" || e.tipo === "revisao" || e.tipo === "multa" || e.tipo === "acidente"))
      .reduce((a, e) => a + (e.valor ?? 0), 0);
    return { ...f, custos: f.custos + custosExtras };
  });
}



export function useCarros(): Carro[] {
  const overrides = useProprietario((s) => s.carrosOverrides);
  const novos = useProprietario((s) => s.carrosNovos);
  const base = carrosBase.map((c) => ({ ...c, ...(overrides[c.id] ?? {}) }));
  return [...novos, ...base];
}

export function useCarro(id: string | undefined): Carro | undefined {
  const overrides = useProprietario((s) => s.carrosOverrides);
  const novos = useProprietario((s) => s.carrosNovos);
  if (!id) return undefined;
  const novo = novos.find((n) => n.id === id);
  if (novo) return novo;
  const base = carrosBase.find((c) => c.id === id);
  if (!base) return undefined;
  return { ...base, ...(overrides[id] ?? {}) };
}

export function useManutencaoDoCarro(carroId: string): ItemManutencao[] {
  const extras = useProprietario((s) => s.manutencaoExtras);
  const overrides = useProprietario((s) => s.manutencaoOverrides);
  return [...manutencaoMock, ...extras]
    .filter((m) => m.carroId === carroId)
    .map((m) => ({ ...m, ...(overrides[m.id] ?? {}) }));
}
