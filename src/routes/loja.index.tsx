import { createFileRoute } from "@tanstack/react-router";
import { PageSection } from "@/components/AppShell";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export const Route = createFileRoute("/loja/")({
  head: () => ({ meta: [{ title: "Dashboard — TCHI LÉVA Loja" }] }),
  component: Dash,
});

const data = [
  { dia: "Seg", clientes: 4 }, { dia: "Ter", clientes: 7 }, { dia: "Qua", clientes: 5 },
  { dia: "Qui", clientes: 11 }, { dia: "Sex", clientes: 14 }, { dia: "Sáb", clientes: 18 }, { dia: "Dom", clientes: 9 },
];

function Dash() {
  return (
    <>
      <PageSection>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Clientes via app" value="68" />
          <Stat label="Cashback gerado" value="R$ 412" />
          <Stat label="Cupons usados" value="23" />
        </div>
      </PageSection>
      <PageSection className="pt-0">
        <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
          <div className="mb-2 px-2 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Clientes na semana</div>
          <div className="h-44 w-full">
            <ResponsiveContainer>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="dia" stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                <Area type="monotone" dataKey="clientes" stroke="var(--color-primary)" fill="url(#g1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </PageSection>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-bold">{value}</div>
    </div>
  );
}
