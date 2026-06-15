import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Tag } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { promocoes as initial } from "@/lib/mock-data";

export const Route = createFileRoute("/oficina/promocoes")({
  head: () => ({ meta: [{ title: "Promoções — Conect Oficina" }] }),
  component: Promocoes,
});

function Promocoes() {
  const [list, setList] = useState(initial);
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageSection>
        <Button onClick={() => setOpen(true)} className="w-full rounded-xl gradient-primary text-primary-foreground shadow-glow">
          <Plus className="mr-2 h-4 w-4" /> Nova promoção
        </Button>
      </PageSection>

      <PageSection className="pt-0">
        <div className="flex flex-col gap-3">
          {list.map((p) => (
            <div key={p.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Tag className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold">{p.titulo}</div>
                <div className="truncate text-xs text-muted-foreground">{p.desconto}% off · até {p.validade}</div>
              </div>
              <Switch
                checked={p.ativa}
                onCheckedChange={(v) => setList((prev) => prev.map((x) => (x.id === p.id ? { ...x, ativa: v } : x)))}
              />
            </div>
          ))}
        </div>
      </PageSection>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Nova promoção</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Título</Label><Input placeholder="Ex: Lavagem completa" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Desconto (%)</Label><Input type="number" placeholder="20" /></div>
              <div><Label>Validade</Label><Input placeholder="dd/mm/aaaa" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={() => { setOpen(false); toast.success("Promoção criada!"); }}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
