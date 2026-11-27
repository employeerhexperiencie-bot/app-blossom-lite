import { useState } from "react";
import { AlertTriangle, Camera, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProprietario } from "@/lib/store-proprietario";
import { hojeISO } from "@/lib/mock-proprietario";
import {
  ladosFoto,
  reduzirFoto,
  situacaoVistoria,
  type LadoFoto,
  type Vistoria,
} from "@/lib/vistorias";
import { VISTORIA } from "@/lib/regras-proprietario";

/** Última vistoria do carro, se houver. */
export function useUltimaVistoria(carroId: string): Vistoria | undefined {
  return useProprietario((s) =>
    s.vistorias
      .filter((v) => v.carroId === carroId)
      .reduce<Vistoria | undefined>((a, v) => (!a || v.enviadaEm > a.enviadaEm ? v : a), undefined),
  );
}

export function useSituacaoVistoria(carroId: string, kmAtual: number) {
  const ultima = useUltimaVistoria(carroId);
  return situacaoVistoria(
    ultima ? { km: ultima.km, data: ultima.enviadaEm.slice(0, 10) } : undefined,
    kmAtual,
    hojeISO(),
  );
}

/**
 * Vistoria com fotos tiradas na hora: o campo abre a câmera do celular (sem galeria),
 * guarda data, hora e, se a pessoa permitir, a localização do envio.
 */
export function VistoriaForm({
  carroId,
  kmAtual,
  enviadaPor,
  onEnviada,
  onCancelar,
}: {
  carroId: string;
  kmAtual: number;
  enviadaPor: Vistoria["enviadaPor"];
  onEnviada?: () => void;
  onCancelar?: () => void;
}) {
  const registrar = useProprietario((s) => s.registrarVistoria);
  const [fotos, setFotos] = useState<Partial<Record<LadoFoto, string>>>({});
  const [km, setKm] = useState("");
  const [luzAcesa, setLuzAcesa] = useState(false);
  const [avarias, setAvarias] = useState("");
  const [local, setLocal] = useState<{ lat: number; lng: number } | undefined>();
  const [buscandoLocal, setBuscandoLocal] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const qtd = Object.keys(fotos).length;

  async function capturar(lado: LadoFoto, arquivo: File | undefined) {
    if (!arquivo) return;
    try {
      const reduzida = await reduzirFoto(arquivo);
      setFotos((f) => ({ ...f, [lado]: reduzida }));
      // A localização é pedida uma vez, na primeira foto.
      if (!local && !buscandoLocal && typeof navigator !== "undefined" && navigator.geolocation) {
        setBuscandoLocal(true);
        navigator.geolocation.getCurrentPosition(
          (p) => {
            setLocal({
              lat: Math.round(p.coords.latitude * 1e4) / 1e4,
              lng: Math.round(p.coords.longitude * 1e4) / 1e4,
            });
            setBuscandoLocal(false);
          },
          () => setBuscandoLocal(false),
          { timeout: 8000, maximumAge: 60000 },
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível usar a foto");
    }
  }

  function enviar() {
    setErro("");
    if (!fotos.painel) return setErro("A foto do painel é obrigatória: é ela que comprova o KM.");
    if (qtd < 3) return setErro("Envie pelo menos 3 fotos: o painel e dois lados do carro.");
    setEnviando(true);
    const res = registrar({
      carroId,
      km: Number(km),
      fotos,
      qtdFotos: qtd,
      local,
      luzAcesa,
      avarias: avarias.trim() || undefined,
      enviadaPor,
    });
    setEnviando(false);
    if (!res.ok) return setErro(res.erro);
    if (res.alerta) toast.warning(`Vistoria enviada com alerta: ${res.alerta}`);
    else toast.success("Vistoria enviada");
    onEnviada?.();
  }

  return (
    <div className="space-y-3 rounded-2xl border border-primary/40 bg-primary/5 p-4">
      <div>
        <div className="font-street text-sm font-black uppercase">Vistoria com fotos</div>
        <p className="text-[11px] text-muted-foreground">
          Tire as fotos agora, pela câmera. A cada {VISTORIA.dias} dias ou{" "}
          {VISTORIA.km.toLocaleString("pt-BR")} km.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ladosFoto.map((l) => (
          <label
            key={l.key}
            className={`relative grid aspect-[4/3] cursor-pointer place-items-center overflow-hidden rounded-xl border text-center text-[11px] ${
              fotos[l.key] ? "border-primary" : "border-dashed border-border bg-background"
            } ${l.key === "painel" ? "col-span-2 aspect-[16/7]" : ""}`}
          >
            {fotos[l.key] ? (
              <img src={fotos[l.key]} alt={l.label} className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-1 text-muted-foreground">
                <Camera className="h-5 w-5" />
                {l.label}
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => capturar(l.key, e.target.files?.[0])}
            />
          </label>
        ))}
      </div>

      <div>
        <Label className="text-xs">KM no painel</Label>
        <Input
          className="mt-1"
          type="number"
          inputMode="numeric"
          value={km}
          onChange={(e) => setKm(e.target.value)}
          placeholder={`Maior ou igual a ${kmAtual.toLocaleString("pt-BR")}`}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={luzAcesa} onChange={(e) => setLuzAcesa(e.target.checked)} />
        Tem luz de alerta acesa no painel
      </label>

      <div>
        <Label className="text-xs">Avarias novas (se houver)</Label>
        <Textarea
          rows={2}
          className="mt-1"
          value={avarias}
          onChange={(e) => setAvarias(e.target.value)}
          placeholder="Risco na porta traseira, pneu careca..."
        />
      </div>

      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <MapPin className="h-3 w-3" />
        {local
          ? "Localização registrada junto com as fotos."
          : buscandoLocal
            ? "Pegando a localização..."
            : "A localização é registrada se você permitir."}
      </p>

      {erro && (
        <p className="flex items-start gap-1 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {erro}
        </p>
      )}

      <div className="flex gap-2">
        {onCancelar && (
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onCancelar}>
            Cancelar
          </Button>
        )}
        <Button
          className="flex-1 rounded-xl gradient-primary text-primary-foreground"
          disabled={enviando}
          onClick={enviar}
        >
          Enviar vistoria ({qtd}/5)
        </Button>
      </div>
    </div>
  );
}

/** Lista de vistorias do carro, com a situação da próxima. */
export function VistoriasPainel({ carroId, kmAtual }: { carroId: string; kmAtual: number }) {
  const vistorias = useProprietario((s) => s.vistorias);
  const situacao = useSituacaoVistoria(carroId, kmAtual);
  const [fazendo, setFazendo] = useState(false);
  const doCarro = vistorias
    .filter((v) => v.carroId === carroId)
    .sort((a, b) => b.enviadaEm.localeCompare(a.enviadaEm));

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`rounded-2xl border p-4 shadow-card ${situacao.pendente ? "border-warning/60 bg-warning/5" : "border-border bg-card"}`}
      >
        <div className="text-sm font-semibold">
          {situacao.pendente ? "Vistoria pendente" : "Vistoria em dia"}
        </div>
        <p className="text-xs text-muted-foreground">
          {situacao.motivo}. O motorista envia pelo app dele; você também pode fazer na entrega.
        </p>
        {!fazendo && (
          <Button
            size="sm"
            variant="outline"
            className="mt-3 w-full rounded-xl"
            onClick={() => setFazendo(true)}
          >
            <Camera className="mr-2 h-4 w-4" /> Fazer vistoria agora
          </Button>
        )}
      </div>

      {fazendo && (
        <VistoriaForm
          carroId={carroId}
          kmAtual={kmAtual}
          enviadaPor="proprietario"
          onEnviada={() => setFazendo(false)}
          onCancelar={() => setFazendo(false)}
        />
      )}

      {doCarro.map((v) => (
        <div key={v.id} className="rounded-2xl border border-border bg-card p-3 shadow-card">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-semibold">{v.km.toLocaleString("pt-BR")} km</span>
            <span className="text-[11px] text-muted-foreground">
              {new Date(v.enviadaEm).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · {v.enviadaPor === "motorista" ? "motorista" : "você"}
            </span>
          </div>
          {Object.keys(v.fotos).length > 0 ? (
            <div className="mt-2 grid grid-cols-5 gap-1">
              {ladosFoto.map((l) =>
                v.fotos[l.key] ? (
                  <img
                    key={l.key}
                    src={v.fotos[l.key]}
                    alt={l.label}
                    title={l.label}
                    className="aspect-square w-full rounded-md object-cover"
                  />
                ) : null,
              )}
            </div>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">
              {v.qtdFotos} fotos (as imagens antigas não ficam guardadas no aparelho).
            </p>
          )}
          {(v.alerta || v.luzAcesa || v.avarias) && (
            <ul className="mt-2 space-y-0.5 text-[11px] text-warning-foreground">
              {v.luzAcesa && <li>Luz de alerta acesa no painel</li>}
              {v.avarias && <li>Avarias: {v.avarias}</li>}
              {v.alerta && <li>{v.alerta}</li>}
            </ul>
          )}
          {v.local && (
            <p className="mt-1 text-[10px] text-muted-foreground">
              Local do envio: {v.local.lat}, {v.local.lng}
            </p>
          )}
        </div>
      ))}
      {doCarro.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma vistoria enviada ainda.</p>
      )}
    </div>
  );
}
