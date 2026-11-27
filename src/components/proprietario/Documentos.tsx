import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fmtData,
  hojeISO,
  statusDocumento,
  type DocStatus,
  type DocumentoDono,
  type DocumentoVeiculo,
} from "@/lib/mock-proprietario";
import { useProprietario } from "@/lib/store-proprietario";

const tiposCarro: DocumentoVeiculo["tipo"][] = [
  "CRLV",
  "Seguro",
  "Licenciamento",
  "IPVA",
  "Manual",
  "NF",
];
const tiposDono: DocumentoDono["tipo"][] = [
  "CNH",
  "Comprovante de residência",
  "Contrato social",
  "Procuração",
  "Outro",
];

export function SeloDocumento({ status }: { status: DocStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        status === "ok"
          ? "bg-success/15 text-success"
          : status === "vencendo"
            ? "bg-warning/20 text-warning-foreground"
            : "bg-destructive/15 text-destructive"
      }`}
    >
      {status === "ok" ? "Em dia" : status === "vencendo" ? "Vencendo" : "Vencido"}
    </span>
  );
}

/** Documentos do carro com vencimento: cadastrar, renovar a data e remover. */
export function DocumentosCarro({ carroId }: { carroId: string }) {
  const docs = useProprietario(
    useShallow((s) => s.documentos.filter((d) => d.carroId === carroId)),
  );
  const salvar = useProprietario((s) => s.salvarDocumento);
  const remover = useProprietario((s) => s.removerDocumento);
  const [editando, setEditando] = useState<string | "novo" | null>(null);
  const [tipo, setTipo] = useState<DocumentoVeiculo["tipo"]>("CRLV");
  const [vencimento, setVencimento] = useState("");
  const hoje = hojeISO();

  function abrir(d?: DocumentoVeiculo) {
    setEditando(d?.id ?? "novo");
    setTipo(d?.tipo ?? "CRLV");
    setVencimento(d?.vencimento ?? "");
  }

  return (
    <div className="flex flex-col gap-2">
      {docs.map((d) =>
        editando === d.id ? (
          <FormDoc
            key={d.id}
            tipos={tiposCarro}
            tipo={tipo}
            setTipo={(t) => setTipo(t as DocumentoVeiculo["tipo"])}
            vencimento={vencimento}
            setVencimento={setVencimento}
            onCancelar={() => setEditando(null)}
            onSalvar={() => {
              salvar({ id: d.id, carroId, tipo, vencimento });
              setEditando(null);
              toast.success("Documento atualizado");
            }}
          />
        ) : (
          <div
            key={d.id}
            className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-card"
          >
            <button className="min-w-0 text-left" onClick={() => abrir(d)}>
              <div className="font-semibold">{d.tipo}</div>
              <div className="text-xs text-muted-foreground">
                Vence em {fmtData(d.vencimento)} · toque para renovar
              </div>
            </button>
            <SeloDocumento status={statusDocumento(d.vencimento, hoje)} />
            <button
              aria-label={`Remover ${d.tipo}`}
              className="text-muted-foreground"
              onClick={() => {
                remover(d.id);
                toast("Documento removido");
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      )}
      {docs.length === 0 && editando !== "novo" && (
        <p className="text-sm text-muted-foreground">Nenhum documento cadastrado.</p>
      )}
      {editando === "novo" ? (
        <FormDoc
          tipos={tiposCarro}
          tipo={tipo}
          setTipo={(t) => setTipo(t as DocumentoVeiculo["tipo"])}
          vencimento={vencimento}
          setVencimento={setVencimento}
          onCancelar={() => setEditando(null)}
          onSalvar={() => {
            salvar({ carroId, tipo, vencimento });
            setEditando(null);
            toast.success("Documento cadastrado. O vencimento entra na agenda.");
          }}
        />
      ) : (
        <Button size="sm" variant="outline" className="rounded-xl" onClick={() => abrir()}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar documento
        </Button>
      )}
    </div>
  );
}

/** Documentos do próprio dono (CNH, comprovante...), no Perfil. */
export function DocumentosDono() {
  const docs = useProprietario((s) => s.documentosDono);
  const salvar = useProprietario((s) => s.salvarDocumentoDono);
  const remover = useProprietario((s) => s.removerDocumentoDono);
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<DocumentoDono["tipo"]>("CNH");
  const [numero, setNumero] = useState("");
  const [vencimento, setVencimento] = useState("");
  const hoje = hojeISO();

  return (
    <div className="space-y-2">
      {docs.map((d) => (
        <div
          key={d.id}
          className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-xl border border-border p-3"
        >
          <div className="min-w-0">
            <div className="text-sm font-semibold">{d.tipo}</div>
            <div className="truncate text-xs text-muted-foreground">
              {[d.numero, d.vencimento ? `vence em ${fmtData(d.vencimento)}` : "sem vencimento"]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          {d.vencimento ? <SeloDocumento status={statusDocumento(d.vencimento, hoje)} /> : <span />}
          <button
            aria-label={`Remover ${d.tipo}`}
            className="text-muted-foreground"
            onClick={() => remover(d.id)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      {docs.length === 0 && !aberto && (
        <p className="text-xs text-muted-foreground">
          Cadastre sua CNH e comprovantes: o app avisa antes de vencer.
        </p>
      )}
      {aberto ? (
        <div className="space-y-2 rounded-xl border border-primary/40 bg-primary/5 p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Documento</Label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as DocumentoDono["tipo"])}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
              >
                {tiposDono.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Vencimento (se tiver)</Label>
              <Input
                className="mt-1"
                type="date"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Número (opcional)</Label>
            <Input className="mt-1" value={numero} onChange={(e) => setNumero(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button
              className="rounded-xl gradient-primary text-primary-foreground"
              onClick={() => {
                salvar({
                  tipo,
                  numero: numero.trim() || undefined,
                  vencimento: vencimento || undefined,
                });
                setAberto(false);
                setNumero("");
                setVencimento("");
                toast.success("Documento salvo");
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => setAberto(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar documento
        </Button>
      )}
    </div>
  );
}

function FormDoc({
  tipos,
  tipo,
  setTipo,
  vencimento,
  setVencimento,
  onCancelar,
  onSalvar,
}: {
  tipos: string[];
  tipo: string;
  setTipo: (t: string) => void;
  vencimento: string;
  setVencimento: (v: string) => void;
  onCancelar: () => void;
  onSalvar: () => void;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-primary/40 bg-primary/5 p-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Documento</Label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
          >
            {tipos.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs">Vencimento</Label>
          <Input
            className="mt-1"
            type="date"
            value={vencimento}
            onChange={(e) => setVencimento(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="rounded-xl" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button
          className="rounded-xl gradient-primary text-primary-foreground"
          disabled={!vencimento}
          onClick={onSalvar}
        >
          Salvar
        </Button>
      </div>
    </div>
  );
}
