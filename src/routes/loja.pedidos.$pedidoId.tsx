import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useParceiro, usePedido } from "@/lib/store-parceiro";
import { fmtBRL, statusPedidoInfo, tiposPedido, totalPedido } from "@/lib/mock-parceiro";
import { comissaoPedido } from "@/lib/monetizacao";
import { toast } from "sonner";

export const Route = createFileRoute("/loja/pedidos/$pedidoId")({
  head: () => ({
    meta: [
      { title: "Detalhe do pedido — Parceiro TCHI LÉVA" },
      { name: "description", content: "Itens, cliente, comissão da plataforma e avanço de status do pedido." },
      { property: "og:title", content: "Detalhe do pedido — Parceiro TCHI LÉVA" },
      { property: "og:description", content: "Acompanhe e atualize o status do pedido recebido." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DetalhePedido,
});

const proximoLabel: Record<string, string> = {
  novo: "Aceitar pedido",
  aceito: "Iniciar preparo",
  em_preparo: "Marcar como pronto",
  pronto: "Marcar como entregue",
};

function DetalhePedido() {
  const { pedidoId } = useParams({ from: "/loja/pedidos/$pedidoId" });
  const pedido = usePedido(pedidoId);
  const avancar = useParceiro((s) => s.avancarPedido);
  const recusar = useParceiro((s) => s.recusarPedido);
  const navigate = useNavigate();

  if (!pedido) {
    return (
      <PageSection>
        <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Pedido não encontrado.
        </div>
      </PageSection>
    );
  }

  const c = comissaoPedido(pedido);
  const label = proximoLabel[pedido.status];

  return (
    <>
      <PageSection>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="font-display text-2xl font-black">{pedido.codigo}</span>
            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusPedidoInfo[pedido.status].cls}`}>
              {statusPedidoInfo[pedido.status].label}
            </span>
          </div>
          <div className="mt-1 text-sm font-semibold">{pedido.clienteNome}</div>
          <div className="text-xs text-muted-foreground">
            {tiposPedido.find((t) => t.key === pedido.tipo)?.label} · {pedido.clientePerfil} · origem {pedido.origem}
          </div>
          {pedido.veiculo && <div className="mt-1 text-xs text-muted-foreground">🚗 {pedido.veiculo}</div>}
          <div className="text-xs text-muted-foreground">{pedido.data} às {pedido.hora}</div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <h2 className="mb-3 font-display text-sm font-black uppercase tracking-wider">Itens</h2>
          <div className="flex flex-col gap-2">
            {pedido.itens.map((i, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate">
                  {i.quantidade}× {i.nome}
                </span>
                <span className="font-display font-black">{fmtBRL(i.quantidade * i.valorUnit)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-border pt-3 text-sm">
            <Linha label="Total do pedido" valor={fmtBRL(c.bruto)} />
            <Linha label={`Comissão TCHI LÉVA (${(c.takeRate * 100).toFixed(1)}%)`} valor={`− ${fmtBRL(c.comissao)}`} />
            <div className="mt-2 flex items-center justify-between">
              <span className="font-semibold">Você recebe</span>
              <span className="font-display text-xl font-black text-primary">{fmtBRL(c.liquido)}</span>
            </div>
          </div>
        </div>
      </PageSection>

      {pedido.observacoes && (
        <PageSection className="pt-0">
          <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Observações</div>
            {pedido.observacoes}
          </div>
        </PageSection>
      )}

      <PageSection className="pt-0">
        {label && (
          <Button
            className="w-full rounded-xl gradient-primary text-primary-foreground shadow-glow"
            onClick={() => { avancar(pedido.id); toast.success(`${label} — feito!`); }}
          >
            <Check className="mr-2 h-4 w-4" /> {label}
          </Button>
        )}
        {pedido.status === "novo" && (
          <Button
            variant="outline"
            className="mt-3 w-full rounded-xl text-destructive"
            onClick={() => { recusar(pedido.id); toast.success("Pedido recusado."); navigate({ to: "/loja/pedidos" }); }}
          >
            <X className="mr-2 h-4 w-4" /> Recusar pedido
          </Button>
        )}
        {!label && pedido.status !== "novo" && (
          <div className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Pedido finalizado — total {fmtBRL(totalPedido(pedido))}.
          </div>
        )}
      </PageSection>
    </>
  );
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span>{valor}</span>
    </div>
  );
}
