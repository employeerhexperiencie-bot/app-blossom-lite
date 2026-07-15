import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, XCircle, Wrench, Store, Car } from "lucide-react";
import { PageSection } from "@/components/AppShell";

export const Route = createFileRoute("/admin/parceiros")({
  head: () => ({ meta: [{ title: "Parceiros — Admin | TCHI LÉVA" }] }),
  component: Parceiros,
});

const aprovacoes = [
  { id: "a1", nome: "Mecânica do Zé", tipo: "Oficina", icon: Wrench, status: "pendente" as const, data: "Hoje" },
  { id: "a2", nome: "Mercadinho Central", tipo: "Loja", icon: Store, status: "pendente" as const, data: "Hoje" },
  { id: "a3", nome: "Frota Itaim", tipo: "Proprietário", icon: Car, status: "aprovado" as const, data: "Ontem" },
  { id: "a4", nome: "Borracharia Bairro", tipo: "Oficina", icon: Wrench, status: "rejeitado" as const, data: "2 dias" },
  { id: "a5", nome: "Padaria do João", tipo: "Loja", icon: Store, status: "aprovado" as const, data: "3 dias" },
];

function Parceiros() {
  return (
    <>
      <PageSection>
        <h1 className="font-display text-xl font-extrabold">Parceiros</h1>
        <p className="text-xs text-muted-foreground">Aprovação de oficinas, lojas e frotistas</p>
      </PageSection>

      <PageSection className="pt-2">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat icon={Clock} label="Pendentes" value="7" tint="warning" />
          <Stat icon={CheckCircle2} label="Aprovados" value="184" tint="success" />
          <Stat icon={XCircle} label="Rejeitados" value="11" tint="destructive" />
        </div>
      </PageSection>

      <PageSection className="pt-2">
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Solicitações
        </h2>
        <div className="flex flex-col gap-2">
          {aprovacoes.map((a) => (
            <div key={a.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                <a.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold">{a.nome}</div>
                <div className="text-xs text-muted-foreground">{a.tipo} · {a.data}</div>
              </div>
              <Badge status={a.status} />
            </div>
          ))}
        </div>
      </PageSection>
    </>
  );
}

function Stat({ icon: Icon, label, value, tint }: { icon: typeof Clock; label: string; value: string; tint: "warning" | "success" | "destructive" }) {
  const cls = tint === "warning" ? "bg-warning/15 text-warning" : tint === "success" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive";
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
      <div className={`mx-auto grid h-9 w-9 place-items-center rounded-lg ${cls}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 font-display text-xl font-extrabold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Badge({ status }: { status: "pendente" | "aprovado" | "rejeitado" }) {
  const map = {
    pendente: { txt: "Pendente", cls: "bg-warning/15 text-warning" },
    aprovado: { txt: "Aprovado", cls: "bg-success/15 text-success" },
    rejeitado: { txt: "Rejeitado", cls: "bg-destructive/15 text-destructive" },
  } as const;
  const v = map[status];
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${v.cls}`}>{v.txt}</span>;
}
