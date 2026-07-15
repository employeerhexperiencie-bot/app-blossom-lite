import { createFileRoute } from "@tanstack/react-router";
import { PageSection } from "@/components/AppShell";

export const Route = createFileRoute("/oficina/agenda")({
  head: () => ({ meta: [{ title: "Agenda — TCHI LÉVA Oficina" }] }),
  component: Agenda,
});

const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const agendamentos = [
  { dia: "Seg", hora: "09:00", cliente: "João Silva", servico: "Troca de óleo" },
  { dia: "Seg", hora: "14:00", cliente: "Marcos Lima", servico: "Alinhamento" },
  { dia: "Ter", hora: "10:00", cliente: "Patrícia Souza", servico: "Revisão" },
  { dia: "Qua", hora: "11:30", cliente: "Ricardo Alves", servico: "Pneu" },
  { dia: "Sex", hora: "10:00", cliente: "Carlos Mendes", servico: "Suspensão" },
];

function Agenda() {
  return (
    <PageSection>
      <div className="grid grid-cols-6 gap-1.5">
        {dias.map((d) => (
          <div key={d} className="rounded-xl bg-card p-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground shadow-card">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {agendamentos.map((a, i) => (
          <div key={i} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border-l-4 border-primary bg-card p-3 shadow-card">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-center">
              <div className="font-display text-[10px] font-bold uppercase text-primary">{a.dia}</div>
              <div className="font-display text-xs font-bold">{a.hora}</div>
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold">{a.cliente}</div>
              <div className="truncate text-xs text-muted-foreground">{a.servico}</div>
            </div>
            <span className="shrink-0 rounded-full bg-success/15 px-2 py-1 text-[10px] font-semibold text-success">Confirmado</span>
          </div>
        ))}
      </div>
    </PageSection>
  );
}
