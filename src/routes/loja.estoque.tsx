import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { FiltroBar } from "@/components/FiltroBar";
import { useParceiro } from "@/lib/store-parceiro";
import { fmtBRL, iconeCategoriaItem } from "@/lib/mock-parceiro";
import { toast } from "sonner";

export const Route = createFileRoute("/loja/estoque")({
  head: () => ({
    meta: [
      { title: "Estoque — Parceiro TCHI LÉVA" },
      { name: "description", content: "Controle de entradas, saídas e alertas de estoque mínimo dos seus produtos." },
      { property: "og:title", content: "Estoque — Parceiro TCHI LÉVA" },
      { property: "og:description", content: "Controle simples de estoque para lojas parceiras." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Estoque,
});

function Estoque() {
  const catalogo = useParceiro((s) => s.catalogo);
  const movimentos = useParceiro((s) => s.movimentos);
  const entrada = useParceiro((s) => s.entradaEstoque);
  const saida = useParceiro((s) => s.saidaEstoque);

  const [busca, setBusca] = useState("");
  const [nivel, setNivel] = useState("todos");
  const [modal, setModal] = useState<{ itemId: string; tipo: "entrada" | "saida" } | null>(null);
  const [qtd, setQtd] = useState("1");
  const [motivo, setMotivo] = useState("");

  const produtos = useMemo(
    () =>
      catalogo
        .filter((i) => i.tipo === "produto")
        .filter((i) => (busca ? i.nome.toLowerCase().includes(busca.toLowerCase()) : true))
        .filter((i) => {
          const baixo = (i.quantidade ?? 0) <= (i.estoqueMinimo ?? 0);
          if (nivel === "baixo") return baixo;
          if (nivel === "ok") return !baixo;
          return true;
        }),
    [catalogo, busca, nivel]
  );

  const valorEstoque = catalogo
    .filter((i) => i.tipo === "produto")
    .reduce((a, i) => a + (i.quantidade ?? 0) * i.preco, 0);

  const alvo = catalogo.find((i) => i.id === modal?.itemId);

  return (
    <>
      <PageSection>
        <div className="rounded-2xl bg-primary/10 p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Valor em estoque</div>
          <div className="font-display text-3xl font-black">{fmtBRL(valorEstoque)}</div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <FiltroBar
          busca={busca}
          onBusca={setBusca}
          buscaPlaceholder="Buscar produto..."
          ativos={nivel !== "todos" ? 1 : 0}
          onLimpar={() => setNivel("todos")}
          chips={[
            { key: "nivel", label: "Nível", value: nivel, onChange: setNivel, options: [
              { value: "todos", label: "Todos" }, { value: "baixo", label: "Abaixo do mínimo" }, { value: "ok", label: "Normal" },
            ]},
          ]}
        />
      </PageSection>

      <PageSection className="pt-0">
        <div className="flex flex-col gap-2">
          {produtos.map((i) => {
            const baixo = (i.quantidade ?? 0) <= (i.estoqueMinimo ?? 0);
            return (
              <div
                key={i.id}
                className={`rounded-2xl border p-3 shadow-card ${baixo ? "border-warning/40 bg-warning/5" : "border-border bg-card"}`}
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-lg">{iconeCategoriaItem(i.categoria)}</div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{i.nome}</div>
                    <div className="text-xs text-muted-foreground">
                      mínimo {i.estoqueMinimo} · {fmtBRL(i.preco)}
                    </div>
                  </div>
                  <div className={`font-display text-2xl font-black ${baixo ? "text-warning" : ""}`}>{i.quantidade}</div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button variant="outline" className="rounded-xl" onClick={() => { setModal({ itemId: i.id, tipo: "entrada" }); setQtd("1"); setMotivo(""); }}>
                    <ArrowUpCircle className="mr-2 h-4 w-4" /> Entrada
                  </Button>
                  <Button variant="outline" className="rounded-xl" onClick={() => { setModal({ itemId: i.id, tipo: "saida" }); setQtd("1"); setMotivo(""); }}>
                    <ArrowDownCircle className="mr-2 h-4 w-4" /> Saída
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <h2 className="mb-2 font-display text-sm font-black uppercase tracking-wider">Movimentações</h2>
        <div className="flex flex-col gap-2">
          {movimentos.slice(0, 12).map((m) => {
            const item = catalogo.find((i) => i.id === m.itemId);
            return (
              <div key={m.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-card p-3 shadow-card">
                {m.tipo === "entrada" ? (
                  <ArrowUpCircle className="h-4 w-4 text-success" />
                ) : (
                  <ArrowDownCircle className="h-4 w-4 text-destructive" />
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{item?.nome ?? "Item"}</div>
                  <div className="truncate text-xs text-muted-foreground">{m.motivo} · {m.data}</div>
                </div>
                <span className="font-display text-sm font-black">
                  {m.tipo === "entrada" ? "+" : "−"}{m.quantidade}
                </span>
              </div>
            );
          })}
        </div>
      </PageSection>

      {modal && alvo && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-4" onClick={() => setModal(null)}>
          <div className="w-full rounded-2xl border border-border bg-card p-4" onClick={(e) => e.stopPropagation()}>
            <div className="font-display text-lg font-black">
              {modal.tipo === "entrada" ? "Entrada" : "Saída"} — {alvo.nome}
            </div>
            <div className="mt-3 flex flex-col gap-3">
              <input
                type="number" value={qtd} onChange={(e) => setQtd(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" placeholder="Quantidade"
              />
              <input
                value={motivo} onChange={(e) => setMotivo(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" placeholder="Motivo"
              />
              <Button
                className="w-full rounded-xl gradient-primary text-primary-foreground"
                onClick={() => {
                  const q = Number(qtd) || 0;
                  if (q <= 0) return;
                  const m = motivo.trim() || (modal.tipo === "entrada" ? "Reposição" : "Venda balcão");
                  if (modal.tipo === "entrada") entrada(modal.itemId, q, m);
                  else saida(modal.itemId, q, m);
                  toast.success("Estoque atualizado!");
                  setModal(null);
                }}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
