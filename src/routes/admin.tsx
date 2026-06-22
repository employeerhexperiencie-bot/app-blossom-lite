import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BarChart3, ShieldAlert, Wallet, Users } from "lucide-react";
import { AppShell, type Tab } from "@/components/AppShell";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const tabs: Tab[] = [
  { to: "/admin", label: "KPIs", icon: BarChart3 },
  { to: "/admin/moderacao", label: "Moderação", icon: ShieldAlert },
  { to: "/admin/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/admin/parceiros", label: "Parceiros", icon: Users },
];

function AdminLayout() {
  return (
    <AppShell
      title="Conect — Admin"
      tabs={tabs}
      right={
        <div className="grid h-10 w-10 place-items-center rounded-full bg-foreground text-background text-sm font-bold">
          A
        </div>
      }
    >
      <Outlet />
    </AppShell>
  );
}
