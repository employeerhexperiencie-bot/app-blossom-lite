import { Link } from "@tanstack/react-router";
import { Power, ChevronRight } from "lucide-react";
import { getNivelByViagens, getProximoNivel, progressoNivel, progressoMock } from "@/lib/niveis";
import { useConect } from "@/lib/store";

export function HeaderMotorista() {
  const nome = useConect((s) => s.nomeUsuario) || "Motorista";
  const status = useConect((s) => s.statusOperacao);
  const ficarOnline = useConect((s) => s.ficarOnline);
  const ficarOffline = useConect((s) => s.ficarOffline);
  const online = status === "online" || status === "em_corrida";

  const nivel = getNivelByViagens(progressoMock.viagensTotais);
  const { pct, restante } = progressoNivel(progressoMock.viagensTotais);
  const proximo = getProximoNivel(nivel.key);

  return (
    <div className="rounded-3xl border border-border bg-card p-3.5 shadow-card">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <Link to="/motorista/clube" className="relative shrink-0">
          <div
            className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl ring-2 ring-white/15"
            style={{ backgroundImage: nivel.gradient }}
          >
            <img src={nivel.ilustracao} alt={nivel.nome} className="h-full w-full object-cover" loading="lazy" />
          </div>
          <span
            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card ${
              online ? "bg-success" : "bg-muted-foreground"
            }`}
          />
        </Link>

        <div className="min-w-0">
          <div className="truncate font-street text-lg font-black uppercase leading-none">{nome.split(" ")[0]}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
            <span className="rounded-full px-2 py-0.5 text-white" style={{ backgroundImage: nivel.gradient }}>
              {nivel.nome}
            </span>
            <span className={online ? "text-success" : "text-muted-foreground"}>{online ? "Online" : "Offline"}</span>
          </div>
        </div>

        <button
          onClick={() => (online ? ficarOffline() : ficarOnline())}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            online
              ? "border border-border bg-muted text-foreground"
              : "gradient-primary text-primary-foreground shadow-glow"
          }`}
        >
          <Power className="h-3.5 w-3.5" />
          {online ? "Parar" : "Rodar"}
        </button>
      </div>

      <Link to="/motorista/clube" className="mt-3 block">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full" style={{ width: `${Math.round(pct * 100)}%`, backgroundImage: nivel.gradient }} />
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <span>{progressoMock.viagensTotais.toLocaleString("pt-BR")} viagens</span>
          <span className="inline-flex items-center gap-0.5">
            {proximo ? `faltam ${restante} p/ ${proximo.nome}` : "nível máximo"}
            <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </Link>
    </div>
  );
}
