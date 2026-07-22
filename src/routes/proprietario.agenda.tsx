import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, FileWarning, Wrench, FileText, Bell } from "lucide-react";
import { useMemo, useState } from "react";
import { PageSection } from "@/components/AppShell";
import { FiltroBar } from "@/components/FiltroBar";
import { documentosMock, manutencaoMock, fmtData } from "@/lib/mock-proprietario";
import { useProprietario, useCarros } from "@/lib/store-proprietario";

export const Route = createFileRoute("/proprietario/agenda")({
  head: () => ({ meta: [{ title: "Agenda — TCHI LÉVA" }] }),
  component: Agenda,
});

type Item = { id: string; titulo: string; sub: string; data: string; tipo: "doc" | "manut" | "contrato" | "lembrete"; carroId?: string };

function Agenda() {
  const contratos = useProprietario((s) => s.contratos);
  const lembretes = useProprietario((s) => s.lembretesVeiculo);
  const carros = useCarros();

  const [tipo, setTipo] = useState<string>("todos");
  const [urgencia, setUrgencia] = useState<string>("todos");
  const [carroId, setCarroId] = useState<string>("todos");

  const itens: Item[] = [
    ...documentosMock.map<Item>((d) => {
      const carro = carros.find((c) => c.id === d.carroId);
      return { id: `doc-${d.id}`, titulo: `${d.tipo} — ${carro?.marca ?? ""} ${carro?.modelo ?? ""}`, sub: carro?.placa ?? "", data: d.vencimento, tipo: "doc", carroId: d.carroId };
    }),
    ...manutencaoMock.filter((m) => m.proximaData).map<Item>((m) => {
      const carro = carros.find((c) => c.id === m.carroId);
      return { id: `mnt-${m.id}`, titulo: `${m.item} — ${carro?.marca ?? ""} ${carro?.modelo ?? ""}`, sub: `Próxima em ${m.proximoKm?.toLocaleString("pt-BR")} km`, data: m.proximaData!, tipo: "manut", carroId: m.carroId };
    }),
    ...contratos.filter((c) => c.fim).map<Item>((c) => ({
      id: `ct-${c.id}`, titulo: `Fim de contrato — ${c.motoristaNome}`, sub: `Contrato ${c.status}`, data: c.fim!, tipo: "contrato", carroId: c.carroId,
    })),
    ...lembretes.filter((l) => !l.feito).map<Item>((l) => {
      const carro = carros.find((c) => c.id === l.carroId);
      return { id: `lb-${l.id}`, titulo: l.titulo, sub: `Lembrete · ${carro ? `${carro.marca} ${carro.modelo}` : ""}`, data: l.dataAlvo, tipo: "lembrete", carroId: l.carroId };
    }),
  ].sort((a, b) => (a.data < b.data ? -1 : 1));

  const hoje = new Date().toISOString().slice(0, 10);
  const em7 = addDays(hoje, 7);
  const em30 = addDays(hoje, 30);

  const chip = (d: string) => {
    if (d < hoje) return { label: "Vencido", cls: "bg-destructive/15 text-destructive", key: "vencido" };
    if (d === hoje) return { label: "Hoje", cls: "bg-primary/15 text-primary", key: "hoje" };
    if (d <= em7) return { label: "Esta semana", cls: "bg-warning/20 text-warning-foreground", key: "semana" };
    if (d <= em30) return { label: "Este mês", cls: "bg-accent text-accent-foreground", key: "mes" };
    return { label: "Futuro", cls: "bg-muted text-muted-foreground", key: "futuro" };
  };

  const filtrados = useMemo(() => itens.filter((i) => {
    if (tipo !== "todos" && i.tipo !== tipo) return false;
    if (carroId !== "todos" && i.carroId !== carroId) return false;
    if (urgencia !== "todos" && chip(i.data).key !== urgencia) return false;
    return true;
  }), [itens, tipo, carroId, urgencia]);

  const icon = (t: Item["tipo"]) =>
    t === "doc" ? <FileWarning className="h-4 w-4" /> :
    t === "manut" ? <Wrench className="h-4 w-4" /> :
    t === "lembrete" ? <Bell className="h-4 w-4" /> :
    <FileText className="h-4 w-4" />;

  const ativos = (tipo !== "todos" ? 1 : 0) + (urgencia !== "todos" ? 1 : 0) + (carroId !== "todos" ? 1 : 0);

  return (
    <PageSection>
      <div className="mb-4 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-primary" />
        <h1 className="font-street text-lg font-black uppercase">Agenda da frota</h1>
      </div>

      <div className="mb-3">
        <FiltroBar
          ativos={ativos}
          onLimpar={() => { setTipo("todos"); setUrgencia("todos"); setCarroId("todos"); }}
          chips={[
            {
              key: "tp", label: "Tipo", value: tipo, onChange: setTipo,
              options: [
                { value: "todos", label: "Todos" },
                { value: "doc", label: "Documento" },
                { value: "manut", label: "Manutenção" },
                { value: "contrato", label: "Contrato" },
                { value: "lembrete", label: "Lembrete" },
              ],
            },
            {
              key: "ur", label: "Urgência", value: urgencia, onChange: setUrgencia,
              options: [
                { value: "todos", label: "Todas" },
                { value: "vencido", label: "Vencido" },
                { value: "hoje", label: "Hoje" },
                { value: "semana", label: "Semana" },
                { value: "mes", label: "Mês" },
                { value: "futuro", label: "Futuro" },
              ],
            },
            {
              key: "car", label: "Veículo", value: carroId, onChange: setCarroId,
              options: [
                { value: "todos", label: "Todos" },
                ...carros.map((c) => ({ value: c.id, label: `${c.marca} ${c.modelo}` })),
              ],
            },
          ]}
        />
      </div>

      <div className="flex flex-col gap-2">
        {filtrados.map((i) => {
          const c = chip(i.data);
          const body = (
            <>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">{icon(i.tipo)}</span>
              <div className="min-w-0">
                <div className="truncate font-semibold">{i.titulo}</div>
                <div className="truncate text-xs text-muted-foreground">{i.sub} · {fmtData(i.data)}</div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${c.cls}`}>{c.label}</span>
            </>
          );
          const className = "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card";
          if (i.carroId) {
            return (
              <Link key={i.id} to="/proprietario/frota/$carroId" params={{ carroId: i.carroId }} className={className}>
                {body}
              </Link>
            );
          }
          return <div key={i.id} className={className}>{body}</div>;
        })}
        {filtrados.length === 0 && <p className="text-sm text-muted-foreground">Nada nesta seleção.</p>}
      </div>
    </PageSection>
  );
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
