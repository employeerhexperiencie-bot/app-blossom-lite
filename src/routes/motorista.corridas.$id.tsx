import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, MapPin, Navigation, Phone, ShieldAlert, X } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { corridasDisponiveis } from "@/lib/mock-data";
import { useConect } from "@/lib/store";
import { getNivelByViagens, progressoMock } from "@/lib/niveis";

export const Route = createFileRoute("/motorista/corridas/$id")({
  head: () => ({ meta: [{ title: "Corrida em andamento — Conect" }] }),
  component: CorridaDetalhe,
  notFoundComponent: () => (
    <PageSection>
      <p className="text-sm text-muted-foreground">Corrida não encontrada.</p>
    </PageSection>
  ),
});

type Fase = "a-caminho" | "em-corrida" | "finalizada";

function CorridaDetalhe() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const corrida = corridasDisponiveis.find((c) => c.id === id);
  const finalizar = useConect((s) => s.finalizarCorrida);
  const cancelar = useConect((s) => s.cancelarCorrida);
  const [fase, setFase] = useState<Fase>("a-caminho");

  if (!corrida) {
    return (
      <PageSection>
        <p className="text-sm text-muted-foreground">Corrida não encontrada.</p>
        <Button asChild className="mt-3"><Link to="/motorista/corridas">Voltar</Link></Button>
      </PageSection>
    );
  }

  const nivel = getNivelByViagens(progressoMock.viagensTotais);
  const taxa = nivel.taxaFixa;
  const liquido = corrida.valor - taxa;

  if (fase === "finalizada") {
    return (
      <PageSection>
        <div className="rounded-2xl border border-success/40 bg-success/10 p-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-success/20 text-success">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="font-display text-xl font-bold">Corrida finalizada</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pagamento confirmado.</p>

          <div className="mt-5 rounded-xl border border-border bg-card p-4 text-left">
            <Linha label="Valor da corrida" value={`R$ ${corrida.valor.toFixed(2)}`} />
            <Linha label={`Taxa Conect (${nivel.nome})`} value={`- R$ ${taxa.toFixed(2)}`} />
            <div className="my-2 border-t border-dashed border-border" />
            <Linha label="Você recebeu" value={`R$ ${liquido.toFixed(2)}`} bold />
          </div>

          <div className="mt-5 flex gap-2">
            <Button asChild variant="outline" className="flex-1 rounded-xl">
              <Link to="/motorista">Voltar à home</Link>
            </Button>
            <Button asChild className="flex-1 rounded-xl gradient-primary text-primary-foreground">
              <Link to="/motorista/corridas">Próxima corrida</Link>
            </Button>
          </div>
        </div>
      </PageSection>
    );
  }

  return (
    <>
      <PageSection>
        <div className="relative grid h-44 place-items-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-accent to-success/10">
          <Navigation className="h-12 w-12 text-primary/60" />
          <span className="absolute bottom-3 left-3 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold shadow-card">
            {fase === "a-caminho" ? "A caminho do passageiro" : "Levando passageiro"}
          </span>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-accent font-bold">
                {corrida.passageiro.charAt(0)}
              </div>
              <div>
                <div className="font-semibold">{corrida.passageiro}</div>
                <div className="text-xs text-muted-foreground">⭐ {corrida.passageiroRating}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" className="rounded-xl"><Phone className="h-4 w-4" /></Button>
              <Button size="icon" variant="outline" className="rounded-xl border-destructive/40 text-destructive">
                <ShieldAlert className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Ponto cor="text-success" label="Origem" texto={corrida.origem} />
            <Ponto cor="text-destructive" label="Destino" texto={corrida.destino} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <Mini label="Distância" value={`${corrida.distanciaKm} km`} />
            <Mini label="Tempo" value={`${corrida.tempoMin} min`} />
            <Mini label="Valor" value={`R$ ${corrida.valor.toFixed(2)}`} />
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        {fase === "a-caminho" ? (
          <Button
            onClick={() => setFase("em-corrida")}
            size="lg"
            className="w-full rounded-xl gradient-primary text-primary-foreground shadow-glow"
          >
            Cheguei — Iniciar corrida
          </Button>
        ) : (
          <Button
            onClick={() => {
              finalizar(corrida.id);
              setFase("finalizada");
            }}
            size="lg"
            className="w-full rounded-xl bg-success text-success-foreground shadow-glow"
          >
            Finalizar corrida
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full text-muted-foreground"
          onClick={() => { cancelar(); navigate({ to: "/motorista/corridas" }); }}
        >
          <X className="mr-1 h-4 w-4" /> Cancelar corrida
        </Button>
      </PageSection>
    </>
  );
}

function Ponto({ cor, label, texto }: { cor: string; label: string; texto: string }) {
  return (
    <div className="flex items-start gap-2">
      <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${cor}`} />
      <div className="min-w-0 text-sm">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate">{texto}</div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-sm font-bold">{value}</div>
    </div>
  );
}

function Linha({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-display text-base font-extrabold" : "font-semibold"}>{value}</span>
    </div>
  );
}
