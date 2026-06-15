import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Car, Users, Banknote, User } from "lucide-react";
import { AppShell, type Tab } from "@/components/AppShell";

export const Route = createFileRoute("/proprietario")({ component: Layout });

const tabs: Tab[] = [
  { to: "/proprietario", label: "Frota", icon: Car },
  { to: "/proprietario/motoristas", label: "Motoristas", icon: Users },
  { to: "/proprietario/financeiro", label: "Financeiro", icon: Banknote },
  { to: "/proprietario/perfil", label: "Perfil", icon: User },
];

function Layout() {
  return (
    <AppShell title="Sua frota" tabs={tabs}>
      <Outlet />
    </AppShell>
  );
}
