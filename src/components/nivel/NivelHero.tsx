import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { getNivelByCorridas, getProximoNivel } from "@/lib/niveis";

export function NivelHero({ corridas }: { corridas: number }) {
  const nivel = getNivelByCorridas(corridas);
  const proximo = getProximoNivel(nivel.key);
  const meta = proximo ? proximo.min : nivel.max;
  const restante = proximo ? Math.max(0, proximo.min - corridas) : 0;
  const total = proximo ? proximo.min - nivel.min : 1;
  const feito = proximo ? corridas - nivel.min : total;
  const pct = Math.min(100, Math.round((feito / total) * 100));

  const r = 38;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <Link
      to="/motorista/jornada"
      className="relative block overflow-hidden rounded-3xl p-5 text-white shadow-glow"
      style={{ backgroundImage: nivel.gradient }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-white/5" />

      <div className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
        <div className="relative grid h-24 w-24 place-items-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r={r} stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="none" />
            <circle
              cx="50" cy="50" r={r}
              stroke="white" strokeWidth="6" fill="none" strokeLinecap="round"
              strokeDasharray={`${dash} ${c}`}
            />
          </svg>
          <img src={nivel.ilustracao} alt={nivel.nome} width={80} height={80} loading="lazy" className="h-20 w-20 rounded-full bg-white/15 object-contain p-1" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">{nivel.frase}</p>
          <h2 className="font-display text-2xl font-extrabold leading-tight">{nivel.nome}</h2>
          <p className="mt-1 text-xs opacity-90">
            {proximo ? <>Faltam <b>{restante}</b> corridas para <b>{proximo.nome}</b></> : <>Você é uma lenda</>}
          </p>
        </div>

        <ChevronRight className="h-5 w-5 opacity-80" />
      </div>

      <div className="relative mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] font-semibold opacity-80">
          <span>{corridas} corridas</span>
          <span>{proximo ? `meta ${meta}` : "máximo"}</span>
        </div>
      </div>
    </Link>
  );
}
