import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, Users, Car, Wrench, Store, ArrowUpRight } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { corridasDisponiveis, parceiros, lojas, motoristas, carros } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "KPIs — Admin | Conect" }] }),
  component: AdminKPIs,
});

function AdminKPIs() {
  const ticket = corridasDisponiveis.reduce((s, c) => s + c.valor, 0) / corridasDisponiveis.length;
  return (
    <>
      <PageSection>
        <h1 className="font-display text-xl font-extrabold">Visão geral</h1>
        <p className="text-xs text-muted-foreground">KPIs em tempo real do ecossistema</p>
      </PageSection>

      <PageSection className="pt-2">
        <div className="grid grid-cols-2 gap-3">
          <Kpi icon={Car} label="Corridas hoje" value="1.284" delta="+12%" />
          <Kpi icon={TrendingUp} label="Faturamento" value="R$ 42,8k" delta="+8%" />
          <Kpi icon={Users} label="Ativos" value="8.412" delta="+3%" />
          <Kpi icon={ArrowUpRight} label="Ticket médio" value={`R$ ${ticket.toFixed(2)}`} delta="—" />
        </div>
      </PageSection>

      <PageSection className="pt-2">
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Ecossistema
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <MiniCount icon={Car} label="Motoristas" value={motoristas.length * 24} />
          <MiniCount icon={Users} label="Passageiros" value={1842} />
          <MiniCount icon={Wrench} label="Oficinas" value={parceiros.length * 18} />
          <MiniCount icon={Store} label="Lojas" value={lojas.length * 14} />
          <MiniCount icon={Car} label="Veículos cadastrados" value={carros.length * 47} />
          <MiniCount icon={TrendingUp} label="Cashback distribuído" value="R$ 18,4k" />
        </div>
      </PageSection>
    </>
  );
}

function Kpi({ icon: Icon, label, value, delta }: { icon: typeof TrendingUp; label: string; value: string; delta: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs font-semibold text-success">{delta}</span>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-extrabold">{value}</div>
    </div>
  );
}

function MiniCount({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-card">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="mt-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-bold">{value}</div>
    </div>
  );
}
