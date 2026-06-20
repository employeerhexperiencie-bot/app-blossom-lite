import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { REGRAS, regrasManutencao, type ProgressoMotorista, type RegraStatus } from "@/lib/niveis";

const statusLabel: Record<RegraStatus, string> = { ok: "Em dia", atencao: "Atenção", risco: "Em risco" };
const barColor: Record<RegraStatus, string> = {
  ok: "var(--success)",
  atencao: "var(--warning)",
  risco: "var(--destructive)",
};

export function ManutencaoCard({ progresso }: { progresso: ProgressoMotorista }) {
  const s = regrasManutencao(progresso);
  const HeaderIcon = s.geral === "ok" ? CheckCircle2 : s.geral === "atencao" ? ShieldCheck : AlertTriangle;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <HeaderIcon className="h-4 w-4" style={{ color: barColor[s.geral] }} />
          <h3 className="font-display text-sm font-bold">Manutenção do mês</h3>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground">faltam {progresso.diasRestantesMes} dias</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Falhar em qualquer regra rebaixa seu nível no fechamento do mês.
      </p>

      <div className="mt-3 flex flex-col gap-3">
        <Linha titulo="Caronas solidárias" pct={Math.min(100, (progresso.caronasMes / REGRAS.caronasMin) * 100)} status={s.caronas} texto={`${progresso.caronasMes} de ${REGRAS.caronasMin} dadas`} />
        <Linha titulo="Rejeições no mês" pct={Math.min(100, (progresso.rejeicoesMes / REGRAS.rejeicoesMax) * 100)} status={s.rejeicoes} texto={`${progresso.rejeicoesMes} de no máx. ${REGRAS.rejeicoesMax}`} />
        <Linha titulo="Média de estrelas" pct={Math.min(100, (progresso.mediaEstrelas / 5) * 100)} status={s.estrelas} texto={`${progresso.mediaEstrelas.toFixed(2)} (mínimo ${REGRAS.estrelasMin.toFixed(1)})`} />
      </div>
    </div>
  );
}

function Linha({ titulo, pct, status, texto }: { titulo: string; pct: number; status: RegraStatus; texto: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold">{titulo}</span>
        <span className="font-semibold" style={{ color: barColor[status] }}>{statusLabel[status]}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor[status] }} />
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{texto}</div>
    </div>
  );
}
