import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Banknote, Gift, Wrench, Car, TrendingUp, PiggyBank, ShieldCheck, Navigation, CheckCircle2 } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { ganhosDoDia, parceiros } from "@/lib/mock-data";
import { NivelHero } from "@/components/nivel/NivelHero";
import { StatusMesStrip } from "@/components/nivel/StatusMesStrip";
import { economiaMes, gastoMesEmTaxas, getNivelByViagens, progressoMock } from "@/lib/niveis";
import { useConect, checkinValido } from "@/lib/store";

export const Route = createFileRoute("/motorista/")({
  head: () => ({ meta: [{ title: "Início — Motorista | TCHI LÉVA" }] }),
  component: Home,
});

function Home() {
  const topParceiros = parceiros.slice(0, 3);
  const nivel = getNivelByViagens(progressoMock.viagensTotais);
  const economia = economiaMes(progressoMock.viagensMes, nivel.taxaFixa);
  const gasto = gastoMesEmTaxas(progressoMock.viagensMes, nivel.taxaFixa);
  const checkin = useConect((s) => s.checkin);
  const liberado = checkinValido(checkin);

  return (
    <>
      <PageSection>
        <Link
          to={liberado ? "/motorista/corridas" : "/motorista/checkin"}
          className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-4 shadow-card transition-colors ${
            liberado ? "border-success/40 bg-success/5" : "border-warning/40 bg-warning/5"
          }`}
        >
          <div className={`grid h-11 w-11 place-items-center rounded-xl ${liberado ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
            {liberado ? <CheckCircle2 className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <div className="font-semibold">{liberado ? "Pronto para rodar" : "Faça o check-in do dia"}</div>
            <div className="text-xs text-muted-foreground">
              {liberado ? "Check-in aprovado. Vá para Corridas." : "Selfie + 3 fotos do carro para liberar corridas."}
            </div>
          </div>
          {liberado ? <Navigation className="h-4 w-4 text-success" /> : <ArrowUpRight className="h-4 w-4 text-warning" />}
        </Link>
      </PageSection>

      <PageSection className="pt-0">
        <NivelHero viagens={progressoMock.viagensTotais} />
      </PageSection>

      <PageSection className="pt-0">
        <StatusMesStrip progresso={progressoMock} />
      </PageSection>

      <PageSection className="pt-0">
        <Link
          to="/motorista/jornada"
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-success/30 bg-success/5 p-4 shadow-card"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success">
            <PiggyBank className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Economia do mês vs Peregrino</div>
            <div className="font-display text-lg font-extrabold text-success">
              R$ {economia.toFixed(2).replace(".", ",")}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Você pagou R$ {gasto.toFixed(2).replace(".", ",")} em taxas em {progressoMock.viagensMes} viagens
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-success" />
        </Link>
      </PageSection>

      <PageSection className="pt-0">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs font-medium text-muted-foreground">Ganho líquido hoje</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold">R$ {ganhosDoDia.liquido.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">/ R$ {ganhosDoDia.bruto.toFixed(2)} bruto</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <Stat label="Corridas" value={ganhosDoDia.corridas} />
            <Stat label="Horas" value={`${ganhosDoDia.horas}h`} />
            <Stat label="Aluguel" value={`R$ ${ganhosDoDia.aluguelDoDia}`} />
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          <MiniCard icon={Gift} label="Cashback" value={`R$ ${ganhosDoDia.cashback.toFixed(2)}`} tint="success" />
          <MiniCard icon={TrendingUp} label="Esta semana" value="R$ 1.842" tint="primary" />
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <SectionHeader title="Acesso rápido" />
        <div className="grid grid-cols-2 gap-3">
          <QuickLink to="/motorista/orcamentos" icon={Wrench} label="Pedir orçamento" />
          <QuickLink to="/motorista/alugueis" icon={Car} label="Alugar um carro" />
        </div>
      </PageSection>

      <PageSection className="pt-2">
        <SectionHeader title="Parceiros perto de você" link="/motorista/beneficios" />
        <div className="flex flex-col gap-2.5">
          {topParceiros.map((p) => (
            <Link
              key={p.id}
              to="/motorista/beneficios/$parceiroId"
              params={{ parceiroId: p.id }}
              className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card transition-colors hover:border-primary/40"
            >
              <img src={p.foto} alt={p.nome} className="h-14 w-14 shrink-0 rounded-xl object-cover" loading="lazy" />
              <div className="min-w-0">
                <div className="truncate font-semibold">{p.nome}</div>
                <div className="truncate text-xs text-muted-foreground">{p.categoria} · {p.distanciaKm} km</div>
              </div>
              <div className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success">-{p.desconto}%</div>
            </Link>
          ))}
        </div>
      </PageSection>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-muted px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-base font-bold">{value}</div>
    </div>
  );
}

function MiniCard({ icon: Icon, label, value, tint }: { icon: typeof Banknote; label: string; value: string; tint: "success" | "primary" }) {
  const color = tint === "success" ? "text-success bg-success/15" : "text-primary bg-primary/10";
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
      <div className={`grid h-8 w-8 place-items-center rounded-lg ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-bold">{value}</div>
    </div>
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

function SectionHeader({ title, link }: { title: string; link?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
      {link ? <Link to={link} className="text-xs font-semibold text-primary">Ver todos</Link> : null}
    </div>
  );
}
