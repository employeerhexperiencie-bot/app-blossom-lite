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
      className="group relative block overflow-hidden rounded-3xl border border-white/10 text-white shadow-glow"
    >
      <div className="absolute inset-0" style={{ backgroundImage: nivel.gradient }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-12 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-8 h-36 w-36 rounded-full bg-black/30 blur-2xl" />

      <div className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-5">
        <div className="relative grid h-24 w-24 place-items-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r={r} stroke="rgba(0,0,0,0.25)" strokeWidth="6" fill="none" />
            <circle cx="50" cy="50" r={r} stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} />
          </svg>
          <div className="grid h-[84px] w-[84px] place-items-center overflow-hidden rounded-full bg-black/40 ring-2 ring-white/30">
            <img src={nivel.ilustracao} alt={nivel.nome} width={168} height={168} loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-85">{nivel.frase}</p>
          <h2 className="font-street text-3xl font-black uppercase leading-none drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]">{nivel.nome}</h2>
          <div className="mt-2 inline-flex items-baseline gap-1 rounded-lg border border-white/20 bg-black/30 px-2.5 py-1 backdrop-blur">
            <span className="text-[10px] uppercase tracking-wider opacity-85">Você paga</span>
            <span className="font-display text-base font-black">R$ {nivel.taxaFixa.toFixed(2).replace(".", ",")}</span>
            <span className="text-[10px] opacity-85">/viagem</span>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 opacity-90" />
      </div>

      <div className="relative px-5 pb-5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-black/30 ring-1 ring-white/10">
          <div className="h-full rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.6)]" style={{ width: `${Math.round(pct * 100)}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-90">
          <span>{viagens.toLocaleString("pt-BR")} viagens</span>
          <span>
            {proximo ? <>faltam {restante.toLocaleString("pt-BR")} p/ {proximo.nome}</> : "nível máximo"}
          </span>
        </div>
      </div>
    </Link>
  );
}
