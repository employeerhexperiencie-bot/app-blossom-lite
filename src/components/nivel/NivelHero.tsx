import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { getProximoNivel, progressoNivel } from "@/lib/niveis";

export function NivelHero({ viagens }: { viagens: number }) {
  const { nivel, pct, restante } = progressoNivel(viagens);
  const proximo = getProximoNivel(nivel.key);
  const r = 38;
  const c = 2 * Math.PI * r;
  const dash = pct * c;

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
            <circle cx="50" cy="50" r={r} stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} />
          </svg>
          <img src={nivel.ilustracao} alt={nivel.nome} width={80} height={80} loading="lazy" className="h-20 w-20 rounded-full bg-white/15 object-contain p-1" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">{nivel.frase}</p>
          <h2 className="font-display text-2xl font-extrabold leading-tight">{nivel.nome}</h2>
          <div className="mt-1.5 inline-flex items-baseline gap-1 rounded-lg bg-white/15 px-2.5 py-1 backdrop-blur">
            <span className="text-[10px] uppercase tracking-wider opacity-80">Você paga</span>
            <span className="font-display text-base font-extrabold">R$ {nivel.taxaFixa.toFixed(2).replace(".", ",")}</span>
            <span className="text-[10px] opacity-80">/viagem</span>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 opacity-80" />
      </div>

      <div className="relative mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white" style={{ width: `${Math.round(pct * 100)}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] font-semibold opacity-90">
          <span>{viagens.toLocaleString("pt-BR")} viagens</span>
          <span>
            {proximo ? <>faltam {restante.toLocaleString("pt-BR")} para {proximo.nome}</> : "nível máximo"}
          </span>
        </div>
      </div>
    </Link>
  );
}
