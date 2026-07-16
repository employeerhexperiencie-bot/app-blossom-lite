import logo from "@/assets/tchileva-logo.png.asset.json";

export function BrandMark({ size = 32, withWordmark = false }: { size?: number; withWordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={logo.url}
        alt="TCHI LÉVA"
        width={size}
        height={size}
        loading="eager"
        className="shrink-0 rounded-lg object-cover shadow-[0_3px_10px_rgba(0,0,0,0.35)]"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className="font-street text-[15px] font-black uppercase tracking-[0.18em] text-foreground">
          Tchi <span className="text-primary">Léva</span>
        </span>
      )}
    </div>
  );
}
