// Marketplace Inteligente — motor de oportunidades (regras determinísticas em mock)

import { carros, type Carro } from "./mock-data";
import { manutencaoMock } from "./mock-proprietario";
import type { CategoriaItem, ItemCatalogo, Oportunidade } from "./mock-parceiro";

export type SugestaoVeiculo = {
  id: string;
  carroId: string;
  veiculo: string;
  necessidade: string;
  motivo: string;
  categoria: CategoriaItem;
  kmRestante: number;
  urgencia: "baixa" | "media" | "alta";
};

// Necessidades previstas por veículo com base em km e último serviço
export function sugestoesParaVeiculos(lista: Carro[] = carros): SugestaoVeiculo[] {
  const out: SugestaoVeiculo[] = [];
  for (const c of lista) {
    const itens = manutencaoMock.filter((m) => m.carroId === c.id);
    for (const m of itens) {
      const intervalo = m.intervaloKm ?? 10000;
      const proximo = m.proximoKm ?? m.ultimoKm + intervalo;
      const restante = proximo - c.km;
      if (restante > intervalo * 0.25) continue;
      const categoria: CategoriaItem =
        m.item === "Óleo" ? "oleo-filtros" : m.item === "Pneus" ? "pneus" : m.item === "Freios" ? "freios" : "outros";
      out.push({
        id: `sg-${c.id}-${m.id}`,
        carroId: c.id,
        veiculo: `${c.marca} ${c.modelo} ${c.ano}`,
        necessidade:
          categoria === "oleo-filtros" ? "Troca de óleo e filtro"
          : categoria === "pneus" ? "Troca de pneus"
          : categoria === "freios" ? "Pastilhas de freio"
          : `Manutenção — ${m.item}`,
        motivo:
          restante <= 0
            ? `${c.km.toLocaleString("pt-BR")} km rodados — prazo já vencido`
            : `Faltam ${restante.toLocaleString("pt-BR")} km para o limite recomendado`,
        categoria,
        kmRestante: restante,
        urgencia: restante <= 0 ? "alta" : restante <= intervalo * 0.1 ? "media" : "baixa",
      });
    }
  }
  return out.sort((a, b) => a.kmRestante - b.kmRestante);
}

// Oportunidades comerciais para o parceiro, cruzando demanda prevista com o catálogo
export function oportunidadesParaParceiro(catalogo: ItemCatalogo[]): Oportunidade[] {
  const sugestoes = sugestoesParaVeiculos();
  const porCategoria = new Map<CategoriaItem, number>();
  for (const s of sugestoes) porCategoria.set(s.categoria, (porCategoria.get(s.categoria) ?? 0) + 1);

  // Escala regional simulada: cada veículo da base representa uma fatia da região
  const fatorRegiao = 7;
  const out: Oportunidade[] = [];

  for (const [categoria, qtd] of porCategoria) {
    const item = catalogo.find((i) => i.categoria === categoria && i.ativo);
    const alcance = qtd * fatorRegiao;
    const ticket = item?.preco ?? 150;
    out.push({
      id: `op-${categoria}`,
      tipo: "demanda",
      titulo:
        categoria === "oleo-filtros" ? `${alcance} veículos trocam óleo nos próximos 15 dias`
        : categoria === "pneus" ? `${alcance} veículos com pneus próximos do limite`
        : categoria === "freios" ? `${alcance} veículos precisam de freios`
        : `${alcance} veículos com manutenção prevista`,
      motivo: "Detectado pela quilometragem e histórico de manutenção da frota da região.",
      alcance,
      receitaPotencial: alcance * ticket * 0.35,
      categoria,
      sugestaoCampanha:
        categoria === "oleo-filtros" ? "Kit óleo + filtro com 15% OFF para motoristas de app"
        : categoria === "pneus" ? "Par de pneus com preço fechado e montagem grátis"
        : categoria === "freios" ? "Pastilhas com instalação inclusa"
        : "Oferta de manutenção preventiva",
      descontoSugerido: 15,
    });
  }

  out.push(
    {
      id: "op-frota", tipo: "frota",
      titulo: "7 proprietários administram frotas com mais de 5 carros",
      motivo: "Frotas cadastradas na sua região de atendimento com compra recorrente de peças.",
      alcance: 7, receitaPotencial: 8400, categoria: "oleo-filtros",
      sugestaoCampanha: "Tabela de preços para frotas com condição especial", descontoSugerido: 12,
    },
    {
      id: "op-recorrencia", tipo: "recorrencia",
      titulo: "5 oficinas parceiras compram filtros semanalmente",
      motivo: "Pedidos repetidos nas últimas 6 semanas — potencial de contrato de fornecimento.",
      alcance: 5, receitaPotencial: 4200, categoria: "oleo-filtros",
      sugestaoCampanha: "Plano de fornecimento semanal para oficinas", descontoSugerido: 8,
    },
    {
      id: "op-solicitacao", tipo: "solicitacao",
      titulo: "4 motoristas abriram solicitação de orçamento",
      motivo: "Solicitações abertas na região que ainda não receberam resposta.",
      alcance: 4, receitaPotencial: 1300, categoria: "servico-geral",
      sugestaoCampanha: "Responder orçamentos em até 1 hora com desconto", descontoSugerido: 10,
    },
    {
      id: "op-fluxo", tipo: "fluxo",
      titulo: "Pico de motoristas entre 11h30 e 14h",
      motivo: "42 corridas terminaram num raio de 500 m da sua loja no último mês.",
      alcance: 42, receitaPotencial: 2100, categoria: "alimentacao",
      sugestaoCampanha: "Campanha de almoço para motoristas TCHI LÉVA", descontoSugerido: 20,
    }
  );

  return out.sort((a, b) => b.receitaPotencial - a.receitaPotencial);
}
