import { type ProgressoMotorista } from "@/lib/niveis";

export function RitmoSemanal({ progresso }: { progresso: ProgressoMotorista }) {
  const semanas = progresso.viagensPorSemana;
  const max = Math.max(...semanas, 60);
  const passadas = semanas.slice(0, -1);
  const media = passadas.length ? Math.round(passadas.reduce((a, b) => a + b, 0) / passadas.length) : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold">Ritmo de viagens</h3>
        <span className="text-[11px] font-semibold text-muted-foreground">média {media}/sem</span>
      </div>
      <div className="mt-4 flex h-28 items-end gap-3">
        {semanas.map((v, i) => {
          const h = Math.round((v / max) * 100);
          const atual = i === semanas.length - 1;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`w-full rounded-t-lg ${atual ? "bg-primary" : "bg-primary/30"}`}
                style={{ height: `${h}%`, minHeight: 6 }}
                aria-label={`Semana ${i + 1}: ${v} viagens`}
              />
              <span className={`text-[10px] font-semibold ${atual ? "text-primary" : "text-muted-foreground"}`}>S{i + 1}</span>
              <span className="text-[10px] text-muted-foreground">{v}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">Semana atual em destaque</p>
    </div>
  );
}
