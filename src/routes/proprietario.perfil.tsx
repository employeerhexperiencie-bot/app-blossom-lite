import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, ChevronRight } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useConect } from "@/lib/store";

export const Route = createFileRoute("/proprietario/perfil")({
  head: () => ({ meta: [{ title: "Perfil — Proprietário TCHI LÉVA" }] }),
  component: Perfil,
});

function Perfil() {
  const { nomeUsuario, logout } = useConect();
  const navigate = useNavigate();
  const nome = nomeUsuario || "Proprietário";
  return (
    <PageSection>
      <div className="flex items-center gap-4 rounded-3xl gradient-warm p-5">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-glow">
          {nome.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-lg font-bold">{nome}</div>
          <div className="text-xs text-muted-foreground">Proprietário · 5 carros</div>
        </div>
      </div>
      <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
        {["Dados da empresa", "Contas bancárias", "Documentos", "Contratos"].map((t) => (
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
