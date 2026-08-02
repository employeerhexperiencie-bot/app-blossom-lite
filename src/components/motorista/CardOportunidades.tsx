import { Link } from "@tanstack/react-router";
import { Flame, Fuel, Wrench, Store, ChevronRight } from "lucide-react";
import { oportunidadesMotorista, type OportunidadeMotorista } from "@/lib/mock-operacao";

const icones = { demanda: Flame, cashback: Fuel, oficina: Wrench, parceiro: Store } as const;

export function CardOportunidades({ compacto = false }: { compacto?: boolean }) {
  const lista = oportunidadesMotorista();
  const itens = compacto ? lista.slice(0, 2) : lista;

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
      <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Oportunidades perto de você
      </h2>
      <div className="flex flex-col gap-2">
        {itens.map((o) => (
          <Item key={o.id} o={o} />
        ))}
      </div>
    </div>
  );
}

function Item({ o }: { o: OportunidadeMotorista }) {
  const Icon = icones[o.tipo];
  return (
    <Link
      to={o.to}
      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-muted p-3 transition-colors hover:bg-accent"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{o.titulo}</div>
        <div className="truncate text-[11px] text-muted-foreground">{o.descricao}</div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success">{o.destaque}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}
