import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Home, Gift, Store, User } from "lucide-react";
import { AppShell, type Tab } from "@/components/AppShell";

export const Route = createFileRoute("/passageiro")({ component: Layout });

const tabs: Tab[] = [
  { to: "/passageiro", label: "Início", icon: Home },
  { to: "/passageiro/cashback", label: "Cashback", icon: Gift },
  { to: "/passageiro/parceiros", label: "Lojas", icon: Store },
  { to: "/passageiro/perfil", label: "Perfil", icon: User },
];

function Layout() {
  return (
    <AppShell title="TCHI LÉVA" tabs={tabs}>
      <Outlet />
    </AppShell>
  );
}
