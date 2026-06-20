import { HeartHandshake, Ban, Star } from "lucide-react";
import { REGRAS, regrasManutencao, type ProgressoMotorista, type RegraStatus } from "@/lib/niveis";

const styles: Record<RegraStatus, string> = {
  ok: "bg-success/10 text-success border-success/30",
  atencao: "bg-warning/20 text-warning-foreground border-warning/50",
  risco: "bg-destructive/10 text-destructive border-destructive/40",
};

export function StatusMesStrip({ progresso }: { progresso: ProgressoMotorista }) {
  const s = regrasManutencao(progresso);
  return (
    <div className="grid grid-cols-3 gap-2">
      <Chip icon={HeartHandshake} label="Caronas" value={`${progresso.caronasMes}/${REGRAS.caronasMin}`} status={s.caronas} />
      <Chip icon={Ban} label="Rejeições" value={`${progresso.rejeicoesMes}/${REGRAS.rejeicoesMax}`} status={s.rejeicoes} />
      <Chip icon={Star} label="Estrelas" value={progresso.mediaEstrelas.toFixed(2)} status={s.estrelas} />
    </div>
  );
}

function Chip({ icon: Icon, label, value, status }: { icon: typeof Star; label: string; value: string; status: RegraStatus }) {
  return (
    <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 ${styles[status]}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <div className="truncate text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</div>
        <div className="truncate font-display text-sm font-extrabold">{value}</div>
      </div>
    </div>
  );
}
