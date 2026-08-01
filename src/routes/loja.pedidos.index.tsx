import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageSection } from "@/components/AppShell";
import { FiltroBar } from "@/components/FiltroBar";
import { useParceiro } from "@/lib/store-parceiro";
import { fmtBRL, statusPedidoInfo, tiposPedido, totalPedido } from "@/lib/mock-parceiro";
import { comissaoPedido } from "@/lib/monetizacao";

export const Route = createFileRoute("/loja/pedidos/")({
  head: () => ({
    meta: [
      { title: "Pedidos — Parceiro TCHI LÉVA" },
      { name: "description", content: "Fila unificada de compras, orçamentos, agendamentos e solicitações da sua loja." },
      { property: "og:title", content: "Pedidos — Parceiro TCHI LÉVA" },
      { property: "og:description", content: "Gerencie pedidos e solicitações recebidas pela TCHI LÉVA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pedidos,
});

function Pedidos() {
  const pedidos = useParceiro((s) => s.pedidos);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [tipo, setTipo] = useState("todos");

  const lista = useMemo(
    () =>
      pedidos.filter((p) => {
        if (busca && !`${p.codigo} ${p.clienteNome} ${p.veiculo ?? ""}`.toLowerCase().includes(busca.toLowerCase())) return false;
        if (status !== "todos" && p.status !== status) return false;
        if (tipo !== "todos" && p.tipo !== tipo) return false;
        return true;
      }),
    [pedidos, busca, status, tipo]
  );

  const bruto = lista.reduce((a, p) => (p.status === "recusado" ? a : a + totalPedido(p)), 0);
  const comissao = lista.reduce((a, p) => (p.status === "recusado" ? a : a + comissaoPedido(p).comissao), 0);

  return (
    <>
      <PageSection>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-card p-3 shadow-card">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total filtrado</div>
            <div className="font-display text-xl font-black">{fmtBRL(bruto)}</div>
          </div>
          <div className="rounded-2xl bg-card p-3 shadow-card">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Comissão TCHI LÉVA</div>
            <div className="font-display text-xl font-black text-primary">{fmtBRL(comissao)}</div>
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <FiltroBar
          busca={busca}
          onBusca={setBusca}
          buscaPlaceholder="Buscar por código, cliente ou veículo..."
          ativos={[status !== "todos", tipo !== "todos"].filter(Boolean).length}
          onLimpar={() => { setStatus("todos"); setTipo("todos"); }}
          chips={[
            { key: "st", label: "Status", value: status, onChange: setStatus, options: [
              { value: "todos", label: "Todos" },
              ...Object.entries(statusPedidoInfo).map(([k, v]) => ({ value: k, label: v.label })),
            ]},
            { key: "tp", label: "Tipo", value: tipo, onChange: setTipo, options: [
              { value: "todos", label: "Todos" }, ...tiposPedido.map((t) => ({ value: t.key, label: t.label })),
            ]},
          ]}
        />
      </PageSection>

      <PageSection className="pt-0">
        <div className="flex flex-col gap-2">
          {lista.map((p) => (
            <Link
              key={p.id}
              to="/loja/pedidos/$pedidoId"
              params={{ pedidoId: p.id }}
              className="rounded-2xl border border-border bg-card p-3 shadow-card"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-black">{p.codigo}</span>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusPedidoInfo[p.status].cls}`}>
                  {statusPedidoInfo[p.status].label}
                </span>
              </div>
              <div className="mt-1 truncate text-sm font-semibold">{p.clienteNome}</div>
              <div className="truncate text-xs text-muted-foreground">
                {tiposPedido.find((t) => t.key === p.tipo)?.icone} {p.veiculo ?? p.clientePerfil} · {p.data} {p.hora}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{p.itens.length} item(ns)</span>
                <span className="font-display text-base font-black">{fmtBRL(totalPedido(p))}</span>
              </div>
            </Link>
          ))}
          {lista.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nenhum pedido encontrado.
            </div>
          )}
        </div>
      </PageSection>
    </>
  );
}
