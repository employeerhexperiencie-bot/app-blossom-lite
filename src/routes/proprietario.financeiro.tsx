import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageSection } from "@/components/AppShell";
import { FiltroBar } from "@/components/FiltroBar";
import { fmtBRL, hojeISO } from "@/lib/mock-proprietario";
import { useCarros, useProprietario, useTodosEventos } from "@/lib/store-proprietario";
import { emAberto, financeiroDoCarro, serieMensal, ultimosMeses } from "@/lib/cobrancas";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export const Route = createFileRoute("/proprietario/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — TCHI LÉVA" }] }),
  component: Financeiro,
});

// Todos os números vêm do que está registrado: pagamentos recebidos (receita) e eventos com valor no Passaporte (custos).
function Financeiro() {
  const carros = useCarros();
  const contratos = useProprietario((s) => s.contratos);
  const pagamentos = useProprietario((s) => s.pagamentos);
  const eventos = useTodosEventos();
  const [periodo, setPeriodo] = useState<string>("6m");
  const [carroFiltro, setCarroFiltro] = useState<string>("todos");

  const meses = periodo === "3m" ? 3 : periodo === "12m" ? 12 : 6;
  const hoje = hojeISO();
  const listaMeses = ultimosMeses(hoje, meses);
  const intervalo = { de: `${listaMeses[0]}-01`, ate: hoje };

  const { pagFiltrados, evFiltrados } = useMemo(() => {
    if (carroFiltro === "todos") return { pagFiltrados: pagamentos, evFiltrados: eventos };
    const ids = new Set(contratos.filter((c) => c.carroId === carroFiltro).map((c) => c.id));
    return {
      pagFiltrados: pagamentos.filter((p) => ids.has(p.contratoId)),
      evFiltrados: eventos.filter((e) => e.carroId === carroFiltro),
    };
  }, [carroFiltro, contratos, pagamentos, eventos]);

  const combinado = serieMensal(pagFiltrados, evFiltrados, listaMeses);
  const receita = combinado.reduce((a, m) => a + m.receita, 0);
  const custos = combinado.reduce((a, m) => a + m.custos, 0);
  const lucro = receita - custos;
  const abertos = pagFiltrados.filter(emAberto);
  const emAtraso = abertos.filter((p) => p.status === "atrasado").reduce((a, p) => a + p.valor, 0);
  const aReceber = abertos.filter((p) => p.status === "pendente").reduce((a, p) => a + p.valor, 0);

  const finFiltrado = (
    carroFiltro === "todos" ? carros : carros.filter((c) => c.id === carroFiltro)
  )
    .map((c) => financeiroDoCarro(c.id, contratos, pagamentos, eventos, intervalo))
    .filter((f) => f.receita > 0 || f.custos > 0);
  const ativos = (periodo !== "6m" ? 1 : 0) + (carroFiltro !== "todos" ? 1 : 0);

  return (
    <>
      <PageSection>
        <div className="gradient-primary rounded-3xl p-5 text-primary-foreground shadow-glow">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">
            Resultado em {meses} meses
          </div>
          <div className="font-street text-4xl font-black">{fmtBRL(lucro)}</div>
          <div className="mt-2 flex gap-4 text-xs opacity-90">
            <span>Recebido {fmtBRL(receita)}</span>
            <span>Custos {fmtBRL(custos)}</span>
          </div>
          {(emAtraso > 0 || aReceber > 0) && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/20 pt-2 text-xs font-semibold">
              {aReceber > 0 && <span>A receber {fmtBRL(aReceber)}</span>}
              {emAtraso > 0 && <span>Em atraso {fmtBRL(emAtraso)}</span>}
            </div>
          )}
        </div>
        <div className="mt-4">
          <FiltroBar
            ativos={ativos}
            onLimpar={() => {
              setPeriodo("6m");
              setCarroFiltro("todos");
            }}
            chips={[
              {
                key: "pd",
                label: "Período",
                value: periodo,
                onChange: setPeriodo,
                options: [
                  { value: "3m", label: "3 meses" },
                  { value: "6m", label: "6 meses" },
                  { value: "12m", label: "12 meses" },
                ],
              },
              {
                key: "car",
                label: "Veículo",
                value: carroFiltro,
                onChange: setCarroFiltro,
                options: [
                  { value: "todos", label: "Todos" },
                  ...carros.map((c) => ({ value: c.id, label: `${c.marca} ${c.modelo}` })),
                ],
              },
            ]}
          />
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-3 font-street text-sm font-black uppercase tracking-wider text-muted-foreground">
          Receita vs custos
        </h2>
        <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <LineChart data={combinado}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis dataKey="mes" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="receita"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot
                />
                <Line
                  type="monotone"
                  dataKey="custos"
                  stroke="var(--color-destructive)"
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-3 font-street text-sm font-black uppercase tracking-wider text-muted-foreground">
          Recebimentos mensais
        </h2>
        <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
          <div className="h-40 w-full">
            <ResponsiveContainer>
              <BarChart data={combinado}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis dataKey="mes" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  cursor={{ fill: "var(--color-accent)" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }}
                />
                <Bar dataKey="receita" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-3 font-street text-sm font-black uppercase tracking-wider text-muted-foreground">
          Por veículo
        </h2>
        <div className="flex flex-col gap-2">
          {finFiltrado.map((f) => {
            const c = carros.find((x) => x.id === f.carroId);
            const lucroV = f.receita - f.custos;
            return (
              <Link
                to="/proprietario/frota/$carroId"
                params={{ carroId: f.carroId }}
                key={f.carroId}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card hover:border-primary/40"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold">
                    {c ? `${c.marca} ${c.modelo}` : f.carroId}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Receita {fmtBRL(f.receita)} · Custos {fmtBRL(f.custos)}
                  </div>
                </div>
                <div
                  className={`font-street text-base font-black ${lucroV >= 0 ? "text-success" : "text-destructive"}`}
                >
                  {fmtBRL(lucroV)}
                </div>
              </Link>
            );
          })}
        </div>
      </PageSection>
    </>
  );
}
