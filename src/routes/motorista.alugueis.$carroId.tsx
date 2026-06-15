import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Shield, Gauge, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { carros } from "@/lib/mock-data";

export const Route = createFileRoute("/motorista/alugueis/$carroId")({
  loader: ({ params }) => {
    const c = carros.find((x) => x.id === params.carroId);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.marca} ${loaderData.modelo} — Conect` : "Carro" }],
  }),
  component: CarroDetalhe,
  notFoundComponent: () => <div className="p-10 text-center text-muted-foreground">Carro não encontrado.</div>,
});

function CarroDetalhe() {
  const c = Route.useLoaderData();
  const [open, setOpen] = useState(false);
  const [valor, setValor] = useState(String(c.diaria));

  return (
    <div className="pb-4">
      <div className="relative h-64">
        <img src={c.foto} alt={c.modelo} className="h-full w-full object-cover" />
        <Link to="/motorista/alugueis" className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-card/90 shadow-soft backdrop-blur">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="px-5 pt-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">{c.marca}</div>
        <h1 className="mt-1 font-display text-2xl font-bold">{c.modelo} {c.ano}</h1>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Spec label="Diária" value={`R$ ${c.diaria}`} highlight />
          <Spec label="Mensal" value={`R$ ${c.mensal}`} />
          <Spec label="Caução" value={`R$ ${c.caucao}`} />
        </div>

        <div className="mt-4 space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
          <Row icon={MapPin}>{c.cidade}</Row>
          <Row icon={Gauge}>{c.km.toLocaleString("pt-BR")} km</Row>
          <Row icon={Calendar}>Placa {c.placa}</Row>
          <Row icon={Shield}>{c.seguro ? "Com seguro incluso" : "Sem seguro incluso"}</Row>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-accent/40 p-4">
          <div className="text-xs text-muted-foreground">Proprietário</div>
          <div className="font-semibold">{c.proprietario}</div>
        </div>

        <Button onClick={() => setOpen(true)} size="lg" className="mt-6 w-full rounded-xl gradient-primary text-primary-foreground shadow-glow">
          Enviar proposta
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Sua proposta</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Valor da diária (R$)</Label>
              <Input value={valor} onChange={(e) => setValor(e.target.value)} type="number" />
            </div>
            <div>
              <Label>Duração</Label>
              <Input placeholder="ex: 30 dias" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={() => { setOpen(false); toast.success("Proposta enviada ao proprietário!"); }}>
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Spec({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 ${highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display text-base font-bold ${highlight ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}

function Row({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span>{children}</span>
    </div>
  );
}
