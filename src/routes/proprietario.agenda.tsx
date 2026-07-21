import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, FileWarning, Wrench, FileText } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { carros } from "@/lib/mock-data";
import { documentosMock, manutencaoMock, fmtData } from "@/lib/mock-proprietario";
import { useProprietario } from "@/lib/store-proprietario";

export const Route = createFileRoute("/proprietario/agenda")({
  head: () => ({ meta: [{ title: "Agenda — TCHI LÉVA" }] }),
  component: Agenda,
});

type Item = { id: string; titulo: string; sub: string; data: string; tipo: "doc" | "manut" | "contrato" };

function Agenda() {
  const contratos = useProprietario((s) => s.contratos);

  const itens: Item[] = [
    ...documentosMock.map<Item>((d) => {
      const carro = carros.find((c) => c.id === d.carroId);
      return { id: `doc-${d.id}`, titulo: `${d.tipo} — ${carro?.marca ?? ""} ${carro?.modelo ?? ""}`, sub: carro?.placa ?? "", data: d.vencimento, tipo: "doc" };
    }),
    ...manutencaoMock.filter((m) => m.proximaData).map<Item>((m) => {
      const carro = carros.find((c) => c.id === m.carroId);
      return { id: `mnt-${m.id}`, titulo: `${m.item} — ${carro?.marca ?? ""} ${carro?.modelo ?? ""}`, sub: `Próxima em ${m.proximoKm?.toLocaleString("pt-BR")} km`, data: m.proximaData!, tipo: "manut" };
    }),
    ...contratos.filter((c) => c.fim).map<Item>((c) => ({
      id: `ct-${c.id}`, titulo: `Fim de contrato — ${c.motoristaNome}`, sub: `Contrato ${c.status}`, data: c.fim!, tipo: "contrato",
    })),
  ].sort((a, b) => (a.data < b.data ? -1 : 1));

  const hoje = new Date().toISOString().slice(0, 10);
  const em7 = addDays(hoje, 7);
  const em30 = addDays(hoje, 30);

  const chip = (d: string) => {
    if (d < hoje) return { label: "Vencido", cls: "bg-destructive/15 text-destructive" };
    if (d === hoje) return { label: "Hoje", cls: "bg-primary/15 text-primary" };
    if (d <= em7) return { label: "Esta semana", cls: "bg-warning/20 text-warning-foreground" };
    if (d <= em30) return { label: "Este mês", cls: "bg-accent text-accent-foreground" };
    return { label: "Futuro", cls: "bg-muted text-muted-foreground" };
  };

  const icon = (t: Item["tipo"]) =>
    t === "doc" ? <FileWarning className="h-4 w-4" /> :
    t === "manut" ? <Wrench className="h-4 w-4" /> :
    <FileText className="h-4 w-4" />;

  return (
    <PageSection>
      <div className="mb-4 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-primary" />
        <h1 className="font-street text-lg font-black uppercase">Agenda da frota</h1>
      </div>
      <div className="flex flex-col gap-2">
        {itens.map((i) => {
          const c = chip(i.data);
          return (
            <div key={i.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">{icon(i.tipo)}</span>
              <div className="min-w-0">
                <div className="truncate font-semibold">{i.titulo}</div>
                <div className="truncate text-xs text-muted-foreground">{i.sub} · {fmtData(i.data)}</div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${c.cls}`}>{c.label}</span>
            </div>
          );
        })}
        {itens.length === 0 && <p className="text-sm text-muted-foreground">Nada agendado.</p>}
      </div>
    </PageSection>
  );
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
