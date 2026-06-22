import { createFileRoute } from "@tanstack/react-router";
import { Wallet, TrendingUp, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { recebimentosMensais } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — Admin | Conect" }] }),
  component: Financeiro,
});

function Financeiro() {
  const total = recebimentosMensais.reduce((s, m) => s + m.valor, 0);
  const max = Math.max(...recebimentosMensais.map((m) => m.valor));
  return (
    <>
      <PageSection>
        <h1 className="font-display text-xl font-extrabold">Financeiro</h1>
        <p className="text-xs text-muted-foreground">Repasses, taxas e comissões</p>
      </PageSection>

      <PageSection className="pt-2">
        <div className="grid grid-cols-2 gap-3">
          <Box icon={Wallet} label="Comissão acumulada" value={`R$ ${(total * 0.18).toFixed(0)}`} delta="+12%" up />
          <Box icon={TrendingUp} label="GMV semestre" value={`R$ ${total.toLocaleString("pt-BR")}`} delta="+9%" up />
          <Box icon={ArrowUpRight} label="A repassar" value="R$ 12.480" delta="—" up />
          <Box icon={ArrowDownRight} label="Em atraso" value="R$ 2.140" delta="-3%" />
        </div>
      </PageSection>

      <PageSection className="pt-2">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Recebimentos por mês
          </h2>
          <div className="mt-4 grid grid-cols-6 items-end gap-2 h-32">
            {recebimentosMensais.map((m) => (
              <div key={m.mes} className="flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md gradient-primary"
                  style={{ height: `${(m.valor / max) * 100}%` }}
                />
                <span className="text-[10px] font-semibold text-muted-foreground">{m.mes}</span>
              </div>
            ))}
          </div>
        </div>
      </PageSection>
    </>
  );
}

function Box({ icon: Icon, label, value, delta, up }: { icon: typeof Wallet; label: string; value: string; delta: string; up?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className={`text-xs font-semibold ${up ? "text-success" : "text-destructive"}`}>{delta}</span>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-extrabold">{value}</div>
    </div>
  );
}
