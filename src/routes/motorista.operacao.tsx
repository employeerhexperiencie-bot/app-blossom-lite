import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Gauge, Wallet, Car, Wrench, CalendarClock, PiggyBank } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { FiltroBar } from "@/components/FiltroBar";
import { CardMeuVeiculo } from "@/components/motorista/CardMeuVeiculo";
import { custosDoDia, fmtBRL, historicoFinanceiro, operacaoDia, operacaoMes, veiculoDoMotorista } from "@/lib/mock-operacao";
import { fmtData } from "@/lib/mock-proprietario";

export const Route = createFileRoute("/motorista/operacao")({
  head: () => ({
    meta: [
      { title: "Minha Operação — Motorista | TCHI LÉVA" },
      { name: "description", content: "Ganhos, custos, lucro, rentabilidade e custo por quilômetro da sua operação." },
      { property: "og:title", content: "Minha Operação — Motorista | TCHI LÉVA" },
      { property: "og:description", content: "Administre seu trabalho: quanto entra, quanto sai e quanto sobra." },
    ],
  }),
  component: Operacao,
});

type Periodo = "dia" | "mes";

function Operacao() {
  const [periodo, setPeriodo] = useState<Periodo>("dia");
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState("recente");

  const dia = operacaoDia();
  const mes = operacaoMes();
  const atual = periodo === "dia" ? dia : mes;

  const veiculo = veiculoDoMotorista();

  const historico = useMemo(() => {
    let l = historicoFinanceiro.filter((h) => !busca || h.label.toLowerCase().includes(busca.toLowerCase()));
    if (ordem === "lucro") l = [...l].sort((a, b) => b.receita - b.custos - (a.receita - a.custos));
    if (ordem === "receita") l = [...l].sort((a, b) => b.receita - a.receita);
    return l;
  }, [busca, ordem]);

  const custos = periodo === "dia" ? custosDoDia() : mes.linhas;

  return (
    <>
      <PageSection>
        <div className="flex gap-2">
          {(["dia", "mes"] as Periodo[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`flex-1 rounded-xl border py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                periodo === p ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {p === "dia" ? "Hoje" : "Este mês"}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Kpi icon={Wallet} label="Ganhos" value={fmtBRL(atual.receita)} tint="text-foreground" />
          <Kpi icon={TrendingDown} label="Custos" value={fmtBRL(atual.custos)} tint="text-destructive" />
          <Kpi icon={TrendingUp} label="Lucro" value={fmtBRL(atual.lucro)} tint="text-success" />
          <Kpi icon={Gauge} label="Rentabilidade" value={`${Math.round(atual.margem * 100)}%`} tint="text-primary" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Kpi icon={Gauge} label="Custo por km" value={fmtBRL(atual.custoPorKm)} tint="text-foreground" />
          <Kpi icon={PiggyBank} label="Economia na taxa" value={fmtBRL(atual.economiaTaxa)} tint="text-success" />
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <Titulo title="Composição dos custos" />
        <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
          <div className="flex flex-col gap-2.5">
            {custos.map((c) => (
              <div key={c.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <div className="min-w-0">
                  <div className="truncate text-xs">{c.label}</div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${(c.valor / atual.custos) * 100}%`, background: c.cor }} />
                  </div>
                </div>
                <span className="font-display text-sm font-bold">{fmtBRL(c.valor)}</span>
              </div>
            ))}
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <Titulo title="Histórico financeiro" />
        <FiltroBar
          busca={busca}
          onBusca={setBusca}
          buscaPlaceholder="Buscar dia..."
          chips={[
            {
              key: "ordem",
              label: "Ordenar",
              value: ordem,
              onChange: setOrdem,
              options: [
                { value: "recente", label: "Mais recente" },
                { value: "lucro", label: "Maior lucro" },
                { value: "receita", label: "Maior receita" },
              ],
            },
          ]}
          ativos={ordem !== "recente" ? 1 : 0}
          onLimpar={() => { setOrdem("recente"); setBusca(""); }}
        />
        <div className="mt-3 flex flex-col gap-2">
          {historico.map((h) => {
            const lucro = h.receita - h.custos;
            return (
              <div key={h.data} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{h.label} · {fmtData(h.data)}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {h.corridas} corridas · ganhos {fmtBRL(h.receita)} · custos {fmtBRL(h.custos)}
                  </div>
                </div>
                <span className={`font-display text-base font-black ${lucro >= 0 ? "text-success" : "text-destructive"}`}>
                  {fmtBRL(lucro)}
                </span>
              </div>
            );
          })}
          {historico.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nenhum registro encontrado.
            </div>
          )}
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <Titulo title="Meu veículo" />
        <CardMeuVeiculo />
      </PageSection>

      {veiculo.alugado && veiculo.contrato && (
        <PageSection className="pt-0">
          <Titulo title="Contrato de locação" />
          <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
            <Linha icon={Car} label="Proprietário" valor={veiculo.proprietario} />
            <Linha
              icon={Wallet}
              label="Valor"
              valor={`${fmtBRL(veiculo.contrato.valor)} / ${veiculo.contrato.periodicidade}`}
            />
            <Linha icon={CalendarClock} label="Início" valor={fmtData(veiculo.contrato.inicio)} />
            <Linha icon={PiggyBank} label="Caução" valor={fmtBRL(veiculo.contrato.caucao)} />
            {veiculo.proximaManutencao && (
              <Linha
                icon={Wrench}
                label="Próxima manutenção"
                valor={`${veiculo.proximaManutencao.item}${veiculo.proximaDataManutencao ? ` · ${veiculo.proximaDataManutencao}` : ""}`}
              />
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/motorista/orcamentos" className="rounded-xl border border-border bg-muted py-2.5 text-center text-xs font-bold uppercase tracking-wider">
              Pedir orçamento
            </Link>
            <Link to="/motorista/alugueis" className="rounded-xl border border-border bg-muted py-2.5 text-center text-xs font-bold uppercase tracking-wider">
              Ver aluguéis
            </Link>
          </div>
        </PageSection>
      )}
    </>
  );
}

function Kpi({ icon: Icon, label, value, tint }: { icon: typeof Wallet; label: string; value: string; tint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className={`font-display text-lg font-black ${tint}`}>{value}</div>
    </div>
  );
}

function Linha({ icon: Icon, label, valor }: { icon: typeof Wallet; label: string; valor: string }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border/60 py-2 last:border-0">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="truncate text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-xs font-semibold">{valor}</span>
    </div>
  );
}

function Titulo({ title }: { title: string }) {
  return <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>;
}
