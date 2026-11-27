import { useState } from "react";
import { Camera, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Checklist, ChecklistItem } from "@/lib/mock-proprietario";
import { combustivelLabel } from "@/lib/checklist";

const FOTOS = ["Frente", "Traseira", "Lateral esq.", "Lateral dir.", "Interior", "Painel"];

export function ChecklistForm({
  tipo,
  kmInicial,
  atual,
  onSalvar,
  onCancelar,
}: {
  tipo: Checklist["tipo"];
  kmInicial: number;
  atual?: ChecklistItem;
  onSalvar: (itens: ChecklistItem) => void;
  onCancelar?: () => void;
}) {
  const [km, setKm] = useState(atual?.km ?? kmInicial);
  const [combustivel, setCombustivel] = useState<ChecklistItem["combustivel"]>(
    atual?.combustivel ?? "cheio",
  );
  const [pneus, setPneus] = useState<ChecklistItem["pneus"]>(atual?.pneus ?? "ok");
  const [avarias, setAvarias] = useState(atual?.avarias ?? "");
  const [observacoes, setObservacoes] = useState(atual?.observacoes ?? "");
  // Fotos ainda são simuladas: guardamos só quais foram tiradas. O envio real vem numa próxima etapa.
  const [fotos, setFotos] = useState<string[]>(FOTOS.slice(0, atual?.fotos ?? 0));
  const kmInvalido = km < kmInicial && !atual;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Km no painel</Label>
          <Input
            className="mt-1"
            type="number"
            value={km}
            onChange={(e) => setKm(+e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">Combustível</Label>
          <select
            value={combustivel}
            onChange={(e) => setCombustivel(e.target.value as ChecklistItem["combustivel"])}
            className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-2 text-sm"
          >
            {(Object.keys(combustivelLabel) as ChecklistItem["combustivel"][]).map((k) => (
              <option key={k} value={k}>
                {combustivelLabel[k]}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <Label className="text-xs">Pneus</Label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {(["ok", "atenção", "trocar"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPneus(p)}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold capitalize ${
                  pneus === p
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
      {kmInvalido && (
        <p className="text-xs text-destructive">
          O km não pode ser menor que o registrado no carro ({kmInicial}).
        </p>
      )}
      <div>
        <Label className="text-xs">Avarias encontradas</Label>
        <Textarea
          className="mt-1"
          rows={2}
          value={avarias}
          onChange={(e) => setAvarias(e.target.value)}
          placeholder="Deixe em branco se não houver. Ex.: risco na porta traseira direita"
        />
      </div>
      <div>
        <Label className="text-xs">
          Fotos ({fotos.length} de {FOTOS.length})
        </Label>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {FOTOS.map((f) => {
            const feita = fotos.includes(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFotos(feita ? fotos.filter((x) => x !== f) : [...fotos, f])}
                className={`flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-[11px] font-semibold ${
                  feita
                    ? "border-success bg-success/5 text-success"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {feita ? <Check className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                {f}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Protótipo: as fotos são simuladas.</p>
      </div>
      <div>
        <Label className="text-xs">Observações</Label>
        <Textarea
          className="mt-1"
          rows={2}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        {onCancelar && (
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={onCancelar}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="button"
          disabled={kmInvalido}
          className="flex-1 rounded-xl gradient-primary text-primary-foreground"
          onClick={() =>
            onSalvar({
              km,
              combustivel,
              pneus,
              avarias: avarias.trim(),
              observacoes: observacoes.trim() || undefined,
              fotos: fotos.length,
            })
          }
        >
          Salvar checklist de {tipo === "entrada" ? "entrada" : "devolução"}
        </Button>
      </div>
    </div>
  );
}

export function ChecklistResumo({ checklist }: { checklist: Checklist }) {
  const i = checklist.itens;
  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <Campo k="Km" v={i.km.toLocaleString("pt-BR")} />
      <Campo k="Combustível" v={combustivelLabel[i.combustivel]} />
      <Campo k="Pneus" v={i.pneus} />
      <Campo k="Fotos" v={String(i.fotos)} />
      <div className="col-span-2">
        <Campo k="Avarias" v={i.avarias || "Nenhuma"} />
      </div>
    </div>
  );
}

function Campo({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-2">
      <div className="text-[10px] uppercase text-muted-foreground">{k}</div>
      <div className="text-sm font-semibold capitalize">{v}</div>
    </div>
  );
}
