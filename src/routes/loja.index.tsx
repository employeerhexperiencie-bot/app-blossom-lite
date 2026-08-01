import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Crown, Sparkles, TrendingUp } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useParceiro, useResumoNegocio } from "@/lib/store-parceiro";
import { fmtBRL, iconeCategoriaItem, statusPedidoInfo, totalPedido } from "@/lib/mock-parceiro";
import { oportunidadesParaParceiro } from "@/lib/marketplace-inteligente";

export const Route = createFileRoute("/loja/")({
  head: () => ({
    meta: [
      { title: "Home do Parceiro — TCHI LÉVA" },
      { name: "description", content: "Vendas do dia, pedidos, estoque e oportunidades detectadas para o seu negócio." },
      { property: "og:title", content: "Home do Parceiro — TCHI LÉVA" },
      { property: "og:description", content: "Como está o seu negócio hoje na TCHI LÉVA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomeParceiro,
});

function HomeParceiro() {
  const negocio = useParceiro((s) => s.negocio);
  const catalogo = useParceiro((s) => s.catalogo);
  const { vendido, comissao, doDia, novos, abertos, acabando, clientesNovos } = useResumoNegocio();
  const oportunidades = oportunidadesParaParceiro(catalogo);

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  return (
    <>
      <PageSection>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="text-xs text-muted-foreground">
            {saudacao}, <span className="font-semibold text-foreground">{negocio.nome}</span>.
          </div>
          <div className="mt-3 rounded-xl bg-primary/10 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Vendido hoje</div>
            <div className="font-display text-3xl font-black">{fmtBRL(vendido)}</div>
            <div className="text-[11px] text-muted-foreground">
              Comissão TCHI LÉVA {fmtBRL(comissao)} · líquido {fmtBRL(vendido - comissao)}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            <Mini label="Pedidos" value={doDia.length} />
            <Mini label="Clientes" value={clientesNovos} />
            <Mini label="Acabando" value={acabando.length} />
            <Mini label="Oport." value={oportunidades.length} />
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <Link
          to="/loja/oportunidades"
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-4"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold">{oportunidades.length} oportunidades detectadas</div>
            <div className="text-xs text-muted-foreground">Demanda prevista na sua região pelo Marketplace Inteligente</div>
          </div>
          <ArrowRight className="h-4 w-4 text-primary" />
        </Link>
      </PageSection>

      <PageSection className="pt-0">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-sm font-black uppercase tracking-wider">Pedidos abertos</h2>
          <Link to="/loja/pedidos" className="text-xs font-semibold text-primary">Ver todos</Link>
        </div>
        {abertos.length === 0 ? (
          <Vazio texto="Nenhum pedido em aberto." />
        ) : (
          <div className="flex flex-col gap-2">
            {abertos.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                to="/loja/pedidos/$pedidoId"
                params={{ pedidoId: p.id }}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-lg">
                  {iconeCategoriaItem(p.itens[0]?.tipo === "servico" ? "servico-geral" : "outros")}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{p.codigo} · {p.clienteNome}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {p.hora} · {fmtBRL(totalPedido(p))}
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${statusPedidoInfo[p.status].cls}`}>
                  {statusPedidoInfo[p.status].label}
                </span>
              </Link>
            ))}
          </div>
        )}
        {novos.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">{novos.length} pedido(s) aguardando resposta.</div>
        )}
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-2 font-display text-sm font-black uppercase tracking-wider">Estoque acabando</h2>
        {acabando.length === 0 ? (
          <Vazio texto="Nenhum produto abaixo do mínimo." />
        ) : (
          <div className="flex flex-col gap-2">
            {acabando.map((i) => (
              <Link
                key={i.id}
                to="/loja/estoque"
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-3"
              >
                <AlertTriangle className="h-5 w-5 text-warning" />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{i.nome}</div>
                  <div className="text-xs text-muted-foreground">
                    {i.quantidade} em estoque · mínimo {i.estoqueMinimo}
                  </div>
                </div>
                <span className="text-xs font-bold text-warning">Repor</span>
              </Link>
            ))}
          </div>
        )}
      </PageSection>

      <PageSection className="pt-0">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            <span className="font-display text-sm font-black uppercase tracking-wider">
              Plano {negocio.plano === "premium" ? "Premium" : "Gratuito"}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {negocio.plano === "premium"
              ? "Você tem destaque nas buscas, relatórios completos e sugestões automáticas de campanha."
              : "Destaque nas buscas, relatórios completos, catálogo ilimitado e sugestões de campanha estão bloqueados."}
          </p>
          <Button asChild variant="outline" className="mt-3 w-full rounded-xl">
            <Link to="/loja/plano">
              {negocio.plano === "premium" ? "Gerenciar plano" : "Conhecer o Premium"}{" "}
              <TrendingUp className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </PageSection>
    </>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-muted/60 p-2">
      <div className="font-display text-xl font-black">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Vazio({ texto }: { texto: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
      {texto}
    </div>
  );
}
