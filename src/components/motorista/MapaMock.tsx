import { areasDemanda } from "@/lib/mock-operacao";
import { parceiros } from "@/lib/mock-data";

export function MapaMock({ className = "" }: { className?: string }) {
  const pins = parceiros.slice(0, 4);

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-border bg-muted ${className}`}>
      {/* grade da cidade */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
        }}
      />
      <div className="absolute inset-x-0 top-1/3 h-3 -rotate-6 bg-border/70" />
      <div className="absolute inset-y-0 left-1/2 w-3 rotate-3 bg-border/70" />

      {/* áreas de demanda */}
      {areasDemanda.map((a) => (
        <div key={a.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${a.x}%`, top: `${a.y}%` }}>
          <div
            className={`h-20 w-20 rounded-full blur-xl ${a.nivel === "alta" ? "bg-primary/50" : "bg-warning/35"}`}
          />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-background/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            {a.nome} ·{a.multiplicador.toFixed(1).replace(".", ",")}x
          </span>
        </div>
      ))}

      {/* parceiros próximos */}
      {pins.map((p, i) => (
        <div
          key={p.id}
          className="absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-[9px] font-black text-success shadow-card"
          style={{ left: `${18 + i * 21}%`, top: `${52 + (i % 2) * 26}%` }}
          title={p.nome}
        >
          -{p.desconto}
        </div>
      ))}

      {/* motorista */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 -m-3 animate-ping rounded-full bg-success/40" />
        <span className="relative block h-4 w-4 rounded-full border-2 border-background bg-success shadow-glow" />
      </div>
    </div>
  );
}
