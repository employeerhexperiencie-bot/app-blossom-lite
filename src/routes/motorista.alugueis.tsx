import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Shield } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { carros } from "@/lib/mock-data";

export const Route = createFileRoute("/motorista/alugueis")({
  head: () => ({ meta: [{ title: "Aluguéis — Conect" }] }),
  component: Alugueis,
});

function Alugueis() {
  const [q, setQ] = useState("");
  const list = carros.filter((c) => c.status === "disponivel" && (!q || `${c.marca} ${c.modelo} ${c.cidade}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <PageSection>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por modelo ou cidade..." className="rounded-xl pl-9" />
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <div className="grid grid-cols-1 gap-3">
          {list.map((c) => (
            <Link
              key={c.id}
              to="/motorista/alugueis/$carroId"
              params={{ carroId: c.id }}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <div className="relative h-40">
                <img src={c.foto} alt={`${c.marca} ${c.modelo}`} className="h-full w-full object-cover" loading="lazy" />
                {c.seguro && (
                  <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-2 py-1 text-[11px] font-semibold shadow-soft">
                    <Shield className="h-3 w-3 text-success" /> com seguro
                  </div>
                )}
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 p-4">
                <div className="min-w-0">
                  <div className="font-display text-lg font-bold">{c.marca} {c.modelo}</div>
                  <div className="text-xs text-muted-foreground">{c.ano} · {c.cidade} · {c.km.toLocaleString("pt-BR")} km</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Diária</div>
                  <div className="font-display text-lg font-bold text-primary">R$ {c.diaria}</div>
                </div>
              </div>
            </Link>
          ))}
          {list.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nenhum carro disponível com esses filtros.
            </div>
          )}
        </div>
      </PageSection>
    </>
  );
}
