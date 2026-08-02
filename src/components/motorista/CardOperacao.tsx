import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Gift, PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import { fmtBRL, operacaoDia } from "@/lib/mock-operacao";

export function CardOperacao() {
  const op = operacaoDia();

  return (
    <Link to="/motorista/operacao" className="block rounded-3xl border border-border bg-card p-4 shadow-card transition-colors hover:border-primary/40">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Minha operação</h2>
        <ArrowUpRight className="h-4 w-4 text-primary" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Item icon={TrendingUp} label="Lucro estimado" value={fmtBRL(op.lucro)} tint="text-success" />
        <Item icon={TrendingDown} label="Gastos estimados" value={fmtBRL(op.custos)} tint="text-destructive" />
        <Item icon={Gift} label="Cashback" value={fmtBRL(op.cashback)} tint="text-primary" />
        <Item icon={PiggyBank} label="Economia na taxa" value={fmtBRL(op.economiaTaxa)} tint="text-success" />
      </div>

      <div className="mt-3 rounded-xl bg-muted px-3 py-2 text-[11px] text-muted-foreground">
        Margem de {Math.round(op.margem * 100)}% · custo por km {fmtBRL(op.custoPorKm)} · lucro por hora {fmtBRL(op.lucroPorHora)}
      </div>
    </Link>
  );
}

function Item({ icon: Icon, label, value, tint }: { icon: typeof Gift; label: string; value: string; tint: string }) {
  return (
    <div className="rounded-2xl bg-muted px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className={`font-display text-base font-black ${tint}`}>{value}</div>
    </div>
  );
}
