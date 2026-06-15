import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useConect } from "@/lib/store";

export const Route = createFileRoute("/passageiro/perfil")({
  head: () => ({ meta: [{ title: "Perfil — Conect" }] }),
  component: Perfil,
});

function Perfil() {
  const { nomeUsuario, logout } = useConect();
  const navigate = useNavigate();
  return (
    <PageSection>
      <div className="rounded-3xl gradient-warm p-5">
        <div className="font-display text-lg font-bold">{nomeUsuario || "Passageiro"}</div>
        <div className="text-xs text-muted-foreground">Membro Conect</div>
      </div>
      <Button variant="outline" className="mt-6 w-full rounded-xl" onClick={() => { logout(); navigate({ to: "/" }); }}>
        <LogOut className="mr-2 h-4 w-4" /> Sair
      </Button>
    </PageSection>
  );
}
