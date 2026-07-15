import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert, FileText, Gavel, CheckCircle2 } from "lucide-react";
import { PageSection } from "@/components/AppShell";

export const Route = createFileRoute("/admin/moderacao")({
  head: () => ({ meta: [{ title: "Moderação — Admin | TCHI LÉVA" }] }),
  component: Moderacao,
});

const denuncias = [
  { id: "d1", tipo: "Direção agressiva", origem: "Passageiro · Marina S.", contra: "Motorista · João Silva", status: "Em análise", fase: "Evidências" },
  { id: "d2", tipo: "Carro sujo no check-in", origem: "IA · Check-in #2841", contra: "Motorista · Ricardo Alves", status: "Pendente", fase: "Aberta" },
  { id: "d3", tipo: "Serviço não entregue", origem: "Motorista · Marcos Lima", contra: "Oficina · Funilaria do Beto", status: "Recurso", fase: "Decisão" },
  { id: "d4", tipo: "Tentativa de fraude", origem: "Sistema", contra: "Passageiro · D. R.", status: "Bloqueado", fase: "Encerrada" },
];

function Moderacao() {
  return (
    <>
      <PageSection>
        <h1 className="font-display text-xl font-extrabold">Moderação</h1>
        <p className="text-xs text-muted-foreground">Denúncias, bloqueios e recursos</p>
      </PageSection>

      <PageSection className="pt-2">
        <div className="grid grid-cols-3 gap-3">
          <Card icon={ShieldAlert} label="Abertas" value="12" tint="warning" />
          <Card icon={Gavel} label="Em análise" value="4" tint="primary" />
          <Card icon={CheckCircle2} label="Resolvidas" value="38" tint="success" />
        </div>
      </PageSection>

      <PageSection className="pt-2">
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Fila de denúncias
        </h2>
        <div className="flex flex-col gap-2.5">
          {denuncias.map((d) => (
            <div key={d.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{d.tipo}</div>
                <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                  {d.fase}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                <FileText className="mr-1 inline h-3 w-3" /> {d.origem} → {d.contra}
              </div>
              <div className="mt-2 text-xs font-medium text-primary">{d.status}</div>
            </div>
          ))}
        </div>
      </PageSection>
    </>
  );
}

function Card({ icon: Icon, label, value, tint }: { icon: typeof ShieldAlert; label: string; value: string; tint: "warning" | "primary" | "success" }) {
  const cls = tint === "warning" ? "bg-warning/15 text-warning" : tint === "primary" ? "bg-primary/15 text-primary" : "bg-success/15 text-success";
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-card">
      <div className={`mx-auto grid h-9 w-9 place-items-center rounded-lg ${cls}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 font-display text-xl font-extrabold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
