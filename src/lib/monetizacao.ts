// Camada de monetização da plataforma TCHI LÉVA (mock, sem banco)

import type { Pedido } from "./mock-parceiro";
import { totalPedido } from "./mock-parceiro";

export const taxas = {
  produto: 0.08,
  servico: 0.1,
  assinaturaPremium: 149.9,
  leadQualificado: 4.5,
  publicidadeCPC: 0.9,
};

export type Comissao = { bruto: number; comissao: number; liquido: number; takeRate: number };

export function comissaoPedido(p: Pedido): Comissao {
  const bruto = totalPedido(p);
  const comissao = p.itens.reduce((acc, i) => {
    const sub = i.quantidade * i.valorUnit;
    return acc + sub * (i.tipo === "servico" ? taxas.servico : taxas.produto);
  }, 0);
  return { bruto, comissao, liquido: bruto - comissao, takeRate: bruto > 0 ? comissao / bruto : 0 };
}

export function comissaoValor(valor: number, tipo: "produto" | "servico"): number {
  return valor * (tipo === "servico" ? taxas.servico : taxas.produto);
}

export type FonteReceita = { key: string; label: string; valor: number; descricao: string };

// Receita agregada da plataforma (visão Admin) — mock consolidado do ecossistema
export const receitaPlataforma: FonteReceita[] = [
  { key: "com-produtos", label: "Comissão de produtos", valor: 18420, descricao: "8% sobre vendas do marketplace" },
  { key: "com-servicos", label: "Comissão de serviços", valor: 22980, descricao: "10% sobre serviços realizados" },
  { key: "assinaturas", label: "Assinaturas Premium", valor: 8994, descricao: "60 parceiros no plano Premium" },
  { key: "leads", label: "Leads qualificados", valor: 5310, descricao: "1.180 leads entregues a parceiros" },
  { key: "publicidade", label: "Publicidade contextual", valor: 3240, descricao: "Ofertas baseadas em necessidade" },
];

export const gmvMensal = [
  { mes: "Mar", gmv: 210000, receita: 21400 },
  { mes: "Abr", gmv: 248000, receita: 25100 },
  { mes: "Mai", gmv: 289000, receita: 29800 },
  { mes: "Jun", gmv: 341000, receita: 35200 },
  { mes: "Jul", gmv: 402000, receita: 42600 },
  { mes: "Ago", gmv: 468000, receita: 58944 },
];

export function totalReceitaPlataforma(): number {
  return receitaPlataforma.reduce((a, f) => a + f.valor, 0);
}
