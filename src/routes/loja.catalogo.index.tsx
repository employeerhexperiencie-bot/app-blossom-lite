import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Plus, Users } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { FiltroBar } from "@/components/FiltroBar";
import { useParceiro } from "@/lib/store-parceiro";
import { categoriasItem, fmtBRL, iconeCategoriaItem, labelCategoriaItem } from "@/lib/mock-parceiro";

export const Route = createFileRoute("/loja/catalogo/")({
  head: () => ({
    meta: [
      { title: "Catálogo — Parceiro TCHI LÉVA" },
      { name: "description", content: "Cadastre produtos e serviços, defina preços, compatibilidade e disponibilidade." },
      { property: "og:title", content: "Catálogo — Parceiro TCHI LÉVA" },
      { property: "og:description", content: "Gestão de produtos e serviços da loja parceira." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Catalogo,
});

function Catalogo() {
  const catalogo = useParceiro((s) => s.catalogo);
  const alternar = useParceiro((s) => s.alternarItem);

  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [categoria, setCategoria] = useState("todas");
  const [situacao, setSituacao] = useState("todas");

  const lista = useMemo(
    () =>
      catalogo.filter((i) => {
        if (busca && !`${i.nome} ${i.marca ?? ""}`.toLowerCase().includes(busca.toLowerCase())) return false;
        if (tipo !== "todos" && i.tipo !== tipo) return false;
        if (categoria !== "todas" && i.categoria !== categoria) return false;
        if (situacao === "ativos" && !i.ativo) return false;
        if (situacao === "inativos" && i.ativo) return false;
        return true;
      }),
    [catalogo, busca, tipo, categoria, situacao]
  );

  const ativos = [tipo !== "todos", categoria !== "todas", situacao !== "todas"].filter(Boolean).length;

  return (
    <>
      <PageSection>
        <Button asChild className="w-full rounded-xl gradient-primary text-primary-foreground shadow-glow">
          <Link to="/loja/catalogo/novo">
            <Plus className="mr-2 h-4 w-4" /> Novo item
          </Link>
        </Button>
      </PageSection>

      <PageSection className="pt-0">
        <FiltroBar
          busca={busca}
          onBusca={setBusca}
          buscaPlaceholder="Buscar por nome ou marca..."
          ativos={ativos}
          onLimpar={() => { setTipo("todos"); setCategoria("todas"); setSituacao("todas"); }}
          chips={[
            { key: "tipo", label: "Tipo", value: tipo, onChange: setTipo, options: [
              { value: "todos", label: "Todos" }, { value: "produto", label: "Produtos" }, { value: "servico", label: "Serviços" },
            ]},
            { key: "cat", label: "Categoria", value: categoria, onChange: setCategoria, options: [
              { value: "todas", label: "Todas" }, ...categoriasItem.map((c) => ({ value: c.key, label: c.label })),
            ]},
            { key: "sit", label: "Situação", value: situacao, onChange: setSituacao, options: [
              { value: "todas", label: "Todas" }, { value: "ativos", label: "Ativos" }, { value: "inativos", label: "Inativos" },
            ]},
          ]}
        />
      </PageSection>

      <PageSection className="pt-0">
        <div className="mb-2 text-xs text-muted-foreground">{lista.length} item(ns)</div>
        <div className="flex flex-col gap-2">
          {lista.map((i) => (
            <div key={i.id} className="rounded-2xl border border-border bg-card p-3 shadow-card">
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-muted text-lg">
                  {iconeCategoriaItem(i.categoria)}
                </div>
                <Link to="/loja/catalogo/$itemId" params={{ itemId: i.id }} className="min-w-0">
                  <div className="truncate font-semibold">{i.nome}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {labelCategoriaItem(i.categoria)} · {i.tipo === "produto" ? `${i.quantidade ?? 0} un.` : `${i.tempoMin} min`}
                  </div>
                </Link>
                <div className="text-right">
                  <div className="font-display text-sm font-black">{fmtBRL(i.preco)}</div>
                  <button
                    onClick={() => alternar(i.id)}
                    className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      i.ativo ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i.ativo ? "Ativo" : "Inativo"}
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {i.visualizacoes} visitas</span>
                <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {i.leads} leads</span>
              </div>
            </div>
          ))}
          {lista.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nenhum item encontrado.
            </div>
          )}
        </div>
      </PageSection>
    </>
  );
}
