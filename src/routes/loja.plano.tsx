import { createFileRoute } from "@tanstack/react-router";
import { Check, Crown, X } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useParceiro } from "@/lib/store-parceiro";
import { beneficiosPlano, fmtBRL, precoPremium } from "@/lib/mock-parceiro";
import { toast } from "sonner";

export const Route = createFileRoute("/loja/plano")({
  head: () => ({
    meta: [
      { title: "Plano Premium — Parceiro TCHI LÉVA" },
      { name: "description", content: "Compare o plano gratuito e o Premium: destaque nas buscas, relatórios e catálogo ilimitado." },
      { property: "og:title", content: "Plano Premium — Parceiro TCHI LÉVA" },
      { property: "og:description", content: "Assine o Premium e venda mais na TCHI LÉVA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Plano,
});

function Plano() {
  const negocio = useParceiro((s) => s.negocio);
  const assinar = useParceiro((s) => s.assinarPremium);
  const cancelar = useParceiro((s) => s.cancelarPremium);
  const premium = negocio.plano === "premium";

  return (
    <>
      <PageSection>
        <div className="rounded-3xl border border-primary/40 bg-primary/10 p-5 text-center">
          <Crown className="mx-auto h-8 w-8 text-primary" />
          <div className="mt-2 font-display text-2xl font-black">Parceiro Premium</div>
          <div className="font-display text-3xl font-black text-primary">{fmtBRL(precoPremium)}<span className="text-sm">/mês</span></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua loja aparece primeiro para milhares de motoristas, oficinas e proprietários da região.
          </p>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="grid grid-cols-[minmax(0,1fr)_56px_56px] items-center gap-2 border-b border-border pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Recurso</span><span className="text-center">Grátis</span><span className="text-center">Premium</span>
          </div>
          {beneficiosPlano.map((b) => (
            <div key={b.label} className="grid grid-cols-[minmax(0,1fr)_56px_56px] items-center gap-2 border-b border-border/50 py-2 text-sm last:border-0">
              <span className="min-w-0">{b.label}</span>
              <span className="grid place-items-center">
                {b.gratuito ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />}
              </span>
              <span className="grid place-items-center">
                {b.premium ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />}
              </span>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection className="pt-0">
        {premium ? (
          <Button variant="outline" className="w-full rounded-xl text-destructive" onClick={() => { cancelar(); toast.success("Plano Premium cancelado."); }}>
            Cancelar Premium
          </Button>
        ) : (
          <Button className="w-full rounded-xl gradient-primary text-primary-foreground shadow-glow" onClick={() => { assinar(); toast.success("Bem-vindo ao Premium!"); }}>
            <Crown className="mr-2 h-4 w-4" /> Assinar por {fmtBRL(precoPremium)}/mês
          </Button>
        )}
      </PageSection>
    </>
  );
}
