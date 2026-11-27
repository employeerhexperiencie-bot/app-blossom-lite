import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Navigation, Clock, Loader2, Car, CheckCircle2, X } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { estimarCorrida, useConect, type PedidoCorrida } from "@/lib/store";
import { fmtBRL } from "@/lib/mock-proprietario";

export const Route = createFileRoute("/passageiro/")({
  head: () => ({ meta: [{ title: "Início — Passageiro TCHI LÉVA" }] }),
  component: Home,
});

const recentes = [
  { to: "Av. Paulista, 1500", time: "Ontem, 18:30" },
  { to: "Aeroporto Congonhas", time: "Sex, 06:00" },
];

function Home() {
  const nome = useConect((s) => s.nomeUsuario);
  const pedidos = useConect((s) => s.pedidos);
  const pedirCorrida = useConect((s) => s.pedirCorrida);
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");

  // Pedido em andamento, ou o último finalizado que o passageiro ainda não dispensou.
  const atual = pedidos.find(
    (p) =>
      p.status === "buscando" ||
      p.status === "a_caminho" ||
      p.status === "em_viagem" ||
      (p.status === "finalizada" && !p.vistoPeloPassageiro),
  );
  const origemFinal = origem.trim() || "Minha localização";
  const estimativa = destino.trim() ? estimarCorrida(origemFinal, destino.trim()) : null;

  function pedir() {
    if (!destino.trim()) {
      toast.error("Informe para onde você vai");
      return;
    }
    pedirCorrida({
      origem: origemFinal,
      destino: destino.trim(),
      passageiro: nome || "Passageiro",
    });
    setDestino("");
  }

  return (
    <>
      <PageSection>
        <div className="relative h-44 overflow-hidden rounded-3xl bg-accent">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, oklch(0.85 0.04 60), oklch(0.92 0.025 70))",
            }}
          />
          <div className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary shadow-glow">
            <MapPin className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      </PageSection>

      {atual ? (
        <PageSection className="pt-0">
          <PedidoAtual pedido={atual} />
        </PageSection>
      ) : (
        <PageSection className="pt-0">
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-success/15">
                <span className="h-2 w-2 rounded-full bg-success" />
              </div>
              <Input
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                placeholder="Origem (sua localização)"
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="ml-4 h-3 w-px border-l border-dashed border-border" />
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15">
                <Navigation className="h-3.5 w-3.5 text-primary" />
              </div>
              <Input
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Para onde?"
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
          {estimativa && (
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm">
              <span className="text-muted-foreground">
                {estimativa.distanciaKm.toLocaleString("pt-BR")} km · {estimativa.tempoMin} min
              </span>
              <span className="font-display text-lg font-bold">{fmtBRL(estimativa.valor)}</span>
            </div>
          )}
          <Button
            onClick={pedir}
            size="lg"
            className="mt-4 w-full rounded-xl gradient-primary text-primary-foreground shadow-glow"
          >
            Pedir corrida
          </Button>
          {estimativa && (
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Estimativa simulada no protótipo.
            </p>
          )}
        </PageSection>
      )}

      {!atual && (
        <PageSection className="pt-0">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Recentes
          </h2>
          <div className="flex flex-col gap-2">
            {recentes.map((r) => (
              <button
                key={r.to}
                onClick={() => setDestino(r.to)}
                className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-card"
              >
                <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{r.to}</div>
                  <div className="truncate text-xs text-muted-foreground">{r.time}</div>
                </div>
              </button>
            ))}
          </div>
        </PageSection>
      )}
    </>
  );
}

function PedidoAtual({ pedido }: { pedido: PedidoCorrida }) {
  const cancelarPedido = useConect((s) => s.cancelarPedido);
  const dispensar = useConect((s) => s.dispensarPedido);

  const etapa = {
    buscando: {
      icone: Loader2,
      titulo: "Procurando motorista",
      texto: "Seu pedido está com os motoristas por perto.",
    },
    a_caminho: {
      icone: Car,
      titulo: `${pedido.motoristaNome ?? "Motorista"} está a caminho`,
      texto: `Encontre o motorista em ${pedido.origem}.`,
    },
    em_viagem: { icone: Navigation, titulo: "Em viagem", texto: `Indo para ${pedido.destino}.` },
    finalizada: {
      icone: CheckCircle2,
      titulo: "Você chegou",
      texto: "Corrida finalizada. Obrigado por viajar com a TCHI LÉVA.",
    },
    cancelada: { icone: X, titulo: "Pedido cancelado", texto: "" },
  }[pedido.status];
  const Icone = etapa.icone;

  return (
    <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
          <Icone className={`h-5 w-5 ${pedido.status === "buscando" ? "animate-spin" : ""}`} />
        </div>
        <div className="min-w-0">
          <div className="font-display font-bold">{etapa.titulo}</div>
          <div className="text-xs text-muted-foreground">{etapa.texto}</div>
        </div>
      </div>
      <div className="mt-3 space-y-1 rounded-xl border border-border bg-card p-3 text-sm">
        <div className="truncate">
          <span className="text-muted-foreground">De </span>
          {pedido.origem}
        </div>
        <div className="truncate">
          <span className="text-muted-foreground">Para </span>
          {pedido.destino}
        </div>
        <div className="flex justify-between pt-1 text-xs text-muted-foreground">
          <span>
            {pedido.distanciaKm.toLocaleString("pt-BR")} km · {pedido.tempoMin} min ·{" "}
            {pedido.formaPagamento}
          </span>
          <span className="font-semibold text-foreground">{fmtBRL(pedido.valor)}</span>
        </div>
      </div>
      {pedido.status === "buscando" && (
        <Button
          variant="outline"
          className="mt-3 w-full rounded-xl"
          onClick={() => cancelarPedido(pedido.id)}
        >
          Cancelar pedido
        </Button>
      )}
      {pedido.status === "finalizada" && (
        <Button
          className="mt-3 w-full rounded-xl gradient-primary text-primary-foreground"
          onClick={() => dispensar(pedido.id)}
        >
          Fechar
        </Button>
      )}
    </div>
  );
}
