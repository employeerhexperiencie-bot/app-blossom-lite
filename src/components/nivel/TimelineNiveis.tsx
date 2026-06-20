import { Check, Lock } from "lucide-react";
import { NIVEIS, type NivelKey } from "@/lib/niveis";

export function TimelineNiveis({ atual }: { atual: NivelKey }) {
  const idxAtual = NIVEIS.findIndex((n) => n.key === atual);

  return (
    <ol className="relative ml-3 border-l-2 border-dashed border-border pl-6">
      {NIVEIS.map((n, i) => {
        const passado = i < idxAtual;
        const ativo = i === idxAtual;
        const bloqueado = i > idxAtual;
        return (
          <li key={n.key} className="relative pb-7 last:pb-0">
            <span
              className="absolute -left-[33px] grid h-7 w-7 place-items-center rounded-full ring-4 ring-background"
              style={{
                backgroundImage: ativo || passado ? n.gradient : "none",
                backgroundColor: bloqueado ? "var(--muted)" : undefined,
              }}
            >
              {passado ? <Check className="h-3.5 w-3.5 text-white" /> : bloqueado ? <Lock className="h-3 w-3 text-muted-foreground" /> : <span className="h-2 w-2 rounded-full bg-white" />}
            </span>
            <div className={`rounded-2xl border p-4 ${ativo ? "border-primary/40 bg-card shadow-card" : "border-border bg-card/50"}`}>
              <div className="flex items-center gap-3">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display text-[11px] font-extrabold text-white"
                  style={{
                    backgroundImage: bloqueado ? "none" : n.gradient,
                    backgroundColor: bloqueado ? "var(--muted)" : undefined,
                    color: bloqueado ? "var(--muted-foreground)" : undefined,
                  }}
                >
                  R${n.taxaFixa.toFixed(2).replace(".", ",")}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold">{n.nome}</h3>
                    {ativo && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">Atual</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {n.min.toLocaleString("pt-BR")}{n.max === Infinity ? "+" : `–${(n.max - 1).toLocaleString("pt-BR")}`} viagens · {n.frase}
                  </p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {n.beneficios.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs text-foreground/80">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: bloqueado ? "var(--muted-foreground)" : "var(--primary)" }} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
