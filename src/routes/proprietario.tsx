import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Car, FileText, CalendarClock, User, LayoutDashboard, Bell } from "lucide-react";
import { AppShell, type Tab } from "@/components/AppShell";
import { useProprietario } from "@/lib/store-proprietario";

export const Route = createFileRoute("/proprietario")({ component: Layout });

const tabs: Tab[] = [
  { to: "/proprietario", label: "Início", icon: LayoutDashboard },
  { to: "/proprietario/frota", label: "Frota", icon: Car },
  { to: "/proprietario/contratos", label: "Contratos", icon: FileText },
  { to: "/proprietario/agenda", label: "Agenda", icon: CalendarClock },
  { to: "/proprietario/perfil", label: "Perfil", icon: User },
];

function Layout() {
  const naoLidas = useProprietario((s) => s.notificacoes.length - s.notificacoesLidas.length);
  return (
    <AppShell
      title="Sua frota"
      tabs={tabs}
      right={
        <Link
          to="/proprietario/notificacoes"
          className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          {naoLidas > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
              {naoLidas}
            </span>
          )}
        </Link>
      }
    >
      <Outlet />
    </AppShell>
  );
}
