import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Navigation, Clock } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/passageiro/")({
  head: () => ({ meta: [{ title: "Início — Passageiro TCHI LÉVA" }] }),
  component: Home,
});

function Home() {
  return (
    <>
      <PageSection>
        <div className="relative h-44 overflow-hidden rounded-3xl bg-accent">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 30% 40%, oklch(0.85 0.04 60), oklch(0.92 0.025 70))"
          }} />
          <div className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary shadow-glow">
            <MapPin className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-success/15"><span className="h-2 w-2 rounded-full bg-success" /></div>
            <Input placeholder="Origem (sua localização)" className="border-0 bg-transparent shadow-none focus-visible:ring-0" />
          </div>
          <div className="ml-4 h-3 w-px border-l border-dashed border-border" />
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15"><Navigation className="h-3.5 w-3.5 text-primary" /></div>
            <Input placeholder="Para onde?" className="border-0 bg-transparent shadow-none focus-visible:ring-0" />
          </div>
        </div>
        <Button onClick={() => toast.success("Buscando motorista...")} size="lg" className="mt-4 w-full rounded-xl gradient-primary text-primary-foreground shadow-glow">
          Pedir corrida
        </Button>
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Recentes</h2>
        <div className="flex flex-col gap-2">
          {[
            { to: "Av. Paulista, 1500", time: "Ontem, 18:30" },
            { to: "Aeroporto Congonhas", time: "Sex, 06:00" },
          ].map((r) => (
            <button key={r.to} className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-card">
              <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <div className="truncate font-semibold">{r.to}</div>
                <div className="truncate text-xs text-muted-foreground">{r.time}</div>
              </div>
            </button>
          ))}
        </div>
      </PageSection>
    </>
  );
}
