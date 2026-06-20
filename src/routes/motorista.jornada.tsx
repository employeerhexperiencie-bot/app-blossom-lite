import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Award, ShieldCheck, History, Activity, Calculator } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { NivelHero } from "@/components/nivel/NivelHero";
import { MissaoCard } from "@/components/nivel/MissaoCard";
import { TimelineNiveis } from "@/components/nivel/TimelineNiveis";
import { NivelBadge } from "@/components/nivel/NivelBadge";
import { ManutencaoCard } from "@/components/nivel/ManutencaoCard";
import { HistoricoNiveis } from "@/components/nivel/HistoricoNiveis";
import { RitmoSemanal } from "@/components/nivel/RitmoSemanal";
import { SimuladorProximoNivel } from "@/components/nivel/SimuladorProximoNivel";
import { getNivel, getNivelByViagens, missoesMock, conquistasMock, progressoMock } from "@/lib/niveis";

export const Route = createFileRoute("/motorista/jornada")({
  head: () => ({
    meta: [
      { title: "Minha Jornada — Conect" },
      { name: "description", content: "Acompanhe seu nível, taxa por viagem, missões e conquistas no Clube do Motorista Conect." },
    ],
  }),
  component: Jornada,
});

function Jornada() {
  const nivelAtual = getNivelByViagens(progressoMock.viagensTotais);

  return (
    <>
      <PageSection>
        <NivelHero viagens={progressoMock.viagensTotais} />
      </PageSection>

      <PageSection className="pt-0">
        <SectionHeader icon={ShieldCheck} title="Status do mês" />
        <ManutencaoCard progresso={progressoMock} />
      </PageSection>

      <PageSection className="pt-0">
        <SectionHeader icon={Activity} title="Seu ritmo" />
        <RitmoSemanal progresso={progressoMock} />
      </PageSection>

      <PageSection className="pt-0">
        <SectionHeader icon={Calculator} title="E se eu acelerar?" />
        <SimuladorProximoNivel progresso={progressoMock} />
      </PageSection>

      <PageSection className="pt-0">
        <SectionHeader icon={Trophy} title="Missões da semana" />
        <div className="flex flex-col gap-3">
          {missoesMock.map((m) => <MissaoCard key={m.id} m={m} />)}
        </div>
      </PageSection>

      <PageSection className="pt-2">
        <SectionHeader icon={Award} title="Sua trajetória" />
        <TimelineNiveis atual={nivelAtual.key} />
      </PageSection>

      <PageSection className="pt-0">
        <SectionHeader icon={History} title="Histórico de níveis" />
        <HistoricoNiveis progresso={progressoMock} />
      </PageSection>

      <PageSection className="pt-0">
        <SectionHeader icon={Award} title="Conquistas" />
        <div className="flex flex-col gap-2">
          {conquistasMock.map((c) => {
            const n = getNivel(c.nivel);
            return (
              <div key={c.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ backgroundImage: n.gradient }}>
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{c.titulo}</div>
                  <div className="text-xs text-muted-foreground">{c.data}</div>
                </div>
                <NivelBadge nivel={n} size="sm" />
              </div>
            );
          })}
        </div>
      </PageSection>
    </>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: typeof Trophy; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
    </div>
  );
}
