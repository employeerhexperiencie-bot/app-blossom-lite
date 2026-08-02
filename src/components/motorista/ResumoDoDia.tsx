import { Link } from "@tanstack/react-router";
import { Clock, Navigation, Target, Wallet } from "lucide-react";
import { metaDiaria, resumoDia } from "@/lib/mock-operacao";
import { useConect } from "@/lib/store";

export function ResumoDoDia() {
  const minutos = useConect((s) => s.minutosOnlineHoje);
  const feitas = useConect((s) => s.corridasFeitasHoje).length;
  const corridas = resumoDia.corridas + feitas;
  const ganhos = resumoDia.ganhosBrutos;
  const pct = Math.min(1, ganhos / metaDiaria.ganhos);
  const horas = resumoDia.horasOnline + minutos / 60;

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Resumo do dia</h2>
        <Link to="/motorista/operacao" className="text-xs font-semibold text-primary">Detalhes</Link>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Bloco icon={Wallet} label="Ganhos" value={`R$ ${ganhos.toFixed(2).replace(".", ",")}`} tint="text-success" />
        <Bloco icon={Navigation} label="Corridas" value={String(corridas)} tint="text-primary" />
        <Bloco icon={Clock} label="Tempo online" value={`${horas.toFixed(1).replace(".", ",")}h`} tint="text-foreground" />
        <Bloco icon={Target} label="Meta do dia" value={`${Math.round(pct * 100)}%`} tint="text-warning" />
      </div>

      <div className="mt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full gradient-primary" style={{ width: `${Math.round(pct * 100)}%` }} />
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          Meta de R$ {metaDiaria.ganhos.toFixed(2).replace(".", ",")} · faltam R$ {Math.max(0, metaDiaria.ganhos - ganhos).toFixed(2).replace(".", ",")}
        </div>
      </div>
    </div>
  );
}

function Bloco({ icon: Icon, label, value, tint }: { icon: typeof Wallet; label: string; value: string; tint: string }) {
  return (
    <div className="rounded-2xl bg-muted px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className={`font-display text-lg font-black ${tint}`}>{value}</div>
    </div>
  );
}
