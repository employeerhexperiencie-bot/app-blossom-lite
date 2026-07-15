import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Star } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { parceiros, type Parceiro } from "@/lib/mock-data";

export const Route = createFileRoute("/motorista/beneficios")({
  head: () => ({ meta: [{ title: "Benefícios — TCHI LÉVA" }] }),
  component: Beneficios,
});

const categorias: Parceiro["categoria"][] = ["Mecânica", "Borracharia", "Lava-rápido", "Troca de óleo", "Funilaria", "Elétrica"];

function Beneficios() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const list = parceiros.filter(
    (p) => (!cat || p.categoria === cat) && (!q || p.nome.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      <PageSection>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar oficinas, lava-rápido..." className="rounded-xl pl-9" />
        </div>
        <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
          <Pill active={cat === null} onClick={() => setCat(null)}>Todos</Pill>
          {categorias.map((c) => (
            <Pill key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Pill>
          ))}
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <div className="flex flex-col gap-3">
          {list.map((p) => (
            <Link
              key={p.id}
              to="/motorista/beneficios/$parceiroId"
              params={{ parceiroId: p.id }}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-colors hover:border-primary/40"
            >
              <div className="relative h-32 w-full">
                <img src={p.foto} alt={p.nome} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute right-3 top-3 rounded-full bg-success px-2.5 py-1 text-xs font-bold text-success-foreground shadow-soft">
                  -{p.desconto}%
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{p.nome}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.categoria} · {p.distanciaKm} km · {p.horario}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-xs font-semibold">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    {p.rating}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {list.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nenhum parceiro encontrado.
            </div>
          )}
        </div>
      </PageSection>
    </>
  );
}

function Pill({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
