import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Home, Calendar, Wrench, Wallet, User } from "lucide-react";
import { AppShell, type Tab } from "@/components/AppShell";

export const Route = createFileRoute("/oficina")({ component: Layout });

const tabs: Tab[] = [
  { to: "/oficina", label: "Hoje", icon: Home },
  { to: "/oficina/agenda", label: "Agenda", icon: Calendar },
  { to: "/oficina/servicos", label: "Serviços", icon: Wrench },
  { to: "/oficina/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/oficina/perfil", label: "Perfil", icon: User },
];

function Layout() {
  return (
    <AppShell title="Centro de Serviços" tabs={tabs}>
      <Outlet />
    </AppShell>
  );
}
