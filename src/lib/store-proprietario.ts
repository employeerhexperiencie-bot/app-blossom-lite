import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import {
  contratosMock,
  pagamentosMock,
  notificacoesMock,
  eventosMock,
  manutencaoMock,
  lembretesDefault,
  motoristasCandidatos,
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
  type Checklist,
  type ChecklistItem,
  type MotoristaCandidato,
  hojeISO,
  fmtBRL,
  perfilDonoVazio,
  type PerfilDono,
} from "./mock-proprietario";
import type { Carro } from "./mock-data";
import { carros as carrosBase } from "./mock-data";
import { emAberto, financeiroDoCarro, vencimentosEntre } from "./cobrancas";

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
  checklists: Checklist[];
  perfil: PerfilDono;
  // Cobrança avulsa gerada à mão pelo dono ("Gerar cobrança Pix"), além das automáticas.
  gerarCobranca: (contratoId: string, dados: { valor: number; vencimento: string }) => string;
  marcarCobrancaEnviada: (pagamentoId: string) => void;

  registrarPagamento: (id: string) => void;
  sincronizarCobrancas: () => void;
  salvarPerfil: (perfil: PerfilDono) => void;
  registrarPagamentoDetalhado: (
    contratoId: string,
    dados: { valor: number; data: string; forma: Pagamento["forma"] },
  ) => void;
  encerrarContrato: (id: string) => void;
  suspenderContrato: (id: string) => void;
  criarContrato: (c: Omit<Contrato, "id" | "status">) => string;
  marcarLida: (id: string) => void;
  marcarTodasLidas: () => void;
  addEvento: (e: Omit<EventoVeiculo, "id">) => void;
  addNotificacao: (n: Omit<Notificacao, "id">) => string;

  publicarVeiculo: (carroId: string, anuncio: AnuncioLocacao) => void;
  despublicarVeiculo: (carroId: string) => void;
  atualizarKm: (carroId: string, km: number, origem?: "manual" | "foto" | "checklist") => void;
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

  enviarProposta: (dados: {
    carroId: string;
    candidato: MotoristaCandidato;
    valor: number;
    periodicidade: Contrato["periodicidade"];
    duracao?: string;
    mensagem?: string;
  }) => string;
  aceitarSolicitacao: (
    id: string,
    condicoes: {
      valor: number;
      periodicidade: Contrato["periodicidade"];
      caucao: number;
      observacoes?: string;
    },
  ) => string | undefined;
  recusarSolicitacao: (id: string) => void;
  motoristaAceitarContrato: (id: string) => void;
  motoristaRecusarContrato: (id: string) => void;
  salvarChecklist: (dados: {
    contratoId: string;
    tipo: Checklist["tipo"];
    itens: ChecklistItem;
  }) => string | undefined;
  finalizarContrato: (
    id: string,
    dados: { desconto: number; motivo?: string; nota: number; comentario?: string },
  ) => void;
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
      checklists: [],
      perfil: perfilDonoVazio,

      gerarCobranca: (contratoId, { valor, vencimento }) => {
        const id = `pg${Date.now()}`;
        // txid do Pix: só letras e números, até 25 caracteres
        const txid = `TL${contratoId}${Date.now().toString(36)}`
          .replace(/[^A-Za-z0-9]/g, "")
          .slice(0, 25);
        set({
          pagamentos: [
            {
              id,
              contratoId,
              valor,
              data: vencimento,
              vencimento,
              forma: "Pix",
              status: "pendente",
              txid,
            },
            ...get().pagamentos,
          ],
        });
        return id;
      },
      marcarCobrancaEnviada: (pagamentoId) =>
        set({
          pagamentos: get().pagamentos.map((p) =>
            p.id === pagamentoId ? { ...p, cobradoEm: hojeISO() } : p,
          ),
        }),

      registrarPagamento: (id) =>
        set({
          pagamentos: get().pagamentos.map((p) =>
            p.id === id ? { ...p, status: "pago", pagoEm: hojeISO() } : p,
          ),
        }),
      registrarPagamentoDetalhado: (contratoId, dados) => {
        // Quita primeiro a cobrança em aberto mais antiga do contrato; sem cobrança aberta, registra um pagamento avulso.
        const aberta = get()
          .pagamentos.filter((p) => p.contratoId === contratoId && emAberto(p))
          .sort((x, y) => ((x.vencimento ?? x.data) < (y.vencimento ?? y.data) ? -1 : 1))[0];
        if (aberta) {
          set({
            pagamentos: get().pagamentos.map((p) =>
              p.id === aberta.id
                ? {
                    ...p,
                    status: "pago",
                    pagoEm: dados.data,
                    forma: dados.forma,
                    valor: dados.valor,
                  }
                : p,
            ),
          });
          return;
        }
        const id = `pg${Date.now()}`;
        set({
          pagamentos: [
            {
              id,
              contratoId,
              valor: dados.valor,
              data: dados.data,
              pagoEm: dados.data,
              forma: dados.forma,
              status: "pago",
            },
            ...get().pagamentos,
          ],
        });
      },
      salvarPerfil: (perfil) => set({ perfil }),
      sincronizarCobrancas: () => {
        const hoje = hojeISO();
        const pagamentos = get().pagamentos;
        const novos: Pagamento[] = [];
        const viraramAtraso = new Map<string, number>();
        const existentes = new Set(
          pagamentos.filter((p) => p.vencimento).map((p) => `${p.contratoId}|${p.vencimento}`),
        );

        // 1. Cria as cobranças que venceram até hoje nos contratos ativos com cobrança automática.
        for (const c of get().contratos) {
          if (c.status !== "ativo" || !c.cobrancaDesde) continue;
          for (const venc of vencimentosEntre(c.cobrancaDesde, hoje, c.periodicidade)) {
            if (existentes.has(`${c.id}|${venc}`)) continue;
            const atrasado = venc < hoje;
            novos.push({
              id: `pg-${c.id}-${venc}`,
              contratoId: c.id,
              valor: c.valor,
              data: venc,
              vencimento: venc,
              forma: "Pix",
              status: atrasado ? "atrasado" : "pendente",
            });
            if (atrasado) viraramAtraso.set(c.id, (viraramAtraso.get(c.id) ?? 0) + 1);
          }
        }

        // 2. Cobranças pendentes que passaram do vencimento viram atrasadas.
        const atualizados = pagamentos.map((p) => {
          if (p.status === "pendente" && (p.vencimento ?? p.data) < hoje) {
            viraramAtraso.set(p.contratoId, (viraramAtraso.get(p.contratoId) ?? 0) + 1);
            return { ...p, status: "atrasado" as const };
          }
          return p;
        });

        if (novos.length === 0 && viraramAtraso.size === 0) return;
        set({ pagamentos: [...novos.reverse(), ...atualizados] });

        for (const [contratoId, qtd] of viraramAtraso) {
          const c = get().contratos.find((x) => x.id === contratoId);
          if (!c) continue;
          get().addNotificacao({
            tipo: "pagamento",
            titulo: qtd > 1 ? `${qtd} pagamentos atrasados` : "Pagamento atrasado",
            descricao: `${c.motoristaNome} — ${fmtBRL(c.valor * qtd)}`,
            data: "Agora",
            urgencia: "alta",
            carroId: c.carroId,
            contratoId,
          });
        }
      },
      encerrarContrato: (id) => {
        const contrato = get().contratos.find((c) => c.id === id);
        set({
          contratos: get().contratos.map((c) =>
            c.id === id ? { ...c, status: "encerrado", fim: hojeISO() } : c,
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
          contratos: get().contratos.map((c) => (c.id === id ? { ...c, status: "suspenso" } : c)),
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
            [carroId]: {
              ...anuncio,
              publicado: true,
              publicadoEm: hojeISO(),
            },
          },
        }),
      despublicarVeiculo: (carroId) => {
        const atual = get().anuncios[carroId];
        if (!atual) return;
        set({ anuncios: { ...get().anuncios, [carroId]: { ...atual, publicado: false } } });
      },
      atualizarKm: (carroId, km, origem = "manual") => {
        // Carros cadastrados pelo dono ficam em carrosNovos; os da base, em carrosOverrides.
        if (get().carrosNovos.some((c) => c.id === carroId)) {
          set({ carrosNovos: get().carrosNovos.map((c) => (c.id === carroId ? { ...c, km } : c)) });
        } else {
          set({
            carrosOverrides: {
              ...get().carrosOverrides,
              [carroId]: { ...get().carrosOverrides[carroId], km },
            },
          });
        }
        // recalc próximas manutenções
        const overrides = { ...get().manutencaoOverrides };
        [...manutencaoMock, ...get().manutencaoExtras]
          .filter((m) => m.carroId === carroId && m.intervaloKm)
          .forEach((m) => {
            const proximo = m.ultimoKm + (m.intervaloKm ?? 0);
            overrides[m.id] = { ...overrides[m.id], proximoKm: proximo };
          });
        set({ manutencaoOverrides: overrides });
        // O checklist já registra o km no próprio evento; não duplicamos.
        if (origem === "checklist") return;
        get().addEvento({
          carroId,
          tipo: "km",
          titulo:
            origem === "foto" ? "KM atualizado via foto do painel" : "KM atualizado manualmente",
          data: hojeISO(),
          km,
          origemKm: origem as "manual" | "foto",
        });
      },
      registrarManutencao: ({ carroId, item, km, data, valor, observacoes }) => {
        const tipoEvento =
          item === "Óleo" || item === "Filtro de óleo"
            ? "troca-oleo"
            : item === "Pneus"
              ? "troca-pneu"
              : "revisao";
        get().addEvento({
          carroId,
          tipo: tipoEvento,
          titulo: `${item}${observacoes ? " — " + observacoes : ""}`,
          data,
          km,
          valor,
        });
        // atualizar item
        const existente = [...manutencaoMock, ...get().manutencaoExtras].find(
          (m) => m.carroId === carroId && m.item === item,
        );
        if (existente) {
          const proximoKm = existente.intervaloKm
            ? km + existente.intervaloKm
            : existente.proximoKm;
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
        const novo: Lembrete = {
          ...l,
          id,
          feito: false,
          criadoEm: hojeISO(),
        };
        set({ lembretesVeiculo: [novo, ...get().lembretesVeiculo] });
        return id;
      },
      concluirLembrete: (id) =>
        set({
          lembretesVeiculo: get().lembretesVeiculo.map((l) =>
            l.id === id ? { ...l, feito: true } : l,
          ),
        }),
      removerLembrete: (id) =>
        set({ lembretesVeiculo: get().lembretesVeiculo.filter((l) => l.id !== id) }),

      enviarProposta: ({ carroId, candidato, valor, periodicidade, duracao, mensagem }) => {
        const hoje = hojeISO();
        const existente = get().solicitacoes.find(
          (s) => s.carroId === carroId && s.motoristaId === candidato.id && s.status === "pendente",
        );
        const dados = {
          candidato,
          valorProposto: valor,
          periodicidade,
          duracao,
          mensagem,
          data: hoje,
        };
        if (existente) {
          set({
            solicitacoes: get().solicitacoes.map((s) =>
              s.id === existente.id ? { ...s, ...dados } : s,
            ),
          });
          return existente.id;
        }
        const id = `sl${Date.now()}`;
        set({
          solicitacoes: [
            { id, carroId, motoristaId: candidato.id, status: "pendente", ...dados },
            ...get().solicitacoes,
          ],
        });
        get().addNotificacao({
          tipo: "solicitacao",
          titulo: "Nova proposta de aluguel",
          descricao: `${candidato.nome} quer alugar seu veículo`,
          data: "Agora",
          urgencia: "alta",
          carroId,
          solicitacaoId: id,
        });
        return id;
      },
      aceitarSolicitacao: (id, { valor, periodicidade, caucao, observacoes }) => {
        const sol = get().solicitacoes.find((s) => s.id === id);
        if (!sol || sol.status !== "pendente") return;
        const motorista =
          sol.candidato ?? motoristasCandidatos.find((m) => m.id === sol.motoristaId);
        if (!motorista) return;
        set({
          solicitacoes: get().solicitacoes.map((s) =>
            s.id === id ? { ...s, status: "aceita" } : s,
          ),
        });
        // A notificação da proposta já foi tratada.
        get()
          .notificacoes.filter((n) => n.solicitacaoId === id)
          .forEach((n) => get().marcarLida(n.id));
        // O contrato nasce aguardando o aceite do motorista; o carro só fica alugado depois do aceite.
        const contratoId = `ct${Date.now()}`;
        const contrato: Contrato = {
          id: contratoId,
          carroId: sol.carroId,
          motoristaId: motorista.id,
          motoristaNome: motorista.nome,
          valor,
          periodicidade,
          caucao,
          inicio: hojeISO(),
          status: "aguardando_aceite",
          observacoes,
          solicitacaoId: id,
        };
        set({ contratos: [contrato, ...get().contratos] });
        return contratoId;
      },
      recusarSolicitacao: (id) => {
        set({
          solicitacoes: get().solicitacoes.map((s) =>
            s.id === id ? { ...s, status: "recusada" } : s,
          ),
        });
        // A notificação da proposta já foi tratada.
        get()
          .notificacoes.filter((n) => n.solicitacaoId === id)
          .forEach((n) => get().marcarLida(n.id));
      },
      motoristaAceitarContrato: (id) => {
        const contrato = get().contratos.find((c) => c.id === id);
        if (!contrato || contrato.status !== "aguardando_aceite") return;
        const hoje = hojeISO();
        set({
          contratos: get().contratos.map((c) =>
            c.id === id ? { ...c, status: "ativo", inicio: hoje, cobrancaDesde: hoje } : c,
          ),
          carrosOverrides: {
            ...get().carrosOverrides,
            [contrato.carroId]: {
              ...get().carrosOverrides[contrato.carroId],
              status: "alugado",
              motoristaAtual: contrato.motoristaNome,
            },
          },
        });
        // O carro foi alugado: o anúncio sai do ar.
        get().despublicarVeiculo(contrato.carroId);
        get().addEvento({
          carroId: contrato.carroId,
          tipo: "locacao",
          titulo: `Alugado para ${contrato.motoristaNome}`,
          data: hoje,
        });
        get().addNotificacao({
          tipo: "contrato",
          titulo: "Contrato aceito",
          descricao: `${contrato.motoristaNome} aceitou. Faça o checklist de entrada na entrega do carro.`,
          data: "Agora",
          urgencia: "alta",
          carroId: contrato.carroId,
          contratoId: id,
        });
        // A primeira cobrança vence no dia do aceite.
        get().sincronizarCobrancas();
      },
      motoristaRecusarContrato: (id) => {
        const contrato = get().contratos.find((c) => c.id === id);
        if (!contrato || contrato.status !== "aguardando_aceite") return;
        set({
          contratos: get().contratos.map((c) => (c.id === id ? { ...c, status: "recusado" } : c)),
        });
        get().addNotificacao({
          tipo: "contrato",
          titulo: "Contrato recusado",
          descricao: `${contrato.motoristaNome} recusou o contrato.`,
          data: "Agora",
          urgencia: "media",
          carroId: contrato.carroId,
          contratoId: id,
        });
      },
      salvarChecklist: ({ contratoId, tipo, itens }) => {
        const contrato = get().contratos.find((c) => c.id === contratoId);
        if (!contrato) return;
        const id = `ck${Date.now()}`;
        const data = hojeISO();
        // Um checklist por tipo e contrato: salvar de novo substitui o anterior.
        const outros = get().checklists.filter(
          (c) => !(c.contratoId === contratoId && c.tipo === tipo),
        );
        set({
          checklists: [{ id, carroId: contrato.carroId, contratoId, tipo, data, itens }, ...outros],
        });
        get().addEvento({
          carroId: contrato.carroId,
          tipo: "checklist",
          titulo: `Checklist de ${tipo === "entrada" ? "entrada" : "devolução"} — ${contrato.motoristaNome}`,
          descricao: itens.avarias ? `Avarias: ${itens.avarias}` : undefined,
          data,
          km: itens.km,
        });
        if (itens.km > kmDoCarro(get(), contrato.carroId))
          get().atualizarKm(contrato.carroId, itens.km, "checklist");
        return id;
      },
      finalizarContrato: (id, { desconto, motivo, nota, comentario }) => {
        const contrato = get().contratos.find((c) => c.id === id);
        if (!contrato || (contrato.status !== "ativo" && contrato.status !== "suspenso")) return;
        const hoje = hojeISO();
        const descontoValido = Math.min(Math.max(0, desconto), contrato.caucao);
        set({
          contratos: get().contratos.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: "encerrado",
                  fim: hoje,
                  acerto: {
                    caucao: contrato.caucao,
                    desconto: descontoValido,
                    devolvido: contrato.caucao - descontoValido,
                    motivo,
                  },
                  avaliacao: { nota, comentario },
                }
              : c,
          ),
          carrosOverrides: {
            ...get().carrosOverrides,
            [contrato.carroId]: {
              ...get().carrosOverrides[contrato.carroId],
              status: "disponivel",
              motoristaAtual: undefined,
            },
          },
        });
        get().addEvento({
          carroId: contrato.carroId,
          tipo: "devolucao",
          titulo: `Devolvido por ${contrato.motoristaNome}`,
          descricao:
            descontoValido > 0
              ? `Desconto na caução: R$ ${descontoValido}${motivo ? ` (${motivo})` : ""}`
              : undefined,
          data: hoje,
        });
      },
    }),
    {
      name: "proprietario-state",
      version: 3,
      // v2: pagamentos ganharam vencimento e histórico gerado. Mantém o que a pessoa registrou e troca os exemplos antigos.
      migrate: (persisted, versao) => {
        const estado = persisted as Partial<State>;
        if (versao < 2) {
          const exemplosAntigos = new Set(["pg1", "pg2", "pg3", "pg4", "pg5", "pg6"]);
          const registrados = (estado.pagamentos ?? []).filter((p) => !exemplosAntigos.has(p.id));
          // Sem "return": as migrações seguintes também precisam rodar.
          Object.assign(estado, {
            pagamentos: [...registrados, ...pagamentosMock],
            contratos: (estado.contratos ?? contratosMock).map((c) =>
              c.id === "ct1" && !c.cobrancaDesde ? { ...c, cobrancaDesde: hojeISO() } : c,
            ),
          });
        }
        // v3: a chave Pix que estava em "recebimento" (tela antiga do Perfil) passa para o perfil do dono.
        const antigo = (
          persisted as { recebimento?: { nome: string; cidade: string; chavePix: string } | null }
        ).recebimento;
        if (versao < 3 && antigo?.chavePix && !estado.perfil?.chavePix) {
          return {
            ...estado,
            perfil: {
              ...perfilDonoVazio,
              ...estado.perfil,
              nome: estado.perfil?.nome || antigo.nome,
              cidade: antigo.cidade || perfilDonoVazio.cidade,
              chavePix: antigo.chavePix,
            },
          } as State;
        }
        return estado as State;
      },
    },
  ),
);

// -------- Selectors / helpers ----------

function kmDoCarro(
  state: { carrosOverrides: Record<string, Partial<Carro>>; carrosNovos: Carro[] },
  carroId: string,
): number {
  const novo = state.carrosNovos.find((c) => c.id === carroId);
  if (novo) return novo.km;
  return state.carrosOverrides[carroId]?.km ?? carrosBase.find((c) => c.id === carroId)?.km ?? 0;
}

export function useChecklistsDoCarro(carroId: string): Checklist[] {
  return useProprietario(useShallow((s) => s.checklists.filter((c) => c.carroId === carroId)));
}

export function useChecklistsDoContrato(contratoId: string): Checklist[] {
  return useProprietario(
    useShallow((s) => s.checklists.filter((c) => c.contratoId === contratoId)),
  );
}

export function todosEventosDoCarro(carroId: string, extras: EventoVeiculo[]): EventoVeiculo[] {
  const base = eventosMock.filter((e) => e.carroId === carroId);
  const ex = extras.filter((e) => e.carroId === carroId);
  // Mais recentes primeiro; no mesmo dia, mantém a ordem de registro (extras já vêm do mais novo ao mais antigo).
  return [...ex, ...base].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));
}

// Pagamentos de um contrato. O useShallow evita o laço infinito de renderização:
// sem ele, o filter cria um array novo a cada leitura e o zustand 5 re-renderiza sem parar.
export function usePagamentosDoContrato(contratoId: string): Pagamento[] {
  return useProprietario(
    useShallow((s) => s.pagamentos.filter((p) => p.contratoId === contratoId)),
  );
}

export function useTodosEventos(): EventoVeiculo[] {
  const extras = useProprietario((s) => s.eventosExtras);
  return useMemo(() => [...extras, ...eventosMock], [extras]);
}

/** Receita (pagamentos recebidos) e custos (eventos com valor) de cada carro, desde o início. */
export function useFinanceiroPorVeiculo(): { carroId: string; receita: number; custos: number }[] {
  const carros = useCarros();
  const contratos = useProprietario((s) => s.contratos);
  const pagamentos = useProprietario((s) => s.pagamentos);
  const eventos = useTodosEventos();
  return useMemo(
    () => carros.map((c) => financeiroDoCarro(c.id, contratos, pagamentos, eventos)),
    [carros, contratos, pagamentos, eventos],
  );
}

export function useCarros(): Carro[] {
  const overrides = useProprietario((s) => s.carrosOverrides);
  const novos = useProprietario((s) => s.carrosNovos);
  const aplicar = (c: Carro): Carro => ({ ...c, ...(overrides[c.id] ?? {}) });
  return [...novos.map(aplicar), ...carrosBase.map(aplicar)];
}

export function useCarro(id: string | undefined): Carro | undefined {
  const overrides = useProprietario((s) => s.carrosOverrides);
  const novos = useProprietario((s) => s.carrosNovos);
  if (!id) return undefined;
  const novo = novos.find((n) => n.id === id);
  if (novo) return { ...novo, ...(overrides[id] ?? {}) };
  const base = carrosBase.find((c) => c.id === id);
  if (!base) return undefined;
  return { ...base, ...(overrides[id] ?? {}) };
}

/** Itens de manutenção de todos os carros, com as atualizações feitas no app. */
export function useManutencaoTodos(): ItemManutencao[] {
  const extras = useProprietario((s) => s.manutencaoExtras);
  const overrides = useProprietario((s) => s.manutencaoOverrides);
  return useMemo(
    () => [...manutencaoMock, ...extras].map((m) => ({ ...m, ...(overrides[m.id] ?? {}) })),
    [extras, overrides],
  );
}

export function useManutencaoDoCarro(carroId: string): ItemManutencao[] {
  const extras = useProprietario((s) => s.manutencaoExtras);
  const overrides = useProprietario((s) => s.manutencaoOverrides);
  return [...manutencaoMock, ...extras]
    .filter((m) => m.carroId === carroId)
    .map((m) => ({ ...m, ...(overrides[m.id] ?? {}) }));
}
