import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Home, Wrench, Car, User, Trophy } from "lucide-react";
import { AppShell, type Tab } from "@/components/AppShell";
import { useConect } from "@/lib/store";
import { NivelBadge } from "@/components/nivel/NivelBadge";
import { getNivelByCorridas, progressoMock } from "@/lib/niveis";

export const Route = createFileRoute("/motorista")({
  component: MotoristaLayout,
});

const tabs: Tab[] = [
  { to: "/motorista", label: "Início", icon: Home },
  { to: "/motorista/beneficios", label: "Benefícios", icon: Wrench },
  { to: "/motorista/jornada", label: "Jornada", icon: Trophy },
  { to: "/motorista/alugueis", label: "Aluguéis", icon: Car },
  { to: "/motorista/perfil", label: "Perfil", icon: User },
];

function MotoristaLayout() {
  const nome = useConect((s) => s.nomeUsuario) || "Motorista";
  const nivel = getNivelByCorridas(progressoMock.corridas);
  return (
    <AppShell
      title={`Olá, ${nome.split(" ")[0]}`}
      tabs={tabs}
      right={
        <div className="flex shrink-0 items-center gap-2">
          <NivelBadge nivel={nivel} size="sm" />
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
            style={{ backgroundImage: nivel.gradient }}
          >
            {nome.charAt(0).toUpperCase()}
          </div>
        </div>
      }
    >
      <Outlet />
    </AppShell>
  );
}
