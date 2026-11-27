// "O que precisa de mim hoje": a lista de ações da Início do proprietário, em ordem de prioridade.
// Função pura: recebe os dados e a data de hoje.
import type { Carro } from "./mock-data";
import type {
  Checklist,
  Contrato,
  DocumentoVeiculo,
  ItemManutencao,
  Pagamento,
  SolicitacaoLocacao,
  AnuncioLocacao,
} from "./mock-proprietario";
import { diasEntre } from "./cobrancas";

export type TipoAcao =
  | "atraso"
  | "proposta"
  | "checklist"
  | "documento"
  | "manutencao"
  | "fim_contrato"
  | "aguardando_aceite"
  | "carro_parado";

export type Acao = {
  id: string;
  tipo: TipoAcao;
  urgencia: "alta" | "media" | "baixa";
  titulo: string;
  descricao: string;
  botao: string;
  destino:
    | { to: "/proprietario/contratos/$id"; id: string }
    | { to: "/proprietario/solicitacoes/$id"; id: string }
    | { to: "/proprietario/frota/$carroId"; carroId: string };
};

const ORDEM: TipoAcao[] = [
  "atraso",
  "proposta",
  "checklist",
  "documento",
  "manutencao",
  "fim_contrato",
  "carro_parado",
  "aguardando_aceite",
];

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function acoesDoDia(d: {
  hoje: string;
  carros: Carro[];
  contratos: Contrato[];
  pagamentos: Pagamento[];
  solicitacoes: SolicitacaoLocacao[];
  checklists: Checklist[];
  documentos: DocumentoVeiculo[];
  manutencao: ItemManutencao[];
  anuncios: Record<string, AnuncioLocacao>;
}): Acao[] {
  const acoes: Acao[] = [];
  const nomeCarro = (id: string) => {
    const c = d.carros.find((x) => x.id === id);
    return c ? `${c.marca} ${c.modelo}` : "Carro";
  };

  // 1. Pagamentos atrasados, um item por contrato.
  for (const c of d.contratos) {
    const atrasados = d.pagamentos.filter((p) => p.contratoId === c.id && p.status === "atrasado");
    if (atrasados.length === 0) continue;
    const total = atrasados.reduce((a, p) => a + p.valor, 0);
    acoes.push({
      id: `atraso-${c.id}`,
      tipo: "atraso",
      urgencia: "alta",
      titulo: `${brl(total)} em atraso`,
      descricao: `${c.motoristaNome} · ${atrasados.length} cobrança${atrasados.length > 1 ? "s" : ""} · ${nomeCarro(c.carroId)}`,
      botao: "Cobrar",
      destino: { to: "/proprietario/contratos/$id", id: c.id },
    });
  }

  // 2. Propostas de aluguel esperando resposta.
  for (const s of d.solicitacoes.filter((x) => x.status === "pendente")) {
    acoes.push({
      id: `proposta-${s.id}`,
      tipo: "proposta",
      urgencia: "alta",
      titulo: "Proposta de aluguel",
      descricao: `${s.candidato?.nome ?? "Motorista"} quer o ${nomeCarro(s.carroId)}`,
      botao: "Responder",
      destino: { to: "/proprietario/solicitacoes/$id", id: s.id },
    });
  }

  // 3. Contratos fechados pelo app que ainda não têm checklist de entrada.
  for (const c of d.contratos) {
    if (c.status !== "ativo" || !c.solicitacaoId) continue;
    if (d.checklists.some((k) => k.contratoId === c.id && k.tipo === "entrada")) continue;
    acoes.push({
      id: `checklist-${c.id}`,
      tipo: "checklist",
      urgencia: "media",
      titulo: "Checklist de entrega",
      descricao: `${nomeCarro(c.carroId)} com ${c.motoristaNome}`,
      botao: "Fazer",
      destino: { to: "/proprietario/contratos/$id", id: c.id },
    });
  }

  // 4. Documentos vencidos ou vencendo em até 30 dias.
  for (const doc of d.documentos) {
    const dias = diasEntre(d.hoje, doc.vencimento);
    if (dias > 30) continue;
    acoes.push({
      id: `doc-${doc.id}`,
      tipo: "documento",
      urgencia: dias < 0 ? "alta" : "media",
      titulo:
        dias < 0
          ? `${doc.tipo} vencido`
          : `${doc.tipo} vence em ${dias} dia${dias === 1 ? "" : "s"}`,
      descricao: nomeCarro(doc.carroId),
      botao: "Ver",
      destino: { to: "/proprietario/frota/$carroId", carroId: doc.carroId },
    });
  }

  // 5. Manutenção a até 1.000 km ou 30 dias.
  for (const m of d.manutencao) {
    const carro = d.carros.find((c) => c.id === m.carroId);
    if (!carro) continue;
    const kmFalta = m.proximoKm != null ? m.proximoKm - carro.km : Infinity;
    const diasFalta = m.proximaData ? diasEntre(d.hoje, m.proximaData) : Infinity;
    if (kmFalta > 1000 && diasFalta > 30) continue;
    const vencida = kmFalta <= 0 || diasFalta < 0;
    acoes.push({
      id: `manut-${m.id}`,
      tipo: "manutencao",
      urgencia: vencida ? "alta" : "media",
      titulo: vencida ? `${m.item}: manutenção vencida` : `${m.item}: manutenção próxima`,
      descricao:
        kmFalta <= 1000 && kmFalta > 0
          ? `${nomeCarro(m.carroId)} · faltam ${kmFalta.toLocaleString("pt-BR")} km`
          : nomeCarro(m.carroId),
      botao: "Ver",
      destino: { to: "/proprietario/frota/$carroId", carroId: m.carroId },
    });
  }

  // 6. Contratos que terminam em até 15 dias.
  for (const c of d.contratos) {
    if (c.status !== "ativo" || !c.fim) continue;
    const dias = diasEntre(d.hoje, c.fim);
    if (dias < 0 || dias > 15) continue;
    acoes.push({
      id: `fim-${c.id}`,
      tipo: "fim_contrato",
      urgencia: "media",
      titulo: dias === 0 ? "Contrato termina hoje" : `Contrato termina em ${dias} dias`,
      descricao: `${c.motoristaNome} · ${nomeCarro(c.carroId)}`,
      botao: "Ver",
      destino: { to: "/proprietario/contratos/$id", id: c.id },
    });
  }

  // 7. Carro livre sem anúncio publicado: está parado.
  for (const carro of d.carros) {
    if (carro.status !== "disponivel" || d.anuncios[carro.id]?.publicado) continue;
    const temProposta = d.solicitacoes.some(
      (s) => s.carroId === carro.id && s.status === "pendente",
    );
    const temAceite = d.contratos.some(
      (c) => c.carroId === carro.id && c.status === "aguardando_aceite",
    );
    if (temProposta || temAceite) continue;
    acoes.push({
      id: `parado-${carro.id}`,
      tipo: "carro_parado",
      urgencia: "baixa",
      titulo: "Carro parado sem anúncio",
      descricao: `${carro.marca} ${carro.modelo} · publique para receber propostas`,
      botao: "Anunciar",
      destino: { to: "/proprietario/frota/$carroId", carroId: carro.id },
    });
  }

  // 8. Contratos esperando o motorista aceitar (só acompanhamento).
  for (const c of d.contratos.filter((x) => x.status === "aguardando_aceite")) {
    acoes.push({
      id: `aceite-${c.id}`,
      tipo: "aguardando_aceite",
      urgencia: "baixa",
      titulo: "Aguardando o motorista aceitar",
      descricao: `${c.motoristaNome} · ${nomeCarro(c.carroId)}`,
      botao: "Ver",
      destino: { to: "/proprietario/contratos/$id", id: c.id },
    });
  }

  return acoes.sort((a, b) => ORDEM.indexOf(a.tipo) - ORDEM.indexOf(b.tipo));
}

/** Percentual de carros alugados entre os que podem rodar (fora os em manutenção). */
export function ocupacaoDaFrota(carros: Carro[]): {
  alugados: number;
  rodaveis: number;
  percentual: number;
} {
  const rodaveis = carros.filter((c) => c.status !== "manutencao").length;
  const alugados = carros.filter((c) => c.status === "alugado").length;
  return { alugados, rodaveis, percentual: rodaveis ? Math.round((alugados / rodaveis) * 100) : 0 };
}
