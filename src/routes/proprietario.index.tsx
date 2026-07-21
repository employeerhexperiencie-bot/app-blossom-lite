import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Car, FileText, Banknote, Users, AlertTriangle, TrendingUp, Wrench, FileWarning } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { carros } from "@/lib/mock-data";
import { financeiroPorVeiculo, fmtBRL } from "@/lib/mock-proprietario";
import { useProprietario } from "@/lib/store-proprietario";

export const Route = createFileRoute("/proprietario/")({
  head: () => ({ meta: [{ title: "Dashboard — Proprietário TCHI LÉVA" }] }),
  component: Dashboard,
});

function Dashboard() {
  const notificacoes = useProprietario((s) => s.notificacoes);
  const lidas = useProprietario((s) => s.notificacoesLidas);
  const alertas = notificacoes.filter((n) => !lidas.includes(n.id));

  const totais = {
    total: carros.length,
    alugados: carros.filter((c) => c.status === "alugado").length,
    disponiveis: carros.filter((c) => c.status === "disponivel").length,
    manutencao: carros.filter((c) => c.status === "manutencao").length,
  };

  const receita = financeiroPorVeiculo.reduce((a, b) => a + b.receita, 0);
  const custos = financeiroPorVeiculo.reduce((a, b) => a + b.custos, 0);
  const lucro = receita - custos;

  return (
    <>
      <PageSection>
        <div className="gradient-primary rounded-3xl p-5 text-primary-foreground shadow-glow">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">Lucro estimado do mês</div>
          <div className="font-street text-4xl font-black">{fmtBRL(lucro)}</div>
          <div className="mt-2 flex gap-4 text-xs opacity-90">
            <span>Receita {fmtBRL(receita)}</span>
            <span>Custos {fmtBRL(custos)}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <Kpi label="Total" value={totais.total} />
          <Kpi label="Alugados" value={totais.alugados} tone="primary" />
          <Kpi label="Livres" value={totais.disponiveis} tone="success" />
          <Kpi label="Manut." value={totais.manutencao} tone="warning" />
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-3 font-street text-sm font-black uppercase tracking-wider text-muted-foreground">Alertas</h2>
        {alertas.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            Nenhum alerta pendente. Bom trabalho!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {alertas.slice(0, 4).map((a) => (
              <Link
                key={a.id}
                to="/proprietario/notificacoes"
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
              >
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${toneOf(a.urgencia)}`}>
                  {a.tipo === "pagamento" ? <Banknote className="h-4 w-4" /> :
                   a.tipo === "manutencao" ? <Wrench className="h-4 w-4" /> :
                   a.tipo === "documento" ? <FileWarning className="h-4 w-4" /> :
                   <AlertTriangle className="h-4 w-4" />}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{a.titulo}</div>
                  <div className="truncate text-xs text-muted-foreground">{a.descricao}</div>
                </div>
                <span className="text-[10px] uppercase text-muted-foreground">{a.data}</span>
              </Link>
            ))}
            {alertas.length > 4 && (
              <Link to="/proprietario/notificacoes" className="text-center text-xs font-semibold text-primary underline">
                Ver todos ({alertas.length})
              </Link>
            )}
          </div>
        )}
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-3 font-street text-sm font-black uppercase tracking-wider text-muted-foreground">Atalhos</h2>
        <div className="grid grid-cols-2 gap-2">
          <Shortcut to="/proprietario/frota/novo" icon={Plus} label="Cadastrar carro" />
          <Shortcut to="/proprietario/contratos/novo" icon={FileText} label="Novo contrato" />
          <Shortcut to="/proprietario/frota" icon={Car} label="Ver frota" />
          <Shortcut to="/proprietario/motoristas" icon={Users} label="Motoristas" />
        </div>
        <Link to="/proprietario/financeiro">
          <Button variant="outline" className="mt-3 w-full rounded-xl">
            <TrendingUp className="mr-2 h-4 w-4" /> Ver relatório financeiro
          </Button>
        </Link>
      </PageSection>
    </>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: "primary" | "success" | "warning" }) {
  const cls =
    tone === "primary" ? "text-primary" :
    tone === "success" ? "text-success" :
    tone === "warning" ? "text-warning-foreground" : "";
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-card">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-street text-2xl font-black ${cls}`}>{value}</div>
    </div>
  );
}

function Shortcut({ to, icon: Icon, label }: { to: string; icon: typeof Plus; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card hover:border-primary/40"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}

function toneOf(u: "alta" | "media" | "baixa") {
  if (u === "alta") return "bg-destructive/15 text-destructive";
  if (u === "media") return "bg-warning/20 text-warning-foreground";
  return "bg-muted text-muted-foreground";
}
