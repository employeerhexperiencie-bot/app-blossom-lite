import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, ChevronRight } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useConect } from "@/lib/store";

export const Route = createFileRoute("/oficina/perfil")({
  head: () => ({ meta: [{ title: "Perfil — Conect Oficina" }] }),
  component: Perfil,
});

function Perfil() {
  const { nomeUsuario, logout } = useConect();
  const navigate = useNavigate();
  const nome = nomeUsuario || "Oficina";
  return (
    <PageSection>
      <div className="rounded-3xl gradient-warm p-5">
        <div className="font-display text-lg font-bold">{nome}</div>
        <div className="text-xs text-muted-foreground">Mecânica · São Paulo</div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-card p-2"><div className="text-[10px] uppercase text-muted-foreground">Atend. mês</div><div className="font-display font-bold">38</div></div>
          <div className="rounded-xl bg-card p-2"><div className="text-[10px] uppercase text-muted-foreground">Avaliação</div><div className="font-display font-bold">4.8 ★</div></div>
        </div>
      </div>
      <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
        {["Dados da empresa", "CNPJ e documentos", "Serviços oferecidos", "Horário de atendimento", "WhatsApp"].map((t) => (
          <button key={t} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 text-left">
            <span className="font-semibold">{t}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
      <Button variant="outline" className="mt-6 w-full rounded-xl" onClick={() => { logout(); navigate({ to: "/" }); }}>
        <LogOut className="mr-2 h-4 w-4" /> Sair
      </Button>
    </PageSection>
  );
}
