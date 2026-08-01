import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Home, Store, Package, Boxes, ReceiptText } from "lucide-react";
import { AppShell, type Tab } from "@/components/AppShell";

export const Route = createFileRoute("/loja")({ component: Layout });

const tabs: Tab[] = [
  { to: "/loja", label: "Home", icon: Home },
  { to: "/loja/negocio", label: "Negócio", icon: Store },
  { to: "/loja/catalogo", label: "Catálogo", icon: Package },
  { to: "/loja/estoque", label: "Estoque", icon: Boxes },
  { to: "/loja/pedidos", label: "Pedidos", icon: ReceiptText },
];

function Layout() {
  return (
    <AppShell title="Parceiro" tabs={tabs}>
      <Outlet />
    </AppShell>
  );
}
