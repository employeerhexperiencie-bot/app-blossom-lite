import { useState } from "react";
import { Calculator } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { simularProximoNivel, getNivelByViagens, getProximoNivel, type ProgressoMotorista } from "@/lib/niveis";

export function SimuladorProximoNivel({ progresso }: { progresso: ProgressoMotorista }) {
  const nivel = getNivelByViagens(progresso.viagensTotais);
  const proximo = getProximoNivel(nivel.key);
  const faltam = proximo ? Math.max(1, proximo.min - progresso.viagensTotais) : 100;
  const max = Math.max(faltam * 2, 200);
  const [extra, setExtra] = useState(Math.min(faltam, 100));
  const r = simularProximoNivel(progresso, extra);

  if (!proximo) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <h3 className="font-display text-sm font-bold">Simulador</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Você já está no nível máximo. Mantenha as regras para garantir os benefícios.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-bold">Simule sua evolução</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Quanto você economiza ao acelerar o ritmo de viagens.
      </p>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Viagens extras</span>
          <span className="font-display text-2xl font-extrabold">+{extra}</span>
        </div>
        <Slider value={[extra]} onValueChange={(v) => setExtra(v[0])} min={0} max={max} step={10} className="mt-2" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Result label="Nível resultante" value={r.novoNivel.nome} highlight={r.atingiuProximo} />
        <Result label={r.atingiuProximo ? "Subiu!" : "Faltam"} value={r.atingiuProximo ? "🎉" : `${r.faltam} viagens`} highlight={r.atingiuProximo} />
        <Result label="Economia estimada no mês" value={`R$ ${r.economiaTotal.toFixed(2).replace(".", ",")}`} highlight full />
      </div>
    </div>
  );
}

function Result({ label, value, highlight, full }: { label: string; value: string; highlight?: boolean; full?: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${highlight ? "border-primary/40 bg-primary/5" : "border-border bg-muted/50"} ${full ? "col-span-2" : ""}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display text-base font-extrabold ${highlight ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}
