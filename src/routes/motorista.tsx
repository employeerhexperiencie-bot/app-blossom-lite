import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Home, Wrench, Navigation, User, Trophy } from "lucide-react";
import { AppShell, type Tab } from "@/components/AppShell";
import { useConect } from "@/lib/store";
import { NivelBadge } from "@/components/nivel/NivelBadge";
import { getNivelByViagens, progressoMock } from "@/lib/niveis";

export const Route = createFileRoute("/motorista")({
  component: MotoristaLayout,
});

const tabs: Tab[] = [
  { to: "/motorista", label: "Início", icon: Home },
  { to: "/motorista/corridas", label: "Corridas", icon: Navigation },
  { to: "/motorista/jornada", label: "Jornada", icon: Trophy },
  { to: "/motorista/beneficios", label: "Oficinas", icon: Wrench },
  { to: "/motorista/perfil", label: "Perfil", icon: User },
];

function MotoristaLayout() {
  const nome = useConect((s) => s.nomeUsuario) || "Motorista";
  const nivel = getNivelByViagens(progressoMock.viagensTotais);
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
