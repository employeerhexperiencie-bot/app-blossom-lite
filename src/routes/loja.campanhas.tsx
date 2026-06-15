import { createFileRoute } from "@tanstack/react-router";
import { Plus, Tag } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/loja/campanhas")({
  head: () => ({ meta: [{ title: "Campanhas — Conect Loja" }] }),
  component: Camp,
});

const camp = [
  { id: 1, titulo: "10% de volta em compras acima de R$ 50", validade: "30/06" },
  { id: 2, titulo: "Frete grátis para usuários Conect", validade: "31/12" },
];

function Camp() {
  return (
    <>
      <PageSection>
        <Button onClick={() => toast.success("Nova campanha criada (mock)")} className="w-full rounded-xl gradient-primary text-primary-foreground shadow-glow">
          <Plus className="mr-2 h-4 w-4" /> Nova campanha
        </Button>
      </PageSection>
      <PageSection className="pt-0">
        <div className="flex flex-col gap-3">
          {camp.map((c) => (
            <div key={c.id} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-success/15 text-success"><Tag className="h-5 w-5" /></div>
              <div className="min-w-0">
                <div className="truncate font-semibold">{c.titulo}</div>
                <div className="truncate text-xs text-muted-foreground">Válida até {c.validade}</div>
              </div>
            </div>
          ))}
        </div>
      </PageSection>
    </>
  );
}
