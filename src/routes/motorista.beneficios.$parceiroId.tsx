import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Star, MapPin, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { parceiros } from "@/lib/mock-data";

export const Route = createFileRoute("/motorista/beneficios/$parceiroId")({
  loader: ({ params }) => {
    const p = parceiros.find((x) => x.id === params.parceiroId);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.nome} — Conect` : "Parceiro" }],
  }),
  component: Detalhe,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Parceiro não encontrado.</div>
  ),
});

function Detalhe() {
  const p = Route.useLoaderData();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  return (
    <div className="pb-4">
      <div className="relative h-56">
        <img src={p.foto} alt={p.nome} className="h-full w-full object-cover" />
        <Link to="/motorista/beneficios" className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-card/90 shadow-soft backdrop-blur">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="absolute right-4 top-4 rounded-full bg-success px-3 py-1.5 text-sm font-bold text-success-foreground shadow-soft">
          -{p.desconto}% para motoristas Conect
        </div>
      </div>

      <div className="px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">{p.categoria}</div>
            <h1 className="mt-1 font-display text-2xl font-bold">{p.nome}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-sm font-bold">
            <Star className="h-4 w-4 fill-warning text-warning" />
            {p.rating}
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <InfoRow icon={MapPin}>{p.endereco} · {p.distanciaKm} km</InfoRow>
          <InfoRow icon={Clock}>{p.horario}</InfoRow>
          <InfoRow icon={Phone}>{p.whatsapp}</InfoRow>
        </div>

        <h2 className="mt-6 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Serviços</h2>
        <div className="mt-2 divide-y divide-border rounded-2xl border border-border bg-card">
          {p.servicos.map((s: { nome: string; preco: number }) => {
            const comDesc = s.preco * (1 - p.desconto / 100);
            return (
              <div key={s.nome} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="text-sm font-medium">{s.nome}</span>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground line-through">R$ {s.preco.toFixed(0)}</div>
                  <div className="font-display font-bold text-success">R$ {comDesc.toFixed(0)}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-20 mt-6 grid grid-cols-2 gap-2">
          <Button variant="outline" className="rounded-xl" onClick={() => toast.success("Serviço agendado (mock)")}>Agendar</Button>
          <Button className="rounded-xl gradient-primary text-primary-foreground" onClick={() => setOpen(true)}>Pedir orçamento</Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Solicitar orçamento</DialogTitle>
          </DialogHeader>
          <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Descreva o serviço que precisa..." rows={4} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={() => { setOpen(false); setMsg(""); toast.success("Orçamento enviado!"); }}>
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="truncate">{children}</span>
    </div>
  );
}
