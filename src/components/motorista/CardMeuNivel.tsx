import { Link } from "@tanstack/react-router";
import { ChevronRight, Sparkles } from "lucide-react";
import { getNivelByViagens, getProximoNivel, progressoNivel, economiaMes, progressoMock } from "@/lib/niveis";

export function CardMeuNivel() {
  const viagens = progressoMock.viagensTotais;
  const { nivel, pct, restante } = progressoNivel(viagens);
  const proximo = getProximoNivel(nivel.key);
  const atual = getNivelByViagens(viagens);
  const economia = economiaMes(progressoMock.viagensMes, atual.taxaFixa);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 text-white shadow-glow">
      <div className="absolute inset-0" style={{ backgroundImage: nivel.gradient }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-12 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

      <div className="relative p-5">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
          <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl bg-black/35 ring-2 ring-white/25">
            <img src={nivel.ilustracao} alt={nivel.nome} className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-85">Meu nível</p>
            <h2 className="font-street text-3xl font-black uppercase leading-none drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]">
              {nivel.nome}
            </h2>
            <div className="mt-2 inline-flex items-baseline gap-1 rounded-lg border border-white/20 bg-black/30 px-2.5 py-1 backdrop-blur">
              <span className="text-[10px] uppercase tracking-wider opacity-85">Você paga</span>
              <span className="font-display text-base font-black">R$ {nivel.taxaFixa.toFixed(2).replace(".", ",")}</span>
              <span className="text-[10px] opacity-85">/viagem</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/30 ring-1 ring-white/10">
            <div className="h-full rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.6)]" style={{ width: `${Math.round(pct * 100)}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-90">
            <span>{viagens.toLocaleString("pt-BR")} viagens</span>
            <span>{proximo ? `faltam ${restante.toLocaleString("pt-BR")} p/ ${proximo.nome}` : "nível máximo"}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/15 bg-black/25 p-2.5">
            <div className="text-[10px] uppercase tracking-wider opacity-80">Economia acumulada</div>
            <div className="font-display text-lg font-black">R$ {economia.toFixed(2).replace(".", ",")}</div>
          </div>
          <div className="rounded-xl border border-white/15 bg-black/25 p-2.5">
            <div className="text-[10px] uppercase tracking-wider opacity-80">Viagens no mês</div>
            <div className="font-display text-lg font-black">{progressoMock.viagensMes}</div>
          </div>
        </div>

        <ul className="mt-3 space-y-1">
          {nivel.beneficios.slice(0, 3).map((b) => (
            <li key={b} className="flex items-start gap-1.5 text-[12px] opacity-95">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0">{b}</span>
            </li>
          ))}
        </ul>

        <Link
          to="/motorista/clube"
          className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-white/95 py-2.5 text-sm font-black uppercase tracking-wider text-black"
        >
          Ver benefícios <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
