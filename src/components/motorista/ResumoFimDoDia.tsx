import { Link } from "@tanstack/react-router";
import { Moon, TrendingUp, Wallet, Gift, PiggyBank, Trophy } from "lucide-react";
import { fmtBRL, operacaoDia, resumoDia, custosDoDia } from "@/lib/mock-operacao";
import { progressoNivel, getProximoNivel, progressoMock } from "@/lib/niveis";
import { useConect } from "@/lib/store";

export function ResumoFimDoDia() {
  const op = operacaoDia();
  const reabrir = useConect((s) => s.reabrirDia);
  const { nivel, pct, restante } = progressoNivel(progressoMock.viagensTotais);
  const proximo = getProximoNivel(nivel.key);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-border bg-card p-5 text-center shadow-card">
        <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
          <Moon className="h-6 w-6" />
        </div>
        <h2 className="font-street text-2xl font-black uppercase leading-none">Dia encerrado</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {resumoDia.corridas} corridas · {resumoDia.horasOnline}h online · {resumoDia.kmRodados} km
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Kpi icon={Wallet} label="Ganhos" value={fmtBRL(op.receita)} tint="text-foreground" />
        <Kpi icon={TrendingUp} label="Lucro" value={fmtBRL(op.lucro)} tint="text-success" />
        <Kpi icon={Wallet} label="Custos" value={fmtBRL(op.custos)} tint="text-destructive" />
        <Kpi icon={Gift} label="Cashback" value={fmtBRL(op.cashback)} tint="text-primary" />
      </div>

      <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Onde foi o dinheiro</h3>
        <div className="flex flex-col gap-2">
          {custosDoDia().map((c) => (
            <div key={c.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <div className="min-w-0">
                <div className="truncate text-xs">{c.label}</div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${(c.valor / op.custos) * 100}%`, background: c.cor }} />
                </div>
              </div>
              <span className="font-display text-sm font-bold">{fmtBRL(c.valor)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-3xl border border-success/30 bg-success/5 p-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success">
          <PiggyBank className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">Economia na taxa por ser {nivel.nome}</div>
          <div className="font-display text-lg font-black text-success">{fmtBRL(op.economiaTaxa)} hoje</div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
        <div className="mb-2 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Progresso no nível</h3>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full" style={{ width: `${Math.round(pct * 100)}%`, backgroundImage: nivel.gradient }} />
        </div>
        <div className="mt-1.5 text-[11px] text-muted-foreground">
          {proximo ? `Faltam ${restante.toLocaleString("pt-BR")} viagens para ${proximo.nome}` : "Você está no nível máximo"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={reabrir} className="rounded-xl gradient-primary py-2.5 text-sm font-black uppercase tracking-wider text-primary-foreground shadow-glow">
          Voltar ao início
        </button>
        <Link to="/motorista/operacao" className="rounded-xl border border-border bg-muted py-2.5 text-center text-sm font-black uppercase tracking-wider">
          Ver operação
        </Link>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, tint }: { icon: typeof Wallet; label: string; value: string; tint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className={`font-display text-lg font-black ${tint}`}>{value}</div>
    </div>
  );
}
