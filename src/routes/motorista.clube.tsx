import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Award, Crown, Lock, Sparkles, Store, Trophy, Medal, PiggyBank } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { NivelHero } from "@/components/nivel/NivelHero";
import { ManutencaoCard } from "@/components/nivel/ManutencaoCard";
import { RitmoSemanal } from "@/components/nivel/RitmoSemanal";
import { SimuladorProximoNivel } from "@/components/nivel/SimuladorProximoNivel";
import { TimelineNiveis } from "@/components/nivel/TimelineNiveis";
import { HistoricoNiveis } from "@/components/nivel/HistoricoNiveis";
import { MissaoCard } from "@/components/nivel/MissaoCard";
import { NivelBadge } from "@/components/nivel/NivelBadge";
import {
  getNivel,
  getNivelByViagens,
  getProximoNivel,
  economiaMes,
  missoesMock,
  conquistasMock,
  progressoMock,
} from "@/lib/niveis";
import { rankingMock } from "@/lib/mock-operacao";
import { parceiros, lojas } from "@/lib/mock-data";

export const Route = createFileRoute("/motorista/clube")({
  head: () => ({
    meta: [
      { title: "Clube TCHI LÉVA — Motorista" },
      { name: "description", content: "Níveis, benefícios, parceiros, missões, ranking e conquistas do Clube TCHI LÉVA." },
      { property: "og:title", content: "Clube TCHI LÉVA — Motorista" },
      { property: "og:description", content: "Evolua de nível, pague menos taxa e aproveite os parceiros do Grajaú." },
    ],
  }),
  component: Clube,
});

const abas = [
  { key: "nivel", label: "Meu nível" },
  { key: "beneficios", label: "Benefícios" },
  { key: "parceiros", label: "Parceiros" },
  { key: "missoes", label: "Missões" },
  { key: "ranking", label: "Ranking" },
  { key: "conquistas", label: "Conquistas" },
] as const;

type Aba = (typeof abas)[number]["key"];

function Clube() {
  const [aba, setAba] = useState<Aba>("nivel");
  const nivel = getNivelByViagens(progressoMock.viagensTotais);
  const proximo = getProximoNivel(nivel.key);
  const economia = economiaMes(progressoMock.viagensMes, nivel.taxaFixa);

  return (
    <>
      <PageSection>
        <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            <h1 className="font-street text-xl font-black uppercase leading-none">Clube TCHI LÉVA</h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Quanto mais você roda, menos taxa você paga e mais benefícios desbloqueia na quebrada.
          </p>
          <div className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl bg-success/10 p-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-success/20 text-success">
              <PiggyBank className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-muted-foreground">Economia obtida no mês</div>
              <div className="font-display text-lg font-black text-success">R$ {economia.toFixed(2).replace(".", ",")}</div>
            </div>
          </div>
        </div>

        <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
          {abas.map((a) => (
            <button
              key={a.key}
              onClick={() => setAba(a.key)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                aba === a.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </PageSection>

      {aba === "nivel" && (
        <>
          <PageSection className="pt-0"><NivelHero viagens={progressoMock.viagensTotais} /></PageSection>
          <PageSection className="pt-0"><ManutencaoCard progresso={progressoMock} /></PageSection>
          <PageSection className="pt-0"><RitmoSemanal progresso={progressoMock} /></PageSection>
          <PageSection className="pt-0"><SimuladorProximoNivel progresso={progressoMock} /></PageSection>
          <PageSection className="pt-0">
            <Titulo icon={Award} title="Sua trajetória" />
            <TimelineNiveis atual={nivel.key} />
          </PageSection>
          <PageSection className="pt-0">
            <Titulo icon={Trophy} title="Histórico de níveis" />
            <HistoricoNiveis progresso={progressoMock} />
          </PageSection>
        </>
      )}

      {aba === "beneficios" && (
        <>
          <PageSection className="pt-0">
            <Titulo icon={Sparkles} title={`Benefícios ativos · ${nivel.nome}`} />
            <ul className="flex flex-col gap-2">
              {nivel.beneficios.map((b) => (
                <li key={b} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
                  <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ backgroundImage: nivel.gradient }}>
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="min-w-0 text-sm">{b}</span>
                </li>
              ))}
            </ul>
          </PageSection>

          {proximo && (
            <PageSection className="pt-0">
              <Titulo icon={Lock} title={`Desbloqueia no ${proximo.nome}`} />
              <ul className="flex flex-col gap-2">
                {proximo.beneficios.map((b) => (
                  <li key={b} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 p-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </div>
                    <span className="min-w-0 text-sm text-muted-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            </PageSection>
          )}
        </>
      )}

      {aba === "parceiros" && (
        <>
          <PageSection className="pt-0">
            <Titulo icon={Store} title="Oficinas e serviços" />
            <div className="flex flex-col gap-2">
              {parceiros.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  to="/motorista/beneficios/$parceiroId"
                  params={{ parceiroId: p.id }}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
                >
                  <img src={p.foto} alt={p.nome} className="h-12 w-12 shrink-0 rounded-xl object-cover" loading="lazy" />
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{p.nome}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.categoria} · {p.distanciaKm} km</div>
                  </div>
                  <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success">-{p.desconto}%</span>
                </Link>
              ))}
            </div>
            <Link to="/motorista/beneficios" className="mt-3 block rounded-xl border border-border bg-muted py-2.5 text-center text-xs font-bold uppercase tracking-wider">
              Ver todos os parceiros
            </Link>
          </PageSection>

          <PageSection className="pt-0">
            <Titulo icon={Store} title="Cashback no bairro" />
            <div className="flex flex-col gap-2">
              {lojas.map((l) => (
                <div key={l.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{l.nome}</div>
                    <div className="truncate text-xs text-muted-foreground">{l.categoria} · {l.distanciaKm} km</div>
                  </div>
                  <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">{l.cashback}%</span>
                </div>
              ))}
            </div>
          </PageSection>
        </>
      )}

      {aba === "missoes" && (
        <PageSection className="pt-0">
          <Titulo icon={Trophy} title="Missões da semana" />
          <div className="flex flex-col gap-3">
            {missoesMock.map((m) => <MissaoCard key={m.id} m={m} />)}
          </div>
        </PageSection>
      )}

      {aba === "ranking" && (
        <PageSection className="pt-0">
          <Titulo icon={Medal} title="Ranking do Grajaú · viagens no mês" />
          <div className="flex flex-col gap-2">
            {rankingMock.map((r) => {
              const n = getNivel(r.nivel);
              return (
                <div
                  key={r.pos}
                  className={`grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-3 shadow-card ${
                    r.voce ? "border-primary/50 bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <span className="font-display text-lg font-black text-muted-foreground">{r.pos}º</span>
                  <img src={n.ilustracao} alt={n.nome} className="h-9 w-9 shrink-0 rounded-full object-cover" loading="lazy" />
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{r.nome}{r.voce ? " (você)" : ""}</div>
                    <div className="text-xs text-muted-foreground">{r.viagens} viagens</div>
                  </div>
                  <NivelBadge nivel={n} size="sm" />
                </div>
              );
            })}
          </div>
        </PageSection>
      )}

      {aba === "conquistas" && (
        <PageSection className="pt-0">
          <Titulo icon={Award} title="Conquistas" />
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
      )}
    </>
  );
}

function Titulo({ icon: Icon, title }: { icon: typeof Trophy; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
    </div>
  );
}
