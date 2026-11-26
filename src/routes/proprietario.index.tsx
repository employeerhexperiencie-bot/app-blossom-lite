import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Plus,
  Car,
  FileText,
  Banknote,
  Users,
  AlertTriangle,
  TrendingUp,
  Wrench,
  FileWarning,
  Store,
  Gauge,
} from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { fmtBRL, hojeISO } from "@/lib/mock-proprietario";
import { useProprietario, useCarros, useTodosEventos } from "@/lib/store-proprietario";
import { emAberto, serieMensal } from "@/lib/cobrancas";

export const Route = createFileRoute("/proprietario/")({
  head: () => ({ meta: [{ title: "Dashboard — Proprietário TCHI LÉVA" }] }),
  component: Dashboard,
});

function Dashboard() {
  const carros = useCarros();
  const notificacoes = useProprietario((s) => s.notificacoes);
  const lidas = useProprietario((s) => s.notificacoesLidas);
  const alertas = notificacoes.filter((n) => !lidas.includes(n.id));

  const totais = {
    total: carros.length,
    alugados: carros.filter((c) => c.status === "alugado").length,
    disponiveis: carros.filter((c) => c.status === "disponivel").length,
    manutencao: carros.filter((c) => c.status === "manutencao").length,
  };

  // Resultado do mês corrente: o que foi recebido menos os custos lançados, com base no que está registrado.
  const pagamentos = useProprietario((s) => s.pagamentos);
  const eventos = useTodosEventos();
  const [{ receita, custos }] = serieMensal(pagamentos, eventos, [hojeISO().slice(0, 7)]);
  const lucro = receita - custos;
  const abertos = pagamentos.filter(emAberto);
  const emAtraso = abertos.filter((p) => p.status === "atrasado").reduce((a, p) => a + p.valor, 0);
  const aReceberHoje = abertos
    .filter((p) => p.status === "pendente")
    .reduce((a, p) => a + p.valor, 0);

  return (
    <>
      <PageSection>
        <div className="mt-1 grid grid-cols-4 gap-2">
          <Kpi label="Total" value={totais.total} />
          <Kpi label="Alugados" value={totais.alugados} tone="primary" />
          <Kpi label="Livres" value={totais.disponiveis} tone="success" />
          <Kpi label="Manut." value={totais.manutencao} tone="warning" />
        </div>

        <div className="gradient-primary mt-4 rounded-3xl p-5 text-primary-foreground shadow-glow">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">
            Resultado do mês
          </div>
          <div className="font-street text-4xl font-black">{fmtBRL(lucro)}</div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-90">
            <span>Recebido {fmtBRL(receita)}</span>
            <span>Custos {fmtBRL(custos)}</span>
          </div>
          {(emAtraso > 0 || aReceberHoje > 0) && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/20 pt-2 text-xs font-semibold">
              {aReceberHoje > 0 && <span>A receber hoje {fmtBRL(aReceberHoje)}</span>}
              {emAtraso > 0 && <span>Em atraso {fmtBRL(emAtraso)}</span>}
            </div>
          )}
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-3 font-street text-sm font-black uppercase tracking-wider text-muted-foreground">
          Alertas
        </h2>
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
                <span
                  className={`grid h-9 w-9 place-items-center rounded-xl ${toneOf(a.urgencia)}`}
                >
                  {a.tipo === "pagamento" ? (
                    <Banknote className="h-4 w-4" />
                  ) : a.tipo === "manutencao" ? (
                    <Wrench className="h-4 w-4" />
                  ) : a.tipo === "documento" ? (
                    <FileWarning className="h-4 w-4" />
                  ) : a.tipo === "km" ? (
                    <Gauge className="h-4 w-4" />
                  ) : a.tipo === "solicitacao" ? (
                    <FileText className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{a.titulo}</div>
                  <div className="truncate text-xs text-muted-foreground">{a.descricao}</div>
                </div>
                <span className="text-[10px] uppercase text-muted-foreground">{a.data}</span>
              </Link>
            ))}
            {alertas.length > 4 && (
              <Link
                to="/proprietario/notificacoes"
                className="text-center text-xs font-semibold text-primary underline"
              >
                Ver todos ({alertas.length})
              </Link>
            )}
          </div>
        )}
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-3 font-street text-sm font-black uppercase tracking-wider text-muted-foreground">
          Ecossistema
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Shortcut to="/proprietario/frota/novo" icon={Plus} label="Cadastrar carro" />
          <Shortcut to="/proprietario/contratos/novo" icon={FileText} label="Novo contrato" />
          <Shortcut to="/proprietario/marketplace" icon={Store} label="Marketplace" />
          <Shortcut to="/proprietario/frota" icon={Car} label="Ver frota" />
          <Shortcut to="/proprietario/motoristas" icon={Users} label="Motoristas" />
          <Shortcut to="/proprietario/agenda" icon={AlertTriangle} label="Agenda" />
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

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "primary" | "success" | "warning";
}) {
  const cls =
    tone === "primary"
      ? "text-primary"
      : tone === "success"
        ? "text-success"
        : tone === "warning"
          ? "text-warning-foreground"
          : "";
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
