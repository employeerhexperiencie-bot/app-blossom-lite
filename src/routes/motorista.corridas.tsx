import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Clock, MapPin, ShieldAlert, Star } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { corridasDisponiveis } from "@/lib/mock-data";
import { useConect, checkinValido } from "@/lib/store";

export const Route = createFileRoute("/motorista/corridas")({
  head: () => ({ meta: [{ title: "Corridas — Motorista | TCHI LÉVA" }] }),
  component: Corridas,
});

function Corridas() {
  const navigate = useNavigate();
  const checkin = useConect((s) => s.checkin);
  const corridaAtivaId = useConect((s) => s.corridaAtivaId);
  const aceitar = useConect((s) => s.aceitarCorrida);
  const feitas = useConect((s) => s.corridasFeitasHoje);
  const valido = checkinValido(checkin);

  if (!valido) {
    return (
      <PageSection>
        <div className="rounded-2xl border border-warning/40 bg-warning/5 p-5 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-warning/15 text-warning">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-bold">Check-in necessário</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Você precisa concluir o check-in do dia para receber corridas.
          </p>
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

  const disponiveis = corridasDisponiveis.filter((c) => !feitas.includes(c.id));

  return (
    <>
      <PageSection>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-bold">Corridas próximas</h1>
            <p className="text-xs text-muted-foreground">{disponiveis.length} pedidos aguardando</p>
          </div>
          <div className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
            {feitas.length} feitas hoje
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-2">
        <div className="flex flex-col gap-3">
          {disponiveis.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              Sem corridas no momento. Aguarde alguns instantes.
            </div>
          )}
          {disponiveis.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-muted-foreground">
                  {c.distanciaKm} km · {c.tempoMin} min · {c.formaPagamento}
                </div>
                <div className="font-display text-xl font-extrabold text-primary">
                  R$ {c.valor.toFixed(2)}
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <div className="min-w-0 text-sm">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Origem</div>
                    <div className="truncate">{c.origem}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <div className="min-w-0 text-sm">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Destino</div>
                    <div className="truncate">{c.destino}</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-2 text-xs">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-accent text-[11px] font-bold">
                    {c.passageiro.charAt(0)}
                  </div>
                  <span className="font-medium">{c.passageiro}</span>
                  <span className="inline-flex items-center gap-0.5 text-muted-foreground">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    {c.passageiroRating}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" /> Pular
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      aceitar(c.id);
                      navigate({ to: "/motorista/corridas/$id", params: { id: c.id } });
                    }}
                    className="rounded-xl gradient-primary text-primary-foreground"
                  >
                    Aceitar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageSection>
    </>
  );
}
