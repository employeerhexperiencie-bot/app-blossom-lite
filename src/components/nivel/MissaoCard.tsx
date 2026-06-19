import { Sparkles } from "lucide-react";
import type { Missao } from "@/lib/niveis";

export function MissaoCard({ m }: { m: Missao }) {
  const pct = Math.min(100, Math.round((m.progresso / m.meta) * 100));
  const completa = m.progresso >= m.meta;
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <div className="truncate font-semibold">{m.titulo}</div>
          <div className="truncate text-xs text-muted-foreground">{m.descricao}</div>
        </div>
        <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary">
          <Sparkles className="h-3 w-3" /> +{m.xp} XP
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: completa ? "var(--success)" : "var(--primary)" }}
        />
      </div>
      <div className="mt-1.5 text-[11px] font-semibold text-muted-foreground">
        {m.progresso} / {m.meta} {completa && "· concluída!"}
      </div>
    </div>
  );
}
