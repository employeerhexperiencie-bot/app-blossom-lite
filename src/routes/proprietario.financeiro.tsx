import { createFileRoute } from "@tanstack/react-router";
import { PageSection } from "@/components/AppShell";
import { recebimentosMensais, carros } from "@/lib/mock-data";
import { custosMensais, financeiroPorVeiculo, fmtBRL } from "@/lib/mock-proprietario";
import { Line, LineChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/proprietario/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — TCHI LÉVA" }] }),
  component: Financeiro,
});

function Financeiro() {
  const receita = recebimentosMensais.reduce((a, b) => a + b.valor, 0);
  const custos = custosMensais.reduce((a, b) => a + b.valor, 0);
  const lucro = receita - custos;

  const combinado = recebimentosMensais.map((r, i) => ({
    mes: r.mes,
    receita: r.valor,
    custos: custosMensais[i]?.valor ?? 0,
  }));

  return (
    <>
      <PageSection>
        <div className="gradient-primary rounded-3xl p-5 text-primary-foreground shadow-glow">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">Lucro em 6 meses</div>
          <div className="font-street text-4xl font-black">{fmtBRL(lucro)}</div>
          <div className="mt-2 flex gap-4 text-xs opacity-90">
            <span>Receita {fmtBRL(receita)}</span>
            <span>Custos {fmtBRL(custos)}</span>
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-3 font-street text-sm font-black uppercase tracking-wider text-muted-foreground">Receita vs custos</h2>
        <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <LineChart data={combinado}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="mes" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="receita" stroke="var(--color-primary)" strokeWidth={2.5} dot />
                <Line type="monotone" dataKey="custos" stroke="var(--color-destructive)" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-3 font-street text-sm font-black uppercase tracking-wider text-muted-foreground">Recebimentos mensais</h2>
        <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
          <div className="h-40 w-full">
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

      <PageSection className="pt-0">
        <h2 className="mb-3 font-street text-sm font-black uppercase tracking-wider text-muted-foreground">Por veículo</h2>
        <div className="flex flex-col gap-2">
          {financeiroPorVeiculo.map((f) => {
            const c = carros.find((x) => x.id === f.carroId);
            const lucroV = f.receita - f.custos;
            return (
              <div key={f.carroId} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{c ? `${c.marca} ${c.modelo}` : f.carroId}</div>
                  <div className="text-xs text-muted-foreground">
                    Receita {fmtBRL(f.receita)} · Custos {fmtBRL(f.custos)}
                  </div>
                </div>
                <div className={`font-street text-base font-black ${lucroV >= 0 ? "text-success" : "text-destructive"}`}>
                  {fmtBRL(lucroV)}
                </div>
              </div>
            );
          })}
        </div>
      </PageSection>
    </>
  );
}
