import { Link } from "@tanstack/react-router";

// Alterna entre Contratos e Motoristas, que ficam juntos na aba Contratos.
export function ContratosNav({ atual }: { atual: "contratos" | "motoristas" }) {
  const item = (ativo: boolean) =>
    `flex-1 rounded-full px-3 py-1.5 text-center text-xs font-semibold ${
      ativo ? "bg-primary text-primary-foreground" : "text-muted-foreground"
    }`;
  return (
    <div className="mb-4 flex gap-1 rounded-full border border-border bg-card p-1">
      <Link to="/proprietario/contratos" className={item(atual === "contratos")}>
        Contratos
      </Link>
      <Link to="/proprietario/contratos/motoristas" className={item(atual === "motoristas")}>
        Motoristas
      </Link>
    </div>
  );
}
