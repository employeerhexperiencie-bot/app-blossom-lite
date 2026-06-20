import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { getNivel, type ProgressoMotorista } from "@/lib/niveis";

const icone = { promovido: ArrowUp, mantido: Minus, rebaixado: ArrowDown } as const;
const cor = { promovido: "text-success", mantido: "text-muted-foreground", rebaixado: "text-destructive" } as const;
const rotulo = { promovido: "Promovido", mantido: "Mantido", rebaixado: "Rebaixado" } as const;

export function HistoricoNiveis({ progresso }: { progresso: ProgressoMotorista }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <h3 className="font-display text-sm font-bold">Histórico dos últimos meses</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {progresso.historicoMeses.map((h, i) => {
          const n = getNivel(h.nivel);
          const Icon = icone[h.status];
          return (
            <li key={i} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-muted/50 px-3 py-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg font-display text-[10px] font-extrabold text-white" style={{ backgroundImage: n.gradient }}>
                {h.mes}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{n.nome}</div>
                <div className="text-[11px] text-muted-foreground">R$ {n.taxaFixa.toFixed(2).replace(".", ",")} por viagem</div>
              </div>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${cor[h.status]}`}>
                <Icon className="h-3 w-3" />
                {rotulo[h.status]}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
