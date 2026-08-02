import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Clock, MapPin, Power, ShieldAlert, Star, Flame, Moon } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { MapaMock } from "@/components/motorista/MapaMock";
import { corridasDisponiveis, parceiros } from "@/lib/mock-data";
import { areasDemanda, metaDiaria, resumoDia, fmtBRL } from "@/lib/mock-operacao";
import { useConect, checkinValido } from "@/lib/store";

export const Route = createFileRoute("/motorista/rodar")({
  head: () => ({
    meta: [
      { title: "Rodar — Motorista | TCHI LÉVA" },
      { name: "description", content: "Mapa de demanda, corridas disponíveis e benefícios próximos enquanto você roda." },
      { property: "og:title", content: "Rodar — Motorista | TCHI LÉVA" },
      { property: "og:description", content: "Fique online, veja áreas de alta demanda e aceite corridas." },
    ],
  }),
  component: Rodar,
});

function Rodar() {
  const navigate = useNavigate();
  const checkin = useConect((s) => s.checkin);
  const status = useConect((s) => s.statusOperacao);
  const corridaAtivaId = useConect((s) => s.corridaAtivaId);
  const aceitar = useConect((s) => s.aceitarCorrida);
  const feitas = useConect((s) => s.corridasFeitasHoje);
  const ficarOnline = useConect((s) => s.ficarOnline);
  const ficarOffline = useConect((s) => s.ficarOffline);
  const encerrarDia = useConect((s) => s.encerrarDia);
  const valido = checkinValido(checkin);

  if (!valido) {
    return (
      <PageSection>
        <div className="rounded-2xl border border-warning/40 bg-warning/5 p-5 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-warning/15 text-warning">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-bold">Check-in necessário</h2>
          <p className="mt-1 text-sm text-muted-foreground">Conclua o check-in do dia para ficar online.</p>
          <Button asChild className="mt-4 rounded-xl gradient-primary text-primary-foreground shadow-glow">
            <Link to="/motorista/checkin">Fazer check-in</Link>
          </Button>
        </div>
      </PageSection>
    );
  }

  if (corridaAtivaId) {
    return (
      <PageSection>
        <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5 text-center">
          <h2 className="font-display text-lg font-bold">Corrida em andamento</h2>
          <p className="mt-1 text-sm text-muted-foreground">Você tem uma corrida ativa.</p>
          <Button
            onClick={() => navigate({ to: "/motorista/corridas/$id", params: { id: corridaAtivaId } })}
            className="mt-4 rounded-xl gradient-primary text-primary-foreground shadow-glow"
          >
            Voltar para corrida
          </Button>
        </div>
      </PageSection>
    );
  }

  const online = status === "online";
  const disponiveis = corridasDisponiveis.filter((c) => !feitas.includes(c.id));
  const corridas = resumoDia.corridas + feitas.length;
  const pctMeta = Math.min(1, resumoDia.ganhosBrutos / metaDiaria.ganhos);
  const perto = [...parceiros].sort((a, b) => a.distanciaKm - b.distanciaKm).slice(0, 3);

  return (
    <>
      <PageSection>
        <div className="relative">
          <MapaMock className={online ? "h-[62vh]" : "h-56"} />

          <div className="absolute inset-x-3 top-3 grid grid-cols-3 gap-2">
            <Faixa label="Ganhos" value={fmtBRL(resumoDia.ganhosBrutos)} />
            <Faixa label="Corridas" value={String(corridas)} />
            <Faixa label="Meta" value={`${Math.round(pctMeta * 100)}%`} />
          </div>

          <div className="absolute inset-x-3 bottom-3">
            <button
              onClick={() => (online ? ficarOffline() : ficarOnline())}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black uppercase tracking-wider shadow-glow ${
                online ? "border border-border bg-card text-foreground" : "gradient-primary text-primary-foreground"
              }`}
            >
              <Power className="h-4 w-4" />
              {online ? "Ficar offline" : "Ficar online"}
            </button>
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <SectionTitle title="Áreas de demanda" />
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {areasDemanda.map((a) => (
            <div
              key={a.id}
              className={`shrink-0 rounded-2xl border px-3 py-2 ${
                a.nivel === "alta" ? "border-primary/40 bg-primary/10" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Flame className={`h-3.5 w-3.5 ${a.nivel === "alta" ? "text-primary" : "text-warning"}`} />
                {a.nome}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {a.nivel === "alta" ? "Alta demanda" : "Demanda média"} · {a.multiplicador.toFixed(1).replace(".", ",")}x
              </div>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection className="pt-2">
        <SectionTitle title="Benefícios próximos" />
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {perto.map((p) => (
            <Link
              key={p.id}
              to="/motorista/beneficios/$parceiroId"
              params={{ parceiroId: p.id }}
              className="w-44 shrink-0 rounded-2xl border border-border bg-card p-3 shadow-card"
            >
              <div className="truncate text-sm font-semibold">{p.nome}</div>
              <div className="truncate text-[11px] text-muted-foreground">{p.categoria} · {p.distanciaKm} km</div>
              <span className="mt-1.5 inline-block rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success">
                -{p.desconto}%
              </span>
            </Link>
          ))}
        </div>
      </PageSection>

      <PageSection className="pt-2">
        <SectionTitle title="Corridas disponíveis" />
        <div className="flex flex-col gap-3">
          {disponiveis.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-semibold">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> <span className="truncate">{c.origem}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> <span className="truncate">{c.destino}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-display text-lg font-black">R$ {c.valor.toFixed(2)}</div>
                  <div className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                    <Star className="h-3 w-3 fill-warning text-warning" /> {c.passageiroRating}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {c.tempoMin} min</span>
                <span>{c.distanciaKm} km</span>
                <span>{c.formaPagamento}</span>
              </div>
              <Button
                onClick={() => {
                  aceitar(c.id);
                  navigate({ to: "/motorista/corridas/$id", params: { id: c.id } });
                }}
                className="mt-3 w-full rounded-xl gradient-primary text-primary-foreground shadow-glow"
              >
                Aceitar corrida
              </Button>
            </div>
          ))}
          {disponiveis.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Sem corridas por enquanto. Fique online e aguarde.
            </div>
          )}
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

function Faixa({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/85 px-2.5 py-1.5 backdrop-blur">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-sm font-black">{value}</div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>;
}
