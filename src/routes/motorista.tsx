import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Home, Wrench, Car, User } from "lucide-react";
import { AppShell, type Tab } from "@/components/AppShell";
import { useConect } from "@/lib/store";

export const Route = createFileRoute("/motorista")({
  component: MotoristaLayout,
});

const tabs: Tab[] = [
  { to: "/motorista", label: "Início", icon: Home },
  { to: "/motorista/beneficios", label: "Benefícios", icon: Wrench },
  { to: "/motorista/alugueis", label: "Aluguéis", icon: Car },
  { to: "/motorista/perfil", label: "Perfil", icon: User },
];

function MotoristaLayout() {
  const nome = useConect((s) => s.nomeUsuario) || "Motorista";
  return (
    <AppShell
      title={`Olá, ${nome.split(" ")[0]}`}
      tabs={tabs}
      right={<div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold">{nome.charAt(0).toUpperCase()}</div>}
    >
      <Outlet />
    </AppShell>
  );
}
