import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { ItemForm } from "@/components/ItemForm";
import { useItem, useParceiro } from "@/lib/store-parceiro";
import { toast } from "sonner";

export const Route = createFileRoute("/loja/catalogo/$itemId")({
  head: () => ({
    meta: [
      { title: "Editar item — Catálogo TCHI LÉVA" },
      { name: "description", content: "Edite preço, estoque, compatibilidade e disponibilidade do item do catálogo." },
      { property: "og:title", content: "Editar item — Catálogo TCHI LÉVA" },
      { property: "og:description", content: "Edição de item no catálogo do parceiro TCHI LÉVA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditarItem,
});

function EditarItem() {
  const { itemId } = useParams({ from: "/loja/catalogo/$itemId" });
  const item = useItem(itemId);
  const editar = useParceiro((s) => s.editarItem);
  const remover = useParceiro((s) => s.removerItem);
  const navigate = useNavigate();

  if (!item) {
    return (
      <PageSection>
        <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Item não encontrado.
        </div>
      </PageSection>
    );
  }

  const { id: _id, visualizacoes, leads, ...valores } = item;

  return (
    <>
      <PageSection>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="font-display text-lg font-black">{item.nome}</div>
          <div className="text-xs text-muted-foreground">{visualizacoes} visitas · {leads} leads gerados</div>
        </div>
      </PageSection>
      <PageSection className="pt-0">
        <ItemForm
          inicial={valores}
          textoBotao="Salvar alterações"
          onSubmit={(v) => {
            editar(item.id, v);
            toast.success("Item atualizado!");
            navigate({ to: "/loja/catalogo" });
          }}
        />
        <Button
          variant="outline"
          className="mt-3 w-full rounded-xl text-destructive"
          onClick={() => {
            remover(item.id);
            toast.success("Item removido do catálogo.");
            navigate({ to: "/loja/catalogo" });
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Remover item
        </Button>
      </PageSection>
    </>
  );
}
