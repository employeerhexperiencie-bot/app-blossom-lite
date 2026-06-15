import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Tag, User } from "lucide-react";
import { AppShell, type Tab } from "@/components/AppShell";

export const Route = createFileRoute("/loja")({ component: Layout });

const tabs: Tab[] = [
  { to: "/loja", label: "Dashboard", icon: LayoutDashboard },
  { to: "/loja/campanhas", label: "Campanhas", icon: Tag },
  { to: "/loja/perfil", label: "Perfil", icon: User },
];

function Layout() {
  return (
    <AppShell title="Sua loja" tabs={tabs}>
      <Outlet />
    </AppShell>
  );
}
