import { saudePadrao, type SaudeVeiculo } from "@/lib/mock-oficina";

const cor = {
  ok: "text-success",
  atencao: "text-warning-foreground",
  critico: "text-destructive",
} as const;

const icone = { ok: "✔", atencao: "⚠", critico: "✖" } as const;

export function SaudeVeiculoCard({ km, saude }: { km?: number; saude?: SaudeVeiculo }) {
  const s = saude ?? saudePadrao(km ?? 0);
  const barra = s.score >= 80 ? "bg-success" : s.score >= 55 ? "bg-warning" : "bg-destructive";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-sm font-black uppercase tracking-wider">Saúde do veículo</span>
        <span className="font-display text-2xl font-black">{s.score}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${barra}`} style={{ width: `${s.score}%` }} />
      </div>
      <ul className="mt-3 space-y-1.5">
        {s.itens.map((i) => (
          <li key={i.nome} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-sm">
            <span className={cor[i.status]}>{icone[i.status]}</span>
            <span className="truncate">{i.nome}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{i.detalhe}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
