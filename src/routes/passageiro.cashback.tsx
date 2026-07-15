import { createFileRoute } from "@tanstack/react-router";
import { PageSection } from "@/components/AppShell";
import { cashbackHistorico } from "@/lib/mock-data";

export const Route = createFileRoute("/passageiro/cashback")({
  head: () => ({ meta: [{ title: "Cashback — TCHI LÉVA" }] }),
  component: Cashback,
});

function Cashback() {
  const saldo = cashbackHistorico.reduce((a, b) => a + b.valor, 0);
  return (
    <>
      <PageSection>
        <div className="rounded-3xl bg-gradient-to-br from-success to-success/70 p-5 text-success-foreground shadow-glow">
          <div className="text-xs opacity-90">Seu saldo de cashback</div>
          <div className="font-display text-4xl font-extrabold">R$ {saldo.toFixed(2)}</div>
          <div className="mt-2 text-xs opacity-90">Use em lojas parceiras</div>
        </div>
      </PageSection>
      <PageSection className="pt-0">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Histórico</h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
          {cashbackHistorico.map((h) => (
            <div key={h.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">{h.origem}</div>
                <div className="text-xs text-muted-foreground">{h.data}</div>
              </div>
              <div className={`font-display font-bold ${h.valor >= 0 ? "text-success" : "text-destructive"}`}>
                {h.valor >= 0 ? "+" : ""}R$ {h.valor.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </PageSection>
    </>
  );
}
