import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { carros } from "@/lib/mock-data";

export const Route = createFileRoute("/proprietario/frota/$carroId")({
  loader: ({ params }) => {
    const c = carros.find((x) => x.id === params.carroId);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.modelo} — TCHI LÉVA` : "Carro" }],
  }),
  component: Detalhe,
  notFoundComponent: () => <div className="p-10 text-center text-muted-foreground">Carro não encontrado.</div>,
});

const propostasMock = [
  { id: "pr1", motorista: "Marcos Lima", valor: 110, duracao: "30 dias" },
  { id: "pr2", motorista: "Patrícia Souza", valor: 125, duracao: "60 dias" },
];

function Detalhe() {
  const c = Route.useLoaderData();
  return (
    <div className="mx-auto min-h-screen max-w-screen-sm bg-background pb-10">
      <div className="relative h-56">
        <img src={c.foto} alt={c.modelo} className="h-full w-full object-cover" />
        <Link to="/proprietario" className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-card/90 shadow-soft backdrop-blur">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="px-5 pt-5">
        <h1 className="font-display text-2xl font-bold">{c.marca} {c.modelo} {c.ano}</h1>
        <p className="text-sm text-muted-foreground">Placa {c.placa} · {c.km.toLocaleString("pt-BR")} km</p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Box label="Diária" value={`R$ ${c.diaria}`} />
          <Box label="Mensal" value={`R$ ${c.mensal}`} />
          <Box label="Caução" value={`R$ ${c.caucao}`} />
        </div>

        {c.motoristaAtual && (
          <div className="mt-4 rounded-2xl border border-border bg-accent/30 p-4">
            <div className="text-xs text-muted-foreground">Alugado para</div>
            <div className="font-semibold">{c.motoristaAtual}</div>
          </div>
        )}

        <h2 className="mt-6 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Propostas recebidas</h2>
        <div className="mt-2 flex flex-col gap-2">
          {propostasMock.map((p) => (
            <div key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
              <div className="min-w-0">
                <div className="truncate font-semibold">{p.motorista}</div>
                <div className="truncate text-xs text-muted-foreground">R$ {p.valor}/dia · {p.duracao}</div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="icon" variant="outline" className="h-9 w-9 rounded-full" onClick={() => toast.success("Aceito!")}>
                  <Check className="h-4 w-4 text-success" />
                </Button>
                <Button size="icon" variant="outline" className="h-9 w-9 rounded-full" onClick={() => toast("Recusado")}>
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-base font-bold">{value}</div>
    </div>
  );
}
