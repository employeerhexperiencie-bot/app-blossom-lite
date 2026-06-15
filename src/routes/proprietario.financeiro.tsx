import { createFileRoute } from "@tanstack/react-router";
import { PageSection } from "@/components/AppShell";
import { recebimentosMensais } from "@/lib/mock-data";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/proprietario/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — Conect" }] }),
  component: Financeiro,
});

function Financeiro() {
  const total = recebimentosMensais.reduce((a, b) => a + b.valor, 0);
  const media = total / recebimentosMensais.length;
  return (
    <>
      <PageSection>
        <div className="gradient-primary rounded-3xl p-5 text-primary-foreground shadow-glow">
          <div className="text-xs opacity-90">Recebido em 6 meses</div>
          <div className="font-display text-4xl font-extrabold">R$ {total.toLocaleString("pt-BR")}</div>
          <div className="mt-1 text-xs opacity-90">Média mensal R$ {media.toFixed(0)}</div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Por mês</h2>
        <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart data={recebimentosMensais}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="mes" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip cursor={{ fill: "var(--color-accent)" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                <Bar dataKey="valor" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </PageSection>
    </>
  );
}
