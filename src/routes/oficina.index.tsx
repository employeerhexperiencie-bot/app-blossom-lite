import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageSection } from "@/components/AppShell";
import { solicitacoes, type Solicitacao } from "@/lib/mock-data";

export const Route = createFileRoute("/oficina/")({
  head: () => ({ meta: [{ title: "Solicitações — Conect Oficina" }] }),
  component: Solicitacoes,
});

const statusInfo: Record<Solicitacao["status"], { label: string; cls: string }> = {
  novo: { label: "Novo", cls: "bg-primary/15 text-primary" },
  respondido: { label: "Respondido", cls: "bg-warning/20 text-warning-foreground" },
  agendado: { label: "Agendado", cls: "bg-success/15 text-success" },
};

function Solicitacoes() {
  const [filter, setFilter] = useState<Solicitacao["status"] | "todos">("todos");
  const list = solicitacoes.filter((s) => filter === "todos" || s.status === filter);

  return (
    <>
      <PageSection>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5">
          {(["todos", "novo", "respondido", "agendado"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
                filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <div className="flex flex-col gap-3">
          {list.map((s) => {
            const st = statusInfo[s.status];
            return (
              <div key={s.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{s.motorista}</div>
                    <div className="truncate text-xs text-muted-foreground">{s.servico} · {s.veiculo}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.cls}`}>{st.label}</span>
                </div>
                <p className="mt-2 rounded-xl bg-muted/60 p-2.5 text-sm">"{s.mensagem}"</p>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{s.data}</span>
                  <button className="font-semibold text-primary">Responder</button>
                </div>
              </div>
            );
          })}
        </div>
      </PageSection>
    </>
  );
}
