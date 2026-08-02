import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ShieldCheck, CheckCircle2, Navigation, Wrench, Car, Moon } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { HeaderMotorista } from "@/components/motorista/HeaderMotorista";
import { CardMeuNivel } from "@/components/motorista/CardMeuNivel";
import { ResumoDoDia } from "@/components/motorista/ResumoDoDia";
import { CardOperacao } from "@/components/motorista/CardOperacao";
import { CardMeuVeiculo } from "@/components/motorista/CardMeuVeiculo";
import { CardOportunidades } from "@/components/motorista/CardOportunidades";
import { ResumoFimDoDia } from "@/components/motorista/ResumoFimDoDia";
import { StatusMesStrip } from "@/components/nivel/StatusMesStrip";
import { progressoMock } from "@/lib/niveis";
import { useConect, checkinValido } from "@/lib/store";

export const Route = createFileRoute("/motorista/")({
  head: () => ({
    meta: [
      { title: "Início — Motorista | TCHI LÉVA" },
      { name: "description", content: "Seu nível, ganhos do dia, operação, veículo e oportunidades do ecossistema TCHI LÉVA." },
      { property: "og:title", content: "Início — Motorista | TCHI LÉVA" },
      { property: "og:description", content: "Ganhe mais, gaste menos e evolua de nível com a TCHI LÉVA." },
    ],
  }),
  component: Home,
});

function Home() {
  const checkin = useConect((s) => s.checkin);
  const status = useConect((s) => s.statusOperacao);
  const encerrarDia = useConect((s) => s.encerrarDia);
  const liberado = checkinValido(checkin);

  if (status === "fim_do_dia") {
    return (
      <PageSection>
        <ResumoFimDoDia />
      </PageSection>
    );
  }

  return (
    <>
      <PageSection>
        <HeaderMotorista />
      </PageSection>

      {!liberado && (
        <PageSection className="pt-0">
          <Link
            to="/motorista/checkin"
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-warning/40 bg-warning/5 p-4 shadow-card"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-warning/15 text-warning">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold">Faça o check-in do dia</div>
              <div className="text-xs text-muted-foreground">Selfie + 3 fotos do carro para liberar corridas.</div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-warning" />
          </Link>
        </PageSection>
      )}

      {liberado && (
        <PageSection className="pt-0">
          <Link
            to="/motorista/rodar"
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-success/40 bg-success/5 p-4 shadow-card"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-success/15 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold">Pronto para rodar</div>
              <div className="text-xs text-muted-foreground">Check-in aprovado. Abra o mapa e comece a receber corridas.</div>
            </div>
            <Navigation className="h-4 w-4 text-success" />
          </Link>
        </PageSection>
      )}

      <PageSection className="pt-0">
        <CardMeuNivel />
      </PageSection>

      <PageSection className="pt-0">
        <ResumoDoDia />
      </PageSection>

      <PageSection className="pt-0">
        <CardOperacao />
      </PageSection>

      <PageSection className="pt-0">
        <CardMeuVeiculo />
      </PageSection>

      <PageSection className="pt-0">
        <CardOportunidades />
      </PageSection>

      <PageSection className="pt-0">
        <StatusMesStrip progresso={progressoMock} />
      </PageSection>

      <PageSection className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          <QuickLink to="/motorista/orcamentos" icon={Wrench} label="Pedir orçamento" />
          <QuickLink to="/motorista/alugueis" icon={Car} label="Alugar um carro" />
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <button
          onClick={encerrarDia}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-bold uppercase tracking-wider text-muted-foreground shadow-card"
        >
          <Moon className="h-4 w-4" /> Encerrar o dia
        </button>
      </PageSection>
    </>
  );
}

function QuickLink({ to, icon: Icon, label }: { to: string; icon: typeof Wrench; label: string }) {
  return (
    <Link to={to} className="group flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40">
      <div className="flex items-center gap-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
    </Link>
  );
}
