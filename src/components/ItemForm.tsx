import { useState } from "react";
import { Button } from "@/components/ui/button";
import { categoriasItem, type CategoriaItem, type ItemCatalogo, type TipoItem } from "@/lib/mock-parceiro";

export type ItemFormValues = Omit<ItemCatalogo, "id" | "visualizacoes" | "leads">;

export const itemVazio: ItemFormValues = {
  tipo: "produto",
  nome: "",
  categoria: "oleo-filtros",
  preco: 0,
  ativo: true,
  fotos: 0,
  marca: "",
  quantidade: 0,
  estoqueMinimo: 0,
  compatibilidade: [],
  tempoMin: 30,
  garantiaMeses: 3,
  agendavel: true,
};

export function ItemForm({
  inicial,
  onSubmit,
  textoBotao,
}: {
  inicial: ItemFormValues;
  onSubmit: (v: ItemFormValues) => void;
  textoBotao: string;
}) {
  const [f, setF] = useState<ItemFormValues>(inicial);
  const [compat, setCompat] = useState((inicial.compatibilidade ?? []).join(", "));

  return (
    <div className="flex flex-col gap-4">
      <Bloco titulo="Tipo do item">
        <div className="grid grid-cols-2 gap-2">
          {(["produto", "servico"] as TipoItem[]).map((t) => (
            <button
              key={t}
              onClick={() => setF({ ...f, tipo: t })}
              className={`h-11 rounded-xl border text-sm font-semibold ${
                f.tipo === t ? "border-primary bg-primary/10 text-primary" : "border-border"
              }`}
            >
              {t === "produto" ? "📦 Produto" : "🔧 Serviço"}
            </button>
          ))}
        </div>
      </Bloco>

      <Bloco titulo="Dados">
        <Campo label="Nome" value={f.nome} onChange={(v) => setF({ ...f, nome: v })} />
        <div>
          <Label>Categoria</Label>
          <select
            value={f.categoria}
            onChange={(e) => setF({ ...f, categoria: e.target.value as CategoriaItem })}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
          >
            {categoriasItem.map((c) => (
              <option key={c.key} value={c.key}>{c.icone} {c.label}</option>
            ))}
          </select>
        </div>
        <Campo label="Preço (R$)" tipo="number" value={String(f.preco)} onChange={(v) => setF({ ...f, preco: Number(v) || 0 })} />
        <Campo label="Fotos" tipo="number" value={String(f.fotos)} onChange={(v) => setF({ ...f, fotos: Number(v) || 0 })} />
      </Bloco>

      {f.tipo === "produto" ? (
        <Bloco titulo="Produto">
          <Campo label="Marca" value={f.marca ?? ""} onChange={(v) => setF({ ...f, marca: v })} />
          <div className="grid grid-cols-2 gap-2">
            <Campo label="Quantidade" tipo="number" value={String(f.quantidade ?? 0)} onChange={(v) => setF({ ...f, quantidade: Number(v) || 0 })} />
            <Campo label="Estoque mínimo" tipo="number" value={String(f.estoqueMinimo ?? 0)} onChange={(v) => setF({ ...f, estoqueMinimo: Number(v) || 0 })} />
          </div>
          <Campo
            label="Compatibilidade (separe por vírgula)"
            value={compat}
            onChange={(v) => { setCompat(v); setF({ ...f, compatibilidade: v.split(",").map((s) => s.trim()).filter(Boolean) }); }}
          />
        </Bloco>
      ) : (
        <Bloco titulo="Serviço">
          <div className="grid grid-cols-2 gap-2">
            <Campo label="Tempo (min)" tipo="number" value={String(f.tempoMin ?? 0)} onChange={(v) => setF({ ...f, tempoMin: Number(v) || 0 })} />
            <Campo label="Garantia (meses)" tipo="number" value={String(f.garantiaMeses ?? 0)} onChange={(v) => setF({ ...f, garantiaMeses: Number(v) || 0 })} />
          </div>
          <button
            onClick={() => setF({ ...f, agendavel: !f.agendavel })}
            className={`h-10 rounded-lg border text-sm font-semibold ${
              f.agendavel ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
            }`}
          >
            Agendável pelo app: {f.agendavel ? "sim" : "não"}
          </button>
        </Bloco>
      )}

      <Button
        className="w-full rounded-xl gradient-primary text-primary-foreground shadow-glow"
        onClick={() => onSubmit(f)}
        disabled={!f.nome.trim() || f.preco <= 0}
      >
        {textoBotao}
      </Button>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <h2 className="mb-3 font-display text-sm font-black uppercase tracking-wider">{titulo}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</div>;
}

function Campo({ label, value, onChange, tipo = "text" }: { label: string; value: string; onChange: (v: string) => void; tipo?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={tipo}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
      />
    </div>
  );
}
