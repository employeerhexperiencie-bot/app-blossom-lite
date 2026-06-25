import mark from "@/assets/tchileva-mark.png";

export function BrandMark({ size = 32, withWordmark = false }: { size?: number; withWordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={mark}
        alt="TCHI LÉVA"
        width={size}
        height={size}
        loading="eager"
        className="shrink-0 drop-shadow-[0_3px_8px_rgba(255,180,0,0.35)]"
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
