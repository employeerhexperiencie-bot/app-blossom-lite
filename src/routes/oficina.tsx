import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Inbox, Calendar, Tag, User } from "lucide-react";
import { AppShell, type Tab } from "@/components/AppShell";

export const Route = createFileRoute("/oficina")({ component: Layout });

const tabs: Tab[] = [
  { to: "/oficina", label: "Solicitações", icon: Inbox },
  { to: "/oficina/agenda", label: "Agenda", icon: Calendar },
  { to: "/oficina/promocoes", label: "Promoções", icon: Tag },
  { to: "/oficina/perfil", label: "Perfil", icon: User },
];

function Layout() {
  return (
    <AppShell title="Sua oficina" tabs={tabs}>
      <Outlet />
    </AppShell>
  );
}
