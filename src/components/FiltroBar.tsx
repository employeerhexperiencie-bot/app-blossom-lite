import { SlidersHorizontal, X } from "lucide-react";
import { useState, type ReactNode } from "react";

export type ChipOption = { value: string; label: string };

type Props = {
  busca?: string;
  onBusca?: (v: string) => void;
  buscaPlaceholder?: string;
  chips?: { key: string; label: string; options: ChipOption[]; value: string; onChange: (v: string) => void }[];
  ativos?: number;
  onLimpar?: () => void;
  children?: ReactNode;
};

export function FiltroBar({ busca, onBusca, buscaPlaceholder = "Buscar...", chips = [], ativos = 0, onLimpar, children }: Props) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
      <div className="flex items-center gap-2">
        {onBusca && (
          <input
            value={busca ?? ""}
            onChange={(e) => onBusca(e.target.value)}
            placeholder={buscaPlaceholder}
            className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm"
          />
        )}
        <button
          onClick={() => setAberto((v) => !v)}
          className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold ${
            ativos > 0 ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filtros
          {ativos > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{ativos}</span>}
        </button>
        {ativos > 0 && onLimpar && (
          <button onClick={onLimpar} className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-background text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {aberto && (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {chips.map((chip) => (
            <div key={chip.key}>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{chip.label}</div>
              <div className="flex flex-wrap gap-1.5">
                {chip.options.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => chip.onChange(o.value)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      chip.value === o.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {children}
        </div>
      )}
    </div>
  );
}
