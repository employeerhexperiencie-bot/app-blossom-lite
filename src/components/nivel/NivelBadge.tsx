import { type NivelInfo } from "@/lib/niveis";

export function NivelBadge({ nivel, size = "md" }: { nivel: NivelInfo; size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "text-[10px] px-2 py-0.5" : size === "lg" ? "text-sm px-3 py-1.5" : "text-xs px-2.5 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-display font-bold uppercase tracking-wider text-white shadow-soft ${dims}`}
      style={{ backgroundImage: nivel.gradient }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/90" />
      {nivel.nome}
    </span>
  );
}
